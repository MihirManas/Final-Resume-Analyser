import os
import json
import logging
import hashlib
import asyncio
from datetime import datetime, timedelta
from fastapi import FastAPI, Depends, UploadFile, File, Form, HTTPException, status, BackgroundTasks, Header
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select

from app.database import Base, engine, get_db
from app.models import User, ResumeAnalysis, AnalysisReport, AnalysisCache, ModelEvaluation, JobPosting, JobMatch, APIClient, APILead
from app.schemas import (
    AnalysisResponse, DashboardReport, FullGeminiResult, JobPostingCreate,
    JobPostingResponse, PersonalizedFeedResponse,
    ExternalAnalysisResponse, APIClientCreate, APIClientResponse, APIClientUsageResponse, APILeadCreate,
)
from app.services.document import extract_markdown_from_upload
from app.services.gemini import analyze_resume, rewrite_resume_background, evaluate_job_match
from app.services.groq_service import run_consensus_voting
from app.services.sheets import upsert_candidate_info
from app.services.third_party_sheets import push_candidate_to_sheet

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = FastAPI(title="Resume Analyzer API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.on_event("startup")
async def startup_event():
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
    logger.info("Database tables initialized successfully.")

@app.get("/")
async def health_check():
    return {"status": "ok"}

@app.get("/health")
async def health():
    return {"status": "ok"}


def _generate_cache_key(resume_md: str, target_role: str, jd_md: str, user_problems: str) -> str:
    components = [
        resume_md.strip().lower() if resume_md else "",
        target_role.strip().lower() if target_role else "",
        jd_md.strip().lower() if jd_md else "",
        user_problems.strip().lower() if user_problems else ""
    ]
    raw_str = "|".join(components)
    return hashlib.sha256(raw_str.encode('utf-8')).hexdigest()

async def background_data_augmentation(
    analysis_id: int, 
    resume_md: str, 
    target_role: str, 
    jd_md: str, 
    feedback_json: str
):
    """
    1. Runs consensus voting on the ORIGINAL resume.
    2. Rewrites the resume based on feedback.
    3. Runs analysis and consensus voting on the SYNTHETIC resume.
    """
    # We need a new session for background tasks
    from app.database import AsyncSessionLocal
    
    try:
        logger.info(f"[Background Task] Starting pipeline for Analysis #{analysis_id}")
        
        # Step 1: Voting on ORIGINAL Resume
        votes = await run_consensus_voting(resume_md, target_role, jd_md)
        async with AsyncSessionLocal() as db:
            for model_name, vote in votes.items():
                eval_record = ModelEvaluation(
                    analysis_id=analysis_id,
                    model_name=model_name,
                    prediction=vote.prediction,
                    confidence=vote.confidence,
                    reason=vote.reason
                )
                db.add(eval_record)
            await db.commit()
            
        logger.info(f"[Background Task] Phase 1 (Original Voting) complete for #{analysis_id}")
        
        # Step 2: Rewrite Resume (Data Augmentation)
        synthetic_resume = await rewrite_resume_background(resume_md, feedback_json)
        
        # Step 3: Analyze & Vote on Synthetic Resume (Recursion stops here)
        synthetic_result = await analyze_resume(synthetic_resume, target_role, jd_md, None)
        synthetic_votes = await run_consensus_voting(synthetic_resume, target_role, jd_md)
        
        # Save synthetic data to DB as a NEW hidden analysis record (no user attached so it doesn't clutter dashboard)
        async with AsyncSessionLocal() as db:
            synth_analysis = ResumeAnalysis(
                target_role=target_role,
                resume_filename="SYNTHETIC_AUGMENTED",
                employability_score=synthetic_result.extraction.employability_score,
                ats_score=synthetic_result.extraction.ats_score,
                skill_score=synthetic_result.extraction.skill_score,
                project_score=synthetic_result.extraction.project_score,
                portfolio_score=synthetic_result.extraction.portfolio_score,
                interview_score=synthetic_result.extraction.interview_score,
                level_1_features=synthetic_result.extraction.level_1_features.model_dump(),
                level_2_features=synthetic_result.extraction.level_2_features,
                level_3_features=[f.model_dump() for f in synthetic_result.extraction.level_3_features],
                shortlist_probability=synthetic_result.extraction.shortlist_probability
            )
            db.add(synth_analysis)
            await db.commit()
            await db.refresh(synth_analysis)
            
            for model_name, vote in synthetic_votes.items():
                eval_record = ModelEvaluation(
                    analysis_id=synth_analysis.id,
                    model_name=model_name + "_synthetic",
                    prediction=vote.prediction,
                    confidence=vote.confidence,
                    reason=vote.reason
                )
                db.add(eval_record)
            await db.commit()
            
        logger.info(f"[Background Task] Phase 2 (Synthetic Augmentation) complete. New ID: #{synth_analysis.id}")
            
    except Exception as e:
        logger.error(f"[Background Task] Failed: {e}", exc_info=True)


@app.post("/api/upload", response_model=AnalysisResponse)
async def upload_resume(
    background_tasks: BackgroundTasks,
    resume_file: UploadFile = File(...),
    jd_file: UploadFile = File(None),
    jd_text: str = Form(None),
    target_role: str = Form(...),
    user_problems: str = Form(None),
    user_email: str = Form("guest@example.com"),
    user_name: str = Form("Guest User"),
    db: AsyncSession = Depends(get_db)
):
    try:
        # 1. Ensure user exists
        stmt = select(User).where(User.email == user_email)
        result = await db.execute(stmt)
        user = result.scalars().first()

        if not user:
            user = User(name=user_name, email=user_email)
            db.add(user)
            await db.commit()
            await db.refresh(user)

        # 2. Extract Document Text
        resume_md = await extract_markdown_from_upload(resume_file)
        
        jd_md = None
        if jd_file and jd_file.filename:
            jd_md = await extract_markdown_from_upload(jd_file)
        elif jd_text and jd_text.strip():
            jd_md = jd_text.strip()

        # 3. Exact Match Caching
        cache_key = _generate_cache_key(resume_md, target_role, jd_md, user_problems)
        cache_stmt = select(AnalysisCache).where(AnalysisCache.hash_key == cache_key)
        cache_result = await db.execute(cache_stmt)
        cached_item = cache_result.scalars().first()
        
        is_cached = False
        if cached_item:
            logger.info("CACHE HIT! Returning instantly from DB.")
            cached_data = cached_item.result_json
            if "original_analysis_id" in cached_data:
                # Completely avoid creating duplicate data if we already have it
                return {"analysis_id": cached_data["original_analysis_id"], "message": "Analysis completed successfully"}
            
            gemini_result = FullGeminiResult(**cached_data)
            is_cached = True
        else:
            logger.info("CACHE MISS. Running AI Pipeline...")
            gemini_result = await analyze_resume(resume_md, target_role, jd_md, user_problems)

        # Export candidate info to Google Sheets in the background
        if hasattr(gemini_result.extraction, 'candidate_info') and gemini_result.extraction.candidate_info:
            loop = asyncio.get_event_loop()
            loop.run_in_executor(None, upsert_candidate_info, gemini_result.extraction.candidate_info)

        # 4. Save Analysis Record for User Dashboard
        analysis = ResumeAnalysis(
            user_id=user.id,
            target_role=target_role,
            resume_filename=resume_file.filename,
            jd_filename=jd_file.filename if (jd_file and jd_file.filename) else None,
            user_problems=user_problems,
            employability_score=gemini_result.extraction.employability_score,
            ats_score=gemini_result.extraction.ats_score,
            skill_score=gemini_result.extraction.skill_score,
            project_score=gemini_result.extraction.project_score,
            portfolio_score=gemini_result.extraction.portfolio_score,
            interview_score=gemini_result.extraction.interview_score,
            level_1_features=gemini_result.extraction.level_1_features.model_dump(),
            level_2_features=gemini_result.extraction.level_2_features,
            level_3_features=[f.model_dump() for f in gemini_result.extraction.level_3_features],
            shortlist_probability=gemini_result.extraction.shortlist_probability,
            jd_date_analysis=gemini_result.extraction.jd_date_analysis
        )
        db.add(analysis)
        await db.commit()
        await db.refresh(analysis)

        # Save detailed Report
        report = AnalysisReport(
            analysis_id=analysis.id,
            strengths_json=gemini_result.feedback.strengths,
            weaknesses_json=gemini_result.feedback.weaknesses,
            missing_skills_json=gemini_result.feedback.missing_skills,
            recommendations_json={
                "skills": gemini_result.feedback.recommended_skills,
                "projects": gemini_result.feedback.recommended_projects,
                "certifications": gemini_result.feedback.recommended_certifications,
                "career_suggestions": gemini_result.feedback.career_suggestions,
                "top_rejection_reasons": gemini_result.feedback.top_rejection_reasons
            },
            improvement_plan_json=[phase.model_dump() if hasattr(phase, 'model_dump') else phase for phase in gemini_result.feedback.improvement_plan],
            alternative_roles_json=gemini_result.feedback.alternative_roles_suggested,
            skill_guide_json=gemini_result.feedback.skill_acquisition_guide,
            jd_comparison_json=[item.model_dump() for item in gemini_result.feedback.jd_resume_comparison],
            raw_llm_response=gemini_result.model_dump_json()
        )
        db.add(report)
        await db.commit()

        # 5. Handle Cache updates and Background Tasks
        if not is_cached:
            cache_payload = gemini_result.model_dump()
            cache_payload["original_analysis_id"] = analysis.id
            new_cache = AnalysisCache(hash_key=cache_key, result_json=cache_payload)
            db.add(new_cache)
            await db.commit()

            background_tasks.add_task(
                background_data_augmentation, 
                analysis_id=analysis.id, 
                resume_md=resume_md, 
                target_role=target_role, 
                jd_md=jd_md, 
                feedback_json=gemini_result.feedback.model_dump_json()
            )
        else:
            # Update existing legacy cache row with original_analysis_id to prevent future duplicates
            cached_data = cached_item.result_json
            cached_data["original_analysis_id"] = analysis.id
            cached_item.result_json = cached_data
            from sqlalchemy.orm.attributes import flag_modified
            flag_modified(cached_item, "result_json")
            await db.commit()

        return {"analysis_id": analysis.id, "message": "Analysis completed successfully"}

    except Exception as e:
        await db.rollback()
        logger.error(f"Upload/analysis failed: {e}", exc_info=True)
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/report/{analysis_id}", response_model=DashboardReport)
async def get_report(analysis_id: int, db: AsyncSession = Depends(get_db)):
    stmt = select(ResumeAnalysis).where(ResumeAnalysis.id == analysis_id)
    result = await db.execute(stmt)
    analysis = result.scalars().first()

    if not analysis:
        raise HTTPException(status_code=404, detail="Analysis not found")

    stmt_rep = select(AnalysisReport).where(AnalysisReport.analysis_id == analysis_id)
    res_rep = await db.execute(stmt_rep)
    report = res_rep.scalars().first()

    if not report:
        raise HTTPException(status_code=404, detail="Report details not found")

    raw_data = json.loads(report.raw_llm_response)

    return {
        "employability_score": analysis.employability_score,
        "ats_score": analysis.ats_score,
        "skill_score": analysis.skill_score,
        "project_score": analysis.project_score,
        "portfolio_score": analysis.portfolio_score,
        "interview_score": analysis.interview_score,
        "strengths": report.strengths_json or [],
        "weaknesses": report.weaknesses_json or [],
        "missing_skills": report.missing_skills_json or [],
        "recommendations": report.recommendations_json or {},
        "improvement_plan": report.improvement_plan_json or [],
        "alternative_roles_suggested": report.alternative_roles_json or [],
        "skill_acquisition_guide": report.skill_guide_json or [],
        "role_fit": raw_data.get("extraction", {}).get("role_fit_score", 0),
        "ats_logic": raw_data.get("extraction", {}).get("ats_logic", ""),
        "absolute_necessary_skills": raw_data.get("feedback", {}).get("absolute_necessary_skills", []),
        "good_to_have_skills": raw_data.get("feedback", {}).get("good_to_have_skills", []),
        "need_to_learn_skills": raw_data.get("feedback", {}).get("need_to_learn_skills", []),
        "skills_logic": raw_data.get("feedback", {}).get("skills_logic", ""),
        "recommended_job_matches": raw_data.get("feedback", {}).get("recommended_job_matches", []),
        "estimated_improved_score": raw_data.get("feedback", {}).get("estimated_improved_score", 0),
        "shortlist_probability": analysis.shortlist_probability or "No Info",
        "jd_date_analysis": analysis.jd_date_analysis,
        "jd_resume_comparison": report.jd_comparison_json,
        "real_result": analysis.real_result
    }

from pydantic import BaseModel
class RealResultUpdate(BaseModel):
    result: str

@app.put("/api/analysis/{analysis_id}/result")
async def update_real_result(analysis_id: int, payload: RealResultUpdate, db: AsyncSession = Depends(get_db)):
    stmt = select(ResumeAnalysis).where(ResumeAnalysis.id == analysis_id)
    res = await db.execute(stmt)
    analysis = res.scalars().first()
    if not analysis:
        raise HTTPException(status_code=404, detail="Analysis not found")
        
    analysis.real_result = payload.result
    await db.commit()
    return {"message": "Result updated successfully"}

@app.post("/api/jobs", response_model=JobPostingResponse)
async def create_job_posting(job: JobPostingCreate, db: AsyncSession = Depends(get_db)):
    db_job = JobPosting(**job.model_dump())
    db.add(db_job)
    await db.commit()
    await db.refresh(db_job)
    return db_job

@app.post("/api/jobs/{job_id}/evaluate/{analysis_id}")
async def evaluate_job_for_user(job_id: int, analysis_id: int, db: AsyncSession = Depends(get_db)):
    # 1. Fetch Job
    job_stmt = select(JobPosting).where(JobPosting.id == job_id)
    job_res = await db.execute(job_stmt)
    job = job_res.scalars().first()
    if not job:
        raise HTTPException(status_code=404, detail="Job not found")
        
    # 2. Fetch Resume Analysis
    analysis_stmt = select(ResumeAnalysis).where(ResumeAnalysis.id == analysis_id)
    analysis_res = await db.execute(analysis_stmt)
    analysis = analysis_res.scalars().first()
    if not analysis:
        raise HTTPException(status_code=404, detail="Analysis not found")
        
    # 3. Read Resume Markdown (Assuming we can reconstruct or fetch it, here we assume it's stored or we pass the skills)
    # Actually, we don't have the original resume_md stored directly in ResumeAnalysis. 
    # Let's fetch the Report which has strengths, missing skills etc. to simulate the resume text.
    report_stmt = select(AnalysisReport).where(AnalysisReport.analysis_id == analysis_id)
    report_res = await db.execute(report_stmt)
    report = report_res.scalars().first()
    
    resume_summary = "Candidate strengths: " + ", ".join(report.strengths_json or [])
    if report.skill_guide_json:
        resume_summary += f". Known Skills/Features: {report.skill_guide_json}"
    
    # 4. Evaluate Match
    match_result = await evaluate_job_match(resume_summary, job.requirements)
    
    # 5. Save JobMatch
    job_match = JobMatch(
        user_id=analysis.user_id,
        analysis_id=analysis.id,
        job_id=job.id,
        match_percentage=match_result.match_percentage,
        missing_requirements=match_result.missing_requirements
    )
    db.add(job_match)
    await db.commit()
    await db.refresh(job_match)
    
    return {"message": "Match evaluated successfully", "match_percentage": job_match.match_percentage}

@app.get("/api/feed/{user_id}", response_model=PersonalizedFeedResponse)
async def get_personalized_feed(user_id: int, db: AsyncSession = Depends(get_db)):
    # Fetch all job matches for the user, joined with the job posting, ordered by date_posted desc
    stmt = select(JobMatch, JobPosting).join(JobPosting, JobMatch.job_id == JobPosting.id).where(JobMatch.user_id == user_id).order_by(JobPosting.date_posted.desc())
    res = await db.execute(stmt)
    
    tier_90 = []
    tier_80 = []
    
    for match, job in res:
        item = {
            "job_id": job.id,
            "company_name": job.company_name,
            "job_title": job.job_title,
            "job_url": job.job_url,
            "date_posted": job.date_posted,
            "match_percentage": match.match_percentage,
            "missing_requirements": match.missing_requirements or []
        }
        
        if match.match_percentage >= 90:
            tier_90.append(item)
        elif match.match_percentage >= 80:
            tier_80.append(item)
            
    return {"tier_90_plus": tier_90, "tier_80_plus": tier_80}


# ─────────────────────────────────────────────────────────────────────────────
# EXTERNAL API SYSTEM  (Third-party startup integration)
# ─────────────────────────────────────────────────────────────────────────────

ADMIN_SECRET = os.getenv("ADMIN_SECRET", "jes_admin_default_change_me")


async def verify_api_key(
    x_api_key: str = Header(..., alias="X-API-Key"),
    db: AsyncSession = Depends(get_db),
) -> APIClient:
    """
    FastAPI dependency that:
      1. Validates the API key exists and is active.
      2. Auto-resets the billing cycle if 30 days have passed.
      3. Checks monthly quota.
    Returns the APIClient ORM object on success.
    """
    stmt = select(APIClient).where(APIClient.api_key == x_api_key)
    result = await db.execute(stmt)
    client = result.scalars().first()

    if not client or not client.is_active:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid or inactive API key.",
        )

    # Auto-reset billing cycle every 30 days
    if client.billing_cycle_start and (
        datetime.utcnow() - client.billing_cycle_start > timedelta(days=30)
    ):
        client.current_usage = 0
        client.billing_cycle_start = datetime.utcnow()
        await db.commit()
        await db.refresh(client)

    # Quota check
    if client.current_usage >= client.monthly_limit:
        raise HTTPException(
            status_code=status.HTTP_429_TOO_MANY_REQUESTS,
            detail=f"Monthly quota of {client.monthly_limit} resumes exceeded. "
                   f"Resets on {(client.billing_cycle_start + timedelta(days=30)).strftime('%Y-%m-%d')}.",
        )

    return client


@app.post("/api/v1/external/analyze", response_model=ExternalAnalysisResponse)
async def external_analyze(
    background_tasks: BackgroundTasks,
    resume_file: UploadFile = File(...),
    target_role: str = Form(...),
    jd_text: str = Form(None),
    client: APIClient = Depends(verify_api_key),
    db: AsyncSession = Depends(get_db),
):
    """
    External API endpoint for third-party startups.
    - Accepts a resume + target role.
    - Runs the full Gemini analysis pipeline.
    - Saves ALL detailed data into OUR database (linked to the API client).
    - Pushes basic candidate info to the STARTUP's Google Sheet.
    - Returns ONLY basic candidate info to the startup (name, phone, email, college, branch).
    """
    try:
        # 1. Extract resume text
        resume_md = await extract_markdown_from_upload(resume_file)

        jd_md = jd_text.strip() if jd_text and jd_text.strip() else None

        # 2. Run full AI analysis (same pipeline as our internal endpoint)
        gemini_result = await analyze_resume(resume_md, target_role, jd_md, None)

        candidate = gemini_result.extraction.candidate_info

        # 3. Save FULL analysis into OUR database (startup never sees this)
        analysis = ResumeAnalysis(
            api_client_id=client.id,
            target_role=target_role,
            resume_filename=resume_file.filename,
            employability_score=gemini_result.extraction.employability_score,
            ats_score=gemini_result.extraction.ats_score,
            skill_score=gemini_result.extraction.skill_score,
            project_score=gemini_result.extraction.project_score,
            portfolio_score=gemini_result.extraction.portfolio_score,
            interview_score=gemini_result.extraction.interview_score,
            level_1_features=gemini_result.extraction.level_1_features.model_dump(),
            level_2_features=gemini_result.extraction.level_2_features,
            level_3_features=[f.model_dump() for f in gemini_result.extraction.level_3_features],
            shortlist_probability=gemini_result.extraction.shortlist_probability,
        )
        db.add(analysis)

        # 4. Increment usage counter
        client.current_usage += 1
        await db.commit()
        await db.refresh(analysis)

        # 5. Save detailed report (for our internal analytics)
        report = AnalysisReport(
            analysis_id=analysis.id,
            strengths_json=gemini_result.feedback.strengths,
            weaknesses_json=gemini_result.feedback.weaknesses,
            missing_skills_json=gemini_result.feedback.missing_skills,
            recommendations_json={
                "skills": gemini_result.feedback.recommended_skills,
                "projects": gemini_result.feedback.recommended_projects,
                "certifications": gemini_result.feedback.recommended_certifications,
                "career_suggestions": gemini_result.feedback.career_suggestions,
                "top_rejection_reasons": gemini_result.feedback.top_rejection_reasons,
            },
            improvement_plan_json=gemini_result.feedback.improvement_plan,
            alternative_roles_json=gemini_result.feedback.alternative_roles_suggested,
            skill_guide_json=gemini_result.feedback.skill_acquisition_guide,
            jd_comparison_json=[item.model_dump() for item in gemini_result.feedback.jd_resume_comparison],
            raw_llm_response=gemini_result.model_dump_json(),
        )
        db.add(report)
        await db.commit()

        # 6. Push basic info to OUR Google Sheet (same as internal flow)
        if candidate:
            loop = asyncio.get_event_loop()
            loop.run_in_executor(None, upsert_candidate_info, candidate)

        # 7. Push basic info to the STARTUP's Google Sheet (background)
        if client.google_sheet_url and candidate:
            background_tasks.add_task(
                push_candidate_to_sheet,
                google_sheet_url=client.google_sheet_url,
                name=candidate.name or "",
                phone=candidate.phone_number or "",
                email=candidate.email or "",
                college=candidate.college_name or "",
                branch=candidate.branch or "",
                target_role=target_role,
            )

        # 8. Return ONLY the basic info to the startup
        return ExternalAnalysisResponse(
            name=candidate.name if candidate else None,
            phone_number=candidate.phone_number if candidate else None,
            email=candidate.email if candidate else None,
            college_name=candidate.college_name if candidate else None,
            branch=candidate.branch if candidate else None,
            target_role=target_role,
            message=f"Analysis completed. Usage: {client.current_usage}/{client.monthly_limit}",
        )

    except HTTPException:
        raise
    except Exception as e:
        await db.rollback()
        logger.error(f"[External API] Analysis failed: {e}", exc_info=True)
        raise HTTPException(status_code=500, detail=str(e))


# ─────────────────────────────────────────────────────────────────────────────
# ADMIN ENDPOINTS  (For you to manage API clients)
# ─────────────────────────────────────────────────────────────────────────────

async def verify_admin(x_admin_secret: str = Header(..., alias="X-Admin-Secret")):
    """Simple admin auth — protect client management endpoints."""
    if x_admin_secret != ADMIN_SECRET:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Invalid admin secret.")


@app.post("/admin/api-clients", response_model=APIClientResponse, dependencies=[Depends(verify_admin)])
async def create_api_client(payload: APIClientCreate, db: AsyncSession = Depends(get_db)):
    """Register a new startup and generate their unique API key."""
    client = APIClient(
        name=payload.name,
        google_sheet_url=payload.google_sheet_url,
        monthly_limit=payload.monthly_limit,
    )
    db.add(client)
    await db.commit()
    await db.refresh(client)
    logger.info(f"[Admin] Created API client '{client.name}' with key {client.api_key[:12]}...")
    return client


@app.get("/admin/api-clients", response_model=list[APIClientResponse], dependencies=[Depends(verify_admin)])
async def list_api_clients(db: AsyncSession = Depends(get_db)):
    """List all registered startups."""
    result = await db.execute(select(APIClient).order_by(APIClient.created_at.desc()))
    return result.scalars().all()


@app.get("/admin/api-clients/{client_id}", response_model=APIClientResponse, dependencies=[Depends(verify_admin)])
async def get_api_client(client_id: int, db: AsyncSession = Depends(get_db)):
    """Get details for a specific API client."""
    result = await db.execute(select(APIClient).where(APIClient.id == client_id))
    client = result.scalars().first()
    if not client:
        raise HTTPException(status_code=404, detail="API client not found.")
    return client


@app.put("/admin/api-clients/{client_id}/sheet", dependencies=[Depends(verify_admin)])
async def update_client_sheet(client_id: int, google_sheet_url: str = Form(...), db: AsyncSession = Depends(get_db)):
    """Update the Google Sheet URL for a client."""
    result = await db.execute(select(APIClient).where(APIClient.id == client_id))
    client = result.scalars().first()
    if not client:
        raise HTTPException(status_code=404, detail="API client not found.")
    client.google_sheet_url = google_sheet_url
    await db.commit()
    return {"message": f"Google Sheet URL updated for '{client.name}'."}


@app.put("/admin/api-clients/{client_id}/deactivate", dependencies=[Depends(verify_admin)])
async def deactivate_api_client(client_id: int, db: AsyncSession = Depends(get_db)):
    """Deactivate a startup's API access."""
    result = await db.execute(select(APIClient).where(APIClient.id == client_id))
    client = result.scalars().first()
    if not client:
        raise HTTPException(status_code=404, detail="API client not found.")
    client.is_active = False
    await db.commit()
    return {"message": f"API client '{client.name}' has been deactivated."}


@app.get("/api/v1/external/usage", response_model=APIClientUsageResponse)
async def check_usage(
    client: APIClient = Depends(verify_api_key),
):
    """Startups can check their own quota usage with their API key."""
    return APIClientUsageResponse(
        name=client.name,
        monthly_limit=client.monthly_limit,
        current_usage=client.current_usage,
        remaining=max(0, client.monthly_limit - client.current_usage),
        billing_cycle_start=client.billing_cycle_start,
    )

@app.post("/api/leads")
async def create_api_lead(payload: APILeadCreate, db: AsyncSession = Depends(get_db)):
    """Capture lead information from startups requesting API access."""
    lead = APILead(
        name=payload.name,
        email=payload.email,
        phone=payload.phone,
        company=payload.company,
        use_case=payload.useCase,
    )
    db.add(lead)
    await db.commit()
    logger.info(f"[Lead Capture] New API request from {lead.name} at {lead.company}")
    return {"message": "Lead captured successfully"}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("app.main:app", host="0.0.0.0", port=8000, reload=True)

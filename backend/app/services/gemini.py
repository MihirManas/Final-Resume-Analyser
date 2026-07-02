import os
import json
import asyncio
import logging
from google import genai
from google.genai import types
from app.schemas import ExtractionScoreOutput, FeedbackOutput, RewriteOutput, FullGeminiResult, JobMatchEvaluationOutput
from dotenv import load_dotenv

load_dotenv()
logger = logging.getLogger(__name__)

PRIMARY_MODEL = "gemini-2.5-flash"
FALLBACK_MODEL = "gemini-2.0-flash"

RETRY_DELAYS = [1, 3, 6]
RETRYABLE_STATUS_CODES = {429, 500, 502, 503, 504}

def _build_job_match_prompt(resume_md: str, job_requirements: str) -> str:
    return f"""
    You are an expert technical recruiter matching candidates to job postings.
    
    JOB REQUIREMENTS:
    {job_requirements}
    
    CANDIDATE RESUME:
    {resume_md}
    
    TASK: Compare the candidate's resume against the job requirements.
    1. Calculate a match_percentage (0 to 100) indicating how well the candidate fits the role. Be strict but fair.
    2. Extract a list of missing_requirements that the job explicitly asks for but the candidate does not have.
    
    OUTPUT: Strictly a JSON object matching the requested schema.
    """

def _build_extraction_prompt(resume_md: str, target_role: str, jd_md: str = None) -> str:
    jd_context = f"JOB DESCRIPTION:\n{jd_md}" if jd_md else f"NO JD. Benchmark for: {target_role}"
    from datetime import datetime
    current_date = datetime.now().strftime("%B %d, %Y")

    return f"""
    You are an elite ATS parsing system and Technical Recruiter.
    Current Date: {current_date}

    {jd_context}
    
    CANDIDATE RESUME:
    {resume_md}
    
    TASK: Extract structured candidate details, feature vectors, and calculate scores based STRICTLY on the text.
    1. Level 1 Features: Calculate years of experience precisely, count projects, internships, etc. Length is rough word count.
    2. Level 2 Features: Extract array of technical skills/tools explicitly mentioned.
    3. Level 3 Features: If JD exists, output a dictionary mapping specific JD requirements to 1 (found) or 0 (missing). If no JD, return empty dict.
    4. Scores (0-100): 
       - ATS Score: Evaluate based ONLY on resume quality, structure, grammar, and parsability. (If the resume is well-written, ATS should be high regardless of role match).
       - ATS Logic: Provide a precise string explaining the exact logic for the ATS score, specifically highlighting the problems or good parts of the resume for ATS systems.
       - Skill, Project, Portfolio Scores: Evaluate based heavily on how well they MATCH the Target Role ({target_role}) or JD.
       - Employability & Interview Scores: Represent OVERALL alignment. Balance resume quality with the target role fit. If the candidate's background is irrelevant to the target role, penalize these to reflect the poor fit.
       - Role Fit Score: Strictly how well the candidate matches the target role/JD.
    5. Shortlist Probability: Based ONLY on JD and resume alignment. Return a percentage (e.g., "75%") or "No Info" if no JD.
    6. Dissect degree and branch. Interested Field is {target_role}. Potential field is top 1 alternative.
    7. Date Analysis: If a job posting date is available in the JD context, calculate the difference between the posting date and the Current Date. Store an explicit sentence like 'The job was posted X months ago, which might reduce the response rate.' inside 'jd_date_analysis'. If no date or JD, return null.
    
    OUTPUT: Strictly a JSON object matching the requested schema.
    """

def _build_feedback_prompt(extraction_json: str, user_problems: str = None) -> str:
    problems_context = f"CANDIDATE CHALLENGES:\n{user_problems}" if user_problems else ""
    return f"""
    You are an elite Career Coach. Based on this candidate's extracted data and scores:
    {extraction_json}
    
    {problems_context}
    
    TASK: Generate highly personalized feedback, strengths, weaknesses, and a concrete improvement plan.
    IMPORTANT: For strengths and weaknesses, do NOT just state the score. You must EXPLAIN the score constructively. Instead of "Portfolio score is 75", say "The projects are weak leading to a weak portfolio, which is why your portfolio score is only 75. Try to do some strong industry-oriented projects like X and Y."
    
    SKILLS CATEGORIZATION:
    Categorize skills into absolute_necessary_skills, good_to_have_skills, and need_to_learn_skills. 
    Provide a skills_logic string explaining why you categorized them this way based on the role.

    JOB MATCHES:
    Generate a list of recommended_job_matches. These should be jobs that actually suit the resume. Provide the job_title and a match_logic string explaining exactly why this job is a fit for the candidate's current background.
    
    Provide actionable steps for skill acquisition. Address their specific challenges if provided.
    Crucially, generate a 'jd_resume_comparison' array matching exactly 5 to 8 core criteria from the JD vs the Resume. If there is no JD context available in the extraction, return an empty array for jd_resume_comparison.
    
    OUTPUT: Strictly a JSON object matching the requested schema.
    """

def _build_rewrite_prompt(resume_md: str, feedback_json: str) -> str:
    return f"""
    You are an elite Executive Resume Writer.
    
    ORIGINAL RESUME:
    {resume_md}
    
    FEEDBACK & IMPROVEMENT PLAN:
    {feedback_json}
    
    TASK: Rewrite the resume applying ALL the suggested improvements. 
    Use strong action verbs, quantify achievements where plausible based on context, and restructure for maximum ATS impact.
    Format the output as professional Markdown.
    
    OUTPUT: Strictly a JSON object matching the requested schema with a single key 'rewritten_resume_markdown'.
    """

def _is_retryable_error(error: Exception) -> bool:
    error_str = str(error)
    for code in RETRYABLE_STATUS_CODES:
        if str(code) in error_str: return True
    for kw in ["overloaded", "unavailable", "temporarily", "capacity", "rate limit", "quota"]:
        if kw.lower() in error_str.lower(): return True
    return False

async def _call_gemini_with_retries(client, model_name: str, prompt: str, schema_class, temp: float):
    last_error = None
    for attempt, delay in enumerate(RETRY_DELAYS, start=1):
        try:
            config_params = {
                "response_mime_type": "application/json",
                "response_schema": schema_class,
                "temperature": temp,
            }
            if "2.5" in model_name:
                config_params["thinking_config"] = types.ThinkingConfig(thinking_budget=4096)

            response = client.models.generate_content(
                model=model_name,
                contents=prompt,
                config=types.GenerateContentConfig(**config_params),
            )
            data = json.loads(response.text)
            return schema_class(**data)
        except Exception as e:
            last_error = e
            if _is_retryable_error(e):
                if attempt < len(RETRY_DELAYS):
                    await asyncio.sleep(delay)
                    continue
                else: raise
            else: raise
    raise last_error

async def analyze_resume(resume_md: str, target_role: str, jd_md: str = None, user_problems: str = None) -> FullGeminiResult:
    api_key = os.getenv("GEMINI_API_KEY")
    if not api_key: raise Exception("GEMINI_API_KEY is missing.")
    client = genai.Client(api_key=api_key)

    # STEP 1: Extraction & Scoring (Temp = 0)
    ext_prompt = _build_extraction_prompt(resume_md, target_role, jd_md)
    try:
        extraction = await _call_gemini_with_retries(client, PRIMARY_MODEL, ext_prompt, ExtractionScoreOutput, 0.0)
    except Exception as e:
        logger.warning(f"Primary failed for extraction: {e}")
        extraction = await _call_gemini_with_retries(client, FALLBACK_MODEL, ext_prompt, ExtractionScoreOutput, 0.0)

    # STEP 2: Feedback Generation (Temp = 0.2)
    fb_prompt = _build_feedback_prompt(extraction.model_dump_json(), user_problems)
    try:
        feedback = await _call_gemini_with_retries(client, PRIMARY_MODEL, fb_prompt, FeedbackOutput, 0.2)
    except Exception as e:
        logger.warning(f"Primary failed for feedback: {e}")
        feedback = await _call_gemini_with_retries(client, FALLBACK_MODEL, fb_prompt, FeedbackOutput, 0.2)

    return FullGeminiResult(extraction=extraction, feedback=feedback)

async def rewrite_resume_background(resume_md: str, feedback_json: str) -> str:
    """Used in the background pipeline to augment data."""
    api_key = os.getenv("GEMINI_API_KEY")
    client = genai.Client(api_key=api_key)
    prompt = _build_rewrite_prompt(resume_md, feedback_json)
    try:
        res = await _call_gemini_with_retries(client, PRIMARY_MODEL, prompt, RewriteOutput, 0.5)
        return res.rewritten_resume_markdown
    except Exception:
        res = await _call_gemini_with_retries(client, FALLBACK_MODEL, prompt, RewriteOutput, 0.5)
        return res.rewritten_resume_markdown

async def evaluate_job_match(resume_md: str, job_requirements: str) -> JobMatchEvaluationOutput:
    api_key = os.getenv("GEMINI_API_KEY")
    if not api_key: raise Exception("GEMINI_API_KEY is missing.")
    client = genai.Client(api_key=api_key)
    prompt = _build_job_match_prompt(resume_md, job_requirements)
    
    try:
        match_result = await _call_gemini_with_retries(client, PRIMARY_MODEL, prompt, JobMatchEvaluationOutput, 0.2)
        return match_result
    except Exception as e:
        logger.warning(f"Primary failed for job match evaluation: {e}")
        match_result = await _call_gemini_with_retries(client, FALLBACK_MODEL, prompt, JobMatchEvaluationOutput, 0.2)
        return match_result


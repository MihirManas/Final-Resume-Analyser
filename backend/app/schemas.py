from pydantic import BaseModel
from typing import List, Optional, Any
from datetime import datetime

class AnalysisResponse(BaseModel):
    analysis_id: int
    message: str

class CandidateInfo(BaseModel):
    name: Optional[str]
    phone_number: Optional[str]
    email: Optional[str]
    college_name: Optional[str]
    degree: Optional[str]
    branch: Optional[str]
    graduation_year: Optional[str]
    interested_field: Optional[str]
    potential_field: Optional[str]
    speaking_languages: List[str]
    major_remark_for_problem: Optional[str]

class JDFeature(BaseModel):
    skill_name: str
    is_present: int

class JDComparisonItem(BaseModel):
    criteria: str
    jd_requirement: str
    resume_status: str
    match: bool

class Level1Features(BaseModel):
    years_experience: float
    project_count: int
    internship_count: int
    education_count: int
    publication_count: int
    leadership_roles: int
    achievements_count: int
    resume_length_words: int
    grammar_score: float
    ats_score: float

class ExtractionScoreOutput(BaseModel):
    candidate_info: CandidateInfo
    level_1_features: Level1Features
    level_2_features: List[str]  # Dynamic tech stack array
    level_3_features: List[JDFeature]  # JD specific boolean matches as list of objects to avoid Gemini schema errors
    
    # Overview Scores
    employability_score: int
    ats_score: int
    ats_logic: str
    skill_score: int
    project_score: int
    portfolio_score: int
    interview_score: int
    role_fit_score: int
    shortlist_probability: str  # e.g., "75%", "No Info"
    jd_date_analysis: str # Mentions the current date vs the job post date. Return "Not Applicable" if no JD or no date.

class RecommendedJobMatch(BaseModel):
    job_title: str
    match_logic: str

class ImprovementPhase(BaseModel):
    phase: str
    title: str
    plan: str
    roadmap: List[str]

class FeedbackOutput(BaseModel):
    strengths: List[str]
    weaknesses: List[str]
    missing_skills: List[str]
    top_rejection_reasons: List[str]
    recommended_skills: List[str]
    
    absolute_necessary_skills: List[str]
    good_to_have_skills: List[str]
    need_to_learn_skills: List[str]
    skills_logic: str
    
    recommended_projects: List[str]
    recommended_certifications: List[str]
    career_suggestions: List[str]
    
    recommended_job_matches: List[RecommendedJobMatch]
    improvement_plan: List[ImprovementPhase]
    alternative_roles_suggested: List[str]
    skill_acquisition_guide: List[str]
    jd_resume_comparison: List[JDComparisonItem]
    estimated_improved_score: int

class RewriteOutput(BaseModel):
    rewritten_resume_markdown: str

class ModelVoteOutput(BaseModel):
    prediction: str  # "Yes" or "No"
    confidence: float
    reason: str

class FullGeminiResult(BaseModel):
    extraction: ExtractionScoreOutput
    feedback: FeedbackOutput

class DashboardReport(BaseModel):
    employability_score: int
    ats_score: int
    skill_score: int
    project_score: int
    portfolio_score: int
    interview_score: int
    
    strengths: List[str]
    weaknesses: List[str]
    missing_skills: List[str]
    
    recommendations: dict
    improvement_plan: List[Any]
    alternative_roles_suggested: List[str]
    skill_acquisition_guide: List[str]
    
    ats_logic: Optional[str] = None
    absolute_necessary_skills: Optional[List[str]] = None
    good_to_have_skills: Optional[List[str]] = None
    need_to_learn_skills: Optional[List[str]] = None
    skills_logic: Optional[str] = None
    recommended_job_matches: Optional[List[dict]] = None
    
    role_fit: int
    estimated_improved_score: int
    shortlist_probability: str
    jd_date_analysis: Optional[str] = None
    jd_resume_comparison: Optional[List[dict]] = None

class JobPostingCreate(BaseModel):
    company_name: str
    job_title: str
    job_url: str
    location: Optional[str] = None
    requirements: str
    tags: Optional[str] = None

class JobPostingResponse(JobPostingCreate):
    id: int
    date_posted: Any # datetime
    created_at: Any # datetime

class JobFeedItem(BaseModel):
    job_id: int
    company_name: str
    job_title: str
    job_url: str
    date_posted: Any # datetime
    match_percentage: int
    missing_requirements: List[str]

class PersonalizedFeedResponse(BaseModel):
    tier_90_plus: List[JobFeedItem]
    tier_80_plus: List[JobFeedItem]

class JobMatchEvaluationOutput(BaseModel):
    match_percentage: int
    missing_requirements: List[str]


# ─── External API Schemas ─────────────────────────────────────────────────────

class ExternalAnalysisResponse(BaseModel):
    """The ONLY data returned to third-party startups."""
    name: Optional[str] = None
    phone_number: Optional[str] = None
    email: Optional[str] = None
    college_name: Optional[str] = None
    branch: Optional[str] = None
    target_role: str
    message: str = "Analysis completed"

class APIClientCreate(BaseModel):
    """Admin request to register a new startup."""
    name: str
    google_sheet_url: Optional[str] = None
    monthly_limit: int = 1000

class APILeadCreate(BaseModel):
    name: str
    email: str
    phone: str
    company: str
    useCase: Optional[str] = None

class APIClientResponse(BaseModel):
    """Returned after creating a new API client."""
    id: int
    name: str
    api_key: str
    google_sheet_url: Optional[str] = None
    monthly_limit: int
    current_usage: int
    is_active: bool
    created_at: Any

class APIClientUsageResponse(BaseModel):
    """Quick usage check for a startup."""
    name: str
    monthly_limit: int
    current_usage: int
    remaining: int
    billing_cycle_start: Any

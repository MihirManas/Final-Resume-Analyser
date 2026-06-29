from pydantic import BaseModel
from typing import List, Optional, Any

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
    skill_score: int
    project_score: int
    portfolio_score: int
    interview_score: int
    role_fit_score: int
    shortlist_probability: str  # e.g., "75%", "No Info"
    jd_date_analysis: str # Mentions the current date vs the job post date. Return "Not Applicable" if no JD or no date.

class FeedbackOutput(BaseModel):
    strengths: List[str]
    weaknesses: List[str]
    missing_skills: List[str]
    top_rejection_reasons: List[str]
    recommended_skills: List[str]
    recommended_projects: List[str]
    recommended_certifications: List[str]
    career_suggestions: List[str]
    improvement_plan: List[str]
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
    improvement_plan: List[str]
    alternative_roles_suggested: List[str]
    skill_acquisition_guide: List[str]
    
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



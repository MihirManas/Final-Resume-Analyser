import secrets
from sqlalchemy import Column, Integer, String, Float, ForeignKey, DateTime, JSON, Boolean
from sqlalchemy.orm import relationship
from datetime import datetime
from .database import Base


class APIClient(Base):
    """Third-party startup accounts that consume the external API."""
    __tablename__ = "api_clients"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, index=True)  # e.g. "CourseWala"
    api_key = Column(String, unique=True, index=True, default=lambda: f"jes_{secrets.token_hex(24)}")
    google_sheet_url = Column(String, nullable=True)  # Link provided by the startup
    monthly_limit = Column(Integer, default=1000)
    current_usage = Column(Integer, default=0)
    billing_cycle_start = Column(DateTime, default=datetime.utcnow)
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime, default=datetime.utcnow)

    analyses = relationship("ResumeAnalysis", back_populates="api_client")

class APILead(Base):
    """Lead capture for startups requesting API access."""
    __tablename__ = "api_leads"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String)
    email = Column(String)
    phone = Column(String)
    company = Column(String)
    use_case = Column(String, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, index=True)
    email = Column(String, unique=True, index=True)
    phone = Column(String, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)

    analyses = relationship("ResumeAnalysis", back_populates="user")

class AnalysisCache(Base):
    __tablename__ = "analysis_cache"

    id = Column(Integer, primary_key=True, index=True)
    hash_key = Column(String, unique=True, index=True)
    result_json = Column(JSON)
    created_at = Column(DateTime, default=datetime.utcnow)

class ResumeAnalysis(Base):
    __tablename__ = "resume_analyses"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=True)
    api_client_id = Column(Integer, ForeignKey("api_clients.id"), nullable=True)
    target_role = Column(String, index=True)
    resume_filename = Column(String)
    jd_filename = Column(String, nullable=True)
    user_problems = Column(String, nullable=True)
    
    # Overview Scores
    employability_score = Column(Float, nullable=True)
    ats_score = Column(Float, nullable=True)
    skill_score = Column(Float, nullable=True)
    project_score = Column(Float, nullable=True)
    portfolio_score = Column(Float, nullable=True)
    interview_score = Column(Float, nullable=True)
    
    # ML Features
    level_1_features = Column(JSON, nullable=True)
    level_2_features = Column(JSON, nullable=True)
    level_3_features = Column(JSON, nullable=True)
    shortlist_probability = Column(String, nullable=True)
    jd_date_analysis = Column(String, nullable=True)
    real_result = Column(String, nullable=True)

    created_at = Column(DateTime, default=datetime.utcnow)

    user = relationship("User", back_populates="analyses")
    api_client = relationship("APIClient", back_populates="analyses")
    report = relationship("AnalysisReport", back_populates="analysis", uselist=False)
    evaluations = relationship("ModelEvaluation", back_populates="analysis")

class ModelEvaluation(Base):
    __tablename__ = "model_evaluations"

    id = Column(Integer, primary_key=True, index=True)
    analysis_id = Column(Integer, ForeignKey("resume_analyses.id"))
    model_name = Column(String, index=True)
    prediction = Column(String)  # 'Yes' or 'No'
    confidence = Column(Float)   # 0.0 to 1.0
    reason = Column(String)
    created_at = Column(DateTime, default=datetime.utcnow)

    analysis = relationship("ResumeAnalysis", back_populates="evaluations")

class AnalysisReport(Base):
    __tablename__ = "analysis_reports"

    id = Column(Integer, primary_key=True, index=True)
    analysis_id = Column(Integer, ForeignKey("resume_analyses.id"), unique=True)
    
    # Detailed JSON chunks for the dashboard
    strengths_json = Column(JSON, nullable=True)
    weaknesses_json = Column(JSON, nullable=True)
    missing_skills_json = Column(JSON, nullable=True)
    recommendations_json = Column(JSON, nullable=True)
    improvement_plan_json = Column(JSON, nullable=True)
    alternative_roles_json = Column(JSON, nullable=True)
    skill_guide_json = Column(JSON, nullable=True)
    jd_comparison_json = Column(JSON, nullable=True)
    
    # Store the raw text just in case
    raw_llm_response = Column(String, nullable=True)

    analysis = relationship("ResumeAnalysis", back_populates="report")

class JobPosting(Base):
    __tablename__ = "job_postings"

    id = Column(Integer, primary_key=True, index=True)
    company_name = Column(String, index=True)
    job_title = Column(String, index=True)
    job_url = Column(String)
    location = Column(String, nullable=True)
    requirements = Column(String) # Raw text or JSON
    tags = Column(String, nullable=True) # e.g., 'Data Analyst, Python'
    date_posted = Column(DateTime, default=datetime.utcnow)
    created_at = Column(DateTime, default=datetime.utcnow)

    matches = relationship("JobMatch", back_populates="job")

class JobMatch(Base):
    __tablename__ = "job_matches"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), index=True)
    analysis_id = Column(Integer, ForeignKey("resume_analyses.id"), index=True)
    job_id = Column(Integer, ForeignKey("job_postings.id"), index=True)
    
    match_percentage = Column(Integer) # 0 to 100
    missing_requirements = Column(JSON, nullable=True) # List of missing skills/reqs
    created_at = Column(DateTime, default=datetime.utcnow)

    user = relationship("User")
    analysis = relationship("ResumeAnalysis")
    job = relationship("JobPosting", back_populates="matches")

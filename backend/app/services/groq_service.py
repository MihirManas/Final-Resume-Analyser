import os
import json
import logging
import asyncio
from groq import AsyncGroq
from app.schemas import ModelVoteOutput
from dotenv import load_dotenv

load_dotenv()
logger = logging.getLogger(__name__)

# Models available on Groq free tier
VOTING_MODELS = [
    "llama-3.3-70b-versatile",
    "qwen-2.5-32b",
    "mixtral-8x7b-32768"
]

def _build_voting_prompt(resume_md: str, target_role: str, jd_md: str = None) -> str:
    jd_context = f"JOB DESCRIPTION:\n{jd_md}" if jd_md else f"Target Role Benchmark: {target_role}"
    
    schema_json = json.dumps(ModelVoteOutput.model_json_schema(), indent=2)
    
    return f"""
    You are an expert Hiring Manager.
    
    {jd_context}
    
    CANDIDATE RESUME:
    {resume_md}
    
    TASK: Evaluate if this candidate should be shortlisted for an interview.
    1. Prediction: Must be strictly "Yes" or "No".
    2. Confidence: A float between 0.0 and 1.0 indicating how certain you are.
    3. Reason: A concise 1-sentence reason.
    
    Respond STRICTLY with a valid JSON object matching this schema:
    {schema_json}
    """

async def _call_groq_model(client: AsyncGroq, model_name: str, prompt: str) -> ModelVoteOutput:
    try:
        logger.info(f"Calling Groq Model: {model_name} for Voting")
        chat_completion = await client.chat.completions.create(
            messages=[{"role": "user", "content": prompt}],
            model=model_name,
            response_format={"type": "json_object"},
            temperature=0.0,
        )
        data = json.loads(chat_completion.choices[0].message.content)
        return ModelVoteOutput(**data)
    except Exception as e:
        logger.error(f"Groq Model {model_name} failed: {e}")
        # Return a fallback neutral vote so the pipeline doesn't crash
        return ModelVoteOutput(prediction="No", confidence=0.0, reason=f"API Error: {str(e)}")

async def run_consensus_voting(resume_md: str, target_role: str, jd_md: str = None) -> dict[str, ModelVoteOutput]:
    """Runs all 3 models concurrently and returns their votes."""
    api_key = os.getenv("GROQ_API_KEY")
    if not api_key:
        logger.warning("GROQ_API_KEY is missing. Skipping consensus voting.")
        return {}

    client = AsyncGroq(api_key=api_key)
    prompt = _build_voting_prompt(resume_md, target_role, jd_md)
    
    # Run all 3 models in parallel!
    tasks = [
        _call_groq_model(client, model, prompt) for model in VOTING_MODELS
    ]
    results = await asyncio.gather(*tasks)
    
    votes = {}
    for model, result in zip(VOTING_MODELS, results):
        votes[model] = result
        
    return votes

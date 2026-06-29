import asyncio
from app.services.gemini import analyze_resume

async def test():
    resume_md = "Software Engineer with 5 years experience in Python and React."
    target_role = "Data Engineer"
    jd_md = "Feeling ready to spread your wings? What if your adventure started with us?! Whatever your dream job, we might have the internship for you!"
    try:
        res = await analyze_resume(resume_md, target_role, jd_md)
        print("SUCCESS!")
        print(res.extraction.jd_date_analysis)
        print(res.feedback.jd_resume_comparison)
    except Exception as e:
        print(f"FAILED: {e}")

if __name__ == "__main__":
    asyncio.run(test())

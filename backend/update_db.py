import asyncio
from app.database import engine

async def update_schema():
    async with engine.begin() as conn:
        try:
            await conn.execute(text("ALTER TABLE resume_analyses ADD COLUMN jd_date_analysis VARCHAR;"))
            print("Added jd_date_analysis to resume_analyses")
        except Exception as e:
            print(f"Column jd_date_analysis might already exist or error: {e}")
            
        try:
            await conn.execute(text("ALTER TABLE analysis_reports ADD COLUMN jd_comparison_json JSON;"))
            print("Added jd_comparison_json to analysis_reports")
        except Exception as e:
            print(f"Column jd_comparison_json might already exist or error: {e}")

        try:
            await conn.execute(text("ALTER TABLE resume_analyses ADD COLUMN resume_markdown VARCHAR;"))
            print("Added resume_markdown to resume_analyses")
        except Exception as e:
            print(f"Column resume_markdown might already exist or error: {e}")
            
        try:
            await conn.execute(text("ALTER TABLE resume_analyses ADD COLUMN jd_markdown VARCHAR;"))
            print("Added jd_markdown to resume_analyses")
        except Exception as e:
            print(f"Column jd_markdown might already exist or error: {e}")

if __name__ == "__main__":
    from sqlalchemy import text
    asyncio.run(update_schema())

import asyncio
import os
import sys

# Add the backend folder to the path so we can import the models
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), '..', 'backend')))

from sqlalchemy.ext.asyncio import create_async_engine
from app.models import Base

async def init_remote_db():
    print("Initializing Remote PostgreSQL Database...")
    
    # You MUST enter your Supabase or Neon database URL here!
    # Example: "postgresql+asyncpg://postgres:YourPassword@db.supabase.co:5432/postgres"
    DATABASE_URL = input("Enter your Cloud PostgreSQL URL (starts with postgresql+asyncpg://): ").strip()
    
    if not DATABASE_URL:
        print("Error: Database URL cannot be empty.")
        return

    try:
        print("Connecting to the database...")
        engine = create_async_engine(DATABASE_URL, echo=True)
        
        async with engine.begin() as conn:
            print("Creating tables if they don't exist...")
            await conn.run_sync(Base.metadata.create_all)
            
        print("✅ SUCCESS! All tables have been created securely in your cloud database.")
        print("You can now safely take this DATABASE_URL and put it in your Render Environment Variables!")
    except Exception as e:
        print(f"❌ ERROR connecting to database: {e}")

if __name__ == "__main__":
    asyncio.run(init_remote_db())

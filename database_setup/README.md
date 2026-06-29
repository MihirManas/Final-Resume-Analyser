# Remote Database Setup Guide

You requested to keep the database separate from Render so you understand exactly how it works. Here is your completely independent setup folder!

### Step 1: Get a Free Cloud PostgreSQL Database
I recommend **Supabase** (supabase.com) or **Neon** (neon.tech) because they are enterprise-grade, highly secure, and 100% free forever for small datasets.

1. Go to Supabase and create a new project.
2. Go to Project Settings -> Database -> Connection String.
3. Find the URL. It will look like this: `postgresql://postgres:[YOUR-PASSWORD]@db.xxxx.supabase.co:5432/postgres`
4. **CRITICAL:** Because our backend uses modern async python, you must change `postgresql://` to `postgresql+asyncpg://`.

### Step 2: Run the Setup Script from your PC
Open your terminal in this folder and run:
```bash
pip install sqlalchemy asyncpg
python setup_remote_db.py
```
Paste your URL when it asks. It will connect to the cloud and securely create all the tables (`users`, `resume_analyses`, `analysis_cache`, `model_evaluations`).

### Step 3: Connect it to Render
Now that your cloud database is fully initialized, you just need to tell your live website to talk to it!
1. Go to Render.com -> Your Web Service -> Environment Variables.
2. Add a new variable:
   - Key: `DATABASE_URL`
   - Value: `postgresql+asyncpg://...` (the exact same URL you pasted above).
3. Save. Render will automatically reboot and connect to your highly secure cloud database!

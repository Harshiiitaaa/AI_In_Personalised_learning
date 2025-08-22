# DSAWithAI (Fresh Build)

A full-stack, resume-ready DSA practice platform with:
- FastAPI backend (auth, practice flow, Judge0 integration, adaptive recommendations)
- React (Vite) frontend with Monaco editor, timer, dashboard/profile
- MongoDB for persistence
- Celery + Redis for 3-day reminders on failed attempts
- Optional Chatbot via OpenAI/Gemini API
- Dockerized for one-command startup

## Quick Start (Docker - recommended)

```bash
git clone <this project>
cd DSAWithAI
cp backend/.env.example backend/.env  # edit the values
# Optional: put your Judge0 RapidAPI creds and OPENAI_API_KEY

docker compose up --build
```

- Frontend: http://localhost:5173
- Backend: http://localhost:8000/docs (OpenAPI docs)
- MongoDB: localhost:27017
- Redis: localhost:6379

## Running without Docker (dev only)

Backend:
```bash
cd backend
python -m venv .venv && source .venv/bin/activate  # on Windows: .venv\Scripts\activate
pip install -r requirements.txt
cp .env.example .env  # edit values
uvicorn app.main:app --reload --port 8000
```

Worker:
```bash
cd backend
celery -A app.tasks.celery worker --loglevel=INFO
```

Frontend:
```bash
cd frontend
npm i
npm run dev
```

## Environment Variables

See `backend/.env.example`. Minimum to change:
- `SECRET_KEY` (any random string)
- `ALLOWED_ORIGINS` (default is http://localhost:5173)
- For real code execution add Judge0 creds:
  - `JUDGE0_URL=https://judge0-ce.p.rapidapi.com`
  - `JUDGE0_KEY=YOUR_KEY`
  - `JUDGE0_HOST_HEADER=judge0-ce.p.rapidapi.com`
- For reminders via email, set SMTP vars; otherwise logs are printed.

## Features Implemented

- ✅ Sign up / Login (JWT)
- ✅ Dashboard shows user & solved count
- ✅ Start session by company/topic or general
- ✅ Problem view: question + LeetCode link + Monaco editor + visible timer
- ✅ Run code (Judge0) + Submit
- ✅ Adaptive next question (Easy/Medium/Hard based on time & result)
- ✅ Failed attempt schedules 3-day reminder via Celery + Redis
- ✅ Profile page with stats
- ✅ Chat endpoint stub (enable by adding API key)

## Notes

- The dataset is loaded from `backend/dataset/leetcode_dataset.csv` and imported into Mongo on first `/practice/start`.
- Judge0 language IDs vary. In the UI we use 62 (Node.js). Change as you like.
- Email reminders print to console unless SMTP envs are provided.
- This repo is structured to be recruiter-friendly and easy to demo.

Good luck and ship it 🚀

# Adaptive DSA Practice & AI Tutoring Platform

A full‑stack platform for coding interview preparation that *adapts* problem difficulty, provides an in‑browser multi-language editor with remote execution, and offers on-demand AI hints/explanations.

## Key Features
- **Adaptive Recommendation**: Confidence-based difficulty progression using recent attempt outcomes.
- **AI Tutor (Gemini)**: Contextual hints or full solutions via prompt-engineered LLM calls.
- **Real-Time Code Execution**: Judge0 integration (JS, Python, Java, C, C++) with async polling.
- **Progress Analytics**: Streak, success rate, recent problems, attempt history.
- **Session Persistence**: Dynamic queue of problems maintained across navigation.
- **Extensible Architecture**: FastAPI async services + optional Celery/Redis tasks (reminders, future spaced repetition).

## Architecture Overview
| Layer      | Tech / Tools |
|------------|--------------|
| Frontend   | React, Vite, Monaco Editor, Axios, Tailwind-esque utilities |
| Backend    | FastAPI (async), Motor (MongoDB), Pydantic Settings |
| ML / Logic | scikit-learn (TF-IDF + NearestNeighbors), heuristic confidence scoring |
| AI Tutor   | Gemini (Google Generative AI) |
| Execution  | Judge0 API |
| Background | Celery + Redis (optional, currently for reminder scaffolding) |
| Data Store | MongoDB (users, questions, attempts) |

## Data & Recommender
1. CSV ingestion normalizes question fields.
2. Topics tokenized → TF-IDF vectors.
3. Numerical features scaled (acceptance_rate, frequency, rating, difficulty_numeric).
4. Concatenated feature space → cosine similarity search (NearestNeighbors).
5. Confidence score decides target difficulty band for next recommendation.

## Confidence Strategy (Simplified)
| Score Range | Strategy |
|-------------|----------|
| > 60        | Aggressive (jump up difficulty) |
| 21–60       | Standard (conditional escalation) |
| ≤ 20        | Conservative (reinforce or step down) |

## Getting Started

### Prerequisites
- Python 3.11+  
- MongoDB running locally (or URI)  
- Node.js 18+  
- (Optional) Redis for Celery tasks  
- Gemini + Judge0 API keys (optional; features degrade gracefully)

### Backend Setup
```bash
cd backend
python -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
cp .env.example .env   # fill in keys (SECRET_KEY, MONGO_URL, GEMINI_API_KEY, etc.)
python scripts/import_questions.py leetcode_dataset.csv  # optional ingestion
uvicorn app.main:app --reload
```

### Frontend Setup
```bash
cd frontend
npm install
npm run dev
```

### Optional: Celery Worker
```bash
celery -A app.celery_app.celery worker -l info
```

### Environment Variables (Sample)
```
SECRET_KEY=CHANGE_ME
MONGO_URL=mongodb://localhost:27017
MONGO_DB=dsa_with_ai
REDIS_URL=redis://localhost:6379/0
GEMINI_API_KEY=YOUR_GEMINI_KEY
JUDGE0_URL=https://judge0-ce.p.rapidapi.com
JUDGE0_KEY=YOUR_RAPIDAPI_KEY
JUDGE0_HOST_HEADER=judge0-ce.p.rapidapi.com
```

### API Highlights
| Endpoint                 | Method | Description |
|--------------------------|--------|-------------|
| /auth/signup             | POST   | Register user |
| /auth/login              | POST   | Obtain JWT |
| /auth/me                 | GET    | Current user profile |
| /practice/start          | POST   | Fetch initial problem(s) |
| /practice/run            | POST   | Execute code via Judge0 |
| /practice/submit         | POST   | Record attempt + get next recommendation |
| /stats/profile           | GET    | User stats (streak, success rate) |
| /chat/ask                | POST   | AI tutor hint/answer |

## Folder Structure (Recommended)
```
backend/
  app/
    core/ (config, logging)
    auth/
    practice/
    recommender/
    chatbot/
    execution/
    tasks/
    schemas/
    db/
frontend/
  src/
    api/
    pages/
    components/
    hooks/
    styles/
```

## Future Enhancements
- Server-side validation of durations & anti-abuse
- Streaming AI responses
- Topic mastery heatmaps
- Spaced repetition scheduling (Celery beat)
- Rate limiting & refresh tokens
- Persisted recommender artifacts (avoid rebuild on every start)
- Test suite expansion + CI integration

## Metrics (Sample – Replace with Real)
- ~XX questions ingested
- Recommendation latency: ~XX ms
- Execution turnaround median: ~X.X s
- Tutor success (non-error) responses: ~XX%
- Average confidence uplift after correct fast solves: +YY points

## Testing (Suggested)
```bash
pytest -q
```
(Placeholder: Add unit tests for recommender, auth, submit flow.)

## License
MIT (or chosen license)

## Acknowledgements
- Judge0 CE
- Google Generative AI (Gemini)
- scikit-learn & FastAPI communities

---
*Replace placeholders before publishing.*  
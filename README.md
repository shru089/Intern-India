# Intern-India 🇮🇳

**AI-powered internship discovery and tracking platform built for Indian students, with a focus on government and rural-first opportunities.**

Intern-India matches students with relevant internships using resume parsing, preference-based filtering, and a lightweight AI ranking engine. It includes a Kanban-style application tracker, government-focused scrapers (Internshala, AICTE), and a profile management system — all wrapped in a modern React + FastAPI stack.

---

## ✨ Features

- **AI Matchmaking** — Resume parsing + skills/domain/location scoring surfaces the most relevant roles
- **Government-First Discovery** — Custom scrapers for Internshala and AICTE with rural/social-category filters
- **Application Tracker** — Drag-and-drop Kanban board (Applied → Under Review → Accepted)
- **Profile Management** — Editable student profiles with LinkedIn, portfolio, and skills
- **JWT Authentication** — Secure login/register with protected routes
- **Telegram Alerts** — Optional bot notifications when new internships are scraped

---

## 🏗️ Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React 18, TypeScript, Vite, Tailwind CSS, Framer Motion |
| Backend | Python 3.11, FastAPI, Pydantic v1 |
| Primary DB | MongoDB (via Motor async driver) |
| Scraper DB | SQLite → PostgreSQL (via SQLAlchemy) |
| Auth | JWT (python-jose + passlib/bcrypt) |
| Mobile | Capacitor (Android) |

---

## 🚀 Getting Started

### Prerequisites

- Node.js ≥ 18
- Python ≥ 3.11
- MongoDB running locally (or a MongoDB Atlas URI)

### 1. Clone

```bash
git clone https://github.com/your-org/intern-india.git
cd intern-india
```

### 2. Frontend

```bash
# Install dependencies
npm install

# Create env file
cp .env.example .env.local
# Edit .env.local and set VITE_API_URL if your backend runs on a different port

# Start dev server (port 5175)
npm run dev
```

### 3. Backend

```bash
cd backend

# Create and activate a virtual environment
python -m venv .venv
.venv\Scripts\activate   # Windows
# source .venv/bin/activate  # macOS/Linux

# Install dependencies
pip install -r requirements.txt

# Create env file
cp .env.example .env
# Edit .env — at minimum set JWT_SECRET and MONGODB_URI

# Start the API server (port 8000)
uvicorn main:app --reload
```

API docs are available at `http://localhost:8000/docs`.

---

## 📂 Project Structure

```
intern-india/
├── backend/
│   ├── main.py            # FastAPI app entry point
│   ├── database.py        # MongoDB + SQLAlchemy setup
│   ├── models/            # Pydantic & SQLAlchemy models
│   ├── routers/           # API route handlers
│   ├── scrapers/          # Internshala, AICTE scrapers
│   ├── services/          # Resume parser, AI engine
│   └── utils/             # Telegram notifications, helpers
└── src/
    ├── api/               # Centralised API call layer
    ├── components/
    │   ├── common/        # Reusable UI components
    │   ├── layout/        # Page wrappers, nav
    │   └── pages/         # Route-level page components
    ├── contexts/          # AuthContext (JWT state)
    ├── services/          # Axios client config
    └── types/             # Shared TypeScript interfaces
```

---

## 🤝 Contributing

Pull requests are welcome. For major changes, please open an issue first to discuss what you'd like to change.

---

## 📄 License

MIT

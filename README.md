# ⚡ StadiumOps AI

**AI-Powered Smart Stadium & Tournament Operations Platform**

A full-stack hackathon-ready web application that brings enterprise-grade intelligence to stadium and tournament management using Google Gemini AI, real-time simulated data, and a beautiful dark-mode dashboard.

---

## 🚀 Features

| Feature | Description |
|---|---|
| 📊 **Live Dashboard** | Real-time KPIs: attendance, incidents, parking, weather, revenue |
| 🗺️ **Stadium Map** | Interactive SVG map with live crowd density (Green/Yellow/Red zones) |
| 🚨 **AI Incident Management** | Report incidents; Gemini AI auto-analyzes, assigns severity & recommends actions |
| 🤖 **AI Chatbot** | Ask "Which gate is overcrowded?" — AI responds with live context |
| 🚗 **Smart Parking** | Real-time occupancy tracking + AI demand predictions |
| 🍔 **Food Court Analytics** | Queue monitoring with 6-hour AI demand forecast |
| 👥 **Volunteer Management** | Deployment tracking with AI task recommendations |
| 🏆 **Tournament Manager** | Teams, fixtures (live/scheduled/completed), group standings |
| 🔔 **Notifications** | Emergency, warning, info alerts with role-based targeting |
| 📈 **Analytics** | Charts for attendance, incidents, revenue, parking, and crowd density |

---

## 🛠️ Tech Stack

**Frontend**
- React 18 + Vite + TypeScript
- Tailwind CSS (custom dark theme)
- Recharts (data visualization)
- Zustand (state management)
- Axios + React Router

**Backend**
- FastAPI (Python)
- SQLAlchemy + Alembic
- PostgreSQL
- Google Gemini AI (gemini-1.5-flash)
- JWT Authentication + bcrypt
- Swagger/OpenAPI docs at `/docs`

**Infrastructure**
- Docker + Docker Compose
- Nginx (frontend production)

---

## ⚡ Quick Start

### Option A: Docker (Recommended)

```bash
cd StadiumOps-AI
# Copy env and add your Gemini API key (optional)
cp backend/.env.example backend/.env

# Start everything
docker compose up --build

# Access:
# Frontend: http://localhost:5173
# API Docs: http://localhost:8000/docs
```

### Option B: Local Development

**Backend:**
```bash
cd backend
pip install -r requirements.txt
cp .env.example .env
# Edit .env with your DATABASE_URL and GEMINI_API_KEY

# Start PostgreSQL, then:
python app/db/seed.py      # seed database
uvicorn main:app --reload  # start API
```

**Frontend:**
```bash
cd frontend
npm install
npm run dev
```

---

## 🔑 Demo Login Accounts

| Role | Username | Password |
|---|---|---|
| Administrator | `admin` | `admin123` |
| Security Officer | `security` | `security123` |
| Medical Staff | `medical` | `medical123` |
| Operations Manager | `operations` | `ops123` |
| Volunteer | `volunteer` | `vol123` |

> **Note:** The app works fully in demo mode without a backend — all mock data is built into the frontend. Add a Gemini API key to unlock real AI analysis.

---

## 🤖 AI Features

### Gemini-Powered Incident Analysis
When an incident is reported, Gemini AI automatically:
- Determines severity (low/medium/high/critical)
- Writes a professional incident summary
- Generates numbered action recommendations
- Estimates resolution time
- Lists required resources

### AI Chatbot Context
The chatbot receives live stadium data on every query including attendance, zone densities, parking, food queues, and active incidents — then provides specific, actionable responses.

### Parking Demand Prediction
AI predicts occupancy percentage, peak arrival time, and staffing needs based on time of day, day of week, and match importance.

---

## 📡 API Reference

Full Swagger docs: `http://localhost:8000/docs`

Key endpoints:
- `POST /api/auth/login` — JWT authentication
- `GET /api/dashboard/kpis` — Live dashboard metrics
- `GET /api/zones/` — Stadium zone crowd data
- `POST /api/incidents/` — Report incident (triggers AI analysis)
- `GET /api/parking/prediction` — AI parking forecast
- `GET /api/foodcourt/demand-forecast` — AI food demand forecast
- `POST /api/chatbot/chat` — AI chatbot query
- `GET /api/tournament/standings` — Group standings

---

## 🏗️ Architecture

```
StadiumOps-AI/
├── frontend/
│   ├── src/
│   │   ├── pages/          # Route-level pages
│   │   ├── components/     # Reusable UI components
│   │   ├── lib/            # API client, utilities
│   │   ├── store/          # Zustand state
│   │   ├── types/          # TypeScript types
│   │   └── data/           # Mock data for demo
│   └── ...
├── backend/
│   ├── app/
│   │   ├── api/routes/     # FastAPI routers
│   │   ├── core/           # Security, config
│   │   ├── db/             # Database + seed
│   │   ├── models/         # SQLAlchemy models
│   │   ├── schemas/        # Pydantic schemas
│   │   └── services/       # AI & simulation services
│   └── main.py
├── docker-compose.yml
└── README.md
```

---

## 🔄 Live Simulation

The system auto-simulates realistic data changes every 5–10 seconds:
- Crowd density shifts based on time-of-day patterns
- Parking occupancy fluctuates naturally
- Food court queues vary with demand cycles
- Dashboard KPIs update automatically

This makes the platform perfect for hackathon demos without requiring real IoT devices.

---

## 📄 License

MIT License — Free for personal and commercial use.

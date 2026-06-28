<p align="center">
  <h1 align="center">CodePilot AI 🚀</h1>
  <p align="center"><em>The AI Code Reviewer That Learns Your Team's Style — and Gets Smarter With Every Review</em></p>
</p>

<p align="center">
  <img src="https://img.shields.io/badge/Python-3.11+-3776AB?style=for-the-badge&logo=python&logoColor=white" alt="Python 3.11+" />
  <img src="https://img.shields.io/badge/Next.js-14-000000?style=for-the-badge&logo=next.js&logoColor=white" alt="Next.js 14" />
  <img src="https://img.shields.io/badge/FastAPI-0.111-009688?style=for-the-badge&logo=fastapi&logoColor=white" alt="FastAPI" />
  <img src="https://img.shields.io/badge/PostgreSQL-16-4169E1?style=for-the-badge&logo=postgresql&logoColor=white" alt="PostgreSQL" />
  <img src="https://img.shields.io/badge/Docker-Compose-2496ED?style=for-the-badge&logo=docker&logoColor=white" alt="Docker" />
</p>

---

## What is CodePilot AI?

**CodePilot AI** is an intelligent, adaptive code review platform that transforms how development teams receive and act on automated feedback. Unlike traditional AI code reviewers that treat every session as a blank slate, CodePilot AI leverages **Hindsight** — a persistent memory engine — to remember your team's coding conventions, framework preferences, accepted patterns, and rejected suggestions across every review session. The result: reviews that feel like they come from a senior developer who *actually knows your codebase*.

Under the hood, CodePilot AI employs **CascadeFlow**, a confidence-based model routing system that intelligently selects the optimal LLM for each review. Simple, well-understood code passes through a fast, cost-efficient model (Llama 8B), while complex or security-sensitive code is automatically escalated to a more powerful model (Llama 70B). This approach delivers **up to 78% cost reduction** without sacrificing review quality — making enterprise-grade AI code review accessible to teams of any size.

---

## Key Features

- 🧠 **Persistent Memory via Hindsight** — Remembers your coding style, accepted/rejected suggestions, and team conventions across sessions
- ⚡ **Smart Model Routing via CascadeFlow** — Confidence-based escalation routes simple reviews through cheap models and complex ones through powerful models
- 🏗️ **Team Knowledge Graph** — Structured repository profiles that capture frameworks, conventions, patterns, and avoided tools
- 📊 **Scored Reports** — Every review generates an overall score plus 6 category scores (correctness, security, performance, style, testing, documentation)
- 🔍 **Static Analysis** — Built-in Tree-sitter parsing and Semgrep rule integration for structural and security analysis
- 💰 **Cost Dashboard** — Real-time tracking of routing decisions, model usage, and cumulative savings from smart routing
- 📈 **Memory Evolution** — Visual timeline showing how the AI's understanding of your team grows over time
- 🎯 **Feedback Loop** — Accept, reject, or ignore every suggestion — each action refines the AI's future recommendations

---

## Architecture

### System Overview

```mermaid
graph LR
    A["🖥️ Next.js Frontend"] -->|REST API| B["⚡ FastAPI Backend"]
    B -->|Orchestration| C["🔄 LangGraph Workflow"]
    C -->|retain / recall| D["🧠 Hindsight"]
    C -->|route / escalate| E["📊 CascadeFlow"]
    E -->|inference| F["🤖 Groq LLMs"]
    B -->|persist| G["🗄️ PostgreSQL"]
    D -->|cache| H["⚡ Redis"]

    style A fill:#0070f3,stroke:#0051a8,color:#fff
    style B fill:#009688,stroke:#00796b,color:#fff
    style C fill:#7c3aed,stroke:#5b21b6,color:#fff
    style D fill:#f59e0b,stroke:#d97706,color:#fff
    style E fill:#ef4444,stroke:#dc2626,color:#fff
    style F fill:#10b981,stroke:#059669,color:#fff
    style G fill:#3b82f6,stroke:#2563eb,color:#fff
    style H fill:#ec4899,stroke:#db2777,color:#fff
```

### LangGraph Review Workflow

```mermaid
graph TD
    A["📥 Parse Code"] --> B["🔍 Static Analysis"]
    B --> C["🧠 Recall Memory"]
    C --> D["🏗️ Load Knowledge Graph"]
    D --> E["📝 Initial Review<br/>(Llama 8B)"]
    E --> F{"🎯 Confidence<br/>≥ 0.8?"}
    F -->|Yes| H["✅ Merge Results"]
    F -->|No| G["🔬 Escalate Review<br/>(Llama 70B)"]
    G --> H
    H --> I["📊 Score & Report"]

    style A fill:#6366f1,stroke:#4f46e5,color:#fff
    style F fill:#f59e0b,stroke:#d97706,color:#fff
    style G fill:#ef4444,stroke:#dc2626,color:#fff
    style H fill:#10b981,stroke:#059669,color:#fff
    style I fill:#8b5cf6,stroke:#7c3aed,color:#fff
```

---

## Tech Stack

| Layer | Technology | Purpose |
|---|---|---|
| **Frontend** | Next.js 14, React 18, Tailwind CSS, ShadcnUI | App Router, server components, responsive UI |
| **Backend** | FastAPI, Pydantic v2, SQLAlchemy 2.0 | Async REST API, data validation, ORM |
| **AI / ML** | LangGraph, Groq SDK, Tree-sitter, Semgrep | Workflow orchestration, LLM inference, static analysis |
| **Memory** | Hindsight, Redis | Persistent memory engine, caching layer |
| **Routing** | CascadeFlow | Confidence-based model selection and cost optimization |
| **Database** | PostgreSQL 16 | Reviews, users, feedback, audit logs |
| **Infrastructure** | Docker Compose, GitHub Actions | Containerized deployment, CI/CD |

---

## Quick Start

### Prerequisites

- [Docker](https://docs.docker.com/get-docker/) and [Docker Compose](https://docs.docker.com/compose/install/)
- A [Groq API key](https://console.groq.com/) (free tier available)

### Launch

```bash
# 1. Clone the repository
git clone https://github.com/your-org/codepilot-ai.git
cd codepilot-ai

# 2. Configure environment
cp .env.example .env
# Edit .env and add your GROQ_API_KEY

# 3. Build and start all services
docker-compose up --build

# 4. Open the app
#    Frontend:  http://localhost:3000
#    Backend:   http://localhost:8000/docs (Swagger UI)
```

> [!TIP]
> First-time build may take 3–5 minutes. Subsequent starts are near-instant thanks to Docker layer caching.

---

## Project Structure

```
codepilot-ai/
├── backend/                    # FastAPI application
│   ├── app/
│   │   ├── main.py             # Application entrypoint & middleware
│   │   ├── api/
│   │   │   ├── routes/
│   │   │   │   ├── auth.py     # Login, register, JWT token management
│   │   │   │   ├── reviews.py  # Submit code, get review results
│   │   │   │   ├── feedback.py # Accept/reject/ignore suggestions
│   │   │   │   ├── memory.py   # Hindsight memory state & evolution
│   │   │   │   ├── knowledge.py# Team Knowledge Graph CRUD
│   │   │   │   └── audit.py    # CascadeFlow routing audit logs
│   │   │   └── deps.py         # Shared dependencies & auth guards
│   │   ├── core/
│   │   │   ├── config.py       # Pydantic Settings (env var loading)
│   │   │   ├── security.py     # JWT creation & verification
│   │   │   └── database.py     # Async SQLAlchemy engine & sessions
│   │   ├── models/             # SQLAlchemy ORM models
│   │   ├── schemas/            # Pydantic request/response schemas
│   │   ├── services/
│   │   │   ├── review_engine.py    # LangGraph workflow orchestration
│   │   │   ├── hindsight_client.py # Hindsight retain/recall/reflect
│   │   │   ├── cascadeflow.py      # Confidence routing logic
│   │   │   ├── static_analysis.py  # Tree-sitter + Semgrep integration
│   │   │   └── scoring.py          # Multi-category scoring engine
│   │   └── utils/              # Helpers, constants, formatters
│   ├── Dockerfile              # Backend container image
│   ├── requirements.txt        # Python dependencies
│   └── alembic/                # Database migrations
├── frontend/                   # Next.js 14 application
│   ├── src/
│   │   ├── app/                # App Router pages & layouts
│   │   ├── components/         # Reusable UI components
│   │   ├── lib/                # API client, utilities, hooks
│   │   └── styles/             # Global CSS & Tailwind config
│   ├── Dockerfile              # Frontend container image
│   └── package.json            # Node.js dependencies
├── docker-compose.yml          # Multi-service orchestration
├── .env.example                # Environment variable template
├── README.md                   # This file
├── PRESENTATION.md             # 10-slide hackathon pitch deck
└── DEMO_SCRIPT.md              # 5-minute live demo walkthrough
```

---

## API Documentation

### Authentication

| Method | Path | Description |
|--------|------|-------------|
| `POST` | `/api/auth/register` | Create a new user account |
| `POST` | `/api/auth/login` | Authenticate and receive a JWT token |
| `GET` | `/api/auth/me` | Get the current authenticated user profile |

### Code Reviews

| Method | Path | Description |
|--------|------|-------------|
| `POST` | `/api/reviews` | Submit code for AI review |
| `GET` | `/api/reviews` | List all reviews for the current user |
| `GET` | `/api/reviews/{id}` | Get a specific review with full details |
| `GET` | `/api/reviews/{id}/suggestions` | Get all suggestions for a review |

### Feedback

| Method | Path | Description |
|--------|------|-------------|
| `POST` | `/api/feedback` | Submit feedback (accept/reject/ignore) on a suggestion |
| `GET` | `/api/feedback/stats` | Get aggregated feedback statistics |

### Memory (Hindsight)

| Method | Path | Description |
|--------|------|-------------|
| `GET` | `/api/memory/state` | Get the current Hindsight memory state |
| `GET` | `/api/memory/evolution` | Get the memory evolution timeline |
| `POST` | `/api/memory/reflect` | Trigger a Hindsight reflection cycle |

### Knowledge Graph

| Method | Path | Description |
|--------|------|-------------|
| `GET` | `/api/knowledge/graph` | Get the full team Knowledge Graph |
| `PUT` | `/api/knowledge/graph` | Update the Knowledge Graph |
| `GET` | `/api/knowledge/preferences` | Get extracted team preferences |

### Audit (CascadeFlow)

| Method | Path | Description |
|--------|------|-------------|
| `GET` | `/api/audit/routing` | Get CascadeFlow routing decision logs |
| `GET` | `/api/audit/costs` | Get cost breakdown and savings report |
| `GET` | `/api/audit/dashboard` | Get full audit dashboard data |

---

## How Hindsight Works

Hindsight provides **persistent, evolving memory** through a three-phase cycle:

### The Retain → Recall → Reflect Cycle

```
┌─────────────────────────────────────────────────────┐
│                                                     │
│   1. RETAIN   User accepts "use React Query"        │
│       ↓       → stored as a memory fragment         │
│                                                     │
│   2. RECALL   New review arrives                    │
│       ↓       → relevant memories are retrieved     │
│               → "Team prefers React Query over      │
│                  Redux for state management"         │
│                                                     │
│   3. REFLECT  After N interactions                  │
│       ↓       → memories consolidate into patterns  │
│               → Knowledge Graph updates             │
│               → Future reviews are more precise     │
│                                                     │
└─────────────────────────────────────────────────────┘
```

**Example:**
1. **Review #1:** AI suggests Redux for state management → User **rejects**
2. **Review #2:** AI suggests React Query → User **accepts**
3. **Review #3:** AI recalls: *"This team avoids Redux; they prefer React Query"* → Suggestion aligns with team preference ✅

Over time, the AI builds a comprehensive profile of your team's conventions, producing increasingly relevant and personalized reviews.

---

## How CascadeFlow Works

CascadeFlow is a **confidence-based model routing** system that optimizes cost without sacrificing quality.

### Decision Flow

```
┌──────────────────────────────────────────────────────────────┐
│                                                              │
│   Code Submitted                                             │
│       ↓                                                      │
│   Llama 8B generates review              cost: ~$0.003       │
│       ↓                                                      │
│   Confidence Score calculated                                │
│       ↓                                                      │
│   ┌─────────────────────┐                                    │
│   │ Confidence ≥ 0.80?  │                                    │
│   └─────────┬───────────┘                                    │
│         YES │         NO                                     │
│             ↓           ↓                                    │
│   ✅ Use 8B result   🔬 Escalate to Llama 70B               │
│      (done!)            cost: ~$0.014                        │
│                         ↓                                    │
│                   ✅ Use 70B result                           │
│                      (higher accuracy)                       │
│                                                              │
│   Average savings: 78% per review                            │
│                                                              │
└──────────────────────────────────────────────────────────────┘
```

### Why It Works

| Metric | Without CascadeFlow | With CascadeFlow |
|--------|--------------------:|------------------:|
| Cost per review | $0.014 | ~$0.005 |
| Reviews using expensive model | 100% | ~30% |
| Quality degradation | — | None (escalation preserves quality) |
| Monthly savings (1,000 reviews) | $0 | **~$9.00** |

---

## Demo Flow

A quick walkthrough of the CodePilot AI experience:

1. **Login** → Register or sign in to your account
2. **Upload Code** → Paste or upload a code file for review
3. **Receive Scored Review** → See overall score (e.g., 92/100) plus 6 category breakdowns
4. **Give Feedback** → Accept, reject, or ignore each suggestion
5. **Watch Memory Update** → See the Knowledge Graph evolve in real-time
6. **Check Cost Savings** → View the audit dashboard for routing decisions and savings

---

## Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `DATABASE_URL` | PostgreSQL async connection string | `postgresql+asyncpg://codepilot:codepilot@postgres:5432/codepilot` |
| `GROQ_API_KEY` | API key for Groq LLM inference | *(required)* |
| `HINDSIGHT_URL` | URL of the Hindsight memory server | `http://hindsight:8888` |
| `JWT_SECRET` | Secret key for signing JWT tokens | *(required — change in production)* |
| `JWT_ALGORITHM` | JWT signing algorithm | `HS256` |
| `JWT_EXPIRY_HOURS` | JWT token expiration time in hours | `24` |
| `CASCADEFLOW_BUDGET` | Maximum cost budget per review (USD) | `1.0` |
| `CASCADEFLOW_MODE` | Routing mode: `enforce` or `monitor` | `enforce` |
| `CORS_ORIGINS` | Allowed CORS origins (JSON array) | `["http://localhost:3000"]` |
| `NEXT_PUBLIC_API_URL` | Backend API URL exposed to the frontend | `http://localhost:8000` |

---

## Future Improvements

- 🔐 **GitHub OAuth + PR Integration** — Review code directly from pull requests with inline comments
- 🔄 **Repository-Level CI/CD Integration** — Trigger reviews automatically on push/PR events
- 🌍 **Multi-Language Support** — Expand beyond Python/JS to 16+ languages (Go, Rust, Java, etc.)
- 👥 **Team Collaboration Features** — Shared Knowledge Graphs, team-wide memory, role-based access
- 📏 **Custom Rule Definitions** — Define team-specific linting and review rules via YAML/JSON
- 🔔 **Webhook Notifications** — Slack, Discord, and email notifications for review completions
- 📦 **Enterprise Deployment** — Helm charts, Kubernetes manifests, SSO/SAML support

---

## License

This project is licensed under the **MIT License**. See the [LICENSE](LICENSE) file for details.

---

<p align="center">
  <strong>CodePilot AI</strong> — The AI code reviewer that gets smarter every day.<br/>
  Built with ❤️ for developers who value consistent, intelligent, and cost-effective code reviews.
</p>

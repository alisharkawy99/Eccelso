# Overview

[← Back to index](README.md)

## What This Backend Does

Eccelso is a **luxury car dealership platform**. The backend powers:

- **Public car catalog** — browse, filter, and view car details with images
- **User accounts** — registration, login, profile with optional avatar
- **Bookings** — users inquire about / reserve cars; admins approve, reject, or mark sales
- **Admin inventory** — CRUD cars, upload/delete images, mark cars as sold
- **Sold-car lifecycle** — sold cars stay visible for 48 hours, then are purged from DB and Cloudinary

There is **no e-commerce order system**. Customer intent is modeled as **bookings**, not orders.

## Tech Stack

| Layer | Technology |
|-------|------------|
| Framework | FastAPI |
| Server | Uvicorn |
| ORM | SQLAlchemy 2.x (async, declarative `Base`) |
| DB driver | asyncpg |
| Validation | Pydantic v2 + pydantic-settings |
| Auth | python-jose (JWT HS256) + argon2-cffi |
| File storage | Cloudinary |
| Database | PostgreSQL (Neon-compatible SSL) |
| Python | 3.12.7 (`runtime.txt`) |

## Project Layout

```
backend/
├── main.py                 # App entry, CORS, routers, startup migrations
├── requirements.txt
├── runtime.txt
├── AGENTS.md               # Pointer to this docs folder
├── docs/                   # Agent documentation (you are here)
├── app/
│   ├── config.py           # Settings + Cloudinary init
│   ├── database.py         # Async engine, session, Base
│   ├── dependencies/
│   │   └── auth.py         # JWT auth + admin guard
│   └── utils/
│       └── security.py     # Password hash + JWT creation
├── models/                 # SQLAlchemy ORM (source of truth for tables)
├── schemas/                # Pydantic DTOs (request/response)
├── routers/                # FastAPI route handlers (thin layer)
└── services/               # Business logic (agents should change logic here)
```

## Frontend Integration

The Next.js app proxies `/api/*` → `BACKEND_URL/*` via `frontend/app/api/[...path]/route.ts`. The browser never calls the backend directly in production.

## Architecture Layers

Agents must respect this separation:

```
HTTP Request
    ↓
routers/          ← Parse input, call service, return response. No heavy logic.
    ↓
services/         ← Business rules, validations, DB queries, Cloudinary calls.
    ↓
models/           ← SQLAlchemy table definitions.
    ↓
PostgreSQL + Cloudinary
```

| Layer | Responsibility | Do NOT |
|-------|----------------|--------|
| `routers/` | HTTP mapping, status codes, dependency injection | Put business rules here |
| `services/` | All domain logic | Import from routers |
| `schemas/` | Input validation, response shapes | Query the database |
| `models/` | Table/column definitions, relationships | Contain API logic |
| `app/dependencies/` | Auth guards, DB session injection | Business logic |

## Related Docs

- [Database schema →](database.md)
- [Business flows →](flows.md)
- [Agent rules →](rules.md)

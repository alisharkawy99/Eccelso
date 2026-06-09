# Eccelso Backend — Agent Documentation

> **Audience:** AI agents and developers working on the Eccelso API.

This folder is the canonical backend reference. Read the index below before making changes.

## Quick Start

1. [Overview](overview.md) — what the API does, tech stack, project layout, architecture layers
2. [Database](database.md) — ER diagram, tables, relationships, booking status machine
3. [Business Flows](flows.md) — registration, catalog, admin, bookings, sold-car purge
4. [API Reference](api.md) — all endpoints, request/response shapes
5. [Authentication](auth.md) — JWT flow, roles, dependencies
6. [Operations](operations.md) — Cloudinary, PostgreSQL, env vars, deployment, migrations
7. [Docker](docker.md) — Single Dockerfile for frontend + backend
8. [Agent Rules](rules.md) — rules every agent must follow
9. [Reference](reference.md) — known gaps, file map

## One-Line Summary

FastAPI + async SQLAlchemy + PostgreSQL backend for a luxury car dealership. Users browse cars and create **bookings** (not orders). Admins manage inventory, approve bookings, and mark cars sold. Sold cars are visible for 48 hours, then purged from DB and Cloudinary.

## Local Dev

```bash
cd backend
pip install -r requirements.txt
# Create .env from .env.example (DATABASE_URL, JWT_SECRET, CLOUDINARY_*)
uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

Swagger UI: `http://localhost:8000/docs`

---

*Last updated: June 2026. Update these docs in the same PR when you change models, endpoints, or business rules.*

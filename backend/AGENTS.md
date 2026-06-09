# Eccelso Backend — Agent Guide

> Canonical backend documentation lives in **[`docs/`](docs/README.md)**.

Start here: **[docs/README.md](docs/README.md)**

## Doc Index

| Doc | Contents |
|-----|----------|
| [overview.md](docs/overview.md) | What the API does, tech stack, project layout, architecture |
| [database.md](docs/database.md) | ER diagram, tables, relationships, booking status machine |
| [flows.md](docs/flows.md) | Registration, catalog, admin, bookings, sold-car purge |
| [api.md](docs/api.md) | All endpoints and request/response shapes |
| [auth.md](docs/auth.md) | JWT flow, roles, dependencies |
| [operations.md](docs/operations.md) | Cloudinary, env vars, deployment, migrations |
| [docker.md](docs/docker.md) | Single Dockerfile (frontend + backend) |
| [rules.md](docs/rules.md) | Rules every agent must follow |
| [reference.md](docs/reference.md) | Known gaps and file map |

## Quick Facts

- **Stack:** FastAPI + async SQLAlchemy + PostgreSQL + Cloudinary
- **Domain:** Luxury car catalog with **bookings** (not orders)
- **Sold cars:** Visible 48h after sale, then purged
- **Admin role:** Set manually in DB — no API endpoint
- **Swagger:** `http://localhost:8000/docs`
- **Docker deploy:** `docker build -t eccelso .` then `docker run -p 3000:3000 --env-file backend/.env eccelso` (see `docs/docker.md`)

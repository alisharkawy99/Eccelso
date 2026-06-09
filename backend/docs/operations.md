# Operations

[← Back to index](README.md)

## External Services

### Cloudinary

| Upload Type | Folder | When |
|-------------|--------|------|
| User avatars | `eccelso/avatars` | Registration |
| Car images | Default (no folder) | Car create/update/image upload |

**Deletion rule:** Always call `cloudinary.uploader.destroy(public_id)` before removing image rows from DB. This applies in:

- `services/images.py` → `delete_image`
- `services/cars.py` → `delete_car`
- `services/sold_cars.py` → `purge_expired_sold_cars`

### PostgreSQL

- Connection via `DATABASE_URL` env var
- Auto-converts `postgres://` and `postgresql://` to `postgresql+asyncpg://`
- SSL enabled when `sslmode=require` or hostname contains `neon.tech`

## Environment Variables

### Required

| Variable | Purpose |
|----------|---------|
| `DATABASE_URL` | PostgreSQL connection string |
| `CLOUDINARY_CLOUD_NAME` | Image CDN |
| `CLOUDINARY_API_KEY` | |
| `CLOUDINARY_API_SECRET` | |
| `JWT_SECRET` | Secret key for signing JWT access tokens |

### Optional

| Variable | Default | Purpose |
|----------|---------|---------|
| `FRONTEND_URL` | `http://localhost:3000` | CORS allowed origin |
| `HOST` | `0.0.0.0` | Defined in config, not wired in `main.py` |
| `PORT` | `8000` | Defined in config, not wired in `main.py` |

### Hardcoded (not in env)

| Setting | Value | File |
|---------|-------|------|
| JWT algorithm | `HS256` | `app/utils/security.py` |
| Token expiry | 30 minutes | `app/utils/security.py` |
| Sold visibility | 48 hours | `services/sold_cars.py` |

## Docker

See [docker.md](docker.md) for local and production container setup.

## CORS Origins

Configured in `main.py`:

- `http://localhost:3000`
- `http://localhost:5173`
- `settings.frontend_url`

## Deployment

| Service | Platform | Config |
|---------|----------|--------|
| API | Render | `render.yaml` — service `eccelso-api`, `rootDir: backend` |
| Frontend | Vercel | Proxies via `BACKEND_URL` env var |

**Render start command:** `uvicorn main:app --host 0.0.0.0 --port $PORT`

## Local Development

```bash
cd backend
pip install -r requirements.txt
# Create .env with required variables
uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

## Schema Migrations

**No Alembic.** Schema is managed at startup in `main.py`:

1. `Base.metadata.create_all` — creates tables from models
2. Inline `ALTER TABLE ... ADD COLUMN IF NOT EXISTS` for legacy columns
3. Booking status migration: `active` → `pending`, column widened to `VARCHAR(20)`

### When Adding a New Column

Update **both**:

1. The SQLAlchemy model in `models/`
2. An `ALTER TABLE ... ADD COLUMN IF NOT EXISTS` statement in `main.py` startup migrations

Do not rely on `create_all` to add columns to existing tables.

## Related Docs

- [Database schema →](database.md)
- [Image rules →](rules.md#image-rules)

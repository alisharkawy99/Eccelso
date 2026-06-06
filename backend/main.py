from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy import text
from app.database import async_engine, Base
from routers.cars import router as cars_router
from routers.images import router as images_router
from routers.users import router as users_router
from routers.bookings import router as bookings_router
from app.config import settings

origins = list(
    dict.fromkeys(
        [
            "http://localhost:3000",
            "http://localhost:5173",
            settings.frontend_url,
        ]
    )
)
app = FastAPI(redirect_slashes=False)
app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(cars_router)
app.include_router(images_router)
app.include_router(users_router)
app.include_router(bookings_router)


@app.get("/health")
async def health():
    return {"status": "ok"}


@app.on_event("startup")
async def create_tables():
    import models.bookings  # noqa: F401 — register Booking model with Base
    import models.cars  # noqa: F401
    import models.users  # noqa: F401
    import models.images  # noqa: F401

    migrations = [
        "ALTER TABLE users ADD COLUMN IF NOT EXISTS avatar_url VARCHAR",
        "ALTER TABLE users ADD COLUMN IF NOT EXISTS avatar_public_id VARCHAR",
        "ALTER TABLE cars ADD COLUMN IF NOT EXISTS condition VARCHAR DEFAULT 'new'",
        "ALTER TABLE cars ADD COLUMN IF NOT EXISTS sold BOOLEAN DEFAULT FALSE",
        "ALTER TABLE cars ADD COLUMN IF NOT EXISTS sold_at TIMESTAMPTZ",
    ]

    async with async_engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
        for migration in migrations:
            await conn.execute(text(migration))

        bookings_exists = await conn.scalar(
            text(
                "SELECT 1 FROM information_schema.tables "
                "WHERE table_schema = 'public' AND table_name = 'bookings'"
            )
        )
        if bookings_exists:
            await conn.execute(
                text(
                    "ALTER TABLE bookings ALTER COLUMN status TYPE VARCHAR(20) "
                    "USING status::text"
                )
            )
            await conn.execute(
                text("UPDATE bookings SET status = 'pending' WHERE status = 'active'")
            )

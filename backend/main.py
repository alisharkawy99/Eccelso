from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy import text
from app.database import async_engine, Base
from routers.cars import router as cars_router
from routers.images import router as images_router
from routers.users import router as users_router
from routers.bookings import router as bookings_router

origins = [
    "http://localhost:3000",
    "http://localhost:5173",
]
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


@app.on_event("startup")
async def create_tables():
    import models.bookings  # noqa: F401 — register Booking model with Base

    async with async_engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
        await conn.execute(
            text("ALTER TABLE users ADD COLUMN IF NOT EXISTS avatar_url VARCHAR")
        )
        await conn.execute(
            text("ALTER TABLE users ADD COLUMN IF NOT EXISTS avatar_public_id VARCHAR")
        )
        await conn.execute(
            text("ALTER TABLE cars ADD COLUMN IF NOT EXISTS condition VARCHAR DEFAULT 'new'")
        )
        await conn.execute(
            text("ALTER TABLE cars ADD COLUMN IF NOT EXISTS sold BOOLEAN DEFAULT FALSE")
        )
        await conn.execute(
            text("ALTER TABLE cars ADD COLUMN IF NOT EXISTS sold_at TIMESTAMPTZ")
        )
        await conn.execute(
            text(
                "ALTER TABLE bookings ALTER COLUMN status TYPE VARCHAR(20) "
                "USING status::text"
            )
        )
        await conn.execute(
            text("UPDATE bookings SET status = 'pending' WHERE status = 'active'")
        )

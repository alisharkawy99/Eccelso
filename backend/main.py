from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy import text
from app.database import async_engine, Base
from routers.cars import router as cars_router
from routers.images import router as images_router
from routers.users import router as users_router

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


@app.on_event("startup")
async def create_tables():
    async with async_engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
        await conn.execute(
            text("ALTER TABLE users ADD COLUMN IF NOT EXISTS avatar_url VARCHAR")
        )
        await conn.execute(
            text("ALTER TABLE users ADD COLUMN IF NOT EXISTS avatar_public_id VARCHAR")
        )

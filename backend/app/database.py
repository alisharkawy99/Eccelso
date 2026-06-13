from urllib.parse import parse_qs, urlparse, urlunparse

from app.config import settings
from sqlalchemy.ext.asyncio import AsyncSession, async_sessionmaker, create_async_engine
from sqlalchemy.orm import declarative_base
from typing import Annotated
from fastapi import Depends

Base = declarative_base()


def _build_async_engine_url(database_url: str) -> tuple[str, dict]:
    if database_url.startswith("sqlite"):
        connect_args = (
            {"check_same_thread": False} if "aiosqlite" in database_url else {}
        )
        return database_url, connect_args

    url = database_url.replace("postgres://", "postgresql://", 1)
    if url.startswith("postgresql://"):
        url = url.replace("postgresql://", "postgresql+asyncpg://", 1)
    elif url.startswith("postgresql+psycopg2://"):
        url = url.replace("postgresql+psycopg2://", "postgresql+asyncpg://", 1)

    parsed = urlparse(url)
    query = parse_qs(parsed.query)

    connect_args: dict = {}
    sslmode = query.get("sslmode", [None])[0]
    hostname = parsed.hostname or ""
    if sslmode in ("require", "verify-full", "verify-ca") or "neon.tech" in hostname:
        connect_args["ssl"] = True

    clean_url = urlunparse(parsed._replace(query=""))
    return clean_url, connect_args


_engine_url, _connect_args = _build_async_engine_url(settings.database_url)
async_engine = create_async_engine(_engine_url, connect_args=_connect_args)


async def get_db():
    async with async_sessionmaker(async_engine, expire_on_commit=False)() as db:
        try:
            yield db
        finally:
            await db.close()


SessionDep = Annotated[AsyncSession, Depends(get_db)]

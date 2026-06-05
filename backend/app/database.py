from app.config import settings
from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession, async_sessionmaker
from sqlalchemy.orm import declarative_base
from typing import Annotated
from fastapi import Depends

Base = declarative_base()

async_engine = create_async_engine(
    settings.database_url.replace("postgresql://", "postgresql+asyncpg://")
)


async def get_db():
    async with async_sessionmaker(async_engine, expire_on_commit=False)() as db:
        try:
            yield db
        finally:
            await db.close()


SessionDep = Annotated[AsyncSession, Depends(get_db)]

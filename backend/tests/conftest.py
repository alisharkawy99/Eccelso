import io
import json
import os
import sys
from typing import AsyncGenerator

import pytest
from httpx import ASGITransport, AsyncClient
from sqlalchemy.ext.asyncio import AsyncSession, async_sessionmaker, create_async_engine

# Configure test env before importing the app
os.environ["DATABASE_URL"] = "sqlite+aiosqlite:///:memory:"
os.environ.setdefault("JWT_SECRET", "test-jwt-secret-key")
os.environ.setdefault("CLOUDINARY_CLOUD_NAME", "test-cloud")
os.environ.setdefault("CLOUDINARY_API_KEY", "test-key")
os.environ.setdefault("CLOUDINARY_API_SECRET", "test-secret")

BACKEND_ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
if BACKEND_ROOT not in sys.path:
    sys.path.insert(0, BACKEND_ROOT)

from app.database import Base, get_db  # noqa: E402
from app.utils.security import create_access_token, get_password_hash  # noqa: E402
from main import app  # noqa: E402
from models.cars import Car  # noqa: E402
from models.images import Image  # noqa: E402
from models.users import RoleEnum, Users  # noqa: E402

TEST_DATABASE_URL = "sqlite+aiosqlite:///:memory:"
test_engine = create_async_engine(
    TEST_DATABASE_URL,
    connect_args={"check_same_thread": False},
)
TestSessionLocal = async_sessionmaker(test_engine, expire_on_commit=False)

# Skip PostgreSQL-only startup migrations during tests
app.router.on_startup.clear()
app.router.on_shutdown.clear()


@pytest.fixture(autouse=True)
def mock_cloudinary(monkeypatch):
    upload_result = {
        "secure_url": "https://res.cloudinary.com/test/image/upload/v1/car.jpg",
        "public_id": "eccelso/test-car",
    }

    def fake_upload(*args, **kwargs):
        return upload_result.copy()

    def fake_destroy(*args, **kwargs):
        return {"result": "ok"}

    monkeypatch.setattr("cloudinary.uploader.upload", fake_upload)
    monkeypatch.setattr("cloudinary.uploader.destroy", fake_destroy)


@pytest.fixture
async def db_session() -> AsyncGenerator[AsyncSession, None]:
    async with test_engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)

    async with TestSessionLocal() as session:
        yield session

    async with test_engine.begin() as conn:
        await conn.run_sync(Base.metadata.drop_all)


@pytest.fixture
async def client(db_session: AsyncSession) -> AsyncGenerator[AsyncClient, None]:
    async def override_get_db() -> AsyncGenerator[AsyncSession, None]:
        yield db_session

    app.dependency_overrides[get_db] = override_get_db

    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as ac:
        yield ac

    app.dependency_overrides.clear()


async def create_user_in_db(
    session: AsyncSession,
    *,
    email: str = "user@example.com",
    password: str = "password123",
    name: str = "Test User",
    role: RoleEnum = RoleEnum.USER,
) -> Users:
    user = Users(
        name=name,
        email=email,
        password_hash=await get_password_hash(password),
        phone_number="+96170000000",
        role=role,
    )
    session.add(user)
    await session.commit()
    await session.refresh(user)
    return user


async def auth_headers_for(user: Users) -> dict[str, str]:
    token = await create_access_token(data={"sub": user.email})
    return {"Authorization": f"Bearer {token}"}


async def seed_car(
    session: AsyncSession,
    *,
    name: str = "Ferrari 488 GTB",
    brand: str = "Ferrari",
    category: str = "supercar",
    featured: bool = False,
    sold: bool = False,
    with_image: bool = True,
) -> Car:
    car = Car(
        name=name,
        brand=brand,
        category=category,
        condition="new",
        specs={
            "engine": "3.9L V8",
            "transmission": "7-Speed DCT",
            "power": "660 hp",
            "seats": 2,
        },
        available=not sold,
        featured=featured,
        sold=sold,
        description="Track-ready supercar",
    )
    session.add(car)
    await session.flush()

    if with_image:
        session.add(
            Image(
                url="https://res.cloudinary.com/test/image/upload/v1/seed.jpg",
                public_id="eccelso/seed",
                car_id=car.id,
            )
        )

    await session.commit()
    await session.refresh(car)
    return car


def car_form_data(**overrides: str) -> dict[str, str]:
    data = {
        "name": "Lamborghini Huracán",
        "brand": "Lamborghini",
        "category": "supercar",
        "condition": "new",
        "specs": json.dumps(
            {
                "engine": "V10",
                "transmission": "Automatic",
                "power": "640 hp",
                "seats": 2,
            }
        ),
        "description": "Exotic supercar",
        "available": "true",
        "featured": "false",
    }
    data.update(overrides)
    return data


def car_image_file(filename: str = "car.jpg") -> tuple[str, tuple[str, io.BytesIO, str]]:
    return ("images", (filename, io.BytesIO(b"fake-image-bytes"), "image/jpeg"))


@pytest.fixture
async def regular_user(db_session: AsyncSession) -> Users:
    return await create_user_in_db(db_session)


@pytest.fixture
async def admin_user(db_session: AsyncSession) -> Users:
    return await create_user_in_db(
        db_session,
        email="admin@example.com",
        name="Admin User",
        role=RoleEnum.ADMIN,
    )


@pytest.fixture
async def user_headers(regular_user: Users) -> dict[str, str]:
    return await auth_headers_for(regular_user)


@pytest.fixture
async def admin_headers(admin_user: Users) -> dict[str, str]:
    return await auth_headers_for(admin_user)


@pytest.fixture
async def sample_car(db_session: AsyncSession) -> Car:
    return await seed_car(db_session)

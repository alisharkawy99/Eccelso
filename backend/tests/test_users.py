import pytest
from httpx import AsyncClient
from sqlalchemy.ext.asyncio import AsyncSession

from models.users import RoleEnum, Users
from tests.conftest import create_user_in_db


@pytest.mark.asyncio
async def test_register_user(client: AsyncClient):
    response = await client.post(
        "/auth/register",
        data={
            "email": "newuser@example.com",
            "password": "securepass123",
            "name": "New User",
            "phone_number": "+96171111111",
        },
    )
    assert response.status_code == 201
    assert response.json()["message"] == "User registered successfully"


@pytest.mark.asyncio
async def test_register_duplicate_email(client: AsyncClient, regular_user: Users):
    response = await client.post(
        "/auth/register",
        data={
            "email": regular_user.email,
            "password": "securepass123",
            "name": "Another User",
            "phone_number": "+96172222222",
        },
    )
    assert response.status_code == 409
    assert response.json()["detail"] == "User Email already exists."


@pytest.mark.asyncio
async def test_register_short_password(client: AsyncClient):
    response = await client.post(
        "/auth/register",
        data={
            "email": "shortpass@example.com",
            "password": "short",
            "name": "Short Pass",
            "phone_number": "+96173333333",
        },
    )
    assert response.status_code == 422


@pytest.mark.asyncio
async def test_login_success(client: AsyncClient, db_session: AsyncSession):
    await create_user_in_db(
        db_session,
        email="login@example.com",
        password="mypassword123",
    )
    response = await client.post(
        "/auth/login",
        json={"email": "login@example.com", "password": "mypassword123"},
    )
    assert response.status_code == 200
    data = response.json()
    assert data["tokenType"] == "bearer"
    assert data["role"] == RoleEnum.USER.value
    assert data["user"]["email"] == "login@example.com"
    assert data["token"]


@pytest.mark.asyncio
async def test_login_wrong_password(client: AsyncClient, regular_user: Users):
    response = await client.post(
        "/auth/login",
        json={"email": regular_user.email, "password": "wrongpassword"},
    )
    assert response.status_code == 401
    assert response.json()["detail"] == "Incorrect email or password"


@pytest.mark.asyncio
async def test_login_unknown_email(client: AsyncClient):
    response = await client.post(
        "/auth/login",
        json={"email": "missing@example.com", "password": "password123"},
    )
    assert response.status_code == 404
    assert response.json()["detail"] == "Incorrect email or password"

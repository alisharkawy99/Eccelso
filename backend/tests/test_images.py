import pytest
from httpx import AsyncClient
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from models.cars import Car
from models.images import Image
from tests.conftest import car_image_file, seed_car


@pytest.mark.asyncio
async def test_delete_image(
    client: AsyncClient,
    admin_headers: dict,
    db_session: AsyncSession,
    sample_car: Car,
):
    result = await db_session.execute(
        select(Image).where(Image.car_id == sample_car.id)
    )
    image = result.scalar_one()

    response = await client.delete(
        f"/images/{image.id}",
        headers=admin_headers,
    )
    assert response.status_code == 200
    assert response.json()["message"] == "Image deleted successfully"

    remaining = await db_session.execute(
        select(Image).where(Image.car_id == sample_car.id)
    )
    assert remaining.scalars().all() == []


@pytest.mark.asyncio
async def test_delete_image_not_found(client: AsyncClient, admin_headers: dict):
    response = await client.delete(
        "/images/00000000-0000-0000-0000-000000000001",
        headers=admin_headers,
    )
    assert response.status_code == 404
    assert response.json()["detail"] == "Image not found"


@pytest.mark.asyncio
async def test_delete_image_requires_admin(
    client: AsyncClient,
    user_headers: dict,
    db_session: AsyncSession,
    sample_car: Car,
):
    result = await db_session.execute(
        select(Image).where(Image.car_id == sample_car.id)
    )
    image = result.scalar_one()

    response = await client.delete(
        f"/images/{image.id}",
        headers=user_headers,
    )
    assert response.status_code == 403


@pytest.mark.asyncio
async def test_create_car_image_via_car_images_endpoint(
    client: AsyncClient,
    admin_headers: dict,
    sample_car: Car,
    db_session: AsyncSession,
):
    before = await db_session.execute(
        select(Image).where(Image.car_id == sample_car.id)
    )
    assert len(before.scalars().all()) == 1

    response = await client.post(
        f"/cars/{sample_car.id}/images",
        files=[("uploaded_images", car_image_file("extra.jpg")[1])],
        headers=admin_headers,
    )
    assert response.status_code == 200

    after = await db_session.execute(
        select(Image).where(Image.car_id == sample_car.id)
    )
    assert len(after.scalars().all()) == 2


@pytest.mark.asyncio
async def test_delete_last_image_leaves_car_without_images(
    client: AsyncClient,
    admin_headers: dict,
    db_session: AsyncSession,
):
    car = await seed_car(db_session, name="Single Image Car")
    result = await db_session.execute(select(Image).where(Image.car_id == car.id))
    image = result.scalar_one()

    response = await client.delete(
        f"/images/{image.id}",
        headers=admin_headers,
    )
    assert response.status_code == 200

    remaining = await db_session.execute(select(Image).where(Image.car_id == car.id))
    assert remaining.scalars().all() == []

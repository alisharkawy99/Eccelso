from datetime import datetime, timedelta, timezone

import pytest
from httpx import AsyncClient
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from models.cars import Car
from services.sold_cars import mark_car_sold, public_car_filter, purge_expired_sold_cars
from tests.conftest import seed_car


@pytest.mark.asyncio
async def test_mark_car_sold_service(db_session: AsyncSession):
    car = await seed_car(db_session, name="Sell Me")
    updated = await mark_car_sold(db_session, car.id)
    assert updated.sold is True
    assert updated.available is False
    assert updated.sold_at is not None


@pytest.mark.asyncio
async def test_mark_car_sold_already_sold(db_session: AsyncSession):
    car = await seed_car(db_session, sold=True)
    with pytest.raises(Exception) as exc_info:
        await mark_car_sold(db_session, car.id)
    assert exc_info.value.status_code == 400


@pytest.mark.asyncio
async def test_public_car_filter_hides_expired_sold_cars(db_session: AsyncSession):
    visible_sold = await seed_car(db_session, name="Recently Sold", sold=True)
    visible_sold.sold_at = datetime.now(timezone.utc) - timedelta(hours=1)
    await db_session.commit()

    expired_sold = await seed_car(db_session, name="Old Sold", sold=True)
    expired_sold.sold_at = datetime.now(timezone.utc) - timedelta(hours=72)
    await db_session.commit()

    query = public_car_filter(select(Car))
    result = await db_session.execute(query)
    names = {car.name for car in result.scalars().all()}

    assert "Recently Sold" in names
    assert "Old Sold" not in names


@pytest.mark.asyncio
async def test_purge_expired_sold_cars(db_session: AsyncSession):
    expired = await seed_car(db_session, name="To Purge", sold=True)
    expired.sold_at = datetime.now(timezone.utc) - timedelta(hours=72)
    await db_session.commit()

    await purge_expired_sold_cars(db_session)

    result = await db_session.execute(select(Car).where(Car.id == expired.id))
    assert result.scalar_one_or_none() is None


@pytest.mark.asyncio
async def test_sold_car_still_visible_in_list_for_48_hours(
    client: AsyncClient,
    db_session: AsyncSession,
    admin_headers: dict,
):
    car = await seed_car(db_session, name="Fresh Sold")
    await client.patch(f"/cars/{car.id}/sold", headers=admin_headers)

    response = await client.get("/cars")
    assert response.status_code == 200
    names = [item["name"] for item in response.json()]
    assert "Fresh Sold" in names


@pytest.mark.asyncio
async def test_expired_sold_car_hidden_from_public_list(
    client: AsyncClient,
    db_session: AsyncSession,
):
    expired = await seed_car(db_session, name="Expired Sold", sold=True)
    expired.sold_at = datetime.now(timezone.utc) - timedelta(hours=72)
    await db_session.commit()

    response = await client.get("/cars")
    assert response.status_code == 200
    names = [item["name"] for item in response.json()]
    assert "Expired Sold" not in names

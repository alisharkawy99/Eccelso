import asyncio
from datetime import datetime, timedelta, timezone
from uuid import UUID

import cloudinary.uploader
from fastapi import HTTPException
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from models.cars import Car

SOLD_VISIBILITY_HOURS = 48


async def purge_expired_sold_cars(db: AsyncSession) -> None:
    cutoff = datetime.now(timezone.utc) - timedelta(hours=SOLD_VISIBILITY_HOURS)
    result = await db.execute(
        select(Car)
        .options(selectinload(Car.images))
        .where(Car.sold.is_(True), Car.sold_at.isnot(None), Car.sold_at < cutoff)
    )
    expired_cars = result.scalars().all()
    if not expired_cars:
        return

    for car in expired_cars:
        for img in car.images:
            await asyncio.to_thread(cloudinary.uploader.destroy, img.public_id)
        await db.delete(car)

    await db.commit()


def public_car_filter(query):
    cutoff = datetime.now(timezone.utc) - timedelta(hours=SOLD_VISIBILITY_HOURS)
    return query.where(
        (Car.sold.is_(False))
        | (Car.sold.is_(True) & Car.sold_at.isnot(None) & (Car.sold_at >= cutoff))
    )


async def mark_car_sold(db: AsyncSession, car_id: UUID) -> Car:
    result = await db.execute(
        select(Car).options(selectinload(Car.images)).where(Car.id == car_id)
    )
    car = result.scalar_one_or_none()
    if not car:
        raise HTTPException(status_code=404, detail="Car not found")

    if car.sold:
        raise HTTPException(status_code=400, detail="Car is already marked as sold")

    car.sold = True
    car.sold_at = datetime.now(timezone.utc)
    car.available = False

    await db.commit()
    result = await db.execute(
        select(Car).options(selectinload(Car.images)).where(Car.id == car_id)
    )
    return result.scalar_one()

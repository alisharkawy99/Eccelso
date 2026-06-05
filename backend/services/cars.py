import json
import asyncio
import cloudinary.uploader
from uuid import UUID
from typing import List
from fastapi import HTTPException, status, UploadFile
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload
from models.cars import Car
from models.images import Image
from schemas.cars import CarCreate, CarFormDependency


async def get_all_cars(
    db: AsyncSession, car_category: str | None = None, featured: bool | None = None
) -> list[Car]:
    query = select(Car).options(selectinload(Car.images))
    if car_category:
        query = query.where(Car.category == car_category)
    if featured:
        query = query.where(Car.featured == featured)
    result = await db.execute(query)
    return result.scalars().all()


async def create_car(db: AsyncSession, car_data: CarCreate, images: List[UploadFile]) -> Car:
    result = await db.execute(select(Car).where(Car.name == car_data.name))
    if result.scalar_one_or_none():
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT, detail="Car name already exists."
        )

    car_dict = car_data.model_dump(exclude={"images"})
    new_car = Car(**car_dict)
    db.add(new_car)
    await db.flush()

    for file in images:
        result_upload = await asyncio.to_thread(cloudinary.uploader.upload, file.file)
        new_image = Image(
            url=result_upload["secure_url"], public_id=result_upload["public_id"], car_id=new_car.id
        )
        db.add(new_image)

    await db.commit()
    result = await db.execute(
        select(Car).options(selectinload(Car.images)).where(Car.id == new_car.id)
    )
    return result.scalar_one()


async def edit_car(db: AsyncSession, car_id: UUID, data: CarFormDependency):
    result = await db.execute(
        select(Car).options(selectinload(Car.images)).where(Car.id == car_id)
    )
    car_db = result.scalar_one_or_none()
    if not car_db:
        raise HTTPException(status_code=404, detail="Car not found")

    update_data = data.__dict__.copy()
    update_data.pop("images", None)

    if data.specs:
        update_data["specs"] = (
            json.loads(data.specs) if isinstance(data.specs, str) else data.specs
        )

    for key, value in update_data.items():
        if value is not None:
            setattr(car_db, key, value)

    if data.images:
        for file in data.images:
            result_upload = await asyncio.to_thread(cloudinary.uploader.upload, file.file)
            new_image = Image(
                url=result_upload["secure_url"],
                public_id=result_upload["public_id"],
                car_id=car_db.id,
            )
            db.add(new_image)

    await db.commit()
    result = await db.execute(
        select(Car).options(selectinload(Car.images)).where(Car.id == car_db.id)
    )
    return result.scalar_one()


async def remove_car(db: AsyncSession, car_id: UUID):
    result = await db.execute(
        select(Car).options(selectinload(Car.images)).where(Car.id == car_id)
    )
    car_db = result.scalar_one_or_none()
    if not car_db:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Car not found"
        )

    for img in car_db.images:
        await asyncio.to_thread(cloudinary.uploader.destroy, img.public_id)

    await db.delete(car_db)
    await db.commit()
    return True


async def get_car(db: AsyncSession, car_id: UUID):
    result = await db.execute(
        select(Car).options(selectinload(Car.images)).where(Car.id == car_id)
    )
    car_instance = result.scalar_one_or_none()
    if not car_instance:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Car not found"
        )
    return car_instance

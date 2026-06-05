import asyncio
from uuid import UUID
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from models.images import Image
import cloudinary.uploader


async def create_car_image(session: AsyncSession, car_id: UUID, file):
    result = await asyncio.to_thread(cloudinary.uploader.upload, file.file)

    new_image = Image(
        url=result["secure_url"], public_id=result["public_id"], car_id=car_id
    )
    session.add(new_image)
    await session.commit()
    await session.refresh(new_image)
    return new_image


async def delete_image(session: AsyncSession, image_id: UUID):
    result = await session.execute(select(Image).where(Image.id == image_id))
    image = result.scalar_one_or_none()
    if image:
        await asyncio.to_thread(cloudinary.uploader.destroy, image.public_id)
        await session.delete(image)
        await session.commit()
    return image

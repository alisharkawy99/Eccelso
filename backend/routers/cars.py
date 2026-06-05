import json
from typing import Annotated, List
from uuid import UUID
from fastapi import APIRouter, status, Depends, HTTPException, UploadFile, File
from services.cars import create_car, list_cars, update_car, delete_car, get_car, mark_car_sold
from services.images import create_car_image
from app.database import SessionDep
from app.dependencies.auth import AdminDep
from schemas.cars import CarCreate, CarFormDependency, CarResponse

router = APIRouter(prefix="/cars", tags=["Cars"])


@router.get("", response_model=List[CarResponse])
async def list_cars_endpoint(
    session: SessionDep, category: str | None = None, featured: bool | None = None
):
    return await list_cars(session, category, featured)


@router.get("/{car_id}", response_model=CarResponse)
async def get_car_endpoint(session: SessionDep, car_id: UUID):
    return await get_car(session, car_id)


@router.post("", response_model=CarResponse, status_code=status.HTTP_201_CREATED)
async def create_car_endpoint(
    session: SessionDep,
    _admin: AdminDep,
    data: CarFormDependency = Depends(CarFormDependency),
):
    specs_dict = json.loads(data.specs) if data.specs else {}

    car_data = CarCreate(
        name=data.name,
        brand=data.brand,
        category=data.category,
        condition=data.condition or "new",
        specs=specs_dict,
        description=data.description or "",
        available=data.available,
        featured=data.featured,
        images=[],
    )

    return await create_car(session, car_data, data.images)


@router.patch("/{car_id}", response_model=CarResponse)
async def update_car_endpoint(
    session: SessionDep,
    car_id: UUID,
    _admin: AdminDep,
    data: CarFormDependency = Depends(CarFormDependency),
):
    await get_car(session, car_id)
    return await update_car(session, car_id, data)


@router.delete("/{car_id}")
async def delete_car_endpoint(session: SessionDep, car_id: UUID, _admin: AdminDep):
    await delete_car(session, car_id)
    return {"message": "Car deleted successfully"}


@router.patch("/{car_id}/sold", response_model=CarResponse)
async def mark_car_sold_endpoint(
    session: SessionDep, car_id: UUID, _admin: AdminDep
):
    return await mark_car_sold(session, car_id)


@router.post("/{car_id}/images")
async def upload_car_images(
    car_id: UUID,
    uploaded_images: Annotated[
        List[UploadFile], File(description="Upload multiple images")
    ],
    session: SessionDep,
    _admin: AdminDep,
):
    await get_car(session, car_id)
    added_images = []

    for image in uploaded_images:
        try:
            new_image = await create_car_image(session, car_id, image)
            added_images.append(new_image)
        except Exception as e:
            raise HTTPException(
                status_code=400, detail=f"Could not upload {image.filename}: {str(e)}"
            )

    if not added_images:
        raise HTTPException(status_code=400, detail="No images were uploaded")

    return {"message": "Images uploaded successfully", "count": len(added_images)}

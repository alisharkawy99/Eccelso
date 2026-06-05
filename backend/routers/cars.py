import json
from typing import List
from uuid import UUID
from fastapi import APIRouter, status, Depends, HTTPException
from services.cars import create_car, get_all_cars, edit_car, remove_car, get_car
from app.database import SessionDep
from schemas.cars import CarCreate, CarFormDependency, CarResponse

router = APIRouter(prefix="/cars", tags=["Cars"])


@router.get("/", response_model=List[CarResponse])
async def list_cars(
    session: SessionDep, car_category: str | None = None, featured: bool | None = None
):
    return await get_all_cars(session, car_category, featured)


@router.get("/{car_id}", response_model=CarResponse)
async def find_car(session: SessionDep, car_id: UUID):
    car = await get_car(session, car_id)
    if not car:
        raise HTTPException(status_code=404, detail="Car not found")
    return car


@router.post("/", response_model=CarResponse, status_code=status.HTTP_201_CREATED)
async def add_new_car(
    session: SessionDep, data: CarFormDependency = Depends(CarFormDependency)
):
    specs_dict = json.loads(data.specs) if data.specs else {}

    car_data = CarCreate(
        name=data.name,
        brand=data.brand,
        category=data.category,
        pricePerDay=data.pricePerDay,
        specs=specs_dict,
        description=data.description,
        available=data.available,
        featured=data.featured,
        images=[],
    )

    return await create_car(session, car_data, data.images)


@router.patch("/{car_id}", response_model=CarResponse)
async def update_car(
    session: SessionDep,
    car_id: UUID,
    data: CarFormDependency = Depends(CarFormDependency),
):
    existing_car = await get_car(session, car_id)
    if not existing_car:
        raise HTTPException(status_code=404, detail="Car not found")

    return await edit_car(session, car_id, data)


@router.delete("/{car_id}")
async def delete_car(session: SessionDep, car_id: UUID):
    success = await remove_car(session, car_id)
    if not success:
        raise HTTPException(status_code=404, detail="Car not found")
    return {"message": "Car deleted successfully"}

from typing import List
from uuid import UUID
from fastapi import APIRouter, status, Form, File, UploadFile
from services.cars import create_car, get_all_cars, edit_car, remove_car, get_car
from app.database import SessionDep
from schemas.cars import CarCreate, CarResponse, EditCar
import json

router = APIRouter(prefix="/cars", tags=["Cars"])


@router.get("/", response_model=list[CarResponse])
def list_cars(
    session: SessionDep, car_category: str | None = None, featured: bool | None = None
):
    return get_all_cars(session, car_category, featured)


@router.get("/{car_id}", response_model=CarResponse)
def find_car(session: SessionDep, car_id: UUID):
    return get_car(session, car_id)


@router.post("/", response_model=CarResponse, status_code=status.HTTP_201_CREATED)
def add_new_car(
    session: SessionDep,
    name: str = Form(...),
    brand: str = Form(...),
    category: str = Form(...),
    pricePerDay: int = Form(...),
    specs: str = Form(...),
    description: str = Form(...),
    available: bool = Form(True),
    featured: bool = Form(True),
    images: List[UploadFile] = File(...),  # Uploaded files
):
    specs_dict = json.loads(specs)
    car_data = CarCreate(
        name=name,
        brand=brand,
        category=category,
        pricePerDay=pricePerDay,
        specs=specs_dict,
        description=description,
        available=available,
        featured=featured,
        images=[],
    )

    return create_car(session, car_data, images)


@router.put("/{car_id}", response_model=CarResponse)
def update_car(session: SessionDep, car_id: UUID, car_data: EditCar):
    return edit_car(session, car_id, car_data)


@router.delete("/{car_id}")
def delete_car(session: SessionDep, car_id: UUID):
    return remove_car(session, car_id)

from uuid import UUID
from fastapi import APIRouter, status  #  Imported status
from services.cars import create_car, get_all_cars, edit_car, remove_car
from app.database import SessionDep
from schemas.cars import CarCreate, CarResponse, EditCar

router = APIRouter(prefix="/cars", tags=["Cars"])


@router.get("/", response_model=list[CarResponse])
def list_cars(session: SessionDep):
    return get_all_cars(session)


@router.post("/", response_model=CarResponse, status_code=status.HTTP_201_CREATED)
def add_new_car(session: SessionDep, car_data: CarCreate):
    return create_car(session, car_data)


@router.put("/{car_id}", response_model=CarResponse)
def update_car(session: SessionDep, car_id: UUID, car_data: EditCar):
    return edit_car(session, car_id, car_data)


@router.delete("/{car_id}")
def delete_car(session: SessionDep, car_id: UUID):
    return remove_car(session, car_id)

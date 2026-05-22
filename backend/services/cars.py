from uuid import UUID
from models.cars import Car
from app.database import Session
from schemas.cars import CarCreate, CarResponse, EditCar
from fastapi import HTTPException, status


def get_all_cars(db: Session) -> list[Car]:
    cars = db.query(Car).all()
    return cars


def create_car(db: Session, car_data: CarCreate) -> Car:
    car_dict = car_data.model_dump()
    new_car = Car(**car_dict)
    db.add(new_car)
    db.commit()
    db.refresh(new_car)
    return new_car


def edit_car(db: Session, car_id: UUID, edited_car: EditCar) -> Car:
    car_db = db.query(Car).filter(Car.id == car_id).first()
    if not car_db:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Car not found"
        )
    updated_car = edited_car.model_dump(exclude_unset=True)
    for key, value in updated_car.items():
        setattr(car_db, key, value)
    db.commit()
    db.refresh(car_db)
    return car_db


def remove_car(db: Session, car_id: UUID):
    car_db = db.query(Car).filter(Car.id == car_id).first()
    if not car_db:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Car not found"
        )
    db.delete(car_db)
    db.commit()
    return {"message": "Car successfully deleted"}

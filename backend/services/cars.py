import json
import cloudinary.uploader
from uuid import UUID
from typing import List
from fastapi import HTTPException, status, UploadFile
from sqlalchemy.orm import Session
from models.cars import Car
from models.images import Image  # Ensure you import your new Image model
from schemas.cars import CarCreate, CarFormDependency


def get_all_cars(
    db: Session, car_category: str | None = None, featured: bool | None = None
) -> list[Car]:
    query = db.query(Car)
    if car_category:
        query = query.filter(Car.category == car_category)
    if featured:
        query = query.filter(Car.featured == featured)
    return query.all()


def create_car(db: Session, car_data: CarCreate, images: List[UploadFile]) -> Car:
    # Check for duplicate
    if db.query(Car).filter(Car.name == car_data.name).first():
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT, detail="Car name already exists."
        )

    car_dict = car_data.model_dump(exclude={"images"})
    new_car = Car(**car_dict)
    db.add(new_car)
    db.flush()  # Get the ID before committing images

    # Handle Image uploads
    for file in images:
        result = cloudinary.uploader.upload(file.file)
        new_image = Image(
            url=result["secure_url"], public_id=result["public_id"], car_id=new_car.id
        )
        db.add(new_image)

    db.commit()
    db.refresh(new_car)
    return new_car


def edit_car(db: Session, car_id: UUID, data: CarFormDependency):
    car_db = db.query(Car).filter(Car.id == car_id).first()
    if not car_db:
        raise HTTPException(status_code=404, detail="Car not found")

    # Update basic fields
    update_data = data.__dict__.copy()
    update_data.pop("images", None)

    if data.specs:
        update_data["specs"] = (
            json.loads(data.specs) if isinstance(data.specs, str) else data.specs
        )

    for key, value in update_data.items():
        if value is not None:
            setattr(car_db, key, value)

    # Handle New Images
    if data.images:
        for file in data.images:
            result = cloudinary.uploader.upload(file.file)
            new_image = Image(
                url=result["secure_url"],
                public_id=result["public_id"],
                car_id=car_db.id,
            )
            db.add(new_image)

    db.commit()
    db.refresh(car_db)
    return car_db


def remove_car(db: Session, car_id: UUID):
    car_db = db.query(Car).filter(Car.id == car_id).first()
    if not car_db:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Car not found"
        )

    # Cloudinary Cleanup: Delete all associated images from the cloud
    for img in car_db.images:
        cloudinary.uploader.destroy(img.public_id)

    db.delete(car_db)
    db.commit()
    return True


def get_car(db: Session, car_id: UUID):
    car_instance = db.query(Car).filter(Car.id == car_id).first()
    if not car_instance:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Car not found"
        )
    return car_instance

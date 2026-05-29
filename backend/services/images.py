from sqlalchemy.orm import Session
from models.images import Image
import cloudinary.uploader


def add_image_to_car(session: Session, car_id: str, file):
    # 1. Upload to Cloudinary
    result = cloudinary.uploader.upload(file.file)

    # 2. Save to Database
    new_image = Image(
        url=result["secure_url"], public_id=result["public_id"], car_id=car_id
    )
    session.add(new_image)
    session.commit()
    session.refresh(new_image)
    return new_image


def delete_image(session: Session, image_id: str):
    image = session.query(Image).filter(Image.id == image_id).first()
    if image:
        # 1. Remove from Cloudinary
        cloudinary.uploader.destroy(image.public_id)
        # 2. Remove from DB
        session.delete(image)
        session.commit()
    return image

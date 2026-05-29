from uuid import UUID
from fastapi import APIRouter, Depends, HTTPException, UploadFile, File
from sqlalchemy.orm import Session
from app.database import get_db
from services.images import delete_image, add_image_to_car
from typing import Annotated, List

router = APIRouter(prefix="/images", tags=["Images"])


@router.delete("/{image_id}")
def remove_image(image_id: str, db: Session = Depends(get_db)):
    deleted = delete_image(db, image_id)
    if not deleted:
        raise HTTPException(status_code=404, detail="Image not found")
    return {"message": "Image deleted successfully"}


@router.post("/{car_id}")
async def add_images_to_car(
    car_id: UUID,
    uploaded_images: Annotated[
        List[UploadFile], File(description="Upload multiple images")
    ],
    db: Session = Depends(get_db),
):
    added_images = []

    # Process each file
    for image in uploaded_images:
        try:
            # Assuming add_image_to_car handles the file reading/saving logic
            new_image = add_image_to_car(db, car_id, image)
            added_images.append(new_image)
        except Exception as e:
            # Handle potential file processing errors
            raise HTTPException(
                status_code=400, detail=f"Could not upload {image.filename}: {str(e)}"
            )

    if not added_images:
        raise HTTPException(status_code=400, detail="No images were uploaded")

    return {"message": "Images uploaded successfully", "count": len(added_images)}

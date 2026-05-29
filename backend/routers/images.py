from fastapi import APIRouter, Depends, HTTPException, UploadFile
from sqlalchemy.orm import Session
from app.database import get_db
from services.images import delete_image

router = APIRouter(prefix="/images", tags=["Images"])


@router.delete("/{image_id}")
def remove_image(image_id: str, db: Session = Depends(get_db)):
    deleted = delete_image(db, image_id)
    if not deleted:
        raise HTTPException(status_code=404, detail="Image not found")
    return {"message": "Image deleted successfully"}

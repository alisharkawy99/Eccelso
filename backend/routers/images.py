from uuid import UUID
from fastapi import APIRouter, HTTPException
from app.database import SessionDep
from services.images import delete_image

router = APIRouter(prefix="/images", tags=["Images"])


@router.delete("/{image_id}")
async def delete_image_endpoint(image_id: UUID, session: SessionDep):
    deleted = await delete_image(session, image_id)
    if not deleted:
        raise HTTPException(status_code=404, detail="Image not found")
    return {"message": "Image deleted successfully"}

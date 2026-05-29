from pydantic import BaseModel
from uuid import UUID


class ImageResponse(BaseModel):
    id: UUID
    url: str
    public_id: str

    class Config:
        from_attributes = True

from sqlalchemy import Column, String, ForeignKey
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
import uuid
from app.database import Base


class Image(Base):
    __tablename__ = "images"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    url = Column(String, nullable=False)
    public_id = Column(String, nullable=False)  # Essential for Cloudinary
    car_id = Column(UUID(as_uuid=True), ForeignKey("cars.id", ondelete="CASCADE"))

    # Allows you to access image.car
    car = relationship("Car", back_populates="images")

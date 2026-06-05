import enum
import uuid
from sqlalchemy.sql import func
from sqlalchemy import Column, String, DateTime, UUID, ForeignKey
from sqlalchemy.orm import relationship
from app.database import Base


class BookingStatus(str, enum.Enum):
    PENDING = "pending"
    APPROVED = "approved"
    REJECTED = "rejected"
    CANCELLED = "cancelled"


class Booking(Base):
    __tablename__ = "bookings"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4, index=True)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    car_id = Column(UUID(as_uuid=True), ForeignKey("cars.id", ondelete="SET NULL"), nullable=True)
    status = Column(String(20), default=BookingStatus.PENDING.value, nullable=False)
    notes = Column(String, nullable=True)
    car_name = Column(String, nullable=False)
    car_brand = Column(String, nullable=False)
    car_image_url = Column(String, nullable=True)
    car_condition = Column(String, nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now(), server_default=func.now())
    cancelled_at = Column(DateTime(timezone=True), nullable=True)

    user = relationship("Users", back_populates="bookings")
    car = relationship("Car", back_populates="bookings")

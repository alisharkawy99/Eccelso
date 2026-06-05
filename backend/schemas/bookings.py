from datetime import datetime
from enum import Enum
from typing import Optional
from uuid import UUID

from pydantic import BaseModel, ConfigDict

from schemas.cars import CarResponse
from schemas.users import UserRead


class BookingStatus(str, Enum):
    PENDING = "pending"
    APPROVED = "approved"
    REJECTED = "rejected"
    CANCELLED = "cancelled"


class BookingCreate(BaseModel):
    car_id: UUID
    notes: Optional[str] = None


class BookingResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True, populate_by_name=True)

    id: UUID
    user_id: UUID
    car_id: Optional[UUID] = None
    status: BookingStatus
    notes: Optional[str] = None
    car_name: str
    car_brand: str
    car_image_url: Optional[str] = None
    car_condition: str
    created_at: datetime
    updated_at: Optional[datetime] = None
    cancelled_at: Optional[datetime] = None
    car: Optional[CarResponse] = None


class BookingWithUserResponse(BookingResponse):
    user: UserRead


class AdminBookingStats(BaseModel):
    total_bookings: int
    pending_bookings: int
    approved_bookings: int
    rejected_bookings: int
    cancelled_bookings: int

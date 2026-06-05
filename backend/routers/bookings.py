from typing import List
from uuid import UUID

from fastapi import APIRouter, status

from app.database import SessionDep
from app.dependencies.auth import AdminDep, CurrentUserDep
from schemas.bookings import (
    AdminBookingStats,
    BookingCreate,
    BookingResponse,
    BookingWithUserResponse,
)
from services.bookings import (
    approve_booking,
    cancel_booking,
    create_booking,
    get_admin_stats,
    get_booking,
    list_all_bookings,
    list_user_bookings,
    mark_booking_car_sold,
    reject_booking,
)

router = APIRouter(prefix="/bookings", tags=["Bookings"])


@router.post("", response_model=BookingResponse, status_code=status.HTTP_201_CREATED)
async def create_booking_endpoint(
    session: SessionDep,
    current_user: CurrentUserDep,
    data: BookingCreate,
):
    return await create_booking(session, current_user, data)


@router.get("/me", response_model=List[BookingResponse])
async def list_my_bookings(
    session: SessionDep,
    current_user: CurrentUserDep,
):
    return await list_user_bookings(session, current_user.id)


@router.get("/admin/stats", response_model=AdminBookingStats)
async def admin_booking_stats(session: SessionDep, _admin: AdminDep):
    return await get_admin_stats(session)


@router.get("/admin/all", response_model=List[BookingWithUserResponse])
async def admin_list_bookings(session: SessionDep, _admin: AdminDep):
    return await list_all_bookings(session)


@router.get("/{booking_id}", response_model=BookingResponse)
async def get_booking_endpoint(
    session: SessionDep,
    booking_id: UUID,
    current_user: CurrentUserDep,
):
    return await get_booking(session, booking_id, current_user)


@router.patch("/{booking_id}/cancel", response_model=BookingResponse)
async def cancel_booking_endpoint(
    session: SessionDep,
    booking_id: UUID,
    current_user: CurrentUserDep,
):
    return await cancel_booking(session, booking_id, current_user)


@router.patch("/{booking_id}/approve", response_model=BookingWithUserResponse)
async def approve_booking_endpoint(
    session: SessionDep,
    booking_id: UUID,
    _admin: AdminDep,
):
    return await approve_booking(session, booking_id)


@router.patch("/{booking_id}/reject", response_model=BookingWithUserResponse)
async def reject_booking_endpoint(
    session: SessionDep,
    booking_id: UUID,
    _admin: AdminDep,
):
    return await reject_booking(session, booking_id)


@router.patch("/{booking_id}/sold", response_model=BookingWithUserResponse)
async def mark_booking_sold_endpoint(
    session: SessionDep,
    booking_id: UUID,
    _admin: AdminDep,
):
    return await mark_booking_car_sold(session, booking_id)

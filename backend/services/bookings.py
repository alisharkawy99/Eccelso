from datetime import datetime, timedelta, timezone
from uuid import UUID

from fastapi import HTTPException, status
from sqlalchemy import func, select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from models.bookings import Booking, BookingStatus
from models.cars import Car
from models.users import RoleEnum, Users
from schemas.bookings import AdminBookingStats, BookingCreate
from services.cars import mark_car_sold

SOLD_VISIBILITY_HOURS = 48

OPEN_STATUSES = (BookingStatus.PENDING.value, BookingStatus.APPROVED.value)


async def purge_expired_sold_cars(db: AsyncSession) -> None:
    cutoff = datetime.now(timezone.utc) - timedelta(hours=SOLD_VISIBILITY_HOURS)
    result = await db.execute(
        select(Car)
        .options(selectinload(Car.images))
        .where(Car.sold.is_(True), Car.sold_at.isnot(None), Car.sold_at < cutoff)
    )
    expired_cars = result.scalars().all()
    if not expired_cars:
        return

    import asyncio
    import cloudinary.uploader

    for car in expired_cars:
        for img in car.images:
            await asyncio.to_thread(cloudinary.uploader.destroy, img.public_id)
        await db.delete(car)

    await db.commit()


def _public_car_filter(query):
    cutoff = datetime.now(timezone.utc) - timedelta(hours=SOLD_VISIBILITY_HOURS)
    return query.where(
        (Car.sold.is_(False))
        | (Car.sold.is_(True) & Car.sold_at.isnot(None) & (Car.sold_at >= cutoff))
    )


async def _get_booking_with_relations(db: AsyncSession, booking_id: UUID) -> Booking:
    result = await db.execute(
        select(Booking)
        .options(
            selectinload(Booking.car).selectinload(Car.images),
            selectinload(Booking.user),
        )
        .where(Booking.id == booking_id)
    )
    booking = result.scalar_one_or_none()
    if not booking:
        raise HTTPException(status_code=404, detail="Booking not found")
    return booking


async def create_booking(
    db: AsyncSession, user: Users, data: BookingCreate
) -> Booking:
    await purge_expired_sold_cars(db)

    result = await db.execute(
        select(Car)
        .options(selectinload(Car.images))
        .where(Car.id == data.car_id)
    )
    car = result.scalar_one_or_none()
    if not car:
        raise HTTPException(status_code=404, detail="Car not found")

    if car.sold:
        raise HTTPException(status_code=400, detail="This car has been sold")

    duplicate = await db.execute(
        select(Booking).where(
            Booking.user_id == user.id,
            Booking.car_id == data.car_id,
            Booking.status.in_(OPEN_STATUSES),
        )
    )
    if duplicate.scalar_one_or_none():
        raise HTTPException(
            status_code=409, detail="You already have an open booking for this car"
        )

    image_url = car.images[0].url if car.images else None
    booking = Booking(
        user_id=user.id,
        car_id=car.id,
        status=BookingStatus.PENDING.value,
        notes=data.notes,
        car_name=car.name,
        car_brand=car.brand,
        car_image_url=image_url,
        car_condition=car.condition,
    )

    db.add(booking)
    await db.commit()
    return await _get_booking_with_relations(db, booking.id)


async def list_user_bookings(db: AsyncSession, user_id: UUID) -> list[Booking]:
    await purge_expired_sold_cars(db)

    result = await db.execute(
        select(Booking)
        .options(selectinload(Booking.car).selectinload(Car.images))
        .where(Booking.user_id == user_id, Booking.car_id.isnot(None))
        .order_by(Booking.created_at.desc())
    )
    return result.scalars().all()


async def get_booking(
    db: AsyncSession, booking_id: UUID, user: Users
) -> Booking:
    await purge_expired_sold_cars(db)
    booking = await _get_booking_with_relations(db, booking_id)

    if booking.user_id != user.id and user.role != RoleEnum.ADMIN:
        raise HTTPException(status_code=403, detail="Not authorized to view this booking")

    return booking


async def cancel_booking(db: AsyncSession, booking_id: UUID, user: Users) -> Booking:
    result = await db.execute(
        select(Booking)
        .options(selectinload(Booking.car))
        .where(Booking.id == booking_id, Booking.user_id == user.id)
    )
    booking = result.scalar_one_or_none()
    if not booking:
        raise HTTPException(status_code=404, detail="Booking not found")

    if booking.status == BookingStatus.CANCELLED.value:
        raise HTTPException(status_code=400, detail="Booking is already cancelled")

    if booking.status == BookingStatus.REJECTED.value:
        raise HTTPException(status_code=400, detail="Cannot cancel a rejected booking")

    if booking.car and booking.car.sold:
        raise HTTPException(
            status_code=400, detail="Cannot cancel a booking for a sold car"
        )

    booking.status = BookingStatus.CANCELLED.value
    booking.cancelled_at = datetime.now(timezone.utc)

    await db.commit()
    return await _get_booking_with_relations(db, booking.id)


async def approve_booking(db: AsyncSession, booking_id: UUID) -> Booking:
    booking = await _get_booking_with_relations(db, booking_id)

    if booking.status != BookingStatus.PENDING.value:
        raise HTTPException(
            status_code=400, detail="Only pending bookings can be approved"
        )

    if booking.car and booking.car.sold:
        raise HTTPException(status_code=400, detail="This car has already been sold")

    booking.status = BookingStatus.APPROVED.value
    await db.commit()
    return await _get_booking_with_relations(db, booking.id)


async def reject_booking(db: AsyncSession, booking_id: UUID) -> Booking:
    booking = await _get_booking_with_relations(db, booking_id)

    if booking.status != BookingStatus.PENDING.value:
        raise HTTPException(
            status_code=400, detail="Only pending bookings can be rejected"
        )

    booking.status = BookingStatus.REJECTED.value
    await db.commit()
    return await _get_booking_with_relations(db, booking.id)


async def mark_booking_car_sold(db: AsyncSession, booking_id: UUID) -> Booking:
    booking = await _get_booking_with_relations(db, booking_id)

    if not booking.car_id:
        raise HTTPException(status_code=400, detail="Car no longer available")

    if booking.car and booking.car.sold:
        raise HTTPException(status_code=400, detail="Car is already marked as sold")

    await mark_car_sold(db, booking.car_id)
    return await _get_booking_with_relations(db, booking.id)


async def list_all_bookings(db: AsyncSession) -> list[Booking]:
    await purge_expired_sold_cars(db)

    result = await db.execute(
        select(Booking)
        .options(
            selectinload(Booking.car).selectinload(Car.images),
            selectinload(Booking.user),
        )
        .order_by(Booking.created_at.desc())
    )
    return result.scalars().all()


async def get_admin_stats(db: AsyncSession) -> AdminBookingStats:
    total = await db.scalar(select(func.count()).select_from(Booking)) or 0
    pending = (
        await db.scalar(
            select(func.count())
            .select_from(Booking)
            .where(Booking.status == BookingStatus.PENDING.value)
        )
        or 0
    )
    approved = (
        await db.scalar(
            select(func.count())
            .select_from(Booking)
            .where(Booking.status == BookingStatus.APPROVED.value)
        )
        or 0
    )
    rejected = (
        await db.scalar(
            select(func.count())
            .select_from(Booking)
            .where(Booking.status == BookingStatus.REJECTED.value)
        )
        or 0
    )
    cancelled = (
        await db.scalar(
            select(func.count())
            .select_from(Booking)
            .where(Booking.status == BookingStatus.CANCELLED.value)
        )
        or 0
    )

    return AdminBookingStats(
        total_bookings=total,
        pending_bookings=pending,
        approved_bookings=approved,
        rejected_bookings=rejected,
        cancelled_bookings=cancelled,
    )

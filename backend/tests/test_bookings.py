import pytest
from httpx import AsyncClient
from sqlalchemy.ext.asyncio import AsyncSession

from models.bookings import BookingStatus
from models.cars import Car
from models.users import Users
from tests.conftest import create_user_in_db, seed_car


@pytest.mark.asyncio
async def test_create_booking(
    client: AsyncClient,
    user_headers: dict,
    sample_car: Car,
):
    response = await client.post(
        "/bookings",
        json={"car_id": str(sample_car.id), "notes": "Interested in a test drive"},
        headers=user_headers,
    )
    assert response.status_code == 201
    data = response.json()
    assert data["car_id"] == str(sample_car.id)
    assert data["status"] == BookingStatus.PENDING.value
    assert data["car_name"] == sample_car.name
    assert data["notes"] == "Interested in a test drive"


@pytest.mark.asyncio
async def test_create_booking_requires_auth(client: AsyncClient, sample_car: Car):
    response = await client.post(
        "/bookings",
        json={"car_id": str(sample_car.id)},
    )
    assert response.status_code == 401


@pytest.mark.asyncio
async def test_create_booking_car_not_found(client: AsyncClient, user_headers: dict):
    response = await client.post(
        "/bookings",
        json={"car_id": "00000000-0000-0000-0000-000000000001"},
        headers=user_headers,
    )
    assert response.status_code == 404


@pytest.mark.asyncio
async def test_create_booking_duplicate_open_booking(
    client: AsyncClient,
    user_headers: dict,
    sample_car: Car,
):
    payload = {"car_id": str(sample_car.id)}
    first = await client.post("/bookings", json=payload, headers=user_headers)
    assert first.status_code == 201

    second = await client.post("/bookings", json=payload, headers=user_headers)
    assert second.status_code == 409
    assert "open booking" in second.json()["detail"]


@pytest.mark.asyncio
async def test_create_booking_for_sold_car(
    client: AsyncClient,
    user_headers: dict,
    db_session: AsyncSession,
):
    sold_car = await seed_car(db_session, name="Sold Car", sold=True)
    response = await client.post(
        "/bookings",
        json={"car_id": str(sold_car.id)},
        headers=user_headers,
    )
    assert response.status_code == 400
    assert response.json()["detail"] == "This car has been sold"


@pytest.mark.asyncio
async def test_list_my_bookings(
    client: AsyncClient,
    user_headers: dict,
    sample_car: Car,
):
    await client.post(
        "/bookings",
        json={"car_id": str(sample_car.id)},
        headers=user_headers,
    )
    response = await client.get("/bookings/me", headers=user_headers)
    assert response.status_code == 200
    data = response.json()
    assert len(data) == 1
    assert data[0]["car_id"] == str(sample_car.id)


@pytest.mark.asyncio
async def test_get_booking_by_id(
    client: AsyncClient,
    user_headers: dict,
    sample_car: Car,
):
    created = await client.post(
        "/bookings",
        json={"car_id": str(sample_car.id)},
        headers=user_headers,
    )
    booking_id = created.json()["id"]

    response = await client.get(f"/bookings/{booking_id}", headers=user_headers)
    assert response.status_code == 200
    assert response.json()["id"] == booking_id


@pytest.mark.asyncio
async def test_get_booking_forbidden_for_other_user(
    client: AsyncClient,
    db_session: AsyncSession,
    user_headers: dict,
    sample_car: Car,
):
    created = await client.post(
        "/bookings",
        json={"car_id": str(sample_car.id)},
        headers=user_headers,
    )
    booking_id = created.json()["id"]

    other_user = await create_user_in_db(
        db_session,
        email="other@example.com",
        name="Other User",
    )
    from tests.conftest import auth_headers_for

    other_headers = await auth_headers_for(other_user)
    response = await client.get(f"/bookings/{booking_id}", headers=other_headers)
    assert response.status_code == 403


@pytest.mark.asyncio
async def test_cancel_booking(
    client: AsyncClient,
    user_headers: dict,
    sample_car: Car,
):
    created = await client.post(
        "/bookings",
        json={"car_id": str(sample_car.id)},
        headers=user_headers,
    )
    booking_id = created.json()["id"]

    response = await client.patch(
        f"/bookings/{booking_id}/cancel",
        headers=user_headers,
    )
    assert response.status_code == 200
    assert response.json()["status"] == BookingStatus.CANCELLED.value
    assert response.json()["cancelled_at"] is not None


@pytest.mark.asyncio
async def test_admin_list_bookings(
    client: AsyncClient,
    admin_headers: dict,
    user_headers: dict,
    sample_car: Car,
):
    await client.post(
        "/bookings",
        json={"car_id": str(sample_car.id)},
        headers=user_headers,
    )
    response = await client.get("/bookings/admin/all", headers=admin_headers)
    assert response.status_code == 200
    data = response.json()
    assert len(data) == 1
    assert data[0]["user"]["email"] == "user@example.com"


@pytest.mark.asyncio
async def test_admin_booking_stats(
    client: AsyncClient,
    admin_headers: dict,
    user_headers: dict,
    sample_car: Car,
):
    await client.post(
        "/bookings",
        json={"car_id": str(sample_car.id)},
        headers=user_headers,
    )
    response = await client.get("/bookings/admin/stats", headers=admin_headers)
    assert response.status_code == 200
    stats = response.json()
    assert stats["total_bookings"] == 1
    assert stats["pending_bookings"] == 1


@pytest.mark.asyncio
async def test_admin_approve_booking(
    client: AsyncClient,
    admin_headers: dict,
    user_headers: dict,
    sample_car: Car,
):
    created = await client.post(
        "/bookings",
        json={"car_id": str(sample_car.id)},
        headers=user_headers,
    )
    booking_id = created.json()["id"]

    response = await client.patch(
        f"/bookings/{booking_id}/approve",
        headers=admin_headers,
    )
    assert response.status_code == 200
    assert response.json()["status"] == BookingStatus.APPROVED.value


@pytest.mark.asyncio
async def test_admin_reject_booking(
    client: AsyncClient,
    admin_headers: dict,
    user_headers: dict,
    sample_car: Car,
):
    created = await client.post(
        "/bookings",
        json={"car_id": str(sample_car.id)},
        headers=user_headers,
    )
    booking_id = created.json()["id"]

    response = await client.patch(
        f"/bookings/{booking_id}/reject",
        headers=admin_headers,
    )
    assert response.status_code == 200
    assert response.json()["status"] == BookingStatus.REJECTED.value


@pytest.mark.asyncio
async def test_admin_mark_booking_sold(
    client: AsyncClient,
    admin_headers: dict,
    user_headers: dict,
    sample_car: Car,
):
    created = await client.post(
        "/bookings",
        json={"car_id": str(sample_car.id)},
        headers=user_headers,
    )
    booking_id = created.json()["id"]

    response = await client.patch(
        f"/bookings/{booking_id}/sold",
        headers=admin_headers,
    )
    assert response.status_code == 200
    assert response.json()["car"]["sold"] is True

    car_response = await client.get(f"/cars/{sample_car.id}")
    assert car_response.json()["sold"] is True


@pytest.mark.asyncio
async def test_admin_endpoints_require_admin(
    client: AsyncClient,
    user_headers: dict,
):
    response = await client.get("/bookings/admin/all", headers=user_headers)
    assert response.status_code == 403

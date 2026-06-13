import pytest
from httpx import AsyncClient
from sqlalchemy.ext.asyncio import AsyncSession

from models.cars import Car
from tests.conftest import car_form_data, car_image_file, seed_car


@pytest.mark.asyncio
async def test_health_endpoint(client: AsyncClient):
    response = await client.get("/health")
    assert response.status_code == 200
    assert response.json() == {"status": "ok"}


@pytest.mark.asyncio
async def test_list_cars_empty(client: AsyncClient):
    response = await client.get("/cars")
    assert response.status_code == 200
    assert response.json() == []


@pytest.mark.asyncio
async def test_list_cars_returns_seeded_car(
    client: AsyncClient, db_session: AsyncSession
):
    await seed_car(db_session, name="Listed Car")
    response = await client.get("/cars")
    assert response.status_code == 200
    data = response.json()
    assert len(data) == 1
    assert data[0]["name"] == "Listed Car"


@pytest.mark.asyncio
async def test_list_cars_filter_by_category(
    client: AsyncClient, db_session: AsyncSession
):
    await seed_car(db_session, name="Super", category="supercar")
    await seed_car(db_session, name="SUV", category="premium_suv")

    response = await client.get("/cars", params={"category": "premium_suv"})
    assert response.status_code == 200
    data = response.json()
    assert len(data) == 1
    assert data[0]["category"] == "premium_suv"


@pytest.mark.asyncio
async def test_list_cars_filter_featured(
    client: AsyncClient, db_session: AsyncSession
):
    await seed_car(db_session, name="Regular", featured=False)
    await seed_car(db_session, name="Featured", featured=True)

    response = await client.get("/cars", params={"featured": True})
    assert response.status_code == 200
    data = response.json()
    assert len(data) == 1
    assert data[0]["featured"] is True


@pytest.mark.asyncio
async def test_get_car_by_id(client: AsyncClient, sample_car: Car):
    response = await client.get(f"/cars/{sample_car.id}")
    assert response.status_code == 200
    data = response.json()
    assert data["id"] == str(sample_car.id)
    assert data["name"] == sample_car.name
    assert len(data["images"]) == 1


@pytest.mark.asyncio
async def test_get_car_not_found(client: AsyncClient):
    response = await client.get(
        "/cars/00000000-0000-0000-0000-000000000001"
    )
    assert response.status_code == 404


@pytest.mark.asyncio
async def test_create_car_requires_admin(client: AsyncClient, user_headers: dict):
    response = await client.post(
        "/cars",
        data=car_form_data(),
        files=[car_image_file()],
        headers=user_headers,
    )
    assert response.status_code == 403


@pytest.mark.asyncio
async def test_create_car_success(client: AsyncClient, admin_headers: dict):
    response = await client.post(
        "/cars",
        data=car_form_data(name="New McLaren"),
        files=[car_image_file()],
        headers=admin_headers,
    )
    assert response.status_code == 201
    data = response.json()
    assert data["name"] == "New McLaren"
    assert data["brand"] == "Lamborghini"
    assert len(data["images"]) == 1


@pytest.mark.asyncio
async def test_create_car_allows_duplicate_names(
    client: AsyncClient, admin_headers: dict
):
    for _ in range(2):
        response = await client.post(
            "/cars",
            data=car_form_data(name="Duplicate Name"),
            files=[car_image_file()],
            headers=admin_headers,
        )
        assert response.status_code == 201
        assert response.json()["name"] == "Duplicate Name"


@pytest.mark.asyncio
async def test_update_car(client: AsyncClient, admin_headers: dict, sample_car: Car):
    response = await client.patch(
        f"/cars/{sample_car.id}",
        data=car_form_data(name="Updated Name", brand="Ferrari"),
        headers=admin_headers,
    )
    assert response.status_code == 200
    data = response.json()
    assert data["name"] == "Updated Name"
    assert data["brand"] == "Ferrari"


@pytest.mark.asyncio
async def test_update_car_not_found(client: AsyncClient, admin_headers: dict):
    response = await client.patch(
        "/cars/00000000-0000-0000-0000-000000000001",
        data=car_form_data(),
        headers=admin_headers,
    )
    assert response.status_code == 404


@pytest.mark.asyncio
async def test_delete_car(client: AsyncClient, admin_headers: dict, sample_car: Car):
    response = await client.delete(
        f"/cars/{sample_car.id}",
        headers=admin_headers,
    )
    assert response.status_code == 200
    assert response.json()["message"] == "Car deleted successfully"

    get_response = await client.get(f"/cars/{sample_car.id}")
    assert get_response.status_code == 404


@pytest.mark.asyncio
async def test_mark_car_sold(
    client: AsyncClient, admin_headers: dict, sample_car: Car
):
    response = await client.patch(
        f"/cars/{sample_car.id}/sold",
        headers=admin_headers,
    )
    assert response.status_code == 200
    data = response.json()
    assert data["sold"] is True
    assert data["available"] is False
    assert data["sold_at"] is not None


@pytest.mark.asyncio
async def test_mark_car_sold_twice_returns_bad_request(
    client: AsyncClient, admin_headers: dict, sample_car: Car
):
    await client.patch(f"/cars/{sample_car.id}/sold", headers=admin_headers)
    response = await client.patch(
        f"/cars/{sample_car.id}/sold",
        headers=admin_headers,
    )
    assert response.status_code == 400
    assert response.json()["detail"] == "Car is already marked as sold"


@pytest.mark.asyncio
async def test_upload_car_images(
    client: AsyncClient,
    admin_headers: dict,
    sample_car: Car,
    db_session: AsyncSession,
):
    car_id = sample_car.id
    response = await client.post(
        f"/cars/{car_id}/images",
        files=[("uploaded_images", car_image_file()[1])],
        headers=admin_headers,
    )
    assert response.status_code == 200
    data = response.json()
    assert data["count"] == 1
    assert data["message"] == "Images uploaded successfully"

    db_session.expire_all()
    car_response = await client.get(f"/cars/{car_id}")
    assert len(car_response.json()["images"]) == 2


@pytest.mark.asyncio
async def test_upload_car_images_requires_files(
    client: AsyncClient, admin_headers: dict, sample_car: Car
):
    response = await client.post(
        f"/cars/{sample_car.id}/images",
        headers=admin_headers,
    )
    assert response.status_code == 422

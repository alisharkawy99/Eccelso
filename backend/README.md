# Eccelso Backend — FastAPI (Coming Soon)

This folder will contain the FastAPI backend for Eccelso by Sharkawy.

## Planned Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/cars` | List all cars |
| GET | `/cars/{id}` | Get a single car by ID |
| POST | `/bookings` | Submit a booking inquiry |
| POST | `/admin/cars` | Add a new car (admin) |
| PUT | `/admin/cars/{id}` | Update a car (admin) |
| DELETE | `/admin/cars/{id}` | Delete a car (admin) |

## Integration Notes

The frontend reads all data through `frontend/src/lib/api.ts`.
When this backend is ready:
1. Run FastAPI locally on `http://localhost:8000`
2. Open `frontend/src/lib/api.ts`
3. Replace the dummy data returns with real `fetch()` calls to the endpoints above

## Planned Tech Stack

- **FastAPI** — Python web framework
- **SQLAlchemy** or **Tortoise ORM** — database ORM
- **PostgreSQL** — database
- **Pydantic** — request/response validation
- **JWT** — admin authentication
- **Chatbot integration** — planned for final phase

## Getting Started (Future)

```bash
cd backend
python -m venv venv
venv\Scripts\activate       # Windows
pip install fastapi uvicorn sqlalchemy psycopg2-binary
uvicorn main:app --reload
```

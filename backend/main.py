from fastapi import FastAPI
from app.database import engine, Base
from routers.cars import router as cars_router

app = FastAPI()

app.include_router(cars_router)


@app.on_event("startup")
async def create_tables():
    Base.metadata.create_all(bind=engine)

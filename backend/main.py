from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.database import engine, Base
from routers.cars import router as cars_router

origins = [
    "http://localhost:3000",  # Next.js / React default
    "http://localhost:5173",  # Vite default
]
app = FastAPI()
app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],  # Allows GET, POST, PUT, PATCH, DELETE
    allow_headers=["*"],
)


app.include_router(cars_router)


@app.on_event("startup")
async def create_tables():
    Base.metadata.create_all(bind=engine)

from services.users import add_new_user, authenticate_user
from schemas.users import TokenResponse, UserCreate, UserLogin
from fastapi import APIRouter, status
from app.database import SessionDep

router = APIRouter(prefix="/users", tags=["Users"])


@router.post("/register", status_code=status.HTTP_200_OK)
async def register_user(session: SessionDep, user_info: UserCreate):
    await add_new_user(session, user_info)
    return {"message": "User registered successfully"}


@router.post("/login", response_model=TokenResponse)
async def login_user(session: SessionDep, user_info: UserLogin):
    return await authenticate_user(session, user_info)

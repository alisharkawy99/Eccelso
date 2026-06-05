from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import ValidationError

from app.database import SessionDep
from schemas.users import TokenResponse, UserCreate, UserLogin, UserRegisterForm
from services.users import create_user, login

router = APIRouter(prefix="/auth", tags=["Auth"])


@router.post("/register", status_code=status.HTTP_201_CREATED)
async def register(
    session: SessionDep, data: UserRegisterForm = Depends(UserRegisterForm)
):
    try:
        user_data = UserCreate(
            email=data.email,
            password=data.password,
            name=data.name,
            phone_number=data.phone_number,
            address=data.address,
        )
    except ValidationError as exc:
        first_error = exc.errors()[0]["msg"] if exc.errors() else "Invalid registration data"
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY, detail=first_error
        )

    await create_user(session, user_data, data.avatar)
    return {"message": "User registered successfully"}


@router.post("/login", response_model=TokenResponse)
async def login_user(session: SessionDep, user_info: UserLogin):
    return await login(session, user_info)

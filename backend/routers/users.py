from services.users import add_new_user, authenticate_user
from schemas.users import TokenResponse, UserBase, UserCreate
from fastapi import APIRouter, status
from app.database import SessionDep

router = APIRouter(prefix="/users", tags=["Users"])


@router.post("/user", status_code=status.HTTP_200_OK)
def register_user(session: SessionDep, user_info: UserCreate):
    add_new_user(session, user_info)
    return {"message": "User registered successfully"}


@router.post("/login", response_model=TokenResponse)
def login_user(session: SessionDep, user_info: UserBase):
    return authenticate_user(session, user_info)

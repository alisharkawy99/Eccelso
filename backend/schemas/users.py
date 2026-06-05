from pydantic import BaseModel, EmailStr, ConfigDict, field_validator
from uuid import UUID
from models.users import RoleEnum
from typing import Optional
from fastapi import Form, File, UploadFile


class UserPublic(BaseModel):
    email: EmailStr
    name: str


class UserCreate(BaseModel):
    email: EmailStr
    name: str
    password: str
    phone_number: str
    address: Optional[str] = None

    @field_validator("password")
    @classmethod
    def password_min_length(cls, value: str) -> str:
        if len(value) < 8:
            raise ValueError("Password must be at least 8 characters")
        return value


class UserRegisterForm:
    def __init__(
        self,
        email: str = Form(...),
        password: str = Form(...),
        name: str = Form(...),
        phone_number: str = Form(...),
        address: Optional[str] = Form(None),
        avatar: UploadFile | None = File(None),
    ):
        self.email = email
        self.password = password
        self.name = name
        self.phone_number = phone_number
        self.address = address
        self.avatar = avatar


class UserLogin(BaseModel):
    email: EmailStr
    password: str


class UserRead(UserPublic):
    id: UUID
    role: RoleEnum
    avatar_url: Optional[str] = None

    model_config = ConfigDict(from_attributes=True)


class TokenResponse(BaseModel):
    user: UserRead
    token: str
    tokenType: str = "bearer"
    role: RoleEnum

from optparse import Option
from pydantic import BaseModel, EmailStr, ConfigDict
from uuid import UUID
from models.users import RoleEnum
from typing import Optional


class UserBase(BaseModel):
    password: str
    email: EmailStr


class UserCreate(UserBase):
    name: str
    phone_number: str
    address: Optional[str] = None


class UserRead(UserBase):
    id: UUID
    role: RoleEnum

    model_config = ConfigDict(from_attributes=True)


# In schemas/users.py


class TokenResponse(BaseModel):
    token: str
    tokenType: str = "bearer"
    role: RoleEnum

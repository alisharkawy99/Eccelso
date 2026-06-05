from pydantic import BaseModel, EmailStr, ConfigDict
from uuid import UUID
from models.users import RoleEnum
from typing import Optional


# 1. Public data structure used in other schemas
class UserPublic(BaseModel):
    email: EmailStr
    name: str


# 2. Used for registration (POST /register)
class UserCreate(UserPublic):
    password: str
    phone_number: str
    address: Optional[str] = None


# 3. Used for logging in (POST /login)
class UserLogin(BaseModel):
    email: EmailStr
    password: str


# 4. Used for reading from DB (Returned in responses)
class UserRead(UserPublic):
    id: UUID
    role: RoleEnum

    model_config = ConfigDict(from_attributes=True)


# 5. Final API Response structure
class TokenResponse(BaseModel):
    user: UserRead
    token: str
    tokenType: str = "bearer"
    role: RoleEnum

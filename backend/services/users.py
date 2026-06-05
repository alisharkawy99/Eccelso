import asyncio
import cloudinary.uploader
from fastapi import HTTPException, UploadFile, status
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.utils.security import create_access_token, get_password_hash, verify_password
from models.users import Users
from schemas.users import TokenResponse, UserCreate, UserLogin, UserRead


async def create_user(
    db: AsyncSession, user_data: UserCreate, avatar: UploadFile | None = None
) -> Users:
    result = await db.execute(select(Users).where(Users.email == user_data.email))
    existing_user = result.scalar_one_or_none()
    if existing_user:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT, detail="User Email already exists."
        )

    user_dic = user_data.model_dump()
    user_dic["password_hash"] = await get_password_hash(user_dic.pop("password"))

    if avatar and avatar.filename:
        upload_result = await asyncio.to_thread(cloudinary.uploader.upload, avatar.file)
        user_dic["avatar_url"] = upload_result["secure_url"]
        user_dic["avatar_public_id"] = upload_result["public_id"]

    new_user = Users(**user_dic)
    db.add(new_user)
    await db.flush()
    await db.commit()
    await db.refresh(new_user)
    return new_user


async def login(db: AsyncSession, user_data: UserLogin) -> TokenResponse:
    result = await db.execute(select(Users).where(Users.email == user_data.email))
    existing_user = result.scalar_one_or_none()
    if not existing_user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Incorrect email or password"
        )

    if not await verify_password(user_data.password, existing_user.password_hash):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password",
        )
    token = await create_access_token(data={"sub": user_data.email})
    return TokenResponse(
        user=UserRead(
            id=existing_user.id,
            name=existing_user.name,
            role=existing_user.role,
            email=existing_user.email,
            avatar_url=existing_user.avatar_url,
        ),
        token=token,
        tokenType="bearer",
        role=existing_user.role,
    )

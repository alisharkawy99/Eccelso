from app.utils.security import create_access_token, get_password_hash, verify_password
from models.users import Users
from schemas.users import TokenResponse, UserCreate, UserLogin, UserRead
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from fastapi import HTTPException, status


async def add_new_user(db: AsyncSession, user_data: UserCreate) -> Users:
    result = await db.execute(select(Users).where(Users.email == user_data.email))
    existing_user = result.scalar_one_or_none()
    if existing_user:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT, detail="User Email already exists."
        )
    user_dic = user_data.model_dump()
    user_dic["password_hash"] = get_password_hash(user_dic.pop("password"))
    new_user = Users(**user_dic)
    db.add(new_user)
    await db.flush()
    await db.commit()
    await db.refresh(new_user)
    return new_user


async def authenticate_user(db: AsyncSession, user_data: UserLogin) -> TokenResponse:
    result = await db.execute(select(Users).where(Users.email == user_data.email))
    existing_user = result.scalar_one_or_none()
    if not existing_user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Incorrect email or password"
        )

    if not verify_password(user_data.password, existing_user.password_hash):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password",
        )
    token = create_access_token(data={"sub": user_data.email})
    return TokenResponse(
        user=UserRead(
            id=existing_user.id,
            name=existing_user.name,
            role=existing_user.role,
            email=existing_user.email,
        ),
        token=token,
        tokenType="bearer",
        role=existing_user.role,
    )

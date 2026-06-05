import asyncio
from argon2 import PasswordHasher
from argon2.exceptions import VerifyMismatchError
from datetime import datetime, timedelta, timezone
from jose import jwt

ph = PasswordHasher()
SECRET_KEY = "Secret_key"
ALGORITHM = "HS256"


async def get_password_hash(password: str) -> str:
    return await asyncio.to_thread(ph.hash, password)


async def verify_password(plain_password: str, hashed_password: str) -> bool:
    try:
        return await asyncio.to_thread(ph.verify, hashed_password, plain_password)
    except VerifyMismatchError:
        return False


async def create_access_token(data: dict) -> str:
    to_encode = data.copy()
    expire = datetime.now(timezone.utc) + timedelta(minutes=30)
    to_encode.update({"exp": expire})
    return await asyncio.to_thread(jwt.encode, to_encode, SECRET_KEY, ALGORITHM)

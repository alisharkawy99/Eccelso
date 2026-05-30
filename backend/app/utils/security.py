from argon2 import PasswordHasher
from argon2.exceptions import VerifyMismatchError
from datetime import datetime, timedelta, timezone
from jose import jwt

# Initialize the hasher once (manages internal security parameters)
ph = PasswordHasher()
SECRET_KEY = "Secret_key"
ALGORITHM = "HS256"


def get_password_hash(password: str) -> str:
    # No manual truncation or byte-encoding needed; accepts raw strings safely
    return ph.hash(password)


def verify_password(plain_password: str, hashed_password: str) -> bool:
    try:
        return ph.verify(hashed_password, plain_password)
    except VerifyMismatchError:
        return False


def create_access_token(data: dict):
    to_encode = data.copy()
    # Use timezone-aware UTC time
    expire = datetime.now(timezone.utc) + timedelta(minutes=30)
    to_encode.update({"exp": expire})
    return jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)

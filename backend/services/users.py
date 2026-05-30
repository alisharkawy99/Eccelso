from app.utils.security import create_access_token, get_password_hash, verify_password
from models.users import Users
from schemas.users import TokenResponse, UserBase, UserCreate
from sqlalchemy.orm import Session
from fastapi import HTTPException, status


def add_new_user(db: Session, user_data: UserCreate) -> Users:
    existing_user = db.query(Users).filter(Users.email == user_data.email).first()
    if existing_user:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT, detail="User Email already exists."
        )
    user_dic = user_data.model_dump()
    user_dic["password_hash"] = get_password_hash(user_dic.pop("password"))
    new_user = Users(**user_dic)
    db.add(new_user)
    db.flush()
    db.commit()
    db.refresh(new_user)
    return new_user


def authenticate_user(db: Session, user_data: UserBase) -> TokenResponse:
    existing_user = db.query(Users).filter(Users.email == user_data.email).first()
    if not existing_user:
        raise HTTPException(
            status_code=status.HTTP_401_NOT_FOUND, detail="Incorrect email or password"
        )

    if not verify_password(user_data.password, existing_user.password_hash):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password",
        )
    token = create_access_token(data={"sub": user_data.email})
    return {"token": token, "tokenType": "bearer", "role": existing_user.role}

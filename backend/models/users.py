import enum
import uuid
from sqlalchemy.sql import func
from app.database import Base

# Change this import
from sqlalchemy import Column, String, Boolean, Enum as SQLAlchemyEnum, DateTime, UUID


class RoleEnum(str, enum.Enum):
    ADMIN = "Admin"
    USER = "User"


class Users(Base):
    __tablename__ = "users"
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4, index=True)
    name = Column(String, nullable=False)
    email = Column(String, unique=True, index=True, nullable=False)
    password_hash = Column(String, nullable=False)
    role = Column(SQLAlchemyEnum(RoleEnum), default=RoleEnum.USER)
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    phone_number = Column(String, nullable=False)
    address = Column(String, nullable=True)
    avatar_url = Column(String, nullable=True)
    avatar_public_id = Column(String, nullable=True)

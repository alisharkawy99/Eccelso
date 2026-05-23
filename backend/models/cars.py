import uuid
from sqlalchemy import Column, Integer, String, Boolean, text, JSON
from sqlalchemy.dialects.postgresql import UUID
from app.database import Base


class Car(Base):
    __tablename__ = "cars"
    id = Column(
        UUID(as_uuid=True),
        primary_key=True,
        default=uuid.uuid4,
        server_default=text("gen_random_uuid()"),
    )
    name = Column(String, index=True)
    brand = Column(String, index=True)
    category = Column(String, index=True)
    price_per_day = Column(Integer)
    images = Column(JSON)
    specs = Column(JSON)
    available = Column(Boolean, default=True)
    featured = Column(Boolean, default=False)
    description = Column(String)

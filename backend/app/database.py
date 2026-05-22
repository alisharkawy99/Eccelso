from app.config import settings
from sqlalchemy import create_engine
from sqlalchemy.orm import Session, declarative_base
from typing import Annotated
from fastapi import Depends

Base = declarative_base()
engine = create_engine(settings.database_url)


def get_db():
    db = Session(engine)
    try:
        yield db
    finally:
        db.close()


SessionDep = Annotated[Session, Depends(get_db)]

from enum import Enum
from typing import Optional, List
from datetime import datetime
from schemas.images import ImageResponse
from pydantic import BaseModel, ConfigDict, Field
from uuid import UUID
from fastapi import Form, File, UploadFile


class CarSpecs(BaseModel):
    engine: str
    power: Optional[str] = None
    seats: Optional[int] = None
    transmission: str


class CarCategory(Enum):
    SUPERCAR = "supercar"
    LUXURYSEDAN = "luxury_sedan"
    SPORTS = "sports"
    PREMIUMSUV = "premium_suv"


class CarResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True, populate_by_name=True)
    id: UUID
    name: str
    brand: str
    category: str
    condition: str = "new"
    images: List[ImageResponse]
    specs: CarSpecs
    available: bool
    featured: bool
    sold: bool = False
    sold_at: Optional[datetime] = None
    description: Optional[str] = ""


class CarCreate(BaseModel):
    model_config = ConfigDict(from_attributes=True, populate_by_name=True)
    name: str
    brand: str
    category: str
    condition: str = "new"
    images: list[ImageResponse]
    specs: CarSpecs
    available: bool = True
    featured: bool = True
    description: str = ""


class EditCar(BaseModel):
    model_config = ConfigDict(from_attributes=True, populate_by_name=True)

    name: Optional[str] = None
    brand: Optional[str] = None
    category: Optional[str] = None
    condition: Optional[str] = None
    images: Optional[List[ImageResponse]] = None
    specs: Optional[CarSpecs] = None
    available: Optional[bool] = None
    featured: Optional[bool] = None
    description: Optional[str] = None


class CarFormDependency:
    def __init__(
        self,
        name: str = Form(None),
        brand: str = Form(None),
        category: str = Form(None),
        condition: str = Form("new"),
        specs: str = Form(None),
        description: str = Form(None),
        available: bool = Form(True),
        featured: bool = Form(True),
        images: List[UploadFile] = File([]),
    ):
        self.name = name
        self.brand = brand
        self.category = category
        self.condition = condition
        self.specs = specs
        self.description = description
        self.available = available
        self.featured = featured
        self.images = images

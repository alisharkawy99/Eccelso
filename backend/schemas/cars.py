from calendar import c
from enum import Enum
from pickle import DICT
from typing import Optional, List, Dict
from schemas.images import ImageResponse
from pydantic import BaseModel, ConfigDict, Field
from uuid import UUID
from fastapi import Form, File, UploadFile, Depends


class CarSpecs(BaseModel):
    engine: str
    power: Optional[str] = None  # Now optional
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
    price_per_day: int = Field(..., serialization_alias="pricePerDay")
    images: List[ImageResponse]
    specs: CarSpecs
    available: bool
    featured: bool
    description: str


class CarCreate(BaseModel):
    #  FIXED: Cleaned up the double assignment typo here
    model_config = ConfigDict(from_attributes=True, populate_by_name=True)
    name: str
    brand: str
    category: str
    price_per_day: int = Field(..., alias="pricePerDay")
    images: list[ImageResponse]
    specs: CarSpecs
    available: bool = True
    featured: bool = True
    description: str


class EditCar(BaseModel):
    model_config = ConfigDict(from_attributes=True, populate_by_name=True)

    name: Optional[str] = None
    brand: Optional[str] = None
    category: Optional[str] = None
    price_per_day: Optional[int] = Field(None, alias="pricePerDay")
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
        pricePerDay: int = Form(None),
        specs: str = Form(None),  # This will be a JSON string
        description: str = Form(None),
        available: bool = Form(True),
        featured: bool = Form(True),
        images: List[UploadFile] = File([]),
    ):
        self.name = name
        self.brand = brand
        self.category = category
        self.pricePerDay = pricePerDay
        self.specs = specs
        self.description = description
        self.available = available
        self.featured = featured
        self.images = images

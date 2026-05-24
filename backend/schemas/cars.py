from enum import Enum
from pickle import DICT
from typing import Optional, List, Dict
from pydantic import BaseModel, ConfigDict, Field
from uuid import UUID


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
    images: List[str]
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
    images: list[str]
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
    images: Optional[str] = None
    specs: Optional[CarSpecs] = None
    available: Optional[bool] = None
    featured: Optional[bool] = None
    description: Optional[str] = None

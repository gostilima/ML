from datetime import datetime
from typing import Optional

from pydantic import BaseModel

from app.schemas.common import ORMBase


class AdvertisementCreate(BaseModel):
    title: str
    product_id: Optional[str] = None


class AdvertisementUpdate(BaseModel):
    title: Optional[str] = None
    status: Optional[str] = None


class AdvertisementVersionOut(ORMBase):
    id: str
    version_number: int
    title: str
    description: Optional[str] = None
    generated_by_ai: bool
    created_at: datetime


class AdvertisementOut(ORMBase):
    id: str
    product_id: Optional[str] = None
    title: str
    status: str
    created_at: datetime
    updated_at: datetime


class AIGenerateRequest(BaseModel):
    product_name: str
    category: Optional[str] = None
    key_features: Optional[list[str]] = None


class AIOptimizeRequest(BaseModel):
    current_title: str
    current_description: Optional[str] = None


class AIGenerateResponse(BaseModel):
    title: str
    description: str

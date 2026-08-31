from datetime import datetime
from typing import Optional

from pydantic import BaseModel

from app.schemas.common import ORMBase


class ProductBase(BaseModel):
    name: str
    brand: Optional[str] = None
    category: Optional[str] = None
    sku: Optional[str] = None
    ml_item_id: Optional[str] = None
    ean: Optional[str] = None
    weight: Optional[float] = None
    height: Optional[float] = None
    width: Optional[float] = None
    length: Optional[float] = None
    image_url: Optional[str] = None


class ProductCreate(ProductBase):
    pass


class ProductUpdate(BaseModel):
    name: Optional[str] = None
    brand: Optional[str] = None
    category: Optional[str] = None
    sku: Optional[str] = None
    ml_item_id: Optional[str] = None
    ean: Optional[str] = None
    weight: Optional[float] = None
    height: Optional[float] = None
    width: Optional[float] = None
    length: Optional[float] = None
    image_url: Optional[str] = None


class ProductOut(ProductBase, ORMBase):
    id: str
    created_at: datetime
    updated_at: datetime

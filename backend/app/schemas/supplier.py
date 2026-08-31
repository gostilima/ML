from datetime import datetime
from typing import Optional

from pydantic import BaseModel

from app.schemas.common import ORMBase


class SupplierBase(BaseModel):
    name: str
    company: Optional[str] = None
    cnpj: Optional[str] = None
    site: Optional[str] = None
    phone: Optional[str] = None
    whatsapp: Optional[str] = None
    email: Optional[str] = None
    city: Optional[str] = None
    state: Optional[str] = None
    notes: Optional[str] = None


class SupplierCreate(SupplierBase):
    pass


class SupplierUpdate(BaseModel):
    name: Optional[str] = None
    company: Optional[str] = None
    cnpj: Optional[str] = None
    site: Optional[str] = None
    phone: Optional[str] = None
    whatsapp: Optional[str] = None
    email: Optional[str] = None
    city: Optional[str] = None
    state: Optional[str] = None
    notes: Optional[str] = None


class SupplierOut(SupplierBase, ORMBase):
    id: str
    created_at: datetime
    updated_at: datetime


class SupplierProductBase(BaseModel):
    name: str
    code: Optional[str] = None
    price: float
    moq: Optional[int] = None
    stock: Optional[int] = None
    shipping_cost: Optional[float] = None
    lead_time: Optional[int] = None
    product_id: Optional[str] = None


class SupplierProductCreate(SupplierProductBase):
    pass


class SupplierProductUpdate(BaseModel):
    name: Optional[str] = None
    code: Optional[str] = None
    price: Optional[float] = None
    moq: Optional[int] = None
    stock: Optional[int] = None
    shipping_cost: Optional[float] = None
    lead_time: Optional[int] = None
    product_id: Optional[str] = None


class SupplierProductOut(SupplierProductBase, ORMBase):
    id: str
    supplier_id: str
    created_at: datetime
    updated_at: datetime

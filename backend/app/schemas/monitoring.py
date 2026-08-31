from datetime import datetime
from typing import Optional

from pydantic import BaseModel

from app.schemas.common import ORMBase


class MonitoredProductCreate(BaseModel):
    product_id: str
    target_price: Optional[float] = None
    min_stock_alert: Optional[int] = None
    is_active: bool = True


class MonitoredProductUpdate(BaseModel):
    target_price: Optional[float] = None
    min_stock_alert: Optional[int] = None
    is_active: Optional[bool] = None


class MonitoredProductOut(ORMBase):
    id: str
    product_id: str
    is_active: bool
    target_price: Optional[float] = None
    min_stock_alert: Optional[int] = None
    created_at: datetime
    updated_at: datetime

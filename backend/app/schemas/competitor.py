from typing import Optional

from pydantic import BaseModel

from app.schemas.common import ORMBase


class CompetitorOut(ORMBase):
    id: str
    product_id: str
    marketplace: str
    external_id: Optional[str] = None
    seller_name: Optional[str] = None
    title: Optional[str] = None
    price: Optional[float] = None
    sold_quantity: Optional[int] = None
    reputation: Optional[str] = None

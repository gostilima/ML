from datetime import datetime
from typing import Optional

from pydantic import BaseModel

from app.schemas.common import ORMBase


class OpportunitySearchFilter(BaseModel):
    """Filter used by POST /mining/search.

    NOTE: a `marketplaces: list[str]` field was intentionally removed for now
    (single-marketplace MVP is Mercado Livre only) but is reintroducible here
    once multi-marketplace mining is supported, e.g.:
        marketplaces: Optional[list[str]] = None
    """

    keyword: Optional[str] = None
    category: Optional[str] = None
    min_price: Optional[float] = None
    max_price: Optional[float] = None
    min_score: Optional[float] = None
    page: int = 1
    limit: int = 20


class OpportunityOut(ORMBase):
    id: str
    product_id: Optional[str] = None
    keyword: Optional[str] = None
    category: Optional[str] = None
    demand_score: float
    consistency_score: float
    margin_score: float
    competition_score: float
    growth_score: float
    logistics_score: float
    repurchase_score: float
    total_score: float
    created_at: datetime

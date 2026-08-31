from typing import Optional

from pydantic import BaseModel, Field

from app.models.fees import LogisticsType


class ProfitabilityInput(BaseModel):
    selling_price: float = Field(gt=0)
    quantity: int = Field(default=1, gt=0)
    product_cost: float = Field(ge=0)
    category: Optional[str] = None
    weight: Optional[float] = Field(default=None, ge=0)
    tax_percentage: Optional[float] = Field(default=None, ge=0)
    shipping: float = Field(default=0, ge=0)
    packaging: float = Field(default=0, ge=0)
    other_costs: float = Field(default=0, ge=0)
    marketplace: str = "MERCADO_LIVRE"


class ProfitabilityResult(BaseModel):
    logistics_type: LogisticsType
    revenue: float
    marketplace_fee: float
    logistics_fee: float
    tax: float
    shipping: float
    packaging: float
    other_costs: float
    product_cost_total: float
    total_cost: float
    profit: float
    margin: float
    roi: float


class ProfitabilityCompareRequest(ProfitabilityInput):
    pass


class ProfitabilityCompareResponse(BaseModel):
    results: list[ProfitabilityResult]
    best: LogisticsType

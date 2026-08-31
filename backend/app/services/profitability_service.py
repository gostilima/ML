from sqlalchemy.orm import Session

from app.calculations.profitability import calculate_profitability
from app.models.fees import LogisticsType
from app.schemas.profitability import ProfitabilityCompareRequest, ProfitabilityCompareResponse, ProfitabilityResult
from app.services.fee_engine import FeeEngine


class ProfitabilityService:
    def __init__(self, db: Session):
        self.fee_engine = FeeEngine(db)

    def compare(self, organization_id: str, payload: ProfitabilityCompareRequest) -> ProfitabilityCompareResponse:
        results: list[ProfitabilityResult] = []
        for logistics_type in LogisticsType:
            marketplace_fee = self.fee_engine.marketplace_fee(
                organization_id, payload.marketplace, payload.category, payload.selling_price, payload.quantity
            )
            tax = self.fee_engine.tax(
                organization_id,
                payload.marketplace,
                payload.category,
                payload.selling_price,
                payload.quantity,
                payload.tax_percentage,
            )
            logistics_fee = self.fee_engine.logistics_fee(
                organization_id, payload.marketplace, logistics_type, payload.weight, payload.quantity
            )

            breakdown = calculate_profitability(
                selling_price=payload.selling_price,
                quantity=payload.quantity,
                product_cost=payload.product_cost,
                marketplace_fee=marketplace_fee,
                logistics_fee=logistics_fee,
                tax=tax,
                shipping=payload.shipping,
                packaging=payload.packaging,
                other_costs=payload.other_costs,
            )

            results.append(
                ProfitabilityResult(
                    logistics_type=logistics_type,
                    revenue=breakdown.revenue,
                    marketplace_fee=breakdown.marketplace_fee,
                    logistics_fee=breakdown.logistics_fee,
                    tax=breakdown.tax,
                    shipping=breakdown.shipping,
                    packaging=breakdown.packaging,
                    other_costs=breakdown.other_costs,
                    product_cost_total=breakdown.product_cost_total,
                    total_cost=breakdown.total_cost,
                    profit=breakdown.profit,
                    margin=breakdown.margin,
                    roi=breakdown.roi,
                )
            )

        results.sort(key=lambda r: r.profit, reverse=True)
        return ProfitabilityCompareResponse(results=results, best=results[0].logistics_type)

"""FeeEngine: resolves the applicable fee/logistics rate rows from the DB
and hands them to the pure calculations in app.calculations.fees.

Never hardcode marketplace fee percentages here or elsewhere -- always read
from the `fees` / `logistics_rates` tables via this engine.
"""
from typing import Optional

from sqlalchemy.orm import Session

from app.calculations.fees import (
    FeeSchedule,
    LogisticsRateSchedule,
    calculate_logistics_fee,
    calculate_marketplace_fee,
    calculate_tax,
    schedule_matches_weight,
)
from app.models.fees import LogisticsType
from app.repositories.misc_repositories import FeeRepository, LogisticsRateRepository

_DEFAULT_FEE = FeeSchedule(percentage_fee=12.0, fixed_fee=0.0, tax_percentage=0.0)
_DEFAULT_LOGISTICS = {
    LogisticsType.FULL: LogisticsRateSchedule(base_cost=15.0, cost_per_kg=2.0),
    LogisticsType.MERCADO_ENVIOS: LogisticsRateSchedule(base_cost=10.0, cost_per_kg=1.5),
    LogisticsType.OWN_LOGISTICS: LogisticsRateSchedule(base_cost=5.0, cost_per_kg=1.0),
}


class FeeEngine:
    def __init__(self, db: Session):
        self.fee_repo = FeeRepository(db)
        self.logistics_repo = LogisticsRateRepository(db)

    def resolve_fee_schedule(self, organization_id: Optional[str], marketplace: str, category: Optional[str]) -> FeeSchedule:
        row = self.fee_repo.find_best_match(organization_id, marketplace, category)
        if row is None:
            return _DEFAULT_FEE
        return FeeSchedule(
            percentage_fee=row.percentage_fee, fixed_fee=row.fixed_fee, tax_percentage=row.tax_percentage
        )

    def resolve_logistics_schedule(
        self, organization_id: Optional[str], marketplace: str, logistics_type: LogisticsType, weight: Optional[float]
    ) -> LogisticsRateSchedule:
        rows = self.logistics_repo.list_for(organization_id, marketplace, logistics_type)
        for row in rows:
            schedule = LogisticsRateSchedule(
                base_cost=row.base_cost, cost_per_kg=row.cost_per_kg, min_weight=row.min_weight, max_weight=row.max_weight
            )
            if schedule_matches_weight(schedule, weight):
                return schedule
        return _DEFAULT_LOGISTICS[logistics_type]

    def marketplace_fee(self, organization_id, marketplace, category, selling_price, quantity) -> float:
        schedule = self.resolve_fee_schedule(organization_id, marketplace, category)
        return calculate_marketplace_fee(selling_price, quantity, schedule)

    def tax(self, organization_id, marketplace, category, selling_price, quantity, tax_percentage_override=None) -> float:
        schedule = self.resolve_fee_schedule(organization_id, marketplace, category)
        if tax_percentage_override is not None:
            schedule = FeeSchedule(
                percentage_fee=schedule.percentage_fee,
                fixed_fee=schedule.fixed_fee,
                tax_percentage=tax_percentage_override,
            )
        return calculate_tax(selling_price, quantity, schedule)

    def logistics_fee(self, organization_id, marketplace, logistics_type, weight, quantity) -> float:
        schedule = self.resolve_logistics_schedule(organization_id, marketplace, logistics_type, weight)
        return calculate_logistics_fee(weight, quantity, schedule)

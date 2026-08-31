"""Pure fee/logistics calculation helpers.

These operate on plain numbers/dataclasses only (no DB/session access) so
they can be unit tested in isolation. The FeeEngine service (in
app.services) is responsible for reading `fees` / `logistics_rates` rows
from the database and calling into these functions -- percentages are never
hardcoded here or anywhere else in the business logic.
"""
from dataclasses import dataclass
from typing import Optional


@dataclass
class FeeSchedule:
    percentage_fee: float  # e.g. 12.0 means 12%
    fixed_fee: float = 0.0
    tax_percentage: float = 0.0


@dataclass
class LogisticsRateSchedule:
    base_cost: float
    cost_per_kg: float = 0.0
    min_weight: Optional[float] = None
    max_weight: Optional[float] = None


def calculate_marketplace_fee(selling_price: float, quantity: int, schedule: FeeSchedule) -> float:
    """Marketplace commission owed for the whole line (price * quantity)."""
    if selling_price < 0 or quantity < 0:
        raise ValueError("selling_price and quantity must be non-negative")
    revenue = selling_price * quantity
    percentage_amount = revenue * (schedule.percentage_fee / 100.0)
    fixed_amount = schedule.fixed_fee * quantity
    return round(percentage_amount + fixed_amount, 2)


def calculate_tax(selling_price: float, quantity: int, schedule: FeeSchedule) -> float:
    revenue = selling_price * quantity
    return round(revenue * (schedule.tax_percentage / 100.0), 2)


def calculate_logistics_fee(weight: Optional[float], quantity: int, schedule: LogisticsRateSchedule) -> float:
    """Shipping/logistics cost for `quantity` units of the given weight (kg)."""
    if schedule is None:
        return 0.0
    unit_weight = weight or 0.0
    per_unit = schedule.base_cost + (schedule.cost_per_kg * unit_weight)
    return round(per_unit * quantity, 2)


def schedule_matches_weight(schedule: LogisticsRateSchedule, weight: Optional[float]) -> bool:
    w = weight or 0.0
    if schedule.min_weight is not None and w < schedule.min_weight:
        return False
    if schedule.max_weight is not None and w > schedule.max_weight:
        return False
    return True

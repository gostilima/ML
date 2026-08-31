"""Pure profitability calculation.

revenue      = selling_price * quantity
total_cost   = product_cost + marketplace_fee + logistics_fee + tax + shipping
               + packaging + other_costs
profit       = revenue - total_cost
margin (%)   = profit / revenue * 100
roi (%)      = profit / product_cost * 100
"""
from dataclasses import dataclass


@dataclass
class ProfitabilityBreakdown:
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


def calculate_profitability(
    *,
    selling_price: float,
    quantity: int,
    product_cost: float,
    marketplace_fee: float = 0.0,
    logistics_fee: float = 0.0,
    tax: float = 0.0,
    shipping: float = 0.0,
    packaging: float = 0.0,
    other_costs: float = 0.0,
) -> ProfitabilityBreakdown:
    if selling_price < 0 or quantity < 0 or product_cost < 0:
        raise ValueError("selling_price, quantity and product_cost must be non-negative")

    revenue = round(selling_price * quantity, 2)
    product_cost_total = round(product_cost * quantity, 2)

    total_cost = round(
        product_cost_total + marketplace_fee + logistics_fee + tax + shipping + packaging + other_costs,
        2,
    )
    profit = round(revenue - total_cost, 2)
    margin = round((profit / revenue) * 100, 2) if revenue > 0 else 0.0
    roi = round((profit / product_cost_total) * 100, 2) if product_cost_total > 0 else 0.0

    return ProfitabilityBreakdown(
        revenue=revenue,
        marketplace_fee=marketplace_fee,
        logistics_fee=logistics_fee,
        tax=tax,
        shipping=shipping,
        packaging=packaging,
        other_costs=other_costs,
        product_cost_total=product_cost_total,
        total_cost=total_cost,
        profit=profit,
        margin=margin,
        roi=roi,
    )

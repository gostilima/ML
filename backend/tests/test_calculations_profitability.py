import pytest

from app.calculations.profitability import calculate_profitability


def test_calculate_profitability_basic():
    result = calculate_profitability(
        selling_price=100.0,
        quantity=2,
        product_cost=30.0,
        marketplace_fee=20.0,
        logistics_fee=10.0,
        tax=5.0,
        shipping=0.0,
        packaging=2.0,
        other_costs=1.0,
    )
    assert result.revenue == 200.0
    assert result.product_cost_total == 60.0
    # total_cost = 60 + 20 + 10 + 5 + 0 + 2 + 1 = 98
    assert result.total_cost == 98.0
    assert result.profit == 102.0
    assert result.margin == 51.0  # 102/200*100
    assert result.roi == pytest.approx(170.0, rel=1e-6)  # 102/60*100


def test_calculate_profitability_zero_revenue_no_div_by_zero():
    result = calculate_profitability(selling_price=0, quantity=1, product_cost=0)
    assert result.margin == 0.0
    assert result.roi == 0.0


def test_calculate_profitability_rejects_negative_inputs():
    with pytest.raises(ValueError):
        calculate_profitability(selling_price=-5, quantity=1, product_cost=1)

import pytest

from app.calculations.fees import (
    FeeSchedule,
    LogisticsRateSchedule,
    calculate_logistics_fee,
    calculate_marketplace_fee,
    calculate_tax,
    schedule_matches_weight,
)


def test_calculate_marketplace_fee_percentage_and_fixed():
    schedule = FeeSchedule(percentage_fee=12.0, fixed_fee=2.5)
    fee = calculate_marketplace_fee(selling_price=100.0, quantity=2, schedule=schedule)
    # revenue = 200, 12% = 24, fixed = 2.5*2 = 5 -> 29
    assert fee == 29.0


def test_calculate_marketplace_fee_rejects_negative():
    schedule = FeeSchedule(percentage_fee=10.0)
    with pytest.raises(ValueError):
        calculate_marketplace_fee(selling_price=-1, quantity=1, schedule=schedule)


def test_calculate_tax():
    schedule = FeeSchedule(percentage_fee=0, tax_percentage=5.0)
    tax = calculate_tax(selling_price=100.0, quantity=3, schedule=schedule)
    assert tax == 15.0


def test_calculate_logistics_fee():
    schedule = LogisticsRateSchedule(base_cost=10.0, cost_per_kg=2.0)
    fee = calculate_logistics_fee(weight=1.5, quantity=2, schedule=schedule)
    # per unit = 10 + 2*1.5 = 13 -> *2 = 26
    assert fee == 26.0


def test_calculate_logistics_fee_no_schedule():
    assert calculate_logistics_fee(weight=1.0, quantity=1, schedule=None) == 0.0


def test_schedule_matches_weight_bounds():
    schedule = LogisticsRateSchedule(base_cost=1, cost_per_kg=0, min_weight=1.0, max_weight=5.0)
    assert schedule_matches_weight(schedule, 3.0) is True
    assert schedule_matches_weight(schedule, 0.5) is False
    assert schedule_matches_weight(schedule, 5.5) is False

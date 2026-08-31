"""Opportunity Score calculation.

Weighted sum of normalized (0-100) sub-scores:
    Demand 25%, Consistency 20%, Margin 20%, Competition 15%,
    Growth 10%, Logistics 5%, Repurchase 5%
"""
from dataclasses import dataclass

WEIGHTS = {
    "demand": 0.25,
    "consistency": 0.20,
    "margin": 0.20,
    "competition": 0.15,
    "growth": 0.10,
    "logistics": 0.05,
    "repurchase": 0.05,
}

assert abs(sum(WEIGHTS.values()) - 1.0) < 1e-9


@dataclass
class OpportunityScores:
    demand: float
    consistency: float
    margin: float
    competition: float
    growth: float
    logistics: float
    repurchase: float


def _clamp(value: float) -> float:
    return max(0.0, min(100.0, value))


def calculate_opportunity_score(scores: OpportunityScores) -> float:
    total = (
        _clamp(scores.demand) * WEIGHTS["demand"]
        + _clamp(scores.consistency) * WEIGHTS["consistency"]
        + _clamp(scores.margin) * WEIGHTS["margin"]
        + _clamp(scores.competition) * WEIGHTS["competition"]
        + _clamp(scores.growth) * WEIGHTS["growth"]
        + _clamp(scores.logistics) * WEIGHTS["logistics"]
        + _clamp(scores.repurchase) * WEIGHTS["repurchase"]
    )
    return round(total, 2)

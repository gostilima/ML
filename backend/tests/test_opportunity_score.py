from app.calculations.opportunity_score import OpportunityScores, calculate_opportunity_score


def test_calculate_opportunity_score_all_100():
    scores = OpportunityScores(
        demand=100, consistency=100, margin=100, competition=100, growth=100, logistics=100, repurchase=100
    )
    assert calculate_opportunity_score(scores) == 100.0


def test_calculate_opportunity_score_all_zero():
    scores = OpportunityScores(demand=0, consistency=0, margin=0, competition=0, growth=0, logistics=0, repurchase=0)
    assert calculate_opportunity_score(scores) == 0.0


def test_calculate_opportunity_score_weighted():
    # Only demand at 100, everything else 0 -> should equal the demand weight (25%)
    scores = OpportunityScores(demand=100, consistency=0, margin=0, competition=0, growth=0, logistics=0, repurchase=0)
    assert calculate_opportunity_score(scores) == 25.0


def test_calculate_opportunity_score_clamps_out_of_range():
    scores = OpportunityScores(
        demand=150, consistency=-10, margin=100, competition=100, growth=100, logistics=100, repurchase=100
    )
    result = calculate_opportunity_score(scores)
    # demand clamped to 100, consistency clamped to 0
    expected = 100 * 0.25 + 0 * 0.20 + 100 * 0.20 + 100 * 0.15 + 100 * 0.10 + 100 * 0.05 + 100 * 0.05
    assert result == round(expected, 2)

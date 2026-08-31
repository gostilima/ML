from typing import Optional

from fastapi import APIRouter, Depends
from pydantic import BaseModel
from sqlalchemy.orm import Session

from app.calculations.opportunity_score import OpportunityScores
from app.core.db import get_db
from app.core.deps import get_current_org
from app.core.responses import success_envelope
from app.models.organization import Organization
from app.schemas.opportunity import OpportunityOut
from app.services.opportunity_service import OpportunityScoreService

router = APIRouter(prefix="/opportunities", tags=["opportunities"])


class OpportunityScoreRequest(BaseModel):
    product_id: Optional[str] = None
    keyword: Optional[str] = None
    category: Optional[str] = None
    demand: float = 0
    consistency: float = 0
    margin: float = 0
    competition: float = 0
    growth: float = 0
    logistics: float = 0
    repurchase: float = 0


@router.get("")
def list_opportunities(org: Organization = Depends(get_current_org), db: Session = Depends(get_db)):
    service = OpportunityScoreService(db)
    items = [OpportunityOut.model_validate(o) for o in service.list(org.id)]
    return success_envelope(items)


@router.post("/score")
def score_opportunity(
    payload: OpportunityScoreRequest,
    org: Organization = Depends(get_current_org),
    db: Session = Depends(get_db),
):
    """Computes the weighted Opportunity Score
    (Demand25/Consistency20/Margin20/Competition15/Growth10/Logistics5/Repurchase5)
    for the given sub-scores and persists it."""
    service = OpportunityScoreService(db)
    scores = OpportunityScores(
        demand=payload.demand,
        consistency=payload.consistency,
        margin=payload.margin,
        competition=payload.competition,
        growth=payload.growth,
        logistics=payload.logistics,
        repurchase=payload.repurchase,
    )
    opportunity = service.score_and_save(
        org.id, product_id=payload.product_id, keyword=payload.keyword, category=payload.category, scores=scores
    )
    return success_envelope(OpportunityOut.model_validate(opportunity))

from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.calculations.opportunity_score import OpportunityScores
from app.core.db import get_db
from app.core.deps import get_current_org
from app.core.responses import success_envelope
from app.models.organization import Organization
from app.schemas.opportunity import OpportunityOut, OpportunitySearchFilter
from app.services.opportunity_service import OpportunityScoreService

router = APIRouter(prefix="/mining", tags=["mining"])


@router.get("/opportunities")
def list_opportunities(org: Organization = Depends(get_current_org), db: Session = Depends(get_db)):
    service = OpportunityScoreService(db)
    items = [OpportunityOut.model_validate(o) for o in service.list(org.id)]
    return success_envelope(items)


@router.post("/search")
def search_opportunities(
    filters: OpportunitySearchFilter,
    org: Organization = Depends(get_current_org),
    db: Session = Depends(get_db),
):
    """Mines/scores opportunities matching the filter. In this MVP scoring
    inputs are simplified placeholders (real demand/growth/competition
    signals require a completed sync via workers.sync_competitors /
    calculate_sales_estimates); the weighting itself is the real
    OpportunityScoreService formula."""
    service = OpportunityScoreService(db)
    items, total = service.search(org.id, filters)
    return success_envelope(
        {
            "items": [OpportunityOut.model_validate(i) for i in items],
            "page": filters.page,
            "limit": filters.limit,
            "total": total,
        }
    )

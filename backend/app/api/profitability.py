from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.core.db import get_db
from app.core.deps import get_current_org
from app.core.responses import success_envelope
from app.models.organization import Organization
from app.schemas.profitability import ProfitabilityCompareRequest
from app.services.profitability_service import ProfitabilityService

router = APIRouter(prefix="/profitability", tags=["profitability"])


@router.post("/compare")
def compare(
    payload: ProfitabilityCompareRequest,
    org: Organization = Depends(get_current_org),
    db: Session = Depends(get_db),
):
    service = ProfitabilityService(db)
    result = service.compare(org.id, payload)
    return success_envelope(result)

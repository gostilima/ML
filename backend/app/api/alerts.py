from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.core.db import get_db
from app.core.deps import get_current_org
from app.core.responses import success_envelope
from app.models.organization import Organization
from app.schemas.alert import AlertOut
from app.services.alert_service import AlertService

router = APIRouter(prefix="/alerts", tags=["alerts"])


@router.get("")
def list_alerts(org: Organization = Depends(get_current_org), db: Session = Depends(get_db)):
    service = AlertService(db)
    items = [AlertOut.model_validate(a) for a in service.list(org.id)]
    return success_envelope(items)

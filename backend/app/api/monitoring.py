from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.core.db import get_db
from app.core.deps import get_current_org
from app.core.responses import success_envelope
from app.models.organization import Organization
from app.schemas.monitoring import MonitoredProductCreate, MonitoredProductOut, MonitoredProductUpdate
from app.services.monitoring_service import MonitoringService

router = APIRouter(prefix="/monitoring", tags=["monitoring"])


@router.get("")
def list_monitored(org: Organization = Depends(get_current_org), db: Session = Depends(get_db)):
    service = MonitoringService(db)
    items = [MonitoredProductOut.model_validate(m) for m in service.list(org.id)]
    return success_envelope(items)


@router.post("")
def create_monitored(
    payload: MonitoredProductCreate, org: Organization = Depends(get_current_org), db: Session = Depends(get_db)
):
    service = MonitoringService(db)
    obj = service.create(org.id, payload.model_dump())
    return success_envelope(MonitoredProductOut.model_validate(obj))


@router.get("/{id}")
def get_monitored(id: str, org: Organization = Depends(get_current_org), db: Session = Depends(get_db)):
    service = MonitoringService(db)
    obj = service.get(org.id, id)
    return success_envelope(MonitoredProductOut.model_validate(obj))


@router.put("/{id}")
def update_monitored(
    id: str,
    payload: MonitoredProductUpdate,
    org: Organization = Depends(get_current_org),
    db: Session = Depends(get_db),
):
    service = MonitoringService(db)
    obj = service.update(org.id, id, payload.model_dump(exclude_unset=True))
    return success_envelope(MonitoredProductOut.model_validate(obj))


@router.delete("/{id}")
def delete_monitored(id: str, org: Organization = Depends(get_current_org), db: Session = Depends(get_db)):
    service = MonitoringService(db)
    service.delete(org.id, id)
    return success_envelope({"message": "Monitored product removed."})

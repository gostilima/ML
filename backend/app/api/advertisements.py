from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.core.db import get_db
from app.core.deps import get_current_org
from app.core.responses import success_envelope
from app.models.organization import Organization
from app.schemas.advertisement import (
    AdvertisementCreate,
    AdvertisementOut,
    AdvertisementUpdate,
    AdvertisementVersionOut,
    AIGenerateRequest,
    AIOptimizeRequest,
)
from app.services.advertisement_service import AdvertisementService

router = APIRouter(prefix="/advertisements", tags=["advertisements"])


@router.get("")
def list_advertisements(org: Organization = Depends(get_current_org), db: Session = Depends(get_db)):
    service = AdvertisementService(db)
    items = [AdvertisementOut.model_validate(a) for a in service.list(org.id)]
    return success_envelope(items)


@router.post("")
def create_advertisement(
    payload: AdvertisementCreate, org: Organization = Depends(get_current_org), db: Session = Depends(get_db)
):
    service = AdvertisementService(db)
    obj = service.create(org.id, payload.model_dump())
    return success_envelope(AdvertisementOut.model_validate(obj))


@router.get("/{id}")
def get_advertisement(id: str, org: Organization = Depends(get_current_org), db: Session = Depends(get_db)):
    service = AdvertisementService(db)
    obj = service.get(org.id, id)
    return success_envelope(AdvertisementOut.model_validate(obj))


@router.put("/{id}")
def update_advertisement(
    id: str,
    payload: AdvertisementUpdate,
    org: Organization = Depends(get_current_org),
    db: Session = Depends(get_db),
):
    service = AdvertisementService(db)
    obj = service.update(org.id, id, payload.model_dump(exclude_unset=True))
    return success_envelope(AdvertisementOut.model_validate(obj))


@router.delete("/{id}")
def delete_advertisement(id: str, org: Organization = Depends(get_current_org), db: Session = Depends(get_db)):
    service = AdvertisementService(db)
    service.delete(org.id, id)
    return success_envelope({"message": "Advertisement deleted."})


@router.post("/{id}/ai/generate")
async def ai_generate(
    id: str,
    payload: AIGenerateRequest,
    org: Organization = Depends(get_current_org),
    db: Session = Depends(get_db),
):
    service = AdvertisementService(db)
    version = await service.generate(org.id, id, payload.product_name, payload.category, payload.key_features)
    return success_envelope(AdvertisementVersionOut.model_validate(version))


@router.post("/{id}/ai/optimize")
async def ai_optimize(
    id: str,
    payload: AIOptimizeRequest,
    org: Organization = Depends(get_current_org),
    db: Session = Depends(get_db),
):
    service = AdvertisementService(db)
    version = await service.optimize(org.id, id, payload.current_title, payload.current_description)
    return success_envelope(AdvertisementVersionOut.model_validate(version))

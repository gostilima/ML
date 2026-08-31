from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.core.db import get_db
from app.core.deps import get_current_org
from app.core.responses import success_envelope
from app.models.organization import Organization
from app.schemas.competitor import CompetitorOut
from app.services.competitor_service import CompetitorService
from app.services.product_service import ProductService

router = APIRouter(prefix="/products", tags=["competitors"])


@router.get("/{product_id}/competitors")
def list_competitors(product_id: str, org: Organization = Depends(get_current_org), db: Session = Depends(get_db)):
    ProductService(db).get(org.id, product_id)  # 404s if not owned by org
    service = CompetitorService(db)
    items = [CompetitorOut.model_validate(c) for c in service.list(org.id, product_id)]
    return success_envelope(items)


@router.post("/{product_id}/competitors/sync")
async def sync_competitors(
    product_id: str,
    query: str = "",
    org: Organization = Depends(get_current_org),
    db: Session = Depends(get_db),
):
    product = ProductService(db).get(org.id, product_id)
    service = CompetitorService(db)
    search_query = query or product.name
    items = await service.sync(org.id, product_id, search_query)
    return success_envelope([CompetitorOut.model_validate(c) for c in items])

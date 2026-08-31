from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.core.db import get_db
from app.core.deps import get_current_org
from app.core.pagination import PaginationParams, paginate_list
from app.core.responses import success_envelope
from app.models.organization import Organization
from app.schemas.product import ProductCreate, ProductOut, ProductUpdate
from app.services.product_service import ProductService

router = APIRouter(prefix="/products", tags=["products"])


@router.get("")
def list_products(
    page: int = 1,
    limit: int = 20,
    org: Organization = Depends(get_current_org),
    db: Session = Depends(get_db),
):
    service = ProductService(db)
    items = [ProductOut.model_validate(p) for p in service.list(org.id)]
    page_result = paginate_list(items, PaginationParams(page=page, limit=limit))
    return success_envelope(page_result)


@router.post("")
def create_product(payload: ProductCreate, org: Organization = Depends(get_current_org), db: Session = Depends(get_db)):
    service = ProductService(db)
    product = service.create(org.id, payload.model_dump())
    return success_envelope(ProductOut.model_validate(product))


@router.get("/{product_id}")
def get_product(product_id: str, org: Organization = Depends(get_current_org), db: Session = Depends(get_db)):
    service = ProductService(db)
    product = service.get(org.id, product_id)
    return success_envelope(ProductOut.model_validate(product))


@router.put("/{product_id}")
def update_product(
    product_id: str,
    payload: ProductUpdate,
    org: Organization = Depends(get_current_org),
    db: Session = Depends(get_db),
):
    service = ProductService(db)
    product = service.update(org.id, product_id, payload.model_dump(exclude_unset=True))
    return success_envelope(ProductOut.model_validate(product))


@router.delete("/{product_id}")
def delete_product(product_id: str, org: Organization = Depends(get_current_org), db: Session = Depends(get_db)):
    service = ProductService(db)
    service.delete(org.id, product_id)
    return success_envelope({"message": "Product deleted."})

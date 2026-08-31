from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.core.db import get_db
from app.core.deps import get_current_org
from app.core.pagination import PaginationParams, paginate_list
from app.core.responses import success_envelope
from app.models.organization import Organization
from app.schemas.supplier import (
    SupplierCreate,
    SupplierOut,
    SupplierProductCreate,
    SupplierProductOut,
    SupplierProductUpdate,
    SupplierUpdate,
)
from app.services.supplier_service import SupplierService

router = APIRouter(prefix="/suppliers", tags=["suppliers"])


@router.get("")
def list_suppliers(page: int = 1, limit: int = 20, org: Organization = Depends(get_current_org), db: Session = Depends(get_db)):
    service = SupplierService(db)
    items = [SupplierOut.model_validate(s) for s in service.list(org.id)]
    return success_envelope(paginate_list(items, PaginationParams(page=page, limit=limit)))


@router.post("")
def create_supplier(payload: SupplierCreate, org: Organization = Depends(get_current_org), db: Session = Depends(get_db)):
    service = SupplierService(db)
    supplier = service.create(org.id, payload.model_dump())
    return success_envelope(SupplierOut.model_validate(supplier))


@router.get("/{supplier_id}")
def get_supplier(supplier_id: str, org: Organization = Depends(get_current_org), db: Session = Depends(get_db)):
    service = SupplierService(db)
    supplier = service.get(org.id, supplier_id)
    return success_envelope(SupplierOut.model_validate(supplier))


@router.put("/{supplier_id}")
def update_supplier(
    supplier_id: str, payload: SupplierUpdate, org: Organization = Depends(get_current_org), db: Session = Depends(get_db)
):
    service = SupplierService(db)
    supplier = service.update(org.id, supplier_id, payload.model_dump(exclude_unset=True))
    return success_envelope(SupplierOut.model_validate(supplier))


@router.delete("/{supplier_id}")
def delete_supplier(supplier_id: str, org: Organization = Depends(get_current_org), db: Session = Depends(get_db)):
    service = SupplierService(db)
    service.delete(org.id, supplier_id)
    return success_envelope({"message": "Supplier deleted."})


@router.get("/{supplier_id}/products")
def list_supplier_products(supplier_id: str, org: Organization = Depends(get_current_org), db: Session = Depends(get_db)):
    service = SupplierService(db)
    items = [SupplierProductOut.model_validate(p) for p in service.list_products(org.id, supplier_id)]
    return success_envelope(items)


@router.post("/{supplier_id}/products")
def create_supplier_product(
    supplier_id: str,
    payload: SupplierProductCreate,
    org: Organization = Depends(get_current_org),
    db: Session = Depends(get_db),
):
    service = SupplierService(db)
    product = service.create_product(org.id, supplier_id, payload.model_dump())
    return success_envelope(SupplierProductOut.model_validate(product))


@router.put("/{supplier_id}/products/{product_id}")
def update_supplier_product(
    supplier_id: str,
    product_id: str,
    payload: SupplierProductUpdate,
    org: Organization = Depends(get_current_org),
    db: Session = Depends(get_db),
):
    service = SupplierService(db)
    product = service.update_product(org.id, supplier_id, product_id, payload.model_dump(exclude_unset=True))
    return success_envelope(SupplierProductOut.model_validate(product))


@router.delete("/{supplier_id}/products/{product_id}")
def delete_supplier_product(
    supplier_id: str, product_id: str, org: Organization = Depends(get_current_org), db: Session = Depends(get_db)
):
    service = SupplierService(db)
    service.delete_product(org.id, supplier_id, product_id)
    return success_envelope({"message": "Supplier product deleted."})

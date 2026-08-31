from sqlalchemy.orm import Session

from app.core.responses import AppError
from app.models.supplier import Supplier, SupplierProduct
from app.repositories.supplier_repository import SupplierProductRepository, SupplierRepository


class SupplierService:
    def __init__(self, db: Session):
        self.repo = SupplierRepository(db)
        self.product_repo = SupplierProductRepository(db)

    def list(self, organization_id: str):
        return self.repo.list(organization_id)

    def get(self, organization_id: str, supplier_id: str) -> Supplier:
        supplier = self.repo.get(organization_id, supplier_id)
        if supplier is None:
            raise AppError(404, "NOT_FOUND", "Supplier not found.")
        return supplier

    def create(self, organization_id: str, data: dict) -> Supplier:
        supplier = Supplier(organization_id=organization_id, **data)
        return self.repo.create(supplier)

    def update(self, organization_id: str, supplier_id: str, data: dict) -> Supplier:
        supplier = self.get(organization_id, supplier_id)
        return self.repo.update(supplier, **data)

    def delete(self, organization_id: str, supplier_id: str) -> None:
        supplier = self.get(organization_id, supplier_id)
        self.repo.delete(supplier)

    # -- supplier products ---------------------------------------------------
    def list_products(self, organization_id: str, supplier_id: str):
        self.get(organization_id, supplier_id)  # ensures org ownership
        return self.product_repo.list(organization_id, supplier_id=supplier_id)

    def get_product(self, organization_id: str, supplier_id: str, product_id: str) -> SupplierProduct:
        self.get(organization_id, supplier_id)
        product = self.product_repo.get(organization_id, product_id)
        if product is None or product.supplier_id != supplier_id:
            raise AppError(404, "NOT_FOUND", "Supplier product not found.")
        return product

    def create_product(self, organization_id: str, supplier_id: str, data: dict) -> SupplierProduct:
        self.get(organization_id, supplier_id)
        product = SupplierProduct(organization_id=organization_id, supplier_id=supplier_id, **data)
        return self.product_repo.create(product)

    def update_product(self, organization_id: str, supplier_id: str, product_id: str, data: dict) -> SupplierProduct:
        product = self.get_product(organization_id, supplier_id, product_id)
        return self.product_repo.update(product, **data)

    def delete_product(self, organization_id: str, supplier_id: str, product_id: str) -> None:
        product = self.get_product(organization_id, supplier_id, product_id)
        self.product_repo.delete(product)

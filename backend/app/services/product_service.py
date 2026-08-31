from sqlalchemy.orm import Session

from app.core.responses import AppError
from app.models.product import Product
from app.repositories.product_repository import ProductRepository


class ProductService:
    def __init__(self, db: Session):
        self.repo = ProductRepository(db)

    def list(self, organization_id: str):
        return self.repo.list(organization_id)

    def get(self, organization_id: str, product_id: str) -> Product:
        product = self.repo.get(organization_id, product_id)
        if product is None:
            raise AppError(404, "NOT_FOUND", "Product not found.")
        return product

    def create(self, organization_id: str, data: dict) -> Product:
        product = Product(organization_id=organization_id, **data)
        return self.repo.create(product)

    def update(self, organization_id: str, product_id: str, data: dict) -> Product:
        product = self.get(organization_id, product_id)
        return self.repo.update(product, **data)

    def delete(self, organization_id: str, product_id: str) -> None:
        product = self.get(organization_id, product_id)
        self.repo.delete(product)

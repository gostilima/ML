from sqlalchemy.orm import Session

from app.core.responses import AppError
from app.models.monitoring import MonitoredProduct
from app.repositories.misc_repositories import MonitoredProductRepository


class MonitoringService:
    def __init__(self, db: Session):
        self.repo = MonitoredProductRepository(db)

    def list(self, organization_id: str):
        return self.repo.list(organization_id)

    def get(self, organization_id: str, id_: str) -> MonitoredProduct:
        obj = self.repo.get(organization_id, id_)
        if obj is None:
            raise AppError(404, "NOT_FOUND", "Monitored product not found.")
        return obj

    def create(self, organization_id: str, data: dict) -> MonitoredProduct:
        obj = MonitoredProduct(organization_id=organization_id, **data)
        return self.repo.create(obj)

    def update(self, organization_id: str, id_: str, data: dict) -> MonitoredProduct:
        obj = self.get(organization_id, id_)
        return self.repo.update(obj, **data)

    def delete(self, organization_id: str, id_: str) -> None:
        obj = self.get(organization_id, id_)
        self.repo.delete(obj)

from sqlalchemy.orm import Session

from app.repositories.misc_repositories import AlertRepository


class AlertService:
    def __init__(self, db: Session):
        self.repo = AlertRepository(db)

    def list(self, organization_id: str):
        return self.repo.list(organization_id)

from typing import Optional

from sqlalchemy import select
from sqlalchemy.orm import Session

from app.models.api_credential import ApiCredential, MarketplaceEnum


class ApiCredentialRepository:
    def __init__(self, db: Session):
        self.db = db

    def get_for_org(
        self, organization_id: str, marketplace: MarketplaceEnum = MarketplaceEnum.MERCADO_LIVRE
    ) -> Optional[ApiCredential]:
        stmt = select(ApiCredential).where(
            ApiCredential.organization_id == organization_id, ApiCredential.marketplace == marketplace
        )
        return self.db.execute(stmt).scalars().first()

    def create(self, credential: ApiCredential) -> ApiCredential:
        self.db.add(credential)
        self.db.commit()
        self.db.refresh(credential)
        return credential

    def save(self, credential: ApiCredential) -> ApiCredential:
        self.db.add(credential)
        self.db.commit()
        self.db.refresh(credential)
        return credential

    def delete(self, credential: ApiCredential) -> None:
        self.db.delete(credential)
        self.db.commit()

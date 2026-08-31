from sqlalchemy.orm import Session

from app.core.responses import AppError
from app.models.advertisement import Advertisement, AdvertisementVersion
from app.repositories.misc_repositories import AdvertisementRepository
from app.services.ai_provider import get_ai_provider


class AdvertisementService:
    def __init__(self, db: Session):
        self.db = db
        self.repo = AdvertisementRepository(db)
        self.ai = get_ai_provider()

    def list(self, organization_id: str):
        return self.repo.list(organization_id)

    def get(self, organization_id: str, id_: str) -> Advertisement:
        obj = self.repo.get(organization_id, id_)
        if obj is None:
            raise AppError(404, "NOT_FOUND", "Advertisement not found.")
        return obj

    def create(self, organization_id: str, data: dict) -> Advertisement:
        obj = Advertisement(organization_id=organization_id, **data)
        return self.repo.create(obj)

    def update(self, organization_id: str, id_: str, data: dict) -> Advertisement:
        obj = self.get(organization_id, id_)
        return self.repo.update(obj, **data)

    def delete(self, organization_id: str, id_: str) -> None:
        obj = self.get(organization_id, id_)
        self.repo.delete(obj)

    async def generate(self, organization_id: str, id_: str, product_name: str, category, key_features):
        advertisement = self.get(organization_id, id_)
        title, description = await self.ai.generate_listing_copy(
            product_name=product_name, category=category, key_features=key_features
        )
        return self._add_version(advertisement, title, description)

    async def optimize(self, organization_id: str, id_: str, current_title: str, current_description):
        advertisement = self.get(organization_id, id_)
        title, description = await self.ai.optimize_listing_copy(
            current_title=current_title, current_description=current_description
        )
        return self._add_version(advertisement, title, description)

    def _add_version(self, advertisement: Advertisement, title: str, description: str) -> AdvertisementVersion:
        next_version = len(advertisement.versions) + 1
        version = AdvertisementVersion(
            advertisement_id=advertisement.id,
            version_number=next_version,
            title=title,
            description=description,
            generated_by_ai=True,
        )
        self.db.add(version)
        advertisement.title = title
        self.db.commit()
        self.db.refresh(version)
        return version

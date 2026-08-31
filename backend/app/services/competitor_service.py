from sqlalchemy.orm import Session

from app.integrations.factory import get_mercado_livre_provider
from app.models.competitor import Competitor
from app.repositories.misc_repositories import CompetitorRepository


class CompetitorService:
    def __init__(self, db: Session):
        self.repo = CompetitorRepository(db)

    def list(self, organization_id: str, product_id: str):
        return self.repo.list(organization_id, product_id=product_id)

    async def sync(self, organization_id: str, product_id: str, query: str, access_token: str | None = None):
        provider = get_mercado_livre_provider(access_token)
        results = await provider.get_products(query=query)
        created = []
        for item in results:
            competitor = Competitor(
                organization_id=organization_id,
                product_id=product_id,
                marketplace="MERCADO_LIVRE",
                external_id=item.get("id"),
                title=item.get("title"),
                price=item.get("price"),
                sold_quantity=item.get("sold_quantity"),
            )
            created.append(self.repo.create(competitor))
        return created

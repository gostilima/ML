from app.integrations.mercado_livre.base_client import MercadoLivreApiClient


class FeesService:
    """Fetches ML's official listing/sale fees for a category (used to seed
    the `fees` table -- runtime profitability math always reads from the DB,
    never calls out to ML directly)."""

    def __init__(self, client: MercadoLivreApiClient):
        self.client = client

    async def get_listing_prices(self, site_id: str, price: float, category_id: str) -> dict:
        return await self.client.get(
            f"/sites/{site_id}/listing_prices",
            params={"price": price, "category_id": category_id},
        )

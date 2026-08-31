from app.integrations.mercado_livre.base_client import MercadoLivreApiClient


class CatalogService:
    """Wraps ML product/item catalog endpoints."""

    def __init__(self, client: MercadoLivreApiClient):
        self.client = client

    async def search_products(self, site_id: str, query: str) -> list[dict]:
        data = await self.client.get(f"/sites/{site_id}/search", params={"q": query})
        return data.get("results", [])

    async def get_item(self, item_id: str) -> dict:
        return await self.client.get(f"/items/{item_id}")

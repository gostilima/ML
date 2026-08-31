from app.integrations.mercado_livre.base_client import MercadoLivreApiClient


class ListingsService:
    def __init__(self, client: MercadoLivreApiClient):
        self.client = client

    async def list_user_items(self, user_id: str) -> list[str]:
        data = await self.client.get(f"/users/{user_id}/items/search")
        return data.get("results", [])

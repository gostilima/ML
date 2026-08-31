from app.integrations.mercado_livre.base_client import MercadoLivreApiClient


class PricingService:
    def __init__(self, client: MercadoLivreApiClient):
        self.client = client

    async def get_item_price(self, item_id: str) -> dict:
        item = await self.client.get(f"/items/{item_id}")
        return {"item_id": item_id, "price": item.get("price"), "currency_id": item.get("currency_id")}

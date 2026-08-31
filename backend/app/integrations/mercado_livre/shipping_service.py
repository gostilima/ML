from app.integrations.mercado_livre.base_client import MercadoLivreApiClient


class ShippingService:
    def __init__(self, client: MercadoLivreApiClient):
        self.client = client

    async def get_shipping_options(self, item_id: str) -> dict:
        return await self.client.get(f"/items/{item_id}/shipping_options")

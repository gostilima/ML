from app.integrations.mercado_livre.base_client import MercadoLivreApiClient


class OrdersService:
    def __init__(self, client: MercadoLivreApiClient):
        self.client = client

    async def list_orders(self, seller_id: str, since: str | None = None) -> list[dict]:
        params = {"seller": seller_id}
        if since:
            params["order.date_created.from"] = since
        data = await self.client.get("/orders/search", params=params)
        return data.get("results", [])

"""MercadoLivreProvider: implements the generic MarketplaceProvider ABC on
top of the individual ML services."""
from typing import Any, Optional

from app.integrations.base_provider import MarketplaceProvider
from app.integrations.mercado_livre.base_client import MercadoLivreApiClient
from app.integrations.mercado_livre.catalog_service import CatalogService
from app.integrations.mercado_livre.fees_service import FeesService
from app.integrations.mercado_livre.orders_service import OrdersService
from app.integrations.mercado_livre.pricing_service import PricingService


class MercadoLivreProvider(MarketplaceProvider):
    marketplace = "MERCADO_LIVRE"

    def __init__(self, access_token: Optional[str] = None, site_id: str = "MLB"):
        self.site_id = site_id
        self.client = MercadoLivreApiClient(access_token=access_token)
        self.catalog = CatalogService(self.client)
        self.pricing = PricingService(self.client)
        self.orders = OrdersService(self.client)
        self.fees = FeesService(self.client)

    async def get_products(self, *, query: Optional[str] = None, **kwargs: Any) -> list[dict]:
        return await self.catalog.search_products(self.site_id, query or "")

    async def get_prices(self, *, item_ids: list[str], **kwargs: Any) -> list[dict]:
        return [await self.pricing.get_item_price(item_id) for item_id in item_ids]

    async def get_orders(self, *, since: Optional[str] = None, **kwargs: Any) -> list[dict]:
        seller_id = kwargs.get("seller_id")
        if not seller_id:
            return []
        return await self.orders.list_orders(seller_id, since=since)

    async def get_fees(self, *, category: Optional[str] = None, **kwargs: Any) -> list[dict]:
        price = kwargs.get("price", 0)
        if not category:
            return []
        result = await self.fees.get_listing_prices(self.site_id, price, category)
        return [result] if result else []

"""In-memory mock implementation of MarketplaceProvider.

Used only when settings.ENV == "development" and the organization has not
configured (or connected) real Mercado Livre credentials, so the rest of the
app has realistic-looking data to work against without hitting the network.
"""
from typing import Any, Optional

from app.integrations.base_provider import MarketplaceProvider


class MockMercadoLivreProvider(MarketplaceProvider):
    marketplace = "MERCADO_LIVRE"

    async def get_products(self, *, query: Optional[str] = None, **kwargs: Any) -> list[dict]:
        return [
            {
                "id": "MLB1234567890",
                "title": f"Mock Product for '{query or 'general'}'",
                "price": 149.90,
                "sold_quantity": 320,
                "available_quantity": 50,
                "category_id": "MLB1000",
            },
            {
                "id": "MLB1234567891",
                "title": f"Mock Competitor Product for '{query or 'general'}'",
                "price": 139.90,
                "sold_quantity": 210,
                "available_quantity": 12,
                "category_id": "MLB1000",
            },
        ]

    async def get_prices(self, *, item_ids: list[str], **kwargs: Any) -> list[dict]:
        return [{"item_id": item_id, "price": 149.90, "currency_id": "BRL"} for item_id in item_ids]

    async def get_orders(self, *, since: Optional[str] = None, **kwargs: Any) -> list[dict]:
        return [
            {"id": "MOCK-ORDER-1", "status": "paid", "total_amount": 149.90, "date_created": since or "2026-01-01"}
        ]

    async def get_fees(self, *, category: Optional[str] = None, **kwargs: Any) -> list[dict]:
        return [{"category": category or "MLB1000", "sale_fee_percent": 13.0, "listing_fee": 0.0}]

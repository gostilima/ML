"""Generic marketplace provider interface.

Every marketplace integration (Mercado Livre today, Amazon/Shopee/TikTok
Shop/Magalu tomorrow) implements this ABC so the rest of the app (services,
workers) never needs to branch on marketplace-specific logic.
"""
from abc import ABC, abstractmethod
from typing import Any


class MarketplaceProvider(ABC):
    """Abstract base for a marketplace data provider."""

    marketplace: str

    @abstractmethod
    async def get_products(self, *, query: str | None = None, **kwargs: Any) -> list[dict]:
        ...

    @abstractmethod
    async def get_prices(self, *, item_ids: list[str], **kwargs: Any) -> list[dict]:
        ...

    @abstractmethod
    async def get_orders(self, *, since: str | None = None, **kwargs: Any) -> list[dict]:
        ...

    @abstractmethod
    async def get_fees(self, *, category: str | None = None, **kwargs: Any) -> list[dict]:
        ...

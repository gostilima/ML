"""Resolves the right MarketplaceProvider implementation for an org."""
from typing import Optional

from app.core.config import settings
from app.integrations.base_provider import MarketplaceProvider
from app.integrations.mercado_livre.mock_provider import MockMercadoLivreProvider
from app.integrations.mercado_livre.provider import MercadoLivreProvider


def get_mercado_livre_provider(access_token: Optional[str] = None) -> MarketplaceProvider:
    if access_token:
        return MercadoLivreProvider(access_token=access_token)
    if settings.ENV == "development":
        return MockMercadoLivreProvider()
    return MercadoLivreProvider(access_token=None)

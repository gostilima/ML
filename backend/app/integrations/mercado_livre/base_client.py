"""Shared authenticated HTTP helper for the ML REST API (non-OAuth
endpoints): catalog, pricing, orders, listings, shipping, fees, users.
"""
from typing import Any, Optional

import httpx

from app.core.config import settings
from app.integrations.mercado_livre.exceptions import NetworkError


class MercadoLivreApiClient:
    def __init__(self, access_token: Optional[str] = None, timeout: float = 15.0):
        self.access_token = access_token
        self.timeout = timeout
        self.base_url = settings.MELI_API_BASE_URL

    async def get(self, path: str, params: Optional[dict] = None) -> Any:
        headers = {}
        if self.access_token:
            headers["Authorization"] = f"Bearer {self.access_token}"
        try:
            async with httpx.AsyncClient(timeout=self.timeout) as client:
                response = await client.get(f"{self.base_url}{path}", params=params, headers=headers)
        except httpx.RequestError as exc:
            raise NetworkError(f"Could not reach Mercado Livre: {exc.__class__.__name__}") from exc
        response.raise_for_status()
        return response.json()

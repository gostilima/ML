"""Low-level Mercado Livre OAuth2 HTTP client.

Wraps httpx.AsyncClient calls to ML's OAuth endpoints. Never logs
client_secret/access_token/refresh_token values.
"""
from dataclasses import dataclass
from typing import Optional
from urllib.parse import urlencode

import httpx

from app.core.config import settings
from app.integrations.mercado_livre.exceptions import (
    ExpiredAuthorizationCodeError,
    InvalidCredentialsError,
    NetworkError,
    TokenRefreshError,
)


@dataclass
class TokenResponse:
    access_token: str
    token_type: str
    expires_in: int
    refresh_token: Optional[str]
    user_id: Optional[str]
    scope: Optional[str] = None


def build_authorize_url(*, client_id: str, redirect_uri: str, state: str) -> str:
    params = {
        "response_type": "code",
        "client_id": client_id,
        "redirect_uri": redirect_uri,
        "state": state,
    }
    return f"{settings.MELI_AUTH_BASE_URL}/authorization?{urlencode(params)}"


class MercadoLivreOAuthClient:
    """Thin async wrapper over Mercado Livre's `/oauth/token` endpoint."""

    def __init__(self, base_url: Optional[str] = None, timeout: float = 15.0):
        self.base_url = base_url or settings.MELI_API_BASE_URL
        self.timeout = timeout

    async def exchange_code_for_token(
        self, *, client_id: str, client_secret: str, code: str, redirect_uri: str
    ) -> TokenResponse:
        data = {
            "grant_type": "authorization_code",
            "client_id": client_id,
            "client_secret": client_secret,
            "code": code,
            "redirect_uri": redirect_uri,
        }
        return await self._request_token(data)

    async def refresh_access_token(
        self, *, client_id: str, client_secret: str, refresh_token: str
    ) -> TokenResponse:
        data = {
            "grant_type": "refresh_token",
            "client_id": client_id,
            "client_secret": client_secret,
            "refresh_token": refresh_token,
        }
        try:
            return await self._request_token(data)
        except (InvalidCredentialsError, ExpiredAuthorizationCodeError) as exc:
            raise TokenRefreshError(str(exc)) from exc

    async def _request_token(self, data: dict) -> TokenResponse:
        url = f"{self.base_url}/oauth/token"
        headers = {"accept": "application/json", "content-type": "application/x-www-form-urlencoded"}
        try:
            async with httpx.AsyncClient(timeout=self.timeout) as client:
                response = await client.post(url, data=data, headers=headers)
        except httpx.RequestError as exc:
            raise NetworkError(f"Could not reach Mercado Livre: {exc.__class__.__name__}") from exc

        if response.status_code == 200:
            payload = response.json()
            return TokenResponse(
                access_token=payload["access_token"],
                token_type=payload.get("token_type", "bearer"),
                expires_in=payload.get("expires_in", 21600),
                refresh_token=payload.get("refresh_token"),
                user_id=str(payload["user_id"]) if payload.get("user_id") is not None else None,
                scope=payload.get("scope"),
            )

        self._raise_for_error(response)

    @staticmethod
    def _raise_for_error(response: httpx.Response):
        try:
            body = response.json()
        except Exception:
            body = {}
        error = body.get("error", "")
        message = body.get("message", response.text)

        if response.status_code in (400, 401):
            if error in ("invalid_client", "invalid_grant") and "code" in message.lower():
                raise ExpiredAuthorizationCodeError(message)
            if error == "invalid_client":
                raise InvalidCredentialsError(message)
            raise ExpiredAuthorizationCodeError(message)
        if response.status_code >= 500:
            raise NetworkError(f"Mercado Livre returned {response.status_code}: {message}")
        raise MercadoLivreClientError(message)


class MercadoLivreClientError(Exception):
    pass

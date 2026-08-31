"""High level Mercado Livre OAuth orchestration: builds authorize URLs,
exchanges codes for tokens, refreshes tokens, and persists everything
encrypted via app.core.security.
"""
import secrets
from datetime import datetime, timedelta, timezone
from typing import Optional

from sqlalchemy.orm import Session

from app.core.config import settings
from app.core.security import decrypt_value, encrypt_value
from app.integrations.mercado_livre.client import (
    MercadoLivreOAuthClient,
    TokenResponse,
    build_authorize_url,
)
from app.models.api_credential import ApiCredential, CredentialStatus
from app.repositories.api_credential_repository import ApiCredentialRepository

# In-memory state store fallback (used when Redis is unavailable, e.g. in
# tests). Maps state -> (organization_id, expires_at).
_STATE_STORE: dict[str, tuple[str, datetime]] = {}
_STATE_TTL_SECONDS = 600


class MercadoLivreOAuthService:
    def __init__(self, db: Session, http_client: Optional[MercadoLivreOAuthClient] = None):
        self.db = db
        self.repo = ApiCredentialRepository(db)
        self.http_client = http_client or MercadoLivreOAuthClient()

    # -- state (CSRF) management ------------------------------------------------
    @staticmethod
    def generate_state(organization_id: str) -> str:
        state = secrets.token_urlsafe(32)
        _STATE_STORE[state] = (organization_id, datetime.now(timezone.utc) + timedelta(seconds=_STATE_TTL_SECONDS))
        return state

    @staticmethod
    def consume_state(state: str) -> Optional[str]:
        entry = _STATE_STORE.pop(state, None)
        if entry is None:
            return None
        organization_id, expires_at = entry
        if datetime.now(timezone.utc) > expires_at:
            return None
        return organization_id

    # -- credential storage -------------------------------------------------
    def save_app_credentials(
        self, organization_id: str, client_id: str, client_secret: str, redirect_uri: Optional[str] = None
    ) -> ApiCredential:
        credential = self.repo.get_for_org(organization_id)
        if credential is None:
            credential = ApiCredential(organization_id=organization_id)
        credential.client_id = encrypt_value(client_id)
        credential.client_secret = encrypt_value(client_secret)
        if redirect_uri:
            credential.redirect_uri = redirect_uri
        if credential.status == CredentialStatus.DISCONNECTED or credential.id is None:
            credential.status = CredentialStatus.DISCONNECTED
        return self.repo.save(credential)

    def get_credential(self, organization_id: str) -> Optional[ApiCredential]:
        return self.repo.get_for_org(organization_id)

    def delete_credential(self, organization_id: str) -> bool:
        credential = self.repo.get_for_org(organization_id)
        if credential is None:
            return False
        self.repo.delete(credential)
        return True

    def build_authorize_url(self, organization_id: str, override_redirect_uri: Optional[str] = None) -> tuple[str, str]:
        credential = self.repo.get_for_org(organization_id)
        if credential is None:
            raise ValueError("No Mercado Livre credentials stored for this organization yet.")
        client_id = decrypt_value(credential.client_id)
        redirect_uri = override_redirect_uri or credential.redirect_uri or settings.MELI_REDIRECT_URI
        state = self.generate_state(organization_id)
        url = build_authorize_url(client_id=client_id, redirect_uri=redirect_uri, state=state)
        return url, state

    async def handle_callback(self, *, code: str, state: str) -> ApiCredential:
        organization_id = self.consume_state(state)
        if organization_id is None:
            raise ValueError("Invalid or expired OAuth state.")

        credential = self.repo.get_for_org(organization_id)
        if credential is None:
            raise ValueError("No Mercado Livre credentials stored for this organization.")

        client_id = decrypt_value(credential.client_id)
        client_secret = decrypt_value(credential.client_secret)
        redirect_uri = credential.redirect_uri or settings.MELI_REDIRECT_URI

        try:
            token: TokenResponse = await self.http_client.exchange_code_for_token(
                client_id=client_id, client_secret=client_secret, code=code, redirect_uri=redirect_uri
            )
        except Exception:
            credential.status = CredentialStatus.ERROR
            self.repo.save(credential)
            raise

        self._apply_token(credential, token)
        return self.repo.save(credential)

    async def refresh_token(self, organization_id: str) -> ApiCredential:
        credential = self.repo.get_for_org(organization_id)
        if credential is None:
            raise ValueError("No Mercado Livre credentials stored for this organization.")
        if not credential.refresh_token:
            raise ValueError("No refresh token available; reconnect via OAuth first.")

        client_id = decrypt_value(credential.client_id)
        client_secret = decrypt_value(credential.client_secret)
        refresh_token = decrypt_value(credential.refresh_token)

        try:
            token: TokenResponse = await self.http_client.refresh_access_token(
                client_id=client_id, client_secret=client_secret, refresh_token=refresh_token
            )
        except Exception:
            credential.status = CredentialStatus.EXPIRED
            self.repo.save(credential)
            raise

        self._apply_token(credential, token)
        return self.repo.save(credential)

    @staticmethod
    def _apply_token(credential: ApiCredential, token: TokenResponse) -> None:
        credential.access_token = encrypt_value(token.access_token)
        if token.refresh_token:
            credential.refresh_token = encrypt_value(token.refresh_token)
        credential.token_expires_at = datetime.now(timezone.utc) + timedelta(seconds=token.expires_in)
        credential.ml_user_id = token.user_id
        credential.status = CredentialStatus.CONNECTED

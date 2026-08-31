"""Service layer for the /integrations/mercado-livre endpoints: converts
between the OAuth service's DB models and API-safe (masked) schemas."""
from typing import Optional

from sqlalchemy.orm import Session

from app.core.responses import AppError
from app.core.security import decrypt_value, mask_secret
from app.integrations.mercado_livre.client import MercadoLivreOAuthClient
from app.integrations.mercado_livre.exceptions import (
    ExpiredAuthorizationCodeError,
    InvalidCredentialsError,
    NetworkError,
    TokenRefreshError,
)
from app.integrations.mercado_livre.oauth_service import MercadoLivreOAuthService
from app.models.api_credential import ApiCredential
from app.schemas.api_credential import CredentialOut


def to_credential_out(credential: ApiCredential) -> CredentialOut:
    raw_client_id = decrypt_value(credential.client_id) or ""
    return CredentialOut(
        id=credential.id,
        marketplace=credential.marketplace,
        client_id_masked=mask_secret(raw_client_id),
        status=credential.status,
        ml_user_id=credential.ml_user_id,
        token_expires_at=credential.token_expires_at,
        created_at=credential.created_at,
        updated_at=credential.updated_at,
    )


class ApiCredentialService:
    def __init__(self, db: Session, http_client: Optional[MercadoLivreOAuthClient] = None):
        self.db = db
        self.oauth = MercadoLivreOAuthService(db, http_client=http_client)

    def save_credentials(self, organization_id: str, client_id: str, client_secret: str, redirect_uri: Optional[str]) -> CredentialOut:
        credential = self.oauth.save_app_credentials(organization_id, client_id, client_secret, redirect_uri)
        return to_credential_out(credential)

    def get_credentials(self, organization_id: str) -> CredentialOut:
        credential = self.oauth.get_credential(organization_id)
        if credential is None:
            raise AppError(404, "NOT_FOUND", "No Mercado Livre credentials configured for this organization.")
        return to_credential_out(credential)

    def delete_credentials(self, organization_id: str) -> None:
        deleted = self.oauth.delete_credential(organization_id)
        if not deleted:
            raise AppError(404, "NOT_FOUND", "No Mercado Livre credentials configured for this organization.")

    def build_authorize_url(self, organization_id: str, redirect_uri: Optional[str] = None):
        try:
            url, state = self.oauth.build_authorize_url(organization_id, redirect_uri)
        except ValueError as exc:
            raise AppError(400, "CREDENTIALS_NOT_CONFIGURED", str(exc))
        return url, state

    async def handle_callback(self, code: str, state: str) -> CredentialOut:
        try:
            credential = await self.oauth.handle_callback(code=code, state=state)
        except ValueError as exc:
            raise AppError(400, "INVALID_STATE", str(exc))
        except InvalidCredentialsError as exc:
            raise AppError(401, "INVALID_ML_CREDENTIALS", str(exc))
        except ExpiredAuthorizationCodeError as exc:
            raise AppError(400, "EXPIRED_CODE", str(exc))
        except NetworkError as exc:
            raise AppError(502, "ML_NETWORK_ERROR", str(exc))
        return to_credential_out(credential)

    async def refresh_token(self, organization_id: str) -> CredentialOut:
        try:
            credential = await self.oauth.refresh_token(organization_id)
        except ValueError as exc:
            raise AppError(400, "REFRESH_NOT_AVAILABLE", str(exc))
        except TokenRefreshError as exc:
            raise AppError(401, "REFRESH_FAILED", str(exc))
        except NetworkError as exc:
            raise AppError(502, "ML_NETWORK_ERROR", str(exc))
        return to_credential_out(credential)

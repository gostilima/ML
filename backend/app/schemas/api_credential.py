from datetime import datetime
from typing import Optional

from pydantic import BaseModel, Field

from app.models.api_credential import CredentialStatus, MarketplaceEnum
from app.schemas.common import ORMBase


class CredentialCreateRequest(BaseModel):
    client_id: str = Field(min_length=1)
    client_secret: str = Field(min_length=1)
    redirect_uri: Optional[str] = None


class CredentialOut(ORMBase):
    id: str
    marketplace: MarketplaceEnum
    client_id_masked: str
    status: CredentialStatus
    ml_user_id: Optional[str] = None
    token_expires_at: Optional[datetime] = None
    created_at: datetime
    updated_at: datetime


class AuthorizeUrlOut(BaseModel):
    authorize_url: str
    state: str


class OAuthCallbackResult(BaseModel):
    status: CredentialStatus
    ml_user_id: Optional[str] = None
    token_expires_at: Optional[datetime] = None

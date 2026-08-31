import enum
from datetime import datetime
from typing import Optional

from sqlalchemy import DateTime, Enum, ForeignKey, String, Text
from sqlalchemy.orm import Mapped, mapped_column

from app.core.db import Base
from app.models.base import TimestampMixin, UUIDPkMixin


class MarketplaceEnum(str, enum.Enum):
    """Extensible marketplace registry. Only MERCADO_LIVRE is active today."""

    MERCADO_LIVRE = "MERCADO_LIVRE"
    AMAZON = "AMAZON"
    SHOPEE = "SHOPEE"
    TIKTOK_SHOP = "TIKTOK_SHOP"
    MAGALU = "MAGALU"


class CredentialStatus(str, enum.Enum):
    DISCONNECTED = "DISCONNECTED"
    CONNECTED = "CONNECTED"
    EXPIRED = "EXPIRED"
    ERROR = "ERROR"


class ApiCredential(Base, UUIDPkMixin, TimestampMixin):
    """Per-organization marketplace API credentials + OAuth tokens.

    Sensitive fields (client_secret, access_token, refresh_token) are stored
    encrypted at rest via app.core.security.encrypt_value/decrypt_value and
    must never be logged or returned raw from the API.
    """

    __tablename__ = "api_credentials"

    organization_id: Mapped[str] = mapped_column(ForeignKey("organizations.id"), nullable=False, index=True)
    marketplace: Mapped[MarketplaceEnum] = mapped_column(
        Enum(MarketplaceEnum, native_enum=False), nullable=False, default=MarketplaceEnum.MERCADO_LIVRE
    )

    client_id: Mapped[str] = mapped_column(Text, nullable=False)  # encrypted
    client_secret: Mapped[str] = mapped_column(Text, nullable=False)  # encrypted

    access_token: Mapped[Optional[str]] = mapped_column(Text, nullable=True)  # encrypted
    refresh_token: Mapped[Optional[str]] = mapped_column(Text, nullable=True)  # encrypted
    token_expires_at: Mapped[Optional[datetime]] = mapped_column(DateTime(timezone=True), nullable=True)

    ml_user_id: Mapped[Optional[str]] = mapped_column(String(64), nullable=True)
    redirect_uri: Mapped[Optional[str]] = mapped_column(String(512), nullable=True)

    status: Mapped[CredentialStatus] = mapped_column(
        Enum(CredentialStatus, native_enum=False), nullable=False, default=CredentialStatus.DISCONNECTED
    )

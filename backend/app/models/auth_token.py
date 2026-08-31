from datetime import datetime

from sqlalchemy import Boolean, DateTime, ForeignKey, String
from sqlalchemy.orm import Mapped, mapped_column

from app.core.db import Base
from app.models.base import TimestampMixin, UUIDPkMixin


class PasswordResetToken(Base, UUIDPkMixin, TimestampMixin):
    __tablename__ = "password_reset_tokens"

    user_id: Mapped[str] = mapped_column(ForeignKey("users.id"), nullable=False, index=True)
    token: Mapped[str] = mapped_column(String(255), unique=True, index=True, nullable=False)
    expires_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), nullable=False)
    used: Mapped[bool] = mapped_column(Boolean, default=False)


class RefreshTokenRecord(Base, UUIDPkMixin, TimestampMixin):
    """Tracks issued refresh tokens so /auth/logout can revoke them."""

    __tablename__ = "refresh_tokens"

    user_id: Mapped[str] = mapped_column(ForeignKey("users.id"), nullable=False, index=True)
    jti: Mapped[str] = mapped_column(String(64), unique=True, index=True, nullable=False)
    revoked: Mapped[bool] = mapped_column(Boolean, default=False)
    expires_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), nullable=False)

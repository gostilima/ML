import enum
from typing import Optional

from sqlalchemy import Boolean, Enum, ForeignKey, String, Text
from sqlalchemy.orm import Mapped, mapped_column


class AlertType(str, enum.Enum):
    PRICE_DROP = "PRICE_DROP"
    PRICE_INCREASE = "PRICE_INCREASE"
    STOCK_OUT = "STOCK_OUT"
    NEW_COMPETITOR = "NEW_COMPETITOR"
    BUYBOX_LOST = "BUYBOX_LOST"
    OPPORTUNITY_FOUND = "OPPORTUNITY_FOUND"
    CREDENTIAL_EXPIRED = "CREDENTIAL_EXPIRED"


from app.core.db import Base  # noqa: E402
from app.models.base import TimestampMixin, UUIDPkMixin  # noqa: E402


class Alert(Base, UUIDPkMixin, TimestampMixin):
    __tablename__ = "alerts"

    organization_id: Mapped[str] = mapped_column(ForeignKey("organizations.id"), nullable=False, index=True)
    product_id: Mapped[Optional[str]] = mapped_column(ForeignKey("products.id"), nullable=True, index=True)

    type: Mapped[AlertType] = mapped_column(Enum(AlertType, native_enum=False), nullable=False)
    message: Mapped[str] = mapped_column(Text, nullable=False)
    is_read: Mapped[bool] = mapped_column(Boolean, default=False)

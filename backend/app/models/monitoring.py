from typing import Optional

from sqlalchemy import Boolean, Float, ForeignKey
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.core.db import Base
from app.models.base import TimestampMixin, UUIDPkMixin


class MonitoredProduct(Base, UUIDPkMixin, TimestampMixin):
    __tablename__ = "monitored_products"

    organization_id: Mapped[str] = mapped_column(ForeignKey("organizations.id"), nullable=False, index=True)
    product_id: Mapped[str] = mapped_column(ForeignKey("products.id"), nullable=False, index=True)

    is_active: Mapped[bool] = mapped_column(Boolean, default=True)
    target_price: Mapped[Optional[float]] = mapped_column(Float, nullable=True)
    min_stock_alert: Mapped[Optional[int]] = mapped_column(Float, nullable=True)

    product: Mapped["Product"] = relationship(back_populates="monitored_products")

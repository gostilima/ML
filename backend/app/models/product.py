from typing import Optional

from sqlalchemy import Float, ForeignKey, String
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.core.db import Base
from app.models.base import TimestampMixin, UUIDPkMixin


class Product(Base, UUIDPkMixin, TimestampMixin):
    __tablename__ = "products"

    organization_id: Mapped[str] = mapped_column(ForeignKey("organizations.id"), nullable=False, index=True)

    name: Mapped[str] = mapped_column(String(500), nullable=False)
    brand: Mapped[Optional[str]] = mapped_column(String(255), nullable=True)
    category: Mapped[Optional[str]] = mapped_column(String(255), nullable=True)
    sku: Mapped[Optional[str]] = mapped_column(String(120), nullable=True, index=True)
    ml_item_id: Mapped[Optional[str]] = mapped_column(String(64), nullable=True, index=True)
    ean: Mapped[Optional[str]] = mapped_column(String(32), nullable=True)

    weight: Mapped[Optional[float]] = mapped_column(Float, nullable=True)
    height: Mapped[Optional[float]] = mapped_column(Float, nullable=True)
    width: Mapped[Optional[float]] = mapped_column(Float, nullable=True)
    length: Mapped[Optional[float]] = mapped_column(Float, nullable=True)

    image_url: Mapped[Optional[str]] = mapped_column(String(1000), nullable=True)

    monitored_products: Mapped[list["MonitoredProduct"]] = relationship(back_populates="product")

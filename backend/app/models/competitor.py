from typing import Optional

from sqlalchemy import Float, ForeignKey, Integer, String
from sqlalchemy.orm import Mapped, mapped_column

from app.core.db import Base
from app.models.base import TimestampMixin, UUIDPkMixin


class Competitor(Base, UUIDPkMixin, TimestampMixin):
    __tablename__ = "competitors"

    organization_id: Mapped[str] = mapped_column(ForeignKey("organizations.id"), nullable=False, index=True)
    product_id: Mapped[str] = mapped_column(ForeignKey("products.id"), nullable=False, index=True)

    marketplace: Mapped[str] = mapped_column(String(60), default="MERCADO_LIVRE")
    external_id: Mapped[Optional[str]] = mapped_column(String(64), nullable=True)
    seller_name: Mapped[Optional[str]] = mapped_column(String(255), nullable=True)
    title: Mapped[Optional[str]] = mapped_column(String(500), nullable=True)
    price: Mapped[Optional[float]] = mapped_column(Float, nullable=True)
    sold_quantity: Mapped[Optional[int]] = mapped_column(Integer, nullable=True)
    reputation: Mapped[Optional[str]] = mapped_column(String(60), nullable=True)

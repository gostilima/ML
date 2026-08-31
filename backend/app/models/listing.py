from datetime import datetime
from typing import Optional

from sqlalchemy import DateTime, Float, ForeignKey, Integer, String
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.core.db import Base
from app.models.base import TimestampMixin, UUIDPkMixin


class Listing(Base, UUIDPkMixin, TimestampMixin):
    __tablename__ = "listings"

    organization_id: Mapped[str] = mapped_column(ForeignKey("organizations.id"), nullable=False, index=True)
    product_id: Mapped[Optional[str]] = mapped_column(ForeignKey("products.id"), nullable=True, index=True)

    marketplace: Mapped[str] = mapped_column(String(60), default="MERCADO_LIVRE")
    external_id: Mapped[Optional[str]] = mapped_column(String(64), nullable=True, index=True)
    title: Mapped[Optional[str]] = mapped_column(String(500), nullable=True)
    status: Mapped[Optional[str]] = mapped_column(String(60), nullable=True)
    current_price: Mapped[Optional[float]] = mapped_column(Float, nullable=True)
    available_quantity: Mapped[Optional[int]] = mapped_column(Integer, nullable=True)

    prices: Mapped[list["ListingPrice"]] = relationship(back_populates="listing", cascade="all, delete-orphan")


class ListingPrice(Base, UUIDPkMixin, TimestampMixin):
    __tablename__ = "listing_prices"

    listing_id: Mapped[str] = mapped_column(ForeignKey("listings.id"), nullable=False, index=True)
    price: Mapped[float] = mapped_column(Float, nullable=False)
    recorded_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), nullable=False)

    listing: Mapped["Listing"] = relationship(back_populates="prices")


class ListingHistory(Base, UUIDPkMixin, TimestampMixin):
    __tablename__ = "listing_history"

    listing_id: Mapped[str] = mapped_column(ForeignKey("listings.id"), nullable=False, index=True)
    field: Mapped[str] = mapped_column(String(120), nullable=False)
    old_value: Mapped[Optional[str]] = mapped_column(String(1000), nullable=True)
    new_value: Mapped[Optional[str]] = mapped_column(String(1000), nullable=True)
    changed_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), nullable=False)

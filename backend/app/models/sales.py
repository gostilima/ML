from datetime import date as date_type
from typing import Optional

from sqlalchemy import Date, Float, ForeignKey, Integer
from sqlalchemy.orm import Mapped, mapped_column

from app.core.db import Base
from app.models.base import TimestampMixin, UUIDPkMixin


class SalesEstimate(Base, UUIDPkMixin, TimestampMixin):
    __tablename__ = "sales_estimates"

    organization_id: Mapped[str] = mapped_column(ForeignKey("organizations.id"), nullable=False, index=True)
    product_id: Mapped[str] = mapped_column(ForeignKey("products.id"), nullable=False, index=True)

    estimated_units_month: Mapped[Optional[int]] = mapped_column(Integer, nullable=True)
    estimated_revenue_month: Mapped[Optional[float]] = mapped_column(Float, nullable=True)
    confidence: Mapped[Optional[float]] = mapped_column(Float, nullable=True)


class SalesHistory(Base, UUIDPkMixin, TimestampMixin):
    __tablename__ = "sales_history"

    organization_id: Mapped[str] = mapped_column(ForeignKey("organizations.id"), nullable=False, index=True)
    product_id: Mapped[str] = mapped_column(ForeignKey("products.id"), nullable=False, index=True)

    date: Mapped[date_type] = mapped_column(Date, nullable=False)
    units_sold: Mapped[int] = mapped_column(Integer, default=0)
    revenue: Mapped[float] = mapped_column(Float, default=0)


class RevenueEstimate(Base, UUIDPkMixin, TimestampMixin):
    __tablename__ = "revenue_estimates"

    organization_id: Mapped[str] = mapped_column(ForeignKey("organizations.id"), nullable=False, index=True)
    product_id: Mapped[str] = mapped_column(ForeignKey("products.id"), nullable=False, index=True)

    period_start: Mapped[date_type] = mapped_column(Date, nullable=False)
    period_end: Mapped[date_type] = mapped_column(Date, nullable=False)
    estimated_revenue: Mapped[float] = mapped_column(Float, default=0)

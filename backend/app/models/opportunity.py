from typing import Optional

from sqlalchemy import Float, ForeignKey, String
from sqlalchemy.orm import Mapped, mapped_column

from app.core.db import Base
from app.models.base import TimestampMixin, UUIDPkMixin


class Opportunity(Base, UUIDPkMixin, TimestampMixin):
    """A scored product/niche opportunity for an organization."""

    __tablename__ = "opportunities"

    organization_id: Mapped[str] = mapped_column(ForeignKey("organizations.id"), nullable=False, index=True)
    product_id: Mapped[Optional[str]] = mapped_column(ForeignKey("products.id"), nullable=True, index=True)

    keyword: Mapped[Optional[str]] = mapped_column(String(255), nullable=True)
    category: Mapped[Optional[str]] = mapped_column(String(255), nullable=True)

    demand_score: Mapped[float] = mapped_column(Float, default=0)
    consistency_score: Mapped[float] = mapped_column(Float, default=0)
    margin_score: Mapped[float] = mapped_column(Float, default=0)
    competition_score: Mapped[float] = mapped_column(Float, default=0)
    growth_score: Mapped[float] = mapped_column(Float, default=0)
    logistics_score: Mapped[float] = mapped_column(Float, default=0)
    repurchase_score: Mapped[float] = mapped_column(Float, default=0)

    total_score: Mapped[float] = mapped_column(Float, default=0)

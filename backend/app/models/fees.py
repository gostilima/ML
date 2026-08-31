import enum
from typing import Optional

from sqlalchemy import Enum, Float, ForeignKey, String
from sqlalchemy.orm import Mapped, mapped_column

from app.core.db import Base
from app.models.base import TimestampMixin, UUIDPkMixin


class LogisticsType(str, enum.Enum):
    FULL = "FULL"
    MERCADO_ENVIOS = "MERCADO_ENVIOS"
    OWN_LOGISTICS = "OWN_LOGISTICS"


class Fee(Base, UUIDPkMixin, TimestampMixin):
    """Marketplace commission/fee schedule. Never hardcode these percentages
    in business logic — always read from this table via the FeeEngine."""

    __tablename__ = "fees"

    organization_id: Mapped[Optional[str]] = mapped_column(
        ForeignKey("organizations.id"), nullable=True, index=True
    )  # null = global/default schedule
    marketplace: Mapped[str] = mapped_column(String(60), nullable=False, default="MERCADO_LIVRE")
    category: Mapped[Optional[str]] = mapped_column(String(255), nullable=True)  # null = applies to all categories

    percentage_fee: Mapped[float] = mapped_column(Float, nullable=False, default=0)  # e.g. 12.0 = 12%
    fixed_fee: Mapped[float] = mapped_column(Float, nullable=False, default=0)
    tax_percentage: Mapped[float] = mapped_column(Float, nullable=False, default=0)


class LogisticsRate(Base, UUIDPkMixin, TimestampMixin):
    __tablename__ = "logistics_rates"

    organization_id: Mapped[Optional[str]] = mapped_column(
        ForeignKey("organizations.id"), nullable=True, index=True
    )
    marketplace: Mapped[str] = mapped_column(String(60), nullable=False, default="MERCADO_LIVRE")
    logistics_type: Mapped[LogisticsType] = mapped_column(Enum(LogisticsType, native_enum=False), nullable=False)

    min_weight: Mapped[Optional[float]] = mapped_column(Float, nullable=True)
    max_weight: Mapped[Optional[float]] = mapped_column(Float, nullable=True)
    base_cost: Mapped[float] = mapped_column(Float, nullable=False, default=0)
    cost_per_kg: Mapped[float] = mapped_column(Float, nullable=False, default=0)

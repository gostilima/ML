from typing import Optional

from sqlalchemy import ForeignKey, Integer, String, Text
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.core.db import Base
from app.models.base import TimestampMixin, UUIDPkMixin


class Advertisement(Base, UUIDPkMixin, TimestampMixin):
    __tablename__ = "advertisements"

    organization_id: Mapped[str] = mapped_column(ForeignKey("organizations.id"), nullable=False, index=True)
    product_id: Mapped[Optional[str]] = mapped_column(ForeignKey("products.id"), nullable=True, index=True)

    title: Mapped[str] = mapped_column(String(500), nullable=False)
    status: Mapped[str] = mapped_column(String(60), default="DRAFT")

    versions: Mapped[list["AdvertisementVersion"]] = relationship(
        back_populates="advertisement", cascade="all, delete-orphan"
    )


class AdvertisementVersion(Base, UUIDPkMixin, TimestampMixin):
    __tablename__ = "advertisement_versions"

    advertisement_id: Mapped[str] = mapped_column(ForeignKey("advertisements.id"), nullable=False, index=True)
    version_number: Mapped[int] = mapped_column(Integer, default=1)
    title: Mapped[str] = mapped_column(String(500), nullable=False)
    description: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    generated_by_ai: Mapped[bool] = mapped_column(default=False)

    advertisement: Mapped["Advertisement"] = relationship(back_populates="versions")

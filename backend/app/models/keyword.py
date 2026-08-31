from datetime import date as date_type
from typing import Optional

from sqlalchemy import Date, Float, ForeignKey, Integer, String
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.core.db import Base
from app.models.base import TimestampMixin, UUIDPkMixin


class Keyword(Base, UUIDPkMixin, TimestampMixin):
    __tablename__ = "keywords"

    organization_id: Mapped[str] = mapped_column(ForeignKey("organizations.id"), nullable=False, index=True)
    term: Mapped[str] = mapped_column(String(255), nullable=False, index=True)
    category: Mapped[Optional[str]] = mapped_column(String(255), nullable=True)
    search_volume: Mapped[Optional[int]] = mapped_column(Integer, nullable=True)

    history: Mapped[list["KeywordHistory"]] = relationship(back_populates="keyword", cascade="all, delete-orphan")


class KeywordHistory(Base, UUIDPkMixin, TimestampMixin):
    __tablename__ = "keyword_history"

    keyword_id: Mapped[str] = mapped_column(ForeignKey("keywords.id"), nullable=False, index=True)
    date: Mapped[date_type] = mapped_column(Date, nullable=False)
    search_volume: Mapped[Optional[int]] = mapped_column(Integer, nullable=True)
    average_price: Mapped[Optional[float]] = mapped_column(Float, nullable=True)

    keyword: Mapped["Keyword"] = relationship(back_populates="history")

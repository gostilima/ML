from typing import Optional

from sqlalchemy import Float, ForeignKey, Integer, String, Text
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.core.db import Base
from app.models.base import TimestampMixin, UUIDPkMixin


class Supplier(Base, UUIDPkMixin, TimestampMixin):
    __tablename__ = "suppliers"

    organization_id: Mapped[str] = mapped_column(ForeignKey("organizations.id"), nullable=False, index=True)

    name: Mapped[str] = mapped_column(String(255), nullable=False)
    company: Mapped[Optional[str]] = mapped_column(String(255), nullable=True)
    cnpj: Mapped[Optional[str]] = mapped_column(String(32), nullable=True)
    site: Mapped[Optional[str]] = mapped_column(String(500), nullable=True)
    phone: Mapped[Optional[str]] = mapped_column(String(32), nullable=True)
    whatsapp: Mapped[Optional[str]] = mapped_column(String(32), nullable=True)
    email: Mapped[Optional[str]] = mapped_column(String(255), nullable=True)
    city: Mapped[Optional[str]] = mapped_column(String(120), nullable=True)
    state: Mapped[Optional[str]] = mapped_column(String(60), nullable=True)
    notes: Mapped[Optional[str]] = mapped_column(Text, nullable=True)

    products: Mapped[list["SupplierProduct"]] = relationship(
        back_populates="supplier", cascade="all, delete-orphan"
    )


class SupplierProduct(Base, UUIDPkMixin, TimestampMixin):
    __tablename__ = "supplier_products"

    organization_id: Mapped[str] = mapped_column(ForeignKey("organizations.id"), nullable=False, index=True)
    supplier_id: Mapped[str] = mapped_column(ForeignKey("suppliers.id"), nullable=False, index=True)
    product_id: Mapped[Optional[str]] = mapped_column(ForeignKey("products.id"), nullable=True, index=True)

    name: Mapped[str] = mapped_column(String(500), nullable=False)
    code: Mapped[Optional[str]] = mapped_column(String(120), nullable=True)
    price: Mapped[float] = mapped_column(Float, nullable=False, default=0)
    moq: Mapped[Optional[int]] = mapped_column(Integer, nullable=True)
    stock: Mapped[Optional[int]] = mapped_column(Integer, nullable=True)
    shipping_cost: Mapped[Optional[float]] = mapped_column(Float, nullable=True)
    lead_time: Mapped[Optional[int]] = mapped_column(Integer, nullable=True)  # days

    supplier: Mapped["Supplier"] = relationship(back_populates="products")

import enum

from sqlalchemy import Enum, ForeignKey, String
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.core.db import Base
from app.models.base import TimestampMixin, UUIDPkMixin


class Organization(Base, UUIDPkMixin, TimestampMixin):
    __tablename__ = "organizations"

    name: Mapped[str] = mapped_column(String(255), nullable=False)
    slug: Mapped[str] = mapped_column(String(255), unique=True, index=True, nullable=False)

    members: Mapped[list["OrganizationMember"]] = relationship(back_populates="organization")


class OrgRole(str, enum.Enum):
    OWNER = "OWNER"
    ADMIN = "ADMIN"
    MEMBER = "MEMBER"


class OrganizationMember(Base, UUIDPkMixin, TimestampMixin):
    __tablename__ = "organization_members"

    organization_id: Mapped[str] = mapped_column(ForeignKey("organizations.id"), nullable=False, index=True)
    user_id: Mapped[str] = mapped_column(ForeignKey("users.id"), nullable=False, index=True)
    role: Mapped[OrgRole] = mapped_column(Enum(OrgRole, native_enum=False), default=OrgRole.MEMBER)

    organization: Mapped["Organization"] = relationship(back_populates="members")
    user: Mapped["User"] = relationship(back_populates="memberships")

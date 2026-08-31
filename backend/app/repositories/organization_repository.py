from typing import Optional

from sqlalchemy import select
from sqlalchemy.orm import Session

from app.models.organization import Organization, OrganizationMember


class OrganizationRepository:
    def __init__(self, db: Session):
        self.db = db

    def create(self, org: Organization) -> Organization:
        self.db.add(org)
        self.db.commit()
        self.db.refresh(org)
        return org

    def get(self, org_id: str) -> Optional[Organization]:
        return self.db.get(Organization, org_id)

    def get_by_slug(self, slug: str) -> Optional[Organization]:
        return self.db.execute(select(Organization).where(Organization.slug == slug)).scalars().first()

    def add_member(self, member: OrganizationMember) -> OrganizationMember:
        self.db.add(member)
        self.db.commit()
        self.db.refresh(member)
        return member

    def get_membership(self, organization_id: str, user_id: str) -> Optional[OrganizationMember]:
        stmt = select(OrganizationMember).where(
            OrganizationMember.organization_id == organization_id, OrganizationMember.user_id == user_id
        )
        return self.db.execute(stmt).scalars().first()

    def get_first_membership_for_user(self, user_id: str) -> Optional[OrganizationMember]:
        stmt = select(OrganizationMember).where(OrganizationMember.user_id == user_id)
        return self.db.execute(stmt).scalars().first()

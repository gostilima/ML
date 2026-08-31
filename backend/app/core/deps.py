"""Common FastAPI dependencies: DB session, current user, current org
(multi-tenant scoping)."""
from typing import Optional

from fastapi import Depends, Header
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.core.db import get_db
from app.core.responses import AppError
from app.core.security import decode_token
from app.models.organization import Organization, OrganizationMember
from app.models.user import User

bearer_scheme = HTTPBearer(auto_error=False)


def get_current_user(
    credentials: Optional[HTTPAuthorizationCredentials] = Depends(bearer_scheme),
    db: Session = Depends(get_db),
) -> User:
    if credentials is None:
        raise AppError(401, "UNAUTHORIZED", "Missing authentication credentials.")
    try:
        payload = decode_token(credentials.credentials)
    except ValueError:
        raise AppError(401, "UNAUTHORIZED", "Invalid or expired token.")
    if payload.get("type") != "access":
        raise AppError(401, "UNAUTHORIZED", "Invalid token type.")
    user_id = payload.get("sub")
    user = db.get(User, user_id)
    if user is None or not user.is_active:
        raise AppError(401, "UNAUTHORIZED", "User not found or inactive.")
    return user


def get_current_org(
    x_organization_id: Optional[str] = Header(default=None),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> Organization:
    """Resolve the active organization for this request and verify the
    current user is a member of it (multi-tenant isolation)."""
    membership_stmt = select(OrganizationMember).where(OrganizationMember.user_id == current_user.id)

    if x_organization_id:
        membership_stmt = membership_stmt.where(OrganizationMember.organization_id == x_organization_id)
        membership = db.execute(membership_stmt).scalars().first()
        if membership is None:
            raise AppError(403, "FORBIDDEN", "You do not have access to this organization.")
    else:
        membership = db.execute(membership_stmt).scalars().first()
        if membership is None:
            raise AppError(403, "FORBIDDEN", "User has no organization.")

    org = db.get(Organization, membership.organization_id)
    if org is None:
        raise AppError(404, "NOT_FOUND", "Organization not found.")
    return org

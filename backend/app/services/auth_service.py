"""Authentication + registration business logic."""
import re
import secrets
import uuid
from datetime import datetime, timedelta, timezone
from typing import Optional

from sqlalchemy.orm import Session

from app.core.responses import AppError
from app.core.security import (
    create_access_token,
    create_refresh_token,
    decode_token,
    hash_password,
    verify_password,
)
from app.models.auth_token import PasswordResetToken, RefreshTokenRecord
from app.models.organization import Organization, OrganizationMember, OrgRole
from app.models.user import User
from app.repositories.organization_repository import OrganizationRepository
from app.repositories.user_repository import UserRepository


def _slugify(name: str) -> str:
    base = re.sub(r"[^a-z0-9]+", "-", name.lower()).strip("-") or "org"
    return f"{base}-{uuid.uuid4().hex[:8]}"


class AuthService:
    def __init__(self, db: Session):
        self.db = db
        self.users = UserRepository(db)
        self.orgs = OrganizationRepository(db)

    def register(self, email: str, password: str, full_name: Optional[str], organization_name: str) -> tuple[User, Organization]:
        if self.users.get_by_email(email):
            raise AppError(409, "EMAIL_TAKEN", "An account with this email already exists.")

        user = User(email=email, hashed_password=hash_password(password), full_name=full_name)
        user = self.users.create(user)

        org = Organization(name=organization_name, slug=_slugify(organization_name))
        org = self.orgs.create(org)

        membership = OrganizationMember(organization_id=org.id, user_id=user.id, role=OrgRole.OWNER)
        self.orgs.add_member(membership)

        return user, org

    def authenticate(self, email: str, password: str) -> User:
        user = self.users.get_by_email(email)
        if user is None or not verify_password(password, user.hashed_password):
            raise AppError(401, "INVALID_CREDENTIALS", "Invalid email or password.")
        if not user.is_active:
            raise AppError(403, "INACTIVE_USER", "This account is inactive.")
        return user

    def issue_tokens(self, user: User) -> tuple[str, str]:
        access = create_access_token(user.id)
        refresh = create_refresh_token(user.id)
        payload = decode_token(refresh)
        record = RefreshTokenRecord(
            user_id=user.id,
            jti=payload["jti"],
            expires_at=datetime.fromtimestamp(payload["exp"], tz=timezone.utc),
        )
        self.db.add(record)
        self.db.commit()
        return access, refresh

    def refresh_access_token(self, refresh_token: str) -> tuple[str, str]:
        try:
            payload = decode_token(refresh_token)
        except ValueError:
            raise AppError(401, "UNAUTHORIZED", "Invalid or expired refresh token.")
        if payload.get("type") != "refresh":
            raise AppError(401, "UNAUTHORIZED", "Invalid token type.")

        record = self.db.query(RefreshTokenRecord).filter_by(jti=payload["jti"]).first()
        if record is None or record.revoked:
            raise AppError(401, "UNAUTHORIZED", "Refresh token has been revoked.")

        user = self.users.get(payload["sub"])
        if user is None or not user.is_active:
            raise AppError(401, "UNAUTHORIZED", "User not found or inactive.")

        # Rotate: revoke old, issue new pair.
        record.revoked = True
        self.db.commit()
        return self.issue_tokens(user)

    def logout(self, refresh_token: str) -> None:
        try:
            payload = decode_token(refresh_token)
        except ValueError:
            return
        record = self.db.query(RefreshTokenRecord).filter_by(jti=payload.get("jti")).first()
        if record:
            record.revoked = True
            self.db.commit()

    def create_password_reset_token(self, email: str) -> Optional[str]:
        user = self.users.get_by_email(email)
        if user is None:
            return None  # do not leak whether the email exists
        token = secrets.token_urlsafe(32)
        record = PasswordResetToken(
            user_id=user.id,
            token=token,
            expires_at=datetime.now(timezone.utc) + timedelta(hours=1),
        )
        self.db.add(record)
        self.db.commit()
        return token

    def reset_password(self, token: str, new_password: str) -> None:
        record = self.db.query(PasswordResetToken).filter_by(token=token).first()
        if record is None or record.used or record.expires_at < datetime.now(timezone.utc):
            raise AppError(400, "INVALID_TOKEN", "Invalid or expired reset token.")
        user = self.users.get(record.user_id)
        if user is None:
            raise AppError(400, "INVALID_TOKEN", "Invalid or expired reset token.")
        user.hashed_password = hash_password(new_password)
        record.used = True
        self.db.commit()

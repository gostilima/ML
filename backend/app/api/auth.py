from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.core.db import get_db
from app.core.deps import get_current_user
from app.core.responses import success_envelope
from app.models.user import User
from app.repositories.organization_repository import OrganizationRepository
from app.schemas.auth import (
    ForgotPasswordRequest,
    LoginRequest,
    LogoutRequest,
    MeOut,
    RefreshRequest,
    RegisterRequest,
    ResetPasswordRequest,
    TokenPair,
    UserOut,
)
from app.services.auth_service import AuthService

router = APIRouter(prefix="/auth", tags=["auth"])


@router.post("/register")
def register(payload: RegisterRequest, db: Session = Depends(get_db)):
    service = AuthService(db)
    user, org = service.register(payload.email, payload.password, payload.full_name, payload.organization_name)
    access, refresh = service.issue_tokens(user)
    return success_envelope(
        {
            "user": UserOut.model_validate(user),
            "organization_id": org.id,
            "tokens": TokenPair(access_token=access, refresh_token=refresh),
        }
    )


@router.post("/login")
def login(payload: LoginRequest, db: Session = Depends(get_db)):
    service = AuthService(db)
    user = service.authenticate(payload.email, payload.password)
    access, refresh = service.issue_tokens(user)
    return success_envelope({"tokens": TokenPair(access_token=access, refresh_token=refresh)})


@router.post("/refresh")
def refresh(payload: RefreshRequest, db: Session = Depends(get_db)):
    service = AuthService(db)
    access, refresh_token = service.refresh_access_token(payload.refresh_token)
    return success_envelope({"tokens": TokenPair(access_token=access, refresh_token=refresh_token)})


@router.post("/logout")
def logout(payload: LogoutRequest, db: Session = Depends(get_db)):
    service = AuthService(db)
    service.logout(payload.refresh_token)
    return success_envelope({"message": "Logged out."})


@router.post("/forgot-password")
def forgot_password(payload: ForgotPasswordRequest, db: Session = Depends(get_db)):
    service = AuthService(db)
    service.create_password_reset_token(payload.email)
    # Always respond the same way to avoid leaking account existence.
    return success_envelope({"message": "If that email exists, a reset link has been sent."})


@router.post("/reset-password")
def reset_password(payload: ResetPasswordRequest, db: Session = Depends(get_db)):
    service = AuthService(db)
    service.reset_password(payload.token, payload.new_password)
    return success_envelope({"message": "Password has been reset."})


@router.get("/me")
def me(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    org_repo = OrganizationRepository(db)
    membership = org_repo.get_first_membership_for_user(current_user.id)
    org = org_repo.get(membership.organization_id) if membership else None
    payload = MeOut(
        id=current_user.id,
        email=current_user.email,
        full_name=current_user.full_name,
        is_active=current_user.is_active,
        organization_id=org.id if org else None,
        organization_name=org.name if org else None,
        role=membership.role.value if membership else None,
    )
    return success_envelope(payload)

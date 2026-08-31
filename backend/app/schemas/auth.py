from typing import Optional

from pydantic import BaseModel, EmailStr, Field

from app.schemas.common import ORMBase


class RegisterRequest(BaseModel):
    email: EmailStr
    password: str = Field(min_length=8)
    full_name: Optional[str] = None
    organization_name: str = Field(min_length=1)


class LoginRequest(BaseModel):
    email: EmailStr
    password: str


class RefreshRequest(BaseModel):
    refresh_token: str


class LogoutRequest(BaseModel):
    refresh_token: str


class ForgotPasswordRequest(BaseModel):
    email: EmailStr


class ResetPasswordRequest(BaseModel):
    token: str
    new_password: str = Field(min_length=8)


class TokenPair(BaseModel):
    access_token: str
    refresh_token: str
    token_type: str = "bearer"


class UserOut(ORMBase):
    id: str
    email: EmailStr
    full_name: Optional[str] = None
    is_active: bool


class MeOut(UserOut):
    organization_id: Optional[str] = None
    organization_name: Optional[str] = None
    role: Optional[str] = None

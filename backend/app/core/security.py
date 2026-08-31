"""Password hashing, JWT issuance/validation, and symmetric encryption for
stored marketplace credentials/tokens.

Never log the values handled by this module (passwords, access/refresh
tokens, client secrets).
"""
import base64
import hashlib
import uuid
from datetime import datetime, timedelta, timezone
from enum import Enum
from typing import Any, Optional

from cryptography.fernet import Fernet, InvalidToken
from jose import JWTError, jwt
from passlib.context import CryptContext

from app.core.config import settings

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")


def hash_password(password: str) -> str:
    return pwd_context.hash(password)


def verify_password(plain_password: str, hashed_password: str) -> bool:
    try:
        return pwd_context.verify(plain_password, hashed_password)
    except Exception:
        return False


class TokenType(str, Enum):
    ACCESS = "access"
    REFRESH = "refresh"


def _create_token(subject: str, token_type: TokenType, expires_delta: timedelta, extra: Optional[dict] = None) -> str:
    now = datetime.now(timezone.utc)
    payload: dict[str, Any] = {
        "sub": subject,
        "type": token_type.value,
        "iat": now,
        "exp": now + expires_delta,
        "jti": uuid.uuid4().hex,
    }
    if extra:
        payload.update(extra)
    return jwt.encode(payload, settings.JWT_SECRET, algorithm=settings.JWT_ALGORITHM)


def create_access_token(subject: str, extra: Optional[dict] = None) -> str:
    return _create_token(
        subject, TokenType.ACCESS, timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES), extra
    )


def create_refresh_token(subject: str, extra: Optional[dict] = None) -> str:
    return _create_token(
        subject, TokenType.REFRESH, timedelta(minutes=settings.REFRESH_TOKEN_EXPIRE_MINUTES), extra
    )


def decode_token(token: str) -> dict:
    try:
        return jwt.decode(token, settings.JWT_SECRET, algorithms=[settings.JWT_ALGORITHM])
    except JWTError as exc:
        raise ValueError("Invalid or expired token") from exc


# --- Symmetric encryption for API credentials at rest -----------------------

def _fernet() -> Fernet:
    key = settings.CREDENTIALS_ENCRYPTION_KEY.encode()
    # Accept either a proper Fernet key (urlsafe base64, 32 bytes) or an
    # arbitrary passphrase, which we derive a valid key from so ops does not
    # need to hand-generate one for every environment.
    try:
        return Fernet(key)
    except Exception:
        derived = base64.urlsafe_b64encode(hashlib.sha256(key).digest())
        return Fernet(derived)


def encrypt_value(value: Optional[str]) -> Optional[str]:
    if value is None:
        return None
    return _fernet().encrypt(value.encode()).decode()


def decrypt_value(value: Optional[str]) -> Optional[str]:
    if value is None:
        return None
    try:
        return _fernet().decrypt(value.encode()).decode()
    except InvalidToken:
        return None


def mask_secret(value: Optional[str], visible: int = 4) -> Optional[str]:
    """Return a masked representation showing only the last `visible` chars."""
    if not value:
        return None
    if len(value) <= visible:
        return "*" * len(value)
    return "*" * (len(value) - visible) + value[-visible:]

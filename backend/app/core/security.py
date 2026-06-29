import base64
import hashlib
import hmac
import json
import os
import secrets
from datetime import datetime, timedelta, timezone

from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.models.organization import Organization
from app.models.user import User

JWT_SECRET_KEY = os.getenv("CRM_JWT_SECRET", "mini-sales-crm-v2-dev-secret")
JWT_ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 60
PBKDF2_ITERATIONS = 600_000

bearer_scheme = HTTPBearer(auto_error=False)


def normalize_email(email: str) -> str:
    return email.strip().lower()


def hash_password(password: str) -> str:
    salt = secrets.token_hex(16)
    password_hash = hashlib.pbkdf2_hmac(
        "sha256",
        password.encode("utf-8"),
        salt.encode("utf-8"),
        PBKDF2_ITERATIONS,
    )
    return (
        f"pbkdf2_sha256${PBKDF2_ITERATIONS}${salt}$"
        f"{base64.urlsafe_b64encode(password_hash).decode('utf-8')}"
    )


def verify_password(password: str, stored_password_hash: str) -> bool:
    try:
        scheme, iterations, salt, encoded_hash = stored_password_hash.split("$", maxsplit=3)
    except ValueError:
        return False

    if scheme != "pbkdf2_sha256":
        return False

    expected_hash = hashlib.pbkdf2_hmac(
        "sha256",
        password.encode("utf-8"),
        salt.encode("utf-8"),
        int(iterations),
    )
    provided_hash = base64.urlsafe_b64encode(expected_hash).decode("utf-8")
    return secrets.compare_digest(provided_hash, encoded_hash)


def _encode_base64url(data: bytes) -> str:
    return base64.urlsafe_b64encode(data).rstrip(b"=").decode("utf-8")


def _decode_base64url(data: str) -> bytes:
    padding = "=" * (-len(data) % 4)
    return base64.urlsafe_b64decode(f"{data}{padding}")


def create_access_token(user: User) -> str:
    header = {"alg": JWT_ALGORITHM, "typ": "JWT"}
    expires_at = datetime.now(timezone.utc) + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    payload = {
        "sub": str(user.id),
        "email": user.email,
        "role": user.role,
        "exp": int(expires_at.timestamp()),
    }

    encoded_header = _encode_base64url(
        json.dumps(header, separators=(",", ":"), sort_keys=True).encode("utf-8")
    )
    encoded_payload = _encode_base64url(
        json.dumps(payload, separators=(",", ":"), sort_keys=True).encode("utf-8")
    )
    signing_input = f"{encoded_header}.{encoded_payload}".encode("utf-8")
    signature = hmac.new(
        JWT_SECRET_KEY.encode("utf-8"),
        signing_input,
        hashlib.sha256,
    ).digest()
    encoded_signature = _encode_base64url(signature)
    return f"{encoded_header}.{encoded_payload}.{encoded_signature}"


def decode_access_token(token: str) -> dict:
    try:
        encoded_header, encoded_payload, encoded_signature = token.split(".")
    except ValueError as exc:
        raise ValueError("Invalid token format") from exc

    signing_input = f"{encoded_header}.{encoded_payload}".encode("utf-8")
    expected_signature = hmac.new(
        JWT_SECRET_KEY.encode("utf-8"),
        signing_input,
        hashlib.sha256,
    ).digest()
    provided_signature = _decode_base64url(encoded_signature)

    if not hmac.compare_digest(expected_signature, provided_signature):
        raise ValueError("Invalid token signature")

    try:
        payload = json.loads(_decode_base64url(encoded_payload))
    except (json.JSONDecodeError, ValueError) as exc:
        raise ValueError("Invalid token payload") from exc

    expires_at = payload.get("exp")
    if not isinstance(expires_at, int):
        raise ValueError("Missing token expiration")

    if expires_at < int(datetime.now(timezone.utc).timestamp()):
        raise ValueError("Token has expired")

    return payload


def get_current_user(
    credentials: HTTPAuthorizationCredentials | None = Depends(bearer_scheme),
    db: Session = Depends(get_db),
) -> User:
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )

    if credentials is None:
        raise credentials_exception

    try:
        payload = decode_access_token(credentials.credentials)
        user_id = int(payload["sub"])
    except (KeyError, TypeError, ValueError):
        raise credentials_exception

    user = db.get(User, user_id)
    if user is None:
        raise credentials_exception

    ensure_user_can_access_app(user)

    return user


def get_user_access_error_detail(user: User) -> str | None:
    if user.role == "platform_admin":
        if user.status == "pending":
            return "Your account is waiting for approval."
        if user.status == "rejected":
            return "Your account was rejected."
        if user.status == "inactive" or not user.is_active:
            return "Your account is inactive."
        return None

    organization: Organization | None = user.organization

    if user.status == "pending" or organization is None or organization.status == "pending":
        return "Your account is waiting for approval."
    if user.status == "rejected" or organization.status == "rejected":
        return "Your account was rejected."
    if (
        user.status == "inactive"
        or organization.status == "inactive"
        or not user.is_active
    ):
        return "Your account is inactive."

    return None


def ensure_user_can_access_app(user: User):
    detail = get_user_access_error_detail(user)
    if detail is not None:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail=detail)


def require_platform_admin(current_user: User = Depends(get_current_user)) -> User:
    if current_user.role != "platform_admin":
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Platform admin access required")
    return current_user


def require_org_admin(current_user: User = Depends(get_current_user)) -> User:
    if current_user.role != "org_admin":
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Organization admin access required")
    return current_user

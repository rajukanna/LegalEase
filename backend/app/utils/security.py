"""Security, authentication, and multi-tenant authorization utilities."""

from datetime import datetime, timedelta
from typing import Optional, Dict
import jwt
import bcrypt
from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from app.config import settings
from app.models.auth import UserResponse, TokenPayload

security_bearer = HTTPBearer(auto_error=False)

# In-memory user store for demo session evaluation (email -> user dict)
DEMO_USERS: Dict[str, dict] = {
    "demo@legalease.com": {
        "id": "usr-demo-001",
        "email": "demo@legalease.com",
        "full_name": "Demo Consumer",
        "password_hash": bcrypt.hashpw(b"demo1234", bcrypt.gensalt()).decode("utf-8"),
        "is_active": True
    },
    "guest@legalease.com": {
        "id": "usr-guest-002",
        "email": "guest@legalease.com",
        "full_name": "Guest Evaluator",
        "password_hash": bcrypt.hashpw(b"guest1234", bcrypt.gensalt()).decode("utf-8"),
        "is_active": True
    }
}


def hash_password(password: str) -> str:
    """Hashes a password using bcrypt."""
    return bcrypt.hashpw(password.encode("utf-8"), bcrypt.gensalt()).decode("utf-8")


def verify_password(plain_password: str, hashed_password: str) -> bool:
    """Verifies a plain password against the bcrypt hash."""
    return bcrypt.checkpw(plain_password.encode("utf-8"), hashed_password.encode("utf-8"))


def create_access_token(user_id: str, email: str, expires_delta: Optional[timedelta] = None) -> str:
    """Creates a signed JWT access token."""
    expire = datetime.utcnow() + (expires_delta or timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES))
    payload = {
        "sub": user_id,
        "email": email,
        "exp": expire,
        "iat": datetime.utcnow()
    }
    return jwt.encode(payload, settings.JWT_SECRET, algorithm=settings.JWT_ALGORITHM)


def decode_access_token(token: str) -> TokenPayload:
    """Decodes and validates a JWT access token."""
    try:
        payload = jwt.decode(token, settings.JWT_SECRET, algorithms=[settings.JWT_ALGORITHM])
        return TokenPayload(sub=payload["sub"], email=payload.get("email"), exp=payload.get("exp"))
    except jwt.ExpiredSignatureError:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Session has expired. Please sign in again.",
            headers={"WWW-Authenticate": "Bearer"}
        )
    except jwt.InvalidTokenError:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid authentication credentials.",
            headers={"WWW-Authenticate": "Bearer"}
        )


async def get_current_user(credentials: Optional[HTTPAuthorizationCredentials] = Depends(security_bearer)) -> UserResponse:
    """FastAPI dependency: extracts and validates the authenticated user from the Bearer token.

    Falls back to a default guest session for friction-free evaluation if no token is passed.
    """
    if not credentials:
        # Default to Guest Evaluator for zero-setup demo
        guest = DEMO_USERS["guest@legalease.com"]
        return UserResponse(id=guest["id"], email=guest["email"], full_name=guest["full_name"], is_active=True)

    token_payload = decode_access_token(credentials.credentials)
    user_id = token_payload.sub

    # Search user
    for user_data in DEMO_USERS.values():
        if user_data["id"] == user_id:
            return UserResponse(
                id=user_data["id"],
                email=user_data["email"],
                full_name=user_data.get("full_name"),
                is_active=user_data.get("is_active", True)
            )

    # Allow dynamic JWT user
    return UserResponse(id=user_id, email=token_payload.email or f"{user_id}@legalease.com", full_name="Authenticated User")

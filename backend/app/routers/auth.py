"""Authentication endpoints for user registration, login, and guest session creation."""

import uuid
from fastapi import APIRouter, HTTPException, status, Depends
from app.models.auth import UserCreate, UserLogin, UserResponse, Token
from app.utils.security import (
    DEMO_USERS,
    hash_password,
    verify_password,
    create_access_token,
    get_current_user
)

router = APIRouter(prefix="/auth", tags=["Authentication"])


@router.post("/register", response_model=Token, status_code=status.HTTP_201_CREATED)
async def register(user_in: UserCreate):
    """Registers a new user account and returns an access token."""
    email = user_in.email.lower()
    if email in DEMO_USERS:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="A user with this email address already exists."
        )

    user_id = f"usr-{uuid.uuid4().hex[:8]}"
    new_user = {
        "id": user_id,
        "email": email,
        "full_name": user_in.full_name or "LegalEase User",
        "password_hash": hash_password(user_in.password),
        "is_active": True
    }
    DEMO_USERS[email] = new_user

    token = create_access_token(user_id=user_id, email=email)
    user_res = UserResponse(id=user_id, email=email, full_name=new_user["full_name"], is_active=True)
    return Token(access_token=token, token_type="bearer", user=user_res)


@router.post("/login", response_model=Token)
async def login(credentials: UserLogin):
    """Authenticates existing user with email and password."""
    email = credentials.email.lower()
    user_data = DEMO_USERS.get(email)
    if not user_data or not verify_password(credentials.password, user_data["password_hash"]):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or password."
        )

    token = create_access_token(user_id=user_data["id"], email=email)
    user_res = UserResponse(
        id=user_data["id"],
        email=user_data["email"],
        full_name=user_data.get("full_name"),
        is_active=user_data.get("is_active", True)
    )
    return Token(access_token=token, token_type="bearer", user=user_res)


@router.get("/me", response_model=UserResponse)
async def get_me(current_user: UserResponse = Depends(get_current_user)):
    """Returns the profile of the currently authenticated user."""
    return current_user


@router.post("/guest-token", response_model=Token)
async def get_guest_token():
    """Generates an instant guest session token for zero-friction evaluation."""
    guest_id = f"guest-{uuid.uuid4().hex[:6]}"
    guest_email = f"{guest_id}@legalease.com"
    DEMO_USERS[guest_email] = {
        "id": guest_id,
        "email": guest_email,
        "full_name": "Guest Evaluator",
        "password_hash": hash_password("guest1234"),
        "is_active": True
    }
    token = create_access_token(user_id=guest_id, email=guest_email)
    user_res = UserResponse(id=guest_id, email=guest_email, full_name="Guest Evaluator", is_active=True)
    return Token(access_token=token, token_type="bearer", user=user_res)

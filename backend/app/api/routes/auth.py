from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.core.security import (
    create_access_token,
    ensure_user_can_access_app,
    get_current_user,
    hash_password,
    normalize_email,
    verify_password,
)
from app.models.organization import Organization
from app.models.user import User
from app.schemas.auth import (
    CurrentUserRead,
    LoginRequest,
    LoginResponse,
    RegisterRequest,
    RegisterResponse,
    SignupType,
)

router = APIRouter(prefix="/auth", tags=["auth"])


def serialize_user(user: User) -> CurrentUserRead:
    return CurrentUserRead.model_validate(
        {
            "id": user.id,
            "organization_id": user.organization_id,
            "organization_name": user.organization.name if user.organization else None,
            "organization_status": user.organization.status if user.organization else None,
            "name": user.name,
            "email": user.email,
            "role": user.role,
            "status": user.status,
            "is_active": user.is_active,
            "created_at": user.created_at,
            "updated_at": user.updated_at,
        }
    )


@router.post("/login", response_model=LoginResponse)
def login(payload: LoginRequest, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.email == normalize_email(payload.email)).first()

    if user is None or not verify_password(payload.password, user.password_hash):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or password",
        )

    ensure_user_can_access_app(user)

    return LoginResponse(access_token=create_access_token(user), user=serialize_user(user))


@router.post("/register", response_model=RegisterResponse, status_code=status.HTTP_201_CREATED)
def register(payload: RegisterRequest, db: Session = Depends(get_db)):
    normalized_email = normalize_email(payload.email)
    workspace_name = payload.organization_name.strip()

    existing_user = db.query(User).filter(User.email == normalized_email).first()
    if existing_user is not None:
        raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail="Email is already in use")

    existing_organization = db.query(Organization).filter(Organization.name == workspace_name).first()

    if payload.signup_type == SignupType.MANAGER:
        if existing_organization is not None:
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail="This company workspace already exists. Ask an admin to add you.",
            )

        organization = Organization(name=workspace_name, status="pending")
        db.add(organization)
        db.flush()

        user = User(
            organization_id=organization.id,
            name=payload.name.strip(),
            email=normalized_email,
            password_hash=hash_password(payload.password),
            role="org_admin",
            status="pending",
            is_active=False,
        )
        db.add(user)
        db.commit()

        return RegisterResponse(
            message=(
                "Your manager account request was submitted. "
                "Konvo will review and approve your company workspace."
            )
        )

    if existing_organization is None or existing_organization.status != "active":
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="This company workspace is not active yet. Ask your company manager or Konvo for help.",
        )

    user = User(
        organization_id=existing_organization.id,
        name=payload.name.strip(),
        email=normalized_email,
        password_hash=hash_password(payload.password),
        role="user",
        status="pending",
        is_active=False,
    )
    db.add(user)
    db.commit()

    return RegisterResponse(
        message="Your employee account request was submitted. Your company manager will review it."
    )


@router.get("/me", response_model=CurrentUserRead)
def get_me(current_user: User = Depends(get_current_user)):
    return serialize_user(current_user)

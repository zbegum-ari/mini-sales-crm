from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.core.security import create_access_token, get_current_user, normalize_email, verify_password
from app.models.user import User
from app.schemas.auth import CurrentUserRead, LoginRequest, LoginResponse

router = APIRouter(prefix="/auth", tags=["auth"])


def serialize_user(user: User) -> CurrentUserRead:
    return CurrentUserRead.model_validate(
        {
            "id": user.id,
            "organization_id": user.organization_id,
            "organization_name": user.organization.name if user.organization else None,
            "name": user.name,
            "email": user.email,
            "role": user.role,
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

    if not user.is_active:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="User is inactive")

    return LoginResponse(access_token=create_access_token(user), user=serialize_user(user))


@router.get("/me", response_model=CurrentUserRead)
def get_me(current_user: User = Depends(get_current_user)):
    return serialize_user(current_user)

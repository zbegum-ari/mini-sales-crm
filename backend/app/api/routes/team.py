from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.core.security import require_org_admin
from app.models.user import User
from app.schemas.auth import TeamUserRead

router = APIRouter(prefix="/team", tags=["team"])


def get_team_user_or_404(user_id: int, current_user: User, db: Session) -> User:
    user = db.get(User, user_id)
    if (
        user is None
        or user.organization_id != current_user.organization_id
        or user.role == "platform_admin"
    ):
        raise HTTPException(status_code=404, detail="User not found")
    return user


def serialize_team_user(user: User) -> TeamUserRead:
    return TeamUserRead(
        id=user.id,
        name=user.name,
        email=user.email,
        role=user.role,
        status=user.status,
        created_at=user.created_at,
    )


@router.get("/pending-employees", response_model=list[TeamUserRead])
def list_pending_employees(
    current_user: User = Depends(require_org_admin),
    db: Session = Depends(get_db),
):
    users = (
        db.query(User)
        .filter(
            User.organization_id == current_user.organization_id,
            User.role == "user",
            User.status == "pending",
        )
        .order_by(User.created_at.asc())
        .all()
    )
    return [serialize_team_user(user) for user in users]


@router.post("/users/{user_id}/approve")
def approve_team_user(
    user_id: int,
    current_user: User = Depends(require_org_admin),
    db: Session = Depends(get_db),
):
    user = get_team_user_or_404(user_id, current_user, db)
    if user.role != "user":
        raise HTTPException(status_code=400, detail="Only employee accounts can be approved here")

    user.status = "active"
    user.is_active = True
    db.commit()
    return {"detail": "User approved"}


@router.post("/users/{user_id}/reject")
def reject_team_user(
    user_id: int,
    current_user: User = Depends(require_org_admin),
    db: Session = Depends(get_db),
):
    user = get_team_user_or_404(user_id, current_user, db)
    if user.role != "user":
        raise HTTPException(status_code=400, detail="Only employee accounts can be rejected here")

    user.status = "rejected"
    user.is_active = False
    db.commit()
    return {"detail": "User rejected"}


@router.get("/users", response_model=list[TeamUserRead])
def list_team_users(
    current_user: User = Depends(require_org_admin),
    db: Session = Depends(get_db),
):
    users = (
        db.query(User)
        .filter(User.organization_id == current_user.organization_id)
        .order_by(User.created_at.asc())
        .all()
    )
    return [serialize_team_user(user) for user in users]

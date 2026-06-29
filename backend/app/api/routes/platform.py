from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy import case, func
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.core.security import require_platform_admin
from app.models.organization import Organization
from app.models.user import User
from app.schemas.auth import OrganizationSummaryRead, PendingManagerRequestRead

router = APIRouter(prefix="/platform", tags=["platform"])


def get_organization_or_404(organization_id: int, db: Session) -> Organization:
    organization = db.get(Organization, organization_id)
    if organization is None:
        raise HTTPException(status_code=404, detail="Organization not found")
    return organization


@router.get("/pending-managers", response_model=list[PendingManagerRequestRead])
def list_pending_managers(
    _: User = Depends(require_platform_admin),
    db: Session = Depends(get_db),
):
    pending_pairs = (
        db.query(Organization, User)
        .join(User, User.organization_id == Organization.id)
        .filter(
            Organization.status == "pending",
            User.role == "org_admin",
            User.status == "pending",
        )
        .order_by(Organization.created_at.asc(), User.created_at.asc())
        .all()
    )

    return [
        PendingManagerRequestRead(
            organization_id=organization.id,
            organization_name=organization.name,
            organization_status=organization.status,
            manager_user_id=user.id,
            manager_name=user.name,
            manager_email=user.email,
            manager_status=user.status,
            created_at=organization.created_at,
        )
        for organization, user in pending_pairs
    ]


@router.post("/organizations/{organization_id}/approve")
def approve_organization(
    organization_id: int,
    _: User = Depends(require_platform_admin),
    db: Session = Depends(get_db),
):
    organization = get_organization_or_404(organization_id, db)
    organization.status = "active"

    pending_managers = (
        db.query(User)
        .filter(
            User.organization_id == organization.id,
            User.role == "org_admin",
            User.status == "pending",
        )
        .all()
    )
    for user in pending_managers:
        user.status = "active"
        user.is_active = True

    db.commit()
    return {"detail": "Organization approved"}


@router.post("/organizations/{organization_id}/reject")
def reject_organization(
    organization_id: int,
    _: User = Depends(require_platform_admin),
    db: Session = Depends(get_db),
):
    organization = get_organization_or_404(organization_id, db)
    organization.status = "rejected"

    pending_managers = (
        db.query(User)
        .filter(
            User.organization_id == organization.id,
            User.role == "org_admin",
            User.status == "pending",
        )
        .all()
    )
    for user in pending_managers:
        user.status = "rejected"
        user.is_active = False

    db.commit()
    return {"detail": "Organization rejected"}


@router.get("/organizations", response_model=list[OrganizationSummaryRead])
def list_organizations(
    _: User = Depends(require_platform_admin),
    db: Session = Depends(get_db),
):
    rows = (
        db.query(
            Organization,
            func.count(User.id).label("user_count"),
            func.sum(case((User.status == "pending", 1), else_=0)).label("pending_user_count"),
        )
        .outerjoin(User, User.organization_id == Organization.id)
        .group_by(Organization.id)
        .order_by(Organization.created_at.asc())
        .all()
    )

    return [
        OrganizationSummaryRead(
            id=organization.id,
            name=organization.name,
            status=organization.status,
            user_count=user_count or 0,
            pending_user_count=pending_user_count or 0,
            created_at=organization.created_at,
        )
        for organization, user_count, pending_user_count in rows
    ]

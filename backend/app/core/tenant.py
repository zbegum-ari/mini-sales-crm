from fastapi import HTTPException
from sqlalchemy.orm import Session

from app.models.organization import Organization
from app.models.user import User

DEMO_ORGANIZATION_NAME = "Demo Organization"


def is_platform_admin(user: User) -> bool:
    return user.role == "platform_admin"


def get_or_create_demo_organization(db: Session) -> Organization:
    organization = (
        db.query(Organization)
        .filter(Organization.name == DEMO_ORGANIZATION_NAME)
        .first()
    )
    if organization is not None:
        return organization

    organization = Organization(name=DEMO_ORGANIZATION_NAME, status="active")
    db.add(organization)
    db.flush()
    return organization


def get_current_organization_id(
    current_user: User,
    db: Session,
    *,
    allow_demo_fallback: bool = False,
) -> int:
    if current_user.organization_id is not None:
        return current_user.organization_id

    if is_platform_admin(current_user) and allow_demo_fallback:
        return get_or_create_demo_organization(db).id

    raise HTTPException(status_code=403, detail="No organization context available")


def can_access_organization(organization_id: int | None, current_user: User) -> bool:
    if is_platform_admin(current_user):
        return True

    return (
        organization_id is not None
        and current_user.organization_id is not None
        and organization_id == current_user.organization_id
    )

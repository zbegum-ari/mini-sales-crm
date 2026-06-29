from fastapi import APIRouter, Depends, HTTPException, Query, Response, status
from sqlalchemy.orm import Session, joinedload

from app.core.database import get_db
from app.core.security import get_current_user
from app.core.tenant import can_access_organization, is_platform_admin
from app.models.company import Company
from app.models.contact import Contact
from app.models.user import User
from app.schemas.contact import ContactCreate, ContactRead, ContactUpdate

router = APIRouter(prefix="/contacts", tags=["contacts"])


def get_company_or_404(company_id: int, db: Session, current_user: User) -> Company:
    company = db.query(Company).filter(Company.id == company_id).first()

    if company is None or not can_access_organization(company.organization_id, current_user):
        raise HTTPException(status_code=404, detail="Company not found")

    return company


def get_contact_or_404(contact_id: int, db: Session, current_user: User) -> Contact:
    contact = (
        db.query(Contact)
        .options(joinedload(Contact.company))
        .filter(Contact.id == contact_id)
        .first()
    )

    if contact is None or not can_access_organization(contact.organization_id, current_user):
        raise HTTPException(status_code=404, detail="Contact not found")

    return contact


@router.get("", response_model=list[ContactRead])
def list_contacts(
    company_id: int | None = Query(default=None),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    query = db.query(Contact).options(joinedload(Contact.company))

    if not is_platform_admin(current_user):
        query = query.filter(Contact.organization_id == current_user.organization_id)

    if company_id is not None:
        query = query.filter(Contact.company_id == company_id)

    return query.order_by(Contact.created_at.desc(), Contact.id.desc()).all()


@router.post("", response_model=ContactRead, status_code=status.HTTP_201_CREATED)
def create_contact(
    contact: ContactCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    company = get_company_or_404(contact.company_id, db, current_user)

    db_contact = Contact(**contact.model_dump(), organization_id=company.organization_id)
    db.add(db_contact)
    db.commit()

    return get_contact_or_404(db_contact.id, db, current_user)


@router.get("/{contact_id}", response_model=ContactRead)
def get_contact(
    contact_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    return get_contact_or_404(contact_id, db, current_user)


@router.put("/{contact_id}", response_model=ContactRead)
def update_contact(
    contact_id: int,
    contact_update: ContactUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    db_contact = get_contact_or_404(contact_id, db, current_user)
    company = get_company_or_404(contact_update.company_id, db, current_user)

    for field, value in contact_update.model_dump().items():
        setattr(db_contact, field, value)
    db_contact.organization_id = company.organization_id

    db.commit()

    return get_contact_or_404(contact_id, db, current_user)


@router.delete("/{contact_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_contact(
    contact_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    db_contact = get_contact_or_404(contact_id, db, current_user)
    db.delete(db_contact)
    db.commit()
    return Response(status_code=status.HTTP_204_NO_CONTENT)

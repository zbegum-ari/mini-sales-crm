from fastapi import APIRouter, Depends, HTTPException, Query, Response, status
from sqlalchemy.orm import Session, joinedload

from app.core.database import get_db
from app.models.company import Company
from app.models.contact import Contact
from app.schemas.contact import ContactCreate, ContactRead, ContactUpdate

router = APIRouter(prefix="/contacts", tags=["contacts"])


def get_company_or_404(company_id: int, db: Session) -> Company:
    company = db.get(Company, company_id)

    if company is None:
        raise HTTPException(status_code=404, detail="Company not found")

    return company


def get_contact_or_404(contact_id: int, db: Session) -> Contact:
    contact = (
        db.query(Contact)
        .options(joinedload(Contact.company))
        .filter(Contact.id == contact_id)
        .first()
    )

    if contact is None:
        raise HTTPException(status_code=404, detail="Contact not found")

    return contact


@router.get("", response_model=list[ContactRead])
def list_contacts(
    company_id: int | None = Query(default=None),
    db: Session = Depends(get_db),
):
    query = db.query(Contact).options(joinedload(Contact.company))

    if company_id is not None:
        query = query.filter(Contact.company_id == company_id)

    return query.order_by(Contact.created_at.desc(), Contact.id.desc()).all()


@router.post("", response_model=ContactRead, status_code=status.HTTP_201_CREATED)
def create_contact(contact: ContactCreate, db: Session = Depends(get_db)):
    get_company_or_404(contact.company_id, db)

    db_contact = Contact(**contact.model_dump())
    db.add(db_contact)
    db.commit()

    return get_contact_or_404(db_contact.id, db)


@router.get("/{contact_id}", response_model=ContactRead)
def get_contact(contact_id: int, db: Session = Depends(get_db)):
    return get_contact_or_404(contact_id, db)


@router.put("/{contact_id}", response_model=ContactRead)
def update_contact(
    contact_id: int,
    contact_update: ContactUpdate,
    db: Session = Depends(get_db),
):
    db_contact = db.get(Contact, contact_id)

    if db_contact is None:
        raise HTTPException(status_code=404, detail="Contact not found")

    get_company_or_404(contact_update.company_id, db)

    for field, value in contact_update.model_dump().items():
        setattr(db_contact, field, value)

    db.commit()

    return get_contact_or_404(contact_id, db)


@router.delete("/{contact_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_contact(contact_id: int, db: Session = Depends(get_db)):
    db_contact = db.get(Contact, contact_id)

    if db_contact is None:
        raise HTTPException(status_code=404, detail="Contact not found")

    db.delete(db_contact)
    db.commit()
    return Response(status_code=status.HTTP_204_NO_CONTENT)

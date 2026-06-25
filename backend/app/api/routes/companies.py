from fastapi import APIRouter, Depends, HTTPException, Response, status
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.models.company import Company
from app.schemas.company import CompanyCreate, CompanyRead, CompanyUpdate

router = APIRouter(prefix="/companies", tags=["companies"])


def get_company_or_404(company_id: int, db: Session) -> Company:
    company = db.get(Company, company_id)

    if company is None:
        raise HTTPException(status_code=404, detail="Company not found")

    return company


@router.get("", response_model=list[CompanyRead])
def list_companies(db: Session = Depends(get_db)):
    return db.query(Company).order_by(Company.created_at.desc(), Company.id.desc()).all()


@router.post("", response_model=CompanyRead, status_code=status.HTTP_201_CREATED)
def create_company(company: CompanyCreate, db: Session = Depends(get_db)):
    db_company = Company(**company.model_dump())
    db.add(db_company)
    db.commit()
    db.refresh(db_company)
    return db_company


@router.get("/{company_id}", response_model=CompanyRead)
def get_company(company_id: int, db: Session = Depends(get_db)):
    return get_company_or_404(company_id, db)


@router.put("/{company_id}", response_model=CompanyRead)
def update_company(
    company_id: int,
    company_update: CompanyUpdate,
    db: Session = Depends(get_db),
):
    db_company = get_company_or_404(company_id, db)

    for field, value in company_update.model_dump(exclude_unset=True).items():
        setattr(db_company, field, value)

    db.commit()
    db.refresh(db_company)
    return db_company


@router.delete("/{company_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_company(company_id: int, db: Session = Depends(get_db)):
    db_company = get_company_or_404(company_id, db)
    db.delete(db_company)
    db.commit()
    return Response(status_code=status.HTTP_204_NO_CONTENT)

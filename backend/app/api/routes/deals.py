from fastapi import APIRouter, Depends, HTTPException, Query, Response, status
from sqlalchemy.orm import Session, joinedload

from app.core.database import get_db
from app.models.company import Company
from app.models.deal import Deal
from app.schemas.deal import DealCreate, DealPipelineStage, DealRead, DealUpdate

router = APIRouter(prefix="/deals", tags=["deals"])


def get_company_or_404(company_id: int, db: Session) -> Company:
    company = db.get(Company, company_id)

    if company is None:
        raise HTTPException(status_code=404, detail="Company not found")

    return company


def get_deal_or_404(deal_id: int, db: Session) -> Deal:
    deal = (
        db.query(Deal)
        .options(joinedload(Deal.company))
        .filter(Deal.id == deal_id)
        .first()
    )

    if deal is None:
        raise HTTPException(status_code=404, detail="Deal not found")

    return deal


@router.get("", response_model=list[DealRead])
def list_deals(
    company_id: int | None = Query(default=None),
    pipeline_stage: DealPipelineStage | None = Query(default=None),
    db: Session = Depends(get_db),
):
    query = db.query(Deal).options(joinedload(Deal.company))

    if company_id is not None:
        query = query.filter(Deal.company_id == company_id)

    if pipeline_stage is not None:
        query = query.filter(Deal.pipeline_stage == pipeline_stage.value)

    return query.order_by(Deal.created_at.desc(), Deal.id.desc()).all()


@router.post("", response_model=DealRead, status_code=status.HTTP_201_CREATED)
def create_deal(deal: DealCreate, db: Session = Depends(get_db)):
    get_company_or_404(deal.company_id, db)

    db_deal = Deal(**deal.model_dump())
    db.add(db_deal)
    db.commit()

    return get_deal_or_404(db_deal.id, db)


@router.get("/{deal_id}", response_model=DealRead)
def get_deal(deal_id: int, db: Session = Depends(get_db)):
    return get_deal_or_404(deal_id, db)


@router.put("/{deal_id}", response_model=DealRead)
def update_deal(
    deal_id: int,
    deal_update: DealUpdate,
    db: Session = Depends(get_db),
):
    db_deal = db.get(Deal, deal_id)

    if db_deal is None:
        raise HTTPException(status_code=404, detail="Deal not found")

    get_company_or_404(deal_update.company_id, db)

    for field, value in deal_update.model_dump().items():
        setattr(db_deal, field, value)

    db.commit()

    return get_deal_or_404(deal_id, db)


@router.delete("/{deal_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_deal(deal_id: int, db: Session = Depends(get_db)):
    db_deal = db.get(Deal, deal_id)

    if db_deal is None:
        raise HTTPException(status_code=404, detail="Deal not found")

    db.delete(db_deal)
    db.commit()
    return Response(status_code=status.HTTP_204_NO_CONTENT)

from fastapi import APIRouter, Depends, HTTPException, Query, Response, status
from sqlalchemy.orm import Session, joinedload

from app.core.database import get_db
from app.core.security import get_current_user
from app.core.tenant import can_access_organization, is_platform_admin
from app.models.activity import Activity
from app.models.company import Company
from app.models.deal import Deal
from app.models.task import Task
from app.models.user import User
from app.schemas.deal import DealCreate, DealPipelineStage, DealRead, DealUpdate

router = APIRouter(prefix="/deals", tags=["deals"])


def get_company_or_404(company_id: int, db: Session, current_user: User) -> Company:
    company = db.query(Company).filter(Company.id == company_id).first()

    if company is None or not can_access_organization(company.organization_id, current_user):
        raise HTTPException(status_code=404, detail="Company not found")

    return company


def get_deal_or_404(deal_id: int, db: Session, current_user: User) -> Deal:
    deal = (
        db.query(Deal)
        .options(joinedload(Deal.company))
        .filter(Deal.id == deal_id)
        .first()
    )

    if deal is None or not can_access_organization(deal.organization_id, current_user):
        raise HTTPException(status_code=404, detail="Deal not found")

    return deal


@router.get("", response_model=list[DealRead])
def list_deals(
    company_id: int | None = Query(default=None),
    pipeline_stage: DealPipelineStage | None = Query(default=None),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    query = db.query(Deal).options(joinedload(Deal.company))

    if not is_platform_admin(current_user):
        query = query.filter(Deal.organization_id == current_user.organization_id)

    if company_id is not None:
        query = query.filter(Deal.company_id == company_id)

    if pipeline_stage is not None:
        query = query.filter(Deal.pipeline_stage == pipeline_stage.value)

    return query.order_by(Deal.created_at.desc(), Deal.id.desc()).all()


@router.post("", response_model=DealRead, status_code=status.HTTP_201_CREATED)
def create_deal(
    deal: DealCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    company = get_company_or_404(deal.company_id, db, current_user)

    db_deal = Deal(**deal.model_dump(), organization_id=company.organization_id)
    db.add(db_deal)
    db.commit()

    return get_deal_or_404(db_deal.id, db, current_user)


@router.get("/{deal_id}", response_model=DealRead)
def get_deal(
    deal_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    return get_deal_or_404(deal_id, db, current_user)


@router.put("/{deal_id}", response_model=DealRead)
def update_deal(
    deal_id: int,
    deal_update: DealUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    db_deal = get_deal_or_404(deal_id, db, current_user)
    company = get_company_or_404(deal_update.company_id, db, current_user)

    for field, value in deal_update.model_dump().items():
        setattr(db_deal, field, value)
    db_deal.organization_id = company.organization_id

    db.commit()

    return get_deal_or_404(deal_id, db, current_user)


@router.delete("/{deal_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_deal(
    deal_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    db_deal = get_deal_or_404(deal_id, db, current_user)

    for activity in db.query(Activity).filter(Activity.deal_id == deal_id).all():
        activity.deal_id = None

    for task in db.query(Task).filter(Task.deal_id == deal_id).all():
        task.deal_id = None

    db.delete(db_deal)
    db.commit()
    return Response(status_code=status.HTTP_204_NO_CONTENT)

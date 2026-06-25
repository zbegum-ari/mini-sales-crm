from fastapi import APIRouter, Depends, HTTPException, Query, Response, status
from sqlalchemy.orm import Session, joinedload

from app.core.database import get_db
from app.models.activity import Activity
from app.models.company import Company
from app.models.deal import Deal
from app.schemas.activity import ActivityCreate, ActivityRead, ActivityType, ActivityUpdate

router = APIRouter(prefix="/activities", tags=["activities"])


def get_company_or_404(company_id: int, db: Session) -> Company:
    company = db.get(Company, company_id)

    if company is None:
        raise HTTPException(status_code=404, detail="Company not found")

    return company


def get_deal_or_404(deal_id: int, db: Session) -> Deal:
    deal = db.get(Deal, deal_id)

    if deal is None:
        raise HTTPException(status_code=404, detail="Deal not found")

    return deal


def validate_deal_company_match(
    deal_id: int | None,
    company_id: int,
    db: Session,
) -> Deal | None:
    if deal_id is None:
        return None

    deal = get_deal_or_404(deal_id, db)

    if deal.company_id != company_id:
        raise HTTPException(
            status_code=400,
            detail="Selected deal does not belong to the selected company",
        )

    return deal


def get_activity_or_404(activity_id: int, db: Session) -> Activity:
    activity = (
        db.query(Activity)
        .options(joinedload(Activity.company), joinedload(Activity.deal))
        .filter(Activity.id == activity_id)
        .first()
    )

    if activity is None:
        raise HTTPException(status_code=404, detail="Activity not found")

    return activity


@router.get("", response_model=list[ActivityRead])
def list_activities(
    company_id: int | None = Query(default=None),
    deal_id: int | None = Query(default=None),
    activity_type: ActivityType | None = Query(default=None),
    db: Session = Depends(get_db),
):
    query = db.query(Activity).options(joinedload(Activity.company), joinedload(Activity.deal))

    if company_id is not None:
        query = query.filter(Activity.company_id == company_id)

    if deal_id is not None:
        query = query.filter(Activity.deal_id == deal_id)

    if activity_type is not None:
        query = query.filter(Activity.activity_type == activity_type.value)

    return query.order_by(Activity.activity_date.desc(), Activity.created_at.desc()).all()


@router.post("", response_model=ActivityRead, status_code=status.HTTP_201_CREATED)
def create_activity(activity: ActivityCreate, db: Session = Depends(get_db)):
    get_company_or_404(activity.company_id, db)
    validate_deal_company_match(activity.deal_id, activity.company_id, db)

    db_activity = Activity(**activity.model_dump())
    db.add(db_activity)
    db.commit()

    return get_activity_or_404(db_activity.id, db)


@router.get("/{activity_id}", response_model=ActivityRead)
def get_activity(activity_id: int, db: Session = Depends(get_db)):
    return get_activity_or_404(activity_id, db)


@router.put("/{activity_id}", response_model=ActivityRead)
def update_activity(
    activity_id: int,
    activity_update: ActivityUpdate,
    db: Session = Depends(get_db),
):
    db_activity = db.get(Activity, activity_id)

    if db_activity is None:
        raise HTTPException(status_code=404, detail="Activity not found")

    get_company_or_404(activity_update.company_id, db)
    validate_deal_company_match(activity_update.deal_id, activity_update.company_id, db)

    for field, value in activity_update.model_dump().items():
        setattr(db_activity, field, value)

    db.commit()

    return get_activity_or_404(activity_id, db)


@router.delete("/{activity_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_activity(activity_id: int, db: Session = Depends(get_db)):
    db_activity = db.get(Activity, activity_id)

    if db_activity is None:
        raise HTTPException(status_code=404, detail="Activity not found")

    db.delete(db_activity)
    db.commit()
    return Response(status_code=status.HTTP_204_NO_CONTENT)

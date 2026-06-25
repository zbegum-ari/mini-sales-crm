from datetime import date

from fastapi import APIRouter, Depends
from sqlalchemy import func
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.models.company import Company
from app.models.contact import Contact
from app.models.deal import Deal
from app.models.task import Task

router = APIRouter(prefix="/dashboard", tags=["dashboard"])


@router.get("/summary")
def get_dashboard_summary(db: Session = Depends(get_db)):
    open_deal_filter = ~Deal.pipeline_stage.in_(["Won", "Lost"])

    total_companies = db.query(func.count(Company.id)).scalar() or 0
    total_contacts = db.query(func.count(Contact.id)).scalar() or 0
    total_open_deals = db.query(func.count(Deal.id)).filter(open_deal_filter).scalar() or 0
    total_won_deals = db.query(func.count(Deal.id)).filter(Deal.pipeline_stage == "Won").scalar() or 0
    total_lost_deals = db.query(func.count(Deal.id)).filter(Deal.pipeline_stage == "Lost").scalar() or 0
    total_open_pipeline_value = (
        db.query(func.coalesce(func.sum(Deal.value), 0))
        .filter(open_deal_filter)
        .scalar()
        or 0
    )
    total_open_tasks = db.query(func.count(Task.id)).filter(Task.status == "Open").scalar() or 0
    total_overdue_tasks = (
        db.query(func.count(Task.id))
        .filter(Task.status == "Open", Task.due_date < date.today())
        .scalar()
        or 0
    )

    return {
        "total_companies": total_companies,
        "total_contacts": total_contacts,
        "total_open_deals": total_open_deals,
        "total_won_deals": total_won_deals,
        "total_lost_deals": total_lost_deals,
        "total_open_pipeline_value": total_open_pipeline_value,
        "total_open_tasks": total_open_tasks,
        "total_overdue_tasks": total_overdue_tasks,
    }

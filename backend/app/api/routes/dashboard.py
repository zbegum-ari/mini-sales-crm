from datetime import date

from fastapi import APIRouter, Depends
from sqlalchemy import func
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.core.security import get_current_user
from app.core.tenant import is_platform_admin
from app.models.company import Company
from app.models.contact import Contact
from app.models.deal import Deal
from app.models.task import Task
from app.models.user import User

router = APIRouter(prefix="/dashboard", tags=["dashboard"])


@router.get("/summary")
def get_dashboard_summary(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    open_deal_filter = ~Deal.pipeline_stage.in_(["Won", "Lost"])

    companies_query = db.query(func.count(Company.id))
    contacts_query = db.query(func.count(Contact.id))
    open_deals_query = db.query(func.count(Deal.id)).filter(open_deal_filter)
    won_deals_query = db.query(func.count(Deal.id)).filter(Deal.pipeline_stage == "Won")
    lost_deals_query = db.query(func.count(Deal.id)).filter(Deal.pipeline_stage == "Lost")
    pipeline_value_query = db.query(func.coalesce(func.sum(Deal.value), 0)).filter(open_deal_filter)
    open_tasks_query = db.query(func.count(Task.id)).filter(Task.status == "Open")
    overdue_tasks_query = db.query(func.count(Task.id)).filter(
        Task.status == "Open",
        Task.due_date < date.today(),
    )

    if not is_platform_admin(current_user):
        organization_id = current_user.organization_id
        companies_query = companies_query.filter(Company.organization_id == organization_id)
        contacts_query = contacts_query.filter(Contact.organization_id == organization_id)
        open_deals_query = open_deals_query.filter(Deal.organization_id == organization_id)
        won_deals_query = won_deals_query.filter(Deal.organization_id == organization_id)
        lost_deals_query = lost_deals_query.filter(Deal.organization_id == organization_id)
        pipeline_value_query = pipeline_value_query.filter(Deal.organization_id == organization_id)
        open_tasks_query = open_tasks_query.filter(Task.organization_id == organization_id)
        overdue_tasks_query = overdue_tasks_query.filter(Task.organization_id == organization_id)

    total_companies = companies_query.scalar() or 0
    total_contacts = contacts_query.scalar() or 0
    total_open_deals = open_deals_query.scalar() or 0
    total_won_deals = won_deals_query.scalar() or 0
    total_lost_deals = lost_deals_query.scalar() or 0
    total_open_pipeline_value = pipeline_value_query.scalar() or 0
    total_open_tasks = open_tasks_query.scalar() or 0
    total_overdue_tasks = overdue_tasks_query.scalar() or 0

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

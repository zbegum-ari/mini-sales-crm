from datetime import date

from fastapi import APIRouter, Depends, HTTPException, Query, Response, status
from sqlalchemy.orm import Session, joinedload

from app.core.database import get_db
from app.core.security import get_current_user
from app.core.tenant import can_access_organization, is_platform_admin
from app.models.company import Company
from app.models.deal import Deal
from app.models.task import Task
from app.models.user import User
from app.schemas.task import TaskCreate, TaskRead, TaskStatus, TaskUpdate

router = APIRouter(prefix="/tasks", tags=["tasks"])


def get_company_or_404(company_id: int, db: Session, current_user: User) -> Company:
    company = db.query(Company).filter(Company.id == company_id).first()

    if company is None or not can_access_organization(company.organization_id, current_user):
        raise HTTPException(status_code=404, detail="Company not found")

    return company


def get_deal_or_404(deal_id: int, db: Session, current_user: User) -> Deal:
    deal = db.query(Deal).filter(Deal.id == deal_id).first()

    if deal is None or not can_access_organization(deal.organization_id, current_user):
        raise HTTPException(status_code=404, detail="Deal not found")

    return deal


def validate_deal_company_match(
    deal_id: int | None,
    company_id: int,
    db: Session,
    current_user: User,
) -> Deal | None:
    if deal_id is None:
        return None

    deal = get_deal_or_404(deal_id, db, current_user)

    if deal.company_id != company_id:
        raise HTTPException(
            status_code=400,
            detail="Selected deal does not belong to the selected company",
        )

    return deal


def get_task_or_404(task_id: int, db: Session, current_user: User) -> Task:
    task = (
        db.query(Task)
        .options(joinedload(Task.company), joinedload(Task.deal))
        .filter(Task.id == task_id)
        .first()
    )

    if task is None or not can_access_organization(task.organization_id, current_user):
        raise HTTPException(status_code=404, detail="Task not found")

    return task


@router.get("", response_model=list[TaskRead])
def list_tasks(
    company_id: int | None = Query(default=None),
    deal_id: int | None = Query(default=None),
    status: TaskStatus | None = Query(default=None),
    overdue: bool = Query(default=False),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    query = db.query(Task).options(joinedload(Task.company), joinedload(Task.deal))

    if not is_platform_admin(current_user):
        query = query.filter(Task.organization_id == current_user.organization_id)

    if company_id is not None:
        query = query.filter(Task.company_id == company_id)

    if deal_id is not None:
        query = query.filter(Task.deal_id == deal_id)

    if status is not None:
        query = query.filter(Task.status == status.value)

    if overdue:
        query = query.filter(Task.due_date < date.today(), Task.status == TaskStatus.OPEN.value)

    return query.order_by(Task.due_date.asc(), Task.created_at.desc()).all()


@router.post("", response_model=TaskRead, status_code=status.HTTP_201_CREATED)
def create_task(
    task: TaskCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    company = get_company_or_404(task.company_id, db, current_user)
    validate_deal_company_match(task.deal_id, task.company_id, db, current_user)

    db_task = Task(**task.model_dump(), organization_id=company.organization_id)
    db.add(db_task)
    db.commit()

    return get_task_or_404(db_task.id, db, current_user)


@router.get("/{task_id}", response_model=TaskRead)
def get_task(
    task_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    return get_task_or_404(task_id, db, current_user)


@router.put("/{task_id}", response_model=TaskRead)
def update_task(
    task_id: int,
    task_update: TaskUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    db_task = get_task_or_404(task_id, db, current_user)
    company = get_company_or_404(task_update.company_id, db, current_user)
    validate_deal_company_match(
        task_update.deal_id,
        task_update.company_id,
        db,
        current_user,
    )

    for field, value in task_update.model_dump().items():
        setattr(db_task, field, value)
    db_task.organization_id = company.organization_id

    db.commit()

    return get_task_or_404(task_id, db, current_user)


@router.delete("/{task_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_task(
    task_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    db_task = get_task_or_404(task_id, db, current_user)
    db.delete(db_task)
    db.commit()
    return Response(status_code=status.HTTP_204_NO_CONTENT)

from datetime import date, datetime
from enum import Enum

from pydantic import BaseModel, ConfigDict

from app.schemas.company import RequiredText


class TaskStatus(str, Enum):
    OPEN = "Open"
    COMPLETED = "Completed"
    CANCELLED = "Cancelled"


class TaskBase(BaseModel):
    company_id: int
    deal_id: int | None = None
    title: RequiredText
    description: str | None = None
    due_date: date
    status: TaskStatus


class TaskCreate(TaskBase):
    pass


class TaskUpdate(TaskBase):
    pass


class TaskCompanyRead(BaseModel):
    id: int
    name: str

    model_config = ConfigDict(from_attributes=True)


class TaskDealRead(BaseModel):
    id: int
    title: str

    model_config = ConfigDict(from_attributes=True)


class TaskRead(BaseModel):
    id: int
    company_id: int
    deal_id: int | None = None
    title: str
    description: str | None = None
    due_date: date
    status: TaskStatus
    company: TaskCompanyRead
    deal: TaskDealRead | None = None
    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True)

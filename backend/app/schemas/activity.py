from datetime import date, datetime
from enum import Enum

from pydantic import BaseModel, ConfigDict

from app.schemas.company import RequiredText


class ActivityType(str, Enum):
    NOTE = "Note"
    CALL = "Call"
    MEETING = "Meeting"
    EMAIL = "Email"
    FOLLOW_UP = "Follow-up"


class ActivityBase(BaseModel):
    company_id: int
    deal_id: int | None = None
    activity_type: ActivityType
    note: RequiredText
    activity_date: date


class ActivityCreate(ActivityBase):
    pass


class ActivityUpdate(ActivityBase):
    pass


class ActivityCompanyRead(BaseModel):
    id: int
    name: str

    model_config = ConfigDict(from_attributes=True)


class ActivityDealRead(BaseModel):
    id: int
    title: str

    model_config = ConfigDict(from_attributes=True)


class ActivityRead(BaseModel):
    id: int
    company_id: int
    deal_id: int | None = None
    activity_type: ActivityType
    note: str
    activity_date: date
    company: ActivityCompanyRead
    deal: ActivityDealRead | None = None
    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True)

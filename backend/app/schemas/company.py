from datetime import datetime
from enum import Enum
from typing import Annotated

from pydantic import BaseModel, ConfigDict, StringConstraints


class CompanyStatus(str, Enum):
    LEAD = "Lead"
    ACTIVE = "Active"
    INACTIVE = "Inactive"
    CUSTOMER = "Customer"
    LOST = "Lost"


class CompanySize(str, Enum):
    UNKNOWN = "Unknown"
    ONE_TO_TEN = "1-10"
    ELEVEN_TO_FIFTY = "11-50"
    FIFTY_ONE_TO_TWO_HUNDRED = "51-200"
    TWO_HUNDRED_ONE_TO_FIVE_HUNDRED = "201-500"
    FIVE_HUNDRED_PLUS = "500+"


RequiredText = Annotated[str, StringConstraints(strip_whitespace=True, min_length=1)]


class CompanyCreate(BaseModel):
    name: RequiredText
    industry: RequiredText
    company_size: CompanySize
    status: CompanyStatus
    website: RequiredText
    phone: str | None = None
    email: str | None = None
    notes: str | None = None


class CompanyUpdate(BaseModel):
    name: RequiredText
    industry: RequiredText
    company_size: CompanySize
    status: CompanyStatus
    website: RequiredText
    phone: str | None = None
    email: str | None = None
    notes: str | None = None


class CompanyRead(BaseModel):
    id: int
    name: str
    industry: str | None = None
    company_size: CompanySize | None = None
    status: CompanyStatus
    website: str | None = None
    phone: str | None = None
    email: str | None = None
    notes: str | None = None
    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True)

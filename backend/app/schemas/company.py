from datetime import datetime

from pydantic import BaseModel, ConfigDict


class CompanyCreate(BaseModel):
    name: str
    industry: str | None = None
    website: str | None = None
    phone: str | None = None
    email: str | None = None
    notes: str | None = None


class CompanyUpdate(BaseModel):
    name: str | None = None
    industry: str | None = None
    website: str | None = None
    phone: str | None = None
    email: str | None = None
    notes: str | None = None


class CompanyRead(BaseModel):
    id: int
    name: str
    industry: str | None = None
    website: str | None = None
    phone: str | None = None
    email: str | None = None
    notes: str | None = None
    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True)

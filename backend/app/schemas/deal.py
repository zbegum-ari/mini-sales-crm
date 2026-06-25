from datetime import date, datetime
from enum import Enum

from pydantic import BaseModel, ConfigDict, field_validator

from app.schemas.company import RequiredText


class DealPipelineStage(str, Enum):
    LEAD = "Lead"
    QUALIFIED = "Qualified"
    PROPOSAL = "Proposal"
    NEGOTIATION = "Negotiation"
    WON = "Won"
    LOST = "Lost"


class DealBase(BaseModel):
    company_id: int
    title: RequiredText
    value: float
    pipeline_stage: DealPipelineStage
    expected_close_date: date
    notes: str | None = None

    @field_validator("value")
    @classmethod
    def validate_value(cls, value: float) -> float:
        if value <= 0:
            raise ValueError("Deal value must be a positive number.")

        return value


class DealCreate(DealBase):
    pass


class DealUpdate(DealBase):
    pass


class DealCompanyRead(BaseModel):
    id: int
    name: str

    model_config = ConfigDict(from_attributes=True)


class DealRead(BaseModel):
    id: int
    company_id: int
    title: str
    value: float
    pipeline_stage: DealPipelineStage
    expected_close_date: date
    notes: str | None = None
    company: DealCompanyRead
    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True)

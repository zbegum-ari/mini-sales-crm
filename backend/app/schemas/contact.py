from datetime import datetime

from pydantic import BaseModel, ConfigDict, EmailStr, field_validator

from app.schemas.company import RequiredText


class ContactBase(BaseModel):
    company_id: int
    first_name: RequiredText
    last_name: RequiredText
    email: EmailStr
    phone: str
    job_title: RequiredText
    notes: str | None = None

    @field_validator("phone")
    @classmethod
    def validate_phone(cls, value: str) -> str:
        cleaned_value = value.strip()

        if not cleaned_value.isdigit() or len(cleaned_value) not in {10, 11}:
            raise ValueError(
                "Phone must contain only digits and be 10 or 11 digits long."
            )

        return cleaned_value


class ContactCreate(ContactBase):
    pass


class ContactUpdate(ContactBase):
    pass


class ContactCompanyRead(BaseModel):
    id: int
    name: str

    model_config = ConfigDict(from_attributes=True)


class ContactRead(BaseModel):
    id: int
    company_id: int
    first_name: str
    last_name: str
    email: EmailStr
    phone: str
    job_title: str
    notes: str | None = None
    company: ContactCompanyRead
    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True)

from datetime import datetime
from enum import Enum
from typing import Annotated

from pydantic import BaseModel, ConfigDict, EmailStr, StringConstraints


class OrganizationStatus(str, Enum):
    ACTIVE = "active"
    INACTIVE = "inactive"


class UserRole(str, Enum):
    PLATFORM_ADMIN = "platform_admin"
    ORG_ADMIN = "org_admin"
    USER = "user"


PasswordText = Annotated[str, StringConstraints(strip_whitespace=True, min_length=8)]


class LoginRequest(BaseModel):
    email: EmailStr
    password: PasswordText


class CurrentUserRead(BaseModel):
    id: int
    organization_id: int | None = None
    organization_name: str | None = None
    name: str
    email: EmailStr
    role: UserRole
    is_active: bool
    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True)


class LoginResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: CurrentUserRead

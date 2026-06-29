from datetime import datetime
from enum import Enum
from typing import Annotated

from pydantic import BaseModel, ConfigDict, EmailStr, StringConstraints


class OrganizationStatus(str, Enum):
    PENDING = "pending"
    ACTIVE = "active"
    REJECTED = "rejected"
    INACTIVE = "inactive"


class UserRole(str, Enum):
    PLATFORM_ADMIN = "platform_admin"
    ORG_ADMIN = "org_admin"
    USER = "user"


class UserStatus(str, Enum):
    PENDING = "pending"
    ACTIVE = "active"
    REJECTED = "rejected"
    INACTIVE = "inactive"


class SignupType(str, Enum):
    MANAGER = "manager"
    EMPLOYEE = "employee"


PasswordText = Annotated[str, StringConstraints(strip_whitespace=True, min_length=8)]
RequiredText = Annotated[str, StringConstraints(strip_whitespace=True, min_length=1)]


class LoginRequest(BaseModel):
    email: EmailStr
    password: PasswordText


class RegisterRequest(BaseModel):
    signup_type: SignupType
    organization_name: RequiredText
    name: RequiredText
    email: EmailStr
    password: PasswordText


class RegisterResponse(BaseModel):
    message: str


class CurrentUserRead(BaseModel):
    id: int
    organization_id: int | None = None
    organization_name: str | None = None
    organization_status: OrganizationStatus | None = None
    name: str
    email: EmailStr
    role: UserRole
    status: UserStatus
    is_active: bool
    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True)


class LoginResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: CurrentUserRead


class PendingManagerRequestRead(BaseModel):
    organization_id: int
    organization_name: str
    organization_status: OrganizationStatus
    manager_user_id: int
    manager_name: str
    manager_email: EmailStr
    manager_status: UserStatus
    created_at: datetime


class OrganizationSummaryRead(BaseModel):
    id: int
    name: str
    status: OrganizationStatus
    user_count: int
    pending_user_count: int
    created_at: datetime


class TeamUserRead(BaseModel):
    id: int
    name: str
    email: EmailStr
    role: UserRole
    status: UserStatus
    created_at: datetime

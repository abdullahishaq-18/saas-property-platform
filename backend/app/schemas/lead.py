from datetime import datetime

from pydantic import BaseModel, EmailStr, Field


class LeadBase(BaseModel):
    name: str = Field(min_length=1, max_length=255)
    email: EmailStr
    source: str = Field(default="website", max_length=100)
    status: str = Field(default="new", max_length=50)


class LeadCreate(LeadBase):
    pass


class LeadRead(LeadBase):
    id: int
    owner_id: int
    created_at: datetime

    model_config = {"from_attributes": True}

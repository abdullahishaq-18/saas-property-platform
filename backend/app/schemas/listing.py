from datetime import datetime

from pydantic import BaseModel, Field


class ListingBase(BaseModel):
    title: str = Field(min_length=1, max_length=255)
    location: str = Field(min_length=1, max_length=255)
    price: float = Field(gt=0)
    size: int = Field(gt=0)
    description: str = Field(default="", max_length=5000)


class ListingCreate(ListingBase):
    pass

class ListingUpdate(BaseModel):
    title: str | None = Field(default=None, min_length=1, max_length=255)
    location: str | None = Field(default=None, min_length=1, max_length=255)
    price: float | None = Field(default=None, gt=0)
    size: int | None = Field(default=None, gt=0)
    description: str | None = Field(default=None, max_length=5000)

class ListingRead(ListingBase):
    id: int
    generated_description: str | None = None
    created_at: datetime
    updated_at: datetime

    model_config = {"from_attributes": True}

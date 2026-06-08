from typing import Annotated

from fastapi import APIRouter, Depends, status
from sqlalchemy.orm import Session

from app.api.deps import get_db
from app.schemas.listing import ListingCreate, ListingRead
from app.services.listing_service import ListingService

router = APIRouter()


def get_listing_service(
    db: Annotated[Session, Depends(get_db)]
) -> ListingService:
    return ListingService(db)


@router.get("", response_model=list[ListingRead])
def read_listings(
    listing_service: Annotated[ListingService, Depends(get_listing_service)]
):
    return listing_service.list_listings()


@router.post("", response_model=ListingRead, status_code=status.HTTP_201_CREATED)
def add_listing(
    payload: ListingCreate,
    listing_service: Annotated[ListingService, Depends(get_listing_service)]
):
    return listing_service.create_listing(payload)

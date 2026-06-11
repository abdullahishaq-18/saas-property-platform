from typing import Annotated

from fastapi import APIRouter, Depends, Response, status
from sqlalchemy.orm import Session

from app.api.deps import get_current_user, get_db
from app.models.user import User
from app.schemas.listing import (
    ListingCreate,
    ListingRead,
    ListingUpdate,
)
from app.services.listing_service import ListingService

router = APIRouter()


def get_listing_service(
    db: Annotated[Session, Depends(get_db)]
) -> ListingService:
    return ListingService(db)


@router.get("", response_model=list[ListingRead])
def read_listings(
    listing_service: Annotated[
        ListingService,
        Depends(get_listing_service)
    ]
):
    return listing_service.list_listings()


@router.get("/{listing_id}", response_model=ListingRead)
def read_listing(
    listing_id: int,
    listing_service: Annotated[
        ListingService,
        Depends(get_listing_service)
    ]
):
    return listing_service.get_listing(listing_id)


@router.post(
    "",
    response_model=ListingRead,
    status_code=status.HTTP_201_CREATED
)
def add_listing(
    payload: ListingCreate,
    listing_service: Annotated[
        ListingService,
        Depends(get_listing_service)
    ],
    current_user: Annotated[
        User,
        Depends(get_current_user)
    ]
):
    return listing_service.create_listing(
        payload,
        current_user
    )


@router.patch("/{listing_id}", response_model=ListingRead)
def update_listing(
    listing_id: int,
    payload: ListingUpdate,
    listing_service: Annotated[
        ListingService,
        Depends(get_listing_service)
    ],
    current_user: Annotated[
        User,
        Depends(get_current_user)
    ]
):
    return listing_service.update_listing(
        listing_id,
        payload,
        current_user
    )


@router.delete(
    "/{listing_id}",
    status_code=status.HTTP_204_NO_CONTENT
)
def delete_listing(
    listing_id: int,
    listing_service: Annotated[
        ListingService,
        Depends(get_listing_service)
    ],
    current_user: Annotated[
        User,
        Depends(get_current_user)
    ]
):
    listing_service.delete_listing(
        listing_id,
        current_user
    )

    return Response(
        status_code=status.HTTP_204_NO_CONTENT
    )

@router.post(
    "/{listing_id}/generate-description",
    response_model=ListingRead
)
def generate_listing_description(
    listing_id: int,
    listing_service: Annotated[
        ListingService,
        Depends(get_listing_service)
    ],
    current_user: Annotated[
        User,
        Depends(get_current_user)
    ]
):
    return listing_service.generate_description(
        listing_id,
        current_user
    )

@router.post(
    "/{listing_id}/investment-analysis"
)
def investment_analysis(
    listing_id: int,
    listing_service: Annotated[
        ListingService,
        Depends(get_listing_service)
    ],
    current_user: Annotated[
        User,
        Depends(get_current_user)
    ]
):
    return {
        "analysis":
        listing_service.investment_analysis(
            listing_id,
            current_user
        )
    }
from typing import Annotated

from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.api.deps import get_current_user, get_db
from app.models.lead import Lead
from app.models.listing import Listing
from app.models.user import User

router = APIRouter()


@router.get("/stats")
def dashboard_stats(
    db: Annotated[Session, Depends(get_db)],
    current_user: Annotated[
        User,
        Depends(get_current_user)
    ]
):
    listings = (
        db.query(Listing)
        .filter(
            Listing.owner_id == current_user.id
        )
        .count()
    )

    leads = (
        db.query(Lead)
        .filter(
            Lead.owner_id == current_user.id
        )
        .count()
    )

    hot = (
        db.query(Lead)
        .filter(
            Lead.owner_id == current_user.id,
            Lead.lead_score == "HOT"
        )
        .count()
    )

    warm = (
        db.query(Lead)
        .filter(
            Lead.owner_id == current_user.id,
            Lead.lead_score == "WARM"
        )
        .count()
    )

    cold = (
        db.query(Lead)
        .filter(
            Lead.owner_id == current_user.id,
            Lead.lead_score == "COLD"
        )
        .count()
    )

    return {
        "total_listings": listings,
        "total_leads": leads,
        "hot_leads": hot,
        "warm_leads": warm,
        "cold_leads": cold
    }
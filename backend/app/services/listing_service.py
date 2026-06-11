from fastapi import HTTPException, status
from app.schemas.listing import ListingCreate, ListingUpdate
import logging
from typing import Any

from openai import OpenAI, OpenAIError
from sqlalchemy.exc import SQLAlchemyError
from sqlalchemy.orm import Session

from app.core.config import settings
from app.models.listing import Listing
from app.models.user import User
from app.schemas.listing import ListingCreate
from app.services.ai_service import generate_property_description
logger = logging.getLogger(__name__)


def generate_listing_description(listing_data: dict[str, Any]) -> str | None:
    if not settings.OPENAI_API_KEY:
        logger.info("Skipping AI listing description generation: OPENAI_API_KEY is not set")
        return None

    prompt = _build_listing_description_prompt(listing_data)
    client = OpenAI(api_key=settings.OPENAI_API_KEY)

    try:
        response = client.responses.create(
            model=settings.OPENAI_MODEL,
            instructions=(
                "You write concise, professional real estate listing copy. "
                "Emphasize investment potential, likely ROI drivers, and location advantages. "
                "Avoid unsupported claims, guarantees, markdown, and exaggerated hype."
            ),
            input=prompt,
            max_output_tokens=180,
            store=False
        )
    except OpenAIError:
        logger.warning("OpenAI listing description generation failed", exc_info=True)
        return None

    generated_text = getattr(response, "output_text", None)
    if not generated_text:
        logger.warning("OpenAI listing description generation returned no text")
        return None

    return generated_text.strip() or None


def _build_listing_description_prompt(listing_data: dict[str, Any]) -> str:
    return (
        "Generate a concise but persuasive real estate description for this property.\n"
        f"Title: {listing_data.get('title')}\n"
        f"Location: {listing_data.get('location')}\n"
        f"Price: {listing_data.get('price')}\n"
        f"Size: {listing_data.get('size')}\n"
        "Mention investment potential, ROI considerations, and location advantages. "
        "Keep it to 2-4 polished sentences."
    )



class ListingService:
    def __init__(self, db: Session):
        self.db = db

    def list_listings(self) -> list[Listing]:
        return self.db.query(Listing).order_by(Listing.id.desc()).all()

    def get_listing(self, listing_id: int) -> Listing:
        listing = self.db.get(Listing, listing_id)

        if listing is None:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Listing not found"
            )

        return listing

    def create_listing(self, payload: ListingCreate, owner: User) -> Listing:
        listing = Listing(
            **self._prepare_listing_data(payload),
            owner_id=owner.id
        )

        try:
            self.db.add(listing)
            self.db.commit()
            self.db.refresh(listing)
        except SQLAlchemyError:
            self.db.rollback()
            raise

        return listing

    def update_listing(
        self,
        listing_id: int,
        payload: ListingUpdate,
        current_user: User
    ) -> Listing:

        listing = self.get_listing(listing_id)

        if listing.owner_id != current_user.id:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Not authorized to modify this listing"
            )

        updates = payload.model_dump(exclude_unset=True)

        for field, value in updates.items():
            setattr(listing, field, value)

        try:
            self.db.commit()
            self.db.refresh(listing)
        except SQLAlchemyError:
            self.db.rollback()
            raise

        return listing

    def delete_listing(
        self,
        listing_id: int,
        current_user: User
    ) -> None:

        listing = self.get_listing(listing_id)

        if listing.owner_id != current_user.id:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Not authorized to delete this listing"
            )

        try:
            self.db.delete(listing)
            self.db.commit()
        except SQLAlchemyError:
            self.db.rollback()
            raise

    def generate_description(
        self,
        listing_id: int,
        current_user: User
    ) -> Listing:

        listing = self.get_listing(listing_id)
    
        if listing.owner_id != current_user.id:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Not authorized"
            )

        description = generate_property_description(
            listing.title,
            listing.location,
            listing.price,
            listing.size
        )
        listing.generated_description = description

        self.db.commit()
        self.db.refresh(listing)

        return listing
    
    def _prepare_listing_data(self, payload: ListingCreate) -> dict[str, Any]:
        data = payload.model_dump()
        data["description"] = data.get("description", "").strip()

        if not data["description"]:
            generated_description = generate_listing_description(data)

            if generated_description:
                data["description"] = generated_description
                data["generated_description"] = generated_description
            else:
                data["generated_description"] = None

        return data
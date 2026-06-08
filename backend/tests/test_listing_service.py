from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker

from app.db.base import Base
from app.schemas.listing import ListingCreate
from app.services import listing_service
from app.services.listing_service import ListingService


def make_service():
    engine = create_engine("sqlite+pysqlite:///:memory:")
    Base.metadata.create_all(bind=engine)
    session = sessionmaker(bind=engine)()
    return ListingService(session), session


def test_create_listing_generates_description_when_empty(monkeypatch):
    service, session = make_service()
    generated = "A polished AI-generated investment description."
    monkeypatch.setattr(
        listing_service,
        "generate_listing_description",
        lambda listing_data: generated
    )

    listing = service.create_listing(
        ListingCreate(
            title="Downtown Studio",
            location="Downtown",
            price=225000,
            size=740,
            description=""
        )
    )

    assert listing.description == generated
    assert listing.generated_description == generated
    session.close()


def test_create_listing_keeps_provided_description(monkeypatch):
    service, session = make_service()
    monkeypatch.setattr(
        listing_service,
        "generate_listing_description",
        lambda listing_data: "Should not be used"
    )

    listing = service.create_listing(
        ListingCreate(
            title="Parkside Unit",
            location="Midtown",
            price=310000,
            size=980,
            description="Existing owner-provided description."
        )
    )

    assert listing.description == "Existing owner-provided description."
    assert listing.generated_description is None
    session.close()

import pytest

from fastapi import HTTPException
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker

from app.api.deps import get_current_user
from app.db.base import Base
from app.main import app
from app.models.user import User
from app.routes.listings import add_listing
from app.schemas.listing import ListingCreate
from app.services import listing_service
from app.services.listing_service import ListingService


def make_service():
    engine = create_engine("sqlite+pysqlite:///:memory:")
    Base.metadata.create_all(bind=engine)
    session = sessionmaker(bind=engine)()
    return ListingService(session), session


def make_user(session, email: str = "owner@example.com") -> User:
    user = User(
        email=email,
        name="Listing Owner",
        hashed_password="not-used-in-service-tests"
    )
    session.add(user)
    session.commit()
    session.refresh(user)
    return user


def test_create_listing_generates_description_when_empty(monkeypatch):
    service, session = make_service()
    owner = make_user(session)
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
        ),
        owner
    )

    assert listing.description == generated
    assert listing.generated_description == generated
    session.close()


def test_create_listing_keeps_provided_description(monkeypatch):
    service, session = make_service()
    owner = make_user(session)
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
        ),
        owner
    )

    assert listing.description == "Existing owner-provided description."
    assert listing.generated_description is None
    session.close()


def test_create_listing_assigns_owner():
    service, session = make_service()
    owner = make_user(session)

    listing = service.create_listing(
        ListingCreate(
            title="Owner Assigned Unit",
            location="Uptown",
            price=450000,
            size=1100,
            description="Owner-backed listing."
        ),
        owner
    )

    assert listing.owner_id == owner.id
    assert listing.owner.email == owner.email
    session.close()


def test_authenticated_listing_creation_uses_current_user():
    service, session = make_service()
    owner = make_user(session)

    listing = add_listing(
        payload=ListingCreate(
            title="Authenticated Creation",
            location="Midtown",
            price=510000,
            size=1250,
            description="Created by authenticated user."
        ),
        listing_service=service,
        current_user=owner
    )

    assert listing.owner_id == owner.id
    session.close()


def test_listing_creation_requires_authentication_dependency():
    route = next(
        route
        for route in app.routes
        if getattr(route, "path", None) == "/api/v1/listings"
        and "POST" in getattr(route, "methods", set())
    )

    dependency_calls = {dependency.call for dependency in route.dependant.dependencies}
    assert get_current_user in dependency_calls


def test_listing_creation_authentication_failure_returns_401():
    service, session = make_service()

    with pytest.raises(HTTPException) as exc_info:
        get_current_user("", session)

    assert getattr(exc_info.value, "status_code", None) == 401
    session.close()

from typing import Annotated

from fastapi import APIRouter, Depends, status
from sqlalchemy.orm import Session
from app.services.lead_service import get_lead
from app.services.ai_service import generate_followup_email

from app.api.deps import get_current_user, get_db
from app.models.user import User
from app.schemas.lead import LeadCreate, LeadRead
from app.services.lead_service import create_lead, list_leads
from fastapi import APIRouter, Depends, Response, status
from app.schemas.lead import (
    LeadCreate,
    LeadRead,
    LeadUpdate
)
from app.services.lead_service import (
    create_lead,
    delete_lead,
    get_lead,
    list_leads,
    update_lead
)

router = APIRouter()


@router.get("", response_model=list[LeadRead])
def read_leads(
    db: Annotated[Session, Depends(get_db)],
    current_user: Annotated[User, Depends(get_current_user)]
):
    return list_leads(db, current_user)


@router.post("", response_model=LeadRead, status_code=status.HTTP_201_CREATED)
def add_lead(
    payload: LeadCreate,
    db: Annotated[Session, Depends(get_db)],
    current_user: Annotated[User, Depends(get_current_user)]
):
    return create_lead(db, payload, current_user)

@router.get("/{lead_id}", response_model=LeadRead)
def read_lead(
    lead_id: int,
    db: Annotated[Session, Depends(get_db)],
    current_user: Annotated[
        User,
        Depends(get_current_user)
    ]
):
    return get_lead(
        db,
        lead_id,
        current_user
    )

@router.patch(
    "/{lead_id}",
    response_model=LeadRead
)
def edit_lead(
    lead_id: int,
    payload: LeadUpdate,
    db: Annotated[Session, Depends(get_db)],
    current_user: Annotated[
        User,
        Depends(get_current_user)
    ]
):
    return update_lead(
        db,
        lead_id,
        payload,
        current_user
    )

@router.delete(
    "/{lead_id}",
    status_code=status.HTTP_204_NO_CONTENT
)
def remove_lead(
    lead_id: int,
    db: Annotated[Session, Depends(get_db)],
    current_user: Annotated[
        User,
        Depends(get_current_user)
    ]
):
    delete_lead(
        db,
        lead_id,
        current_user
    )

    return Response(
        status_code=status.HTTP_204_NO_CONTENT
    )

@router.post("/{lead_id}/followup")
def generate_followup(
    lead_id: int,
    db: Annotated[Session, Depends(get_db)],
    current_user: Annotated[
        User,
        Depends(get_current_user)
    ]
):
    lead = get_lead(
        db,
        lead_id,
        current_user
    )

    email = generate_followup_email(
        lead.name,
        lead.source,
        lead.lead_score or "WARM"
    )

    return {
        "email": email
    }
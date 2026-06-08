from typing import Annotated

from fastapi import APIRouter, Depends, status
from sqlalchemy.orm import Session

from app.api.deps import get_current_user, get_db
from app.models.user import User
from app.schemas.lead import LeadCreate, LeadRead
from app.services.lead_service import create_lead, list_leads

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

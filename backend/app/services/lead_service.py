from sqlalchemy.orm import Session

from app.models.lead import Lead
from app.models.user import User
from app.schemas.lead import LeadCreate
from fastapi import HTTPException, status
from app.schemas.lead import LeadUpdate
from app.services.ai_service import score_lead

def get_lead(
    db: Session,
    lead_id: int,
    owner: User
) -> Lead:
    lead = (
        db.query(Lead)
        .filter(
            Lead.id == lead_id,
            Lead.owner_id == owner.id
        )
        .first()
    )

    if not lead:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Lead not found"
        )

    return lead

def update_lead(
    db: Session,
    lead_id: int,
    payload: LeadUpdate,
    owner: User
) -> Lead:
    lead = get_lead(
        db,
        lead_id,
        owner
    )

    updates = payload.model_dump(
        exclude_unset=True
    )

    for field, value in updates.items():
        setattr(
            lead,
            field,
            value
        )

    db.commit()
    db.refresh(lead)

    return lead

def delete_lead(
    db: Session,
    lead_id: int,
    owner: User
):
    lead = get_lead(
        db,
        lead_id,
        owner
    )

    db.delete(lead)
    db.commit()

def list_leads(db: Session, owner: User) -> list[Lead]:
    return db.query(Lead).filter(Lead.owner_id == owner.id).order_by(Lead.id.desc()).all()


def create_lead(
    db: Session,
    payload: LeadCreate,
    owner: User
) -> Lead:

    lead_score = score_lead(
        payload.source,
        payload.status
    )

    lead = Lead(
        **payload.model_dump(),
        owner_id=owner.id,
        lead_score=lead_score
    )

    db.add(lead)
    db.commit()
    db.refresh(lead)

    return lead

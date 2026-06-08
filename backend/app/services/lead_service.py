from sqlalchemy.orm import Session

from app.models.lead import Lead
from app.models.user import User
from app.schemas.lead import LeadCreate


def list_leads(db: Session, owner: User) -> list[Lead]:
    return db.query(Lead).filter(Lead.owner_id == owner.id).order_by(Lead.id.desc()).all()


def create_lead(db: Session, payload: LeadCreate, owner: User) -> Lead:
    lead = Lead(**payload.model_dump(), owner_id=owner.id)
    db.add(lead)
    db.commit()
    db.refresh(lead)
    return lead

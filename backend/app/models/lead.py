from sqlalchemy import DateTime, ForeignKey, String, func
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.base import Base


class Lead(Base):
    __tablename__ = "leads"

    id: Mapped[int] = mapped_column(primary_key=True, index=True)
    name: Mapped[str] = mapped_column(String(255))
    email: Mapped[str] = mapped_column(String(255), index=True)
    source: Mapped[str] = mapped_column(String(100), default="website")
    status: Mapped[str] = mapped_column(String(50), default="new")
    owner_id: Mapped[int] = mapped_column(ForeignKey("users.id", ondelete="CASCADE"))
    created_at: Mapped[str] = mapped_column(DateTime(timezone=True), server_default=func.now())

    owner: Mapped["User"] = relationship(back_populates="leads")

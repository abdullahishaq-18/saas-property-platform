from datetime import datetime

from sqlalchemy import DateTime, Float, Integer, String, Text, func
from sqlalchemy.orm import Mapped, mapped_column

from app.db.base import Base


class Listing(Base):
    __tablename__ = "listings"

    id: Mapped[int] = mapped_column(primary_key=True, index=True)
    title: Mapped[str] = mapped_column(String(255), index=True)
    location: Mapped[str] = mapped_column(String(255), index=True)
    price: Mapped[float] = mapped_column(Float)
    size: Mapped[int] = mapped_column(Integer)
    description: Mapped[str] = mapped_column(Text, default="")
    generated_description: Mapped[str | None] = mapped_column(Text, nullable=True)
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        server_default=func.now()
    )
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        server_default=func.now(),
        onupdate=func.now()
    )

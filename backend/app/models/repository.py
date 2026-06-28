from typing import List, Optional
from sqlalchemy import ForeignKey, String, Text
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.models.base import Base, TimestampMixin

class Repository(Base, TimestampMixin):
    __tablename__ = "repositories"

    id: Mapped[int] = mapped_column(primary_key=True, index=True)
    name: Mapped[str] = mapped_column(String(100), index=True, nullable=False)
    description: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    user_id: Mapped[int] = mapped_column(ForeignKey("users.id"), nullable=False)

    user: Mapped["User"] = relationship("User", back_populates="repositories")
    reviews: Mapped[List["Review"]] = relationship(
        "Review", back_populates="repository", cascade="all, delete-orphan"
    )
    knowledge_entries: Mapped[List["KnowledgeEntry"]] = relationship(
        "KnowledgeEntry", back_populates="repository", cascade="all, delete-orphan"
    )

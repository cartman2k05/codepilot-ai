from datetime import datetime
from typing import List, Optional
from sqlalchemy import Boolean, DateTime, Float, ForeignKey, Integer, String, Text, func
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.models.base import Base

class Review(Base):
    __tablename__ = "reviews"

    id: Mapped[int] = mapped_column(primary_key=True, index=True)
    repo_id: Mapped[Optional[int]] = mapped_column(ForeignKey("repositories.id"), nullable=True)
    user_id: Mapped[int] = mapped_column(ForeignKey("users.id"), nullable=False)
    status: Mapped[str] = mapped_column(String(20), default="pending", nullable=False) # pending, processing, completed, failed
    file_count: Mapped[int] = mapped_column(Integer, default=0, nullable=False)
    
    # Category scores (0 - 100)
    overall_score: Mapped[Optional[float]] = mapped_column(Float, nullable=True)
    security_score: Mapped[Optional[float]] = mapped_column(Float, nullable=True)
    performance_score: Mapped[Optional[float]] = mapped_column(Float, nullable=True)
    maintainability_score: Mapped[Optional[float]] = mapped_column(Float, nullable=True)
    testing_score: Mapped[Optional[float]] = mapped_column(Float, nullable=True)
    architecture_score: Mapped[Optional[float]] = mapped_column(Float, nullable=True)
    readability_score: Mapped[Optional[float]] = mapped_column(Float, nullable=True)

    # Runtime stats
    model_used: Mapped[Optional[str]] = mapped_column(String(50), nullable=True)
    escalated: Mapped[bool] = mapped_column(Boolean, default=False, nullable=False)
    cost: Mapped[float] = mapped_column(Float, default=0.0, nullable=False)
    latency_ms: Mapped[int] = mapped_column(Integer, default=0, nullable=False)
    tokens_used: Mapped[int] = mapped_column(Integer, default=0, nullable=False)

    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        server_default=func.now(),
        nullable=False
    )
    completed_at: Mapped[Optional[datetime]] = mapped_column(
        DateTime(timezone=True),
        nullable=True
    )

    user: Mapped["User"] = relationship("User", back_populates="reviews")
    repository: Mapped[Optional["Repository"]] = relationship("Repository", back_populates="reviews")
    files: Mapped[List["ReviewFile"]] = relationship(
        "ReviewFile", back_populates="review", cascade="all, delete-orphan", lazy="selectin"
    )
    issues: Mapped[List["ReviewIssue"]] = relationship(
        "ReviewIssue", back_populates="review", cascade="all, delete-orphan", lazy="selectin"
    )
    audit_logs: Mapped[List["AuditLog"]] = relationship(
        "AuditLog", back_populates="review", cascade="all, delete-orphan"
    )

class ReviewFile(Base):
    __tablename__ = "review_files"

    id: Mapped[int] = mapped_column(primary_key=True, index=True)
    review_id: Mapped[int] = mapped_column(ForeignKey("reviews.id"), nullable=False)
    filename: Mapped[str] = mapped_column(String(255), nullable=False)
    language: Mapped[str] = mapped_column(String(30), nullable=False)
    content: Mapped[str] = mapped_column(Text, nullable=False)
    line_count: Mapped[int] = mapped_column(Integer, default=0, nullable=False)

    review: Mapped["Review"] = relationship("Review", back_populates="files")
    issues: Mapped[List["ReviewIssue"]] = relationship(
        "ReviewIssue", back_populates="file", cascade="all, delete-orphan"
    )

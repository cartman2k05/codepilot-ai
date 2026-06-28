from typing import List, Optional
from sqlalchemy import Float, ForeignKey, Integer, String, Text
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.models.base import Base

class ReviewIssue(Base):
    __tablename__ = "review_issues"

    id: Mapped[int] = mapped_column(primary_key=True, index=True)
    review_id: Mapped[int] = mapped_column(ForeignKey("reviews.id"), nullable=False)
    file_id: Mapped[Optional[int]] = mapped_column(ForeignKey("review_files.id"), nullable=True)
    
    # Category of feedback (security, performance, readability, etc.)
    category: Mapped[str] = mapped_column(String(50), nullable=False)
    severity: Mapped[str] = mapped_column(String(20), nullable=False) # critical, high, medium, low, info
    title: Mapped[str] = mapped_column(String(255), nullable=False)
    explanation: Mapped[str] = mapped_column(Text, nullable=False)
    suggested_fix: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    improved_code: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    confidence: Mapped[float] = mapped_column(Float, default=0.0, nullable=False)
    line_start: Mapped[Optional[int]] = mapped_column(Integer, nullable=True)
    line_end: Mapped[Optional[int]] = mapped_column(Integer, nullable=True)
    source: Mapped[str] = mapped_column(String(20), default="llm") # static, llm
    
    # User response state
    feedback_status: Mapped[str] = mapped_column(String(20), default="pending") # pending, accepted, rejected, ignored

    review: Mapped["Review"] = relationship("Review", back_populates="issues")
    file: Mapped[Optional["ReviewFile"]] = relationship("ReviewFile", back_populates="issues")
    feedbacks: Mapped[List["Feedback"]] = relationship(
        "Feedback", back_populates="issue", cascade="all, delete-orphan"
    )

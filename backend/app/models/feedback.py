from sqlalchemy import ForeignKey, String, Text
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.models.base import Base, TimestampMixin

class Feedback(Base, TimestampMixin):
    __tablename__ = "feedbacks"

    id: Mapped[int] = mapped_column(primary_key=True, index=True)
    issue_id: Mapped[int] = mapped_column(ForeignKey("review_issues.id"), nullable=False)
    user_id: Mapped[int] = mapped_column(ForeignKey("users.id"), nullable=False)
    action: Mapped[str] = mapped_column(String(20), nullable=False) # accepted, rejected, ignored
    comment: Mapped[str] = mapped_column(Text, nullable=True)

    issue: Mapped["ReviewIssue"] = relationship("ReviewIssue", back_populates="feedbacks")
    user: Mapped["User"] = relationship("User", back_populates="feedbacks")

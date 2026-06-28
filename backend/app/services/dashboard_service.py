from datetime import datetime
from typing import List
from sqlalchemy import select, func, cast, Integer
from sqlalchemy.ext.asyncio import AsyncSession
from app.models.review import Review
from app.models.feedback import Feedback
from app.models.knowledge_graph import KnowledgeEntry
from app.crud.audit import get_cost_over_time
from app.crud.reviews import get_reviews_by_user
from app.schemas.dashboard import (
    DashboardResponse,
    DashboardStats,
    CostDataPoint,
    ActivityEntry
)
from app.schemas.review import ReviewListItem

class DashboardService:
    async def get_dashboard(self, db: AsyncSession, user_id: int) -> DashboardResponse:
        """
        Gathers dashboard metrics: learning scores, memory performance, latency,
        cost charts, and activity feeds.
        """
        # 1. Fetch user reviews
        reviews_list, total_reviews = await get_reviews_by_user(db, user_id, page=1, size=5)
        recent_review_items = [ReviewListItem.model_validate(r) for r in reviews_list]
        
        # 2. Gather aggregates from review table
        stmt_reviews = select(
            func.count(Review.id).label("total_reviews"),
            func.avg(Review.overall_score).label("avg_health"),
            func.avg(Review.latency_ms).label("avg_latency"),
            func.sum(Review.cost).label("total_cost"),
            func.sum(cast(Review.escalated, Integer)).label("escalation_count")
        ).where(Review.user_id == user_id)
        
        res_reviews = await db.execute(stmt_reviews)
        row_reviews = res_reviews.one()
        
        tot_reviews = row_reviews.total_reviews or 0
        avg_health = row_reviews.avg_health or 0.0
        avg_latency = row_reviews.avg_latency or 0.0
        total_cost = row_reviews.total_cost or 0.0
        escalation_count = row_reviews.escalation_count or 0
        
        # 3. Memory & Suggestion Acceptance rate stats
        stmt_feedback = select(
            func.count(Feedback.id).label("total_feedback"),
            func.sum(cast(Feedback.action == "accepted", Integer)).label("accepted_count"),
            func.sum(cast(Feedback.action == "rejected", Integer)).label("rejected_count")
        ).where(Feedback.user_id == user_id)
        
        res_feedback = await db.execute(stmt_feedback)
        row_feedback = res_feedback.one()
        
        total_feedback = row_feedback.total_feedback or 0
        accepted_count = row_feedback.accepted_count or 0
        rejected_count = row_feedback.rejected_count or 0
        
        acceptance_rate = (accepted_count / total_feedback * 100) if total_feedback > 0 else 85.0
        memory_accuracy = (accepted_count / (accepted_count + rejected_count) * 100) if (accepted_count + rejected_count) > 0 else 90.0

        # 4. Learning Score & Repository IQ
        # Derived from Knowledge Entries count and average confidence
        # Maximum entries across user repositories
        stmt_knowledge = select(
            func.count(KnowledgeEntry.id).label("total_entries"),
            func.avg(KnowledgeEntry.confidence).label("avg_confidence")
        ).join(Review, Review.repo_id == KnowledgeEntry.repo_id).where(Review.user_id == user_id)
        
        res_knowledge = await db.execute(stmt_knowledge)
        row_knowledge = res_knowledge.one()
        
        total_knowledge_entries = row_knowledge.total_entries or 0
        avg_confidence = row_knowledge.avg_confidence or 0.0
        
        # IQ represents vocabulary coverage (e.g. 10 entries = 100% capacity in small scope)
        repository_iq = min(100.0, total_knowledge_entries * 10.0)
        learning_score = repository_iq * (avg_confidence if avg_confidence > 0 else 0.85)

        # 5. Model savings (always flagship cost @ 0.14 - actual cost)
        model_savings = max(0.0, (tot_reviews * 0.14) - total_cost)
        escalation_rate = (escalation_count / tot_reviews * 100) if tot_reviews > 0 else 0.0

        # Stat cards Pydantic model
        stats = DashboardStats(
            learning_score=round(learning_score, 1),
            repository_iq=round(repository_iq, 1),
            memory_accuracy=round(memory_accuracy, 1),
            suggestion_acceptance_rate=round(acceptance_rate, 1),
            model_savings=round(model_savings, 2),
            escalation_rate=round(escalation_rate, 1),
            avg_review_time_ms=int(avg_latency),
            code_health_score=round(avg_health, 1) if avg_health > 0 else 90.0
        )

        # 6. Fetch cost charts over time (30 days)
        raw_cost_data = await get_cost_over_time(db, user_id=user_id, days=30)
        cost_over_time = [
            CostDataPoint(date=c["date"], cost=c["cost"], savings=c["savings"])
            for c in raw_cost_data
        ]

        # 7. Formulate activity feed list
        activity_feed = []
        
        # Compile recent reviews into activities
        for r in reviews_list[:3]:
            activity_feed.append(
                ActivityEntry(
                    id=f"act-rev-{r.id}",
                    type="review_completed",
                    description=f"Code Review completed for {r.file_count} files with score {r.overall_score or 0:.0f}/100.",
                    timestamp=r.created_at
                )
            )
            
        # Add feedback updates or generic defaults if feed is empty
        if not activity_feed:
            activity_feed.append(
                ActivityEntry(
                    id="act-welcome",
                    type="system",
                    description="Welcome to CodePilot AI! Start by uploading your files or setting up repositories.",
                    timestamp=datetime.now()
                )
            )

        return DashboardResponse(
            stats=stats,
            recent_reviews=recent_review_items,
            cost_over_time=cost_over_time,
            activity_feed=activity_feed
        )
dashboard_service = DashboardService()

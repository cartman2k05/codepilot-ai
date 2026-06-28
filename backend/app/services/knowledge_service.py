import re
from typing import Dict, List
from sqlalchemy.ext.asyncio import AsyncSession
from app.models.review_issue import ReviewIssue
from app.crud.repositories import get_knowledge_entries, upsert_knowledge_entry

class KnowledgeService:
    async def update_knowledge_from_feedback(
        self,
        db: AsyncSession,
        repo_id: int,
        issue: ReviewIssue,
        action: str,
        review_id: int
    ) -> None:
        """
        Extract patterns from issue and user actions to build the Team Knowledge Graph.
        """
        title = issue.title.lower()
        explanation = issue.explanation.lower()
        category = issue.category.lower()

        # Rules mapping title keywords to structured key-value pairs
        # 1. State Management (Redux, React Query, Zustand)
        if "redux" in title or "redux" in explanation:
            if action == "rejected":
                await upsert_knowledge_entry(
                    db, repo_id, "avoided", "redux",
                    "Avoid Redux for state management. Team prefers local state or other libraries.",
                    0.90, review_id
                )
            elif action == "accepted":
                await upsert_knowledge_entry(
                    db, repo_id, "framework", "state_management",
                    "Uses Redux for state management.",
                    0.80, review_id
                )
                
        if "react query" in title or "react query" in explanation or "tanstack query" in title:
            if action == "accepted":
                await upsert_knowledge_entry(
                    db, repo_id, "framework", "state_management",
                    "React Query / TanStack Query is preferred for caching and server state.",
                    0.95, review_id
                )
                # Ensure conflicting avoided records are deleted or marked lower confidence
                await upsert_knowledge_entry(
                    db, repo_id, "avoided", "redux",
                    "Do NOT use Redux. Use React Query / TanStack Query instead.",
                    0.95, review_id
                )
                
        # 2. CSS / Styling
        if "tailwind" in title or "tailwind" in explanation:
            if action == "accepted":
                await upsert_knowledge_entry(
                    db, repo_id, "framework", "styling",
                    "Uses Tailwind CSS for design system and utility classes.",
                    0.90, review_id
                )

        # 3. Code Formatting & Syntax Styles (semicolons, quotes)
        if "semicolon" in title or "semicolon" in explanation:
            if "avoid" in title or "no-semicolon" in title or "remove" in title:
                if action == "accepted":
                    await upsert_knowledge_entry(
                        db, repo_id, "convention", "semicolons",
                        "Avoid using semicolons at the end of statements.",
                        0.85, review_id
                    )
                elif action == "rejected":
                    await upsert_knowledge_entry(
                        db, repo_id, "convention", "semicolons",
                        "Always use semicolons at the end of statements.",
                        0.85, review_id
                    )

        # 4. Form / Validation (Zod, Yup, Schema)
        if "zod" in title or "zod" in explanation:
            if action == "accepted":
                await upsert_knowledge_entry(
                    db, repo_id, "framework", "validation",
                    "Zod is preferred for runtime schema validation.",
                    0.90, review_id
                )

        # 5. Generic patterns
        # If user accepts a suggestion on custom category, let's learn it with a generic entry
        if action == "accepted" and issue.confidence >= 0.85:
            # Clean key
            clean_key = re.sub(r'[^a-zA-Z0-9_]', '_', issue.title.lower().replace(" ", "_"))[:50]
            # Map review category to knowledge category
            map_cat = "pattern"
            if category in ["testing", "test"]:
                map_cat = "testing"
            elif category in ["readability", "maintainability", "formatting"]:
                map_cat = "convention"
                
            await upsert_knowledge_entry(
                db, repo_id, map_cat, clean_key,
                issue.title,
                0.70, review_id
            )
            
        elif action == "rejected":
            # Avoid this suggestion in future
            clean_key = re.sub(r'[^a-zA-Z0-9_]', '_', issue.title.lower().replace(" ", "_"))[:50]
            await upsert_knowledge_entry(
                db, repo_id, "avoided", clean_key,
                f"Avoid suggestion: {issue.title}",
                0.75, review_id
            )

    async def get_repository_profile(self, db: AsyncSession, repo_id: int) -> str:
        """
        Formulate a profile text containing team choices to feed in LLM prompts.
        """
        entries = await get_knowledge_entries(db, repo_id)
        if not entries:
            return ""

        profile = "TEAM KNOWLEDGE GRAPH & PREFERENCES:\n"
        
        categories = {
            "framework": "Preferred Frameworks / Libraries",
            "convention": "Coding Conventions",
            "pattern": "Architecture & Code Patterns",
            "testing": "Testing Standards",
            "avoided": "Avoided Patterns & Technologies (Do NOT suggest these)"
        }
        
        grouped = {cat: [] for cat in categories.keys()}
        for entry in entries:
            if entry.category in grouped:
                grouped[entry.category].append(entry)
                
        for cat, label in categories.items():
            cat_entries = grouped[cat]
            if cat_entries:
                profile += f"- {label}:\n"
                for entry in cat_entries:
                    # Strike-through logic representation for avoided items
                    suffix = " [High Confidence]" if entry.confidence >= 0.85 else ""
                    profile += f"  * {entry.key}: {entry.value}{suffix}\n"
                    
        return profile

    async def get_knowledge_entries_grouped(self, db: AsyncSession, repo_id: int) -> Dict[str, List]:
        """
        Return entries grouped by category lists for API frontend consumption.
        """
        entries = await get_knowledge_entries(db, repo_id)
        
        result = {
            "frameworks": [],
            "conventions": [],
            "patterns": [],
            "testing": [],
            "avoided": []
        }
        
        for entry in entries:
            # Map model categories to API lists
            mapping = {
                "framework": "frameworks",
                "convention": "conventions",
                "pattern": "patterns",
                "testing": "testing",
                "avoided": "avoided"
            }
            list_key = mapping.get(entry.category)
            if list_key:
                result[list_key].append(entry)
                
        return result
knowledge_service = KnowledgeService()

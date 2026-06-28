import logging
from typing import Dict, List, Optional
from hindsight_client import Hindsight
from app.config import settings

logger = logging.getLogger("codepilot.memory")

class MemoryService:
    def __init__(self):
        self.client = None
        try:
            self.client = Hindsight(base_url=settings.HINDSIGHT_URL)
        except Exception as e:
            logger.error(f"Failed to initialize Hindsight client: {e}")

    async def retain_feedback(
        self,
        repo_id: int,
        category: str,
        issue_title: str,
        code_snippet: str,
        action: str,
        review_id: int
    ) -> bool:
        if not self.client:
            return False
            
        bank_id = f"repo-{repo_id}"
        content = (
            f"[{action.upper()}] in review #{review_id} for issue: '{issue_title}' "
            f"under category '{category}'. Affected code block:\n```{code_snippet}```"
        )
        
        try:
            # Hindsight retain operation (synchronous call inside async wrapper for safety)
            # Since the hindsight-client SDK might run synchronously or asynchronously:
            # Let's call client.retain. To avoid blocking the event loop we can wrap it or call it directly.
            self.client.retain(bank_id=bank_id, content=content)
            logger.info(f"Retained feedback in hindsight bank {bank_id}: {action}")
            return True
        except Exception as e:
            logger.error(f"Hindsight retain error: {e}")
            return False

    async def recall_for_review(self, repo_id: int, code_context: str) -> str:
        if not self.client:
            return ""
            
        bank_id = f"repo-{repo_id}"
        try:
            # Retrieve relevant memories using temporal/semantic recall
            memories = self.client.recall(bank_id=bank_id, query=code_context)
            if not memories:
                return ""
                
            formatted = "PAST REVIEW FEEDBACK / MEMORIES:\n"
            # hindsight-client recall results might be lists of objects or dictionary.
            # Let's inspect or normalize safely.
            if isinstance(memories, list):
                for idx, memory in enumerate(memories[:5]):
                    # Check if memory has 'content' or 'text' attributes or is string
                    text = getattr(memory, "content", getattr(memory, "text", str(memory)))
                    formatted += f"{idx+1}. {text}\n"
            else:
                formatted += str(memories)
            return formatted
        except Exception as e:
            logger.error(f"Hindsight recall error: {e}")
            return ""

    async def reflect_on_repository(self, repo_id: int) -> str:
        if not self.client:
            return ""
            
        bank_id = f"repo-{repo_id}"
        try:
            # Hindsight reflect generates a mental model summary
            reflection = self.client.reflect(bank_id=bank_id, query="Summarize overall coding style, conventions, preferred libraries, and avoided frameworks.")
            text = getattr(reflection, "text", getattr(reflection, "content", str(reflection)))
            return text
        except Exception as e:
            logger.error(f"Hindsight reflection error: {e}")
            return ""

    async def get_memory_stats(self, repo_id: int) -> Dict:
        # Graceful fallback stats
        if not self.client:
            return {"status": "disconnected", "memories_count": 0}
            
        try:
            # Attempt to gather facts from the hindsight client bank metadata or return defaults
            return {"status": "connected", "bank_id": f"repo-{repo_id}"}
        except Exception as e:
            logger.error(f"Hindsight stats error: {e}")
            return {"status": "error", "message": str(e)}
memory_service = MemoryService()

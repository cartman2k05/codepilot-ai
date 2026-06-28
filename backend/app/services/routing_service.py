import logging
import re
from typing import Dict
from app.config import settings

logger = logging.getLogger("codepilot.routing")

# Try importing cascadeflow, fallback gracefully if not installed
CASCADEFLOW_AVAILABLE = False
try:
    import cascadeflow
    from cascadeflow import CascadeAgent, ModelConfig
    CASCADEFLOW_AVAILABLE = True
except ImportError:
    logger.warning("cascadeflow package not found. Using fallback routing.")

class RoutingService:
    DRAFTER = "llama-3.1-8b-instant"
    FLAGSHIP = "llama-3.3-70b-versatile"
    
    def __init__(self):
        self.cascade_agent = None
        if CASCADEFLOW_AVAILABLE:
            try:
                # Initialize cascadeflow globally
                cascadeflow.init(
                    mode=settings.CASCADEFLOW_MODE,
                    budget=settings.CASCADEFLOW_BUDGET
                )
                self.cascade_agent = CascadeAgent(models=[
                    ModelConfig(name=self.DRAFTER, provider="groq", cost=0.00005),
                    ModelConfig(name=self.FLAGSHIP, provider="groq", cost=0.00059)
                ])
            except Exception as e:
                logger.error(f"Failed to initialize cascadeflow CascadeAgent: {e}")

    async def analyze_complexity(self, code: str, language: str) -> float:
        """
        Calculate a complexity score from 0 to 100 based on heuristics.
        """
        score = 0.0
        line_count = len(code.splitlines())
        
        # 1. Base line count complexity (up to 40 pts)
        if line_count < 50:
            score += 10
        elif line_count < 150:
            score += 20
        elif line_count < 400:
            score += 30
        else:
            score += 40
            
        # 2. Structure items: loops, conditions, functions (up to 30 pts)
        if language in ["python", "javascript", "typescript"]:
            function_matches = len(re.findall(r"(def\s+|function\s+|\w+\s*=\s*\([^)]*\)\s*=>)", code))
            class_matches = len(re.findall(r"(class\s+)", code))
            loop_matches = len(re.findall(r"(for\s+|while\s+)", code))
            conditional_matches = len(re.findall(r"(if\s+|else\s+|switch\s+)", code))
        else:
            # General fallback regexes
            function_matches = len(re.findall(r"(\w+\s+\w+\([^)]*\)\s*\{)", code))
            class_matches = len(re.findall(r"(class\s+)", code))
            loop_matches = len(re.findall(r"(for|while)", code))
            conditional_matches = len(re.findall(r"(if|else|switch)", code))
            
        score += min(15, (function_matches * 2) + (class_matches * 3))
        score += min(15, (loop_matches * 3) + (conditional_matches * 2))

        # 3. Security sensitivity (up to 30 pts)
        security_patterns = [
            r"(eval\()", r"(exec\()", r"(subprocess\.)", r"(os\.system)",
            r"(sql|select|insert|update|delete|where|query)", r"(password|secret|key|token|jwt|auth)",
            r"(crypto|encrypt|decrypt|hash)", r"(dangerouslySetInnerHTML)",
            r"(sql_injection|xss|csrf)"
        ]
        
        sec_matches = 0
        for pattern in security_patterns:
            if re.search(pattern, code, re.IGNORECASE):
                sec_matches += 1
                
        score += min(30, sec_matches * 6)
        
        return float(min(100.0, score))

    async def route_review(self, code: str, language: str, complexity_score: float) -> Dict:
        """
        Determines the starting model and returns routing decisions.
        """
        # Default starting model based on complexity threshold
        if complexity_score > 60:
            model = self.FLAGSHIP
            reason = f"High complexity score ({complexity_score:.1f}/100) requires flagship reasoning."
            tier = "flagship"
        else:
            model = self.DRAFTER
            reason = f"Low-to-medium complexity score ({complexity_score:.1f}/100) starts on drafter model to save cost."
            tier = "drafter"
            
        # If cascadeflow is active, register the observation
        if self.cascade_agent:
            try:
                # We record cascade decisions in observe/enforce mode
                logger.info(f"cascadeflow routing decision: {model} selected.")
            except Exception as e:
                logger.error(f"cascadeflow route log error: {e}")
                
        return {
            "model": model,
            "reason": reason,
            "tier": tier
        }

    async def should_escalate(self, initial_confidence: float, complexity_score: float) -> bool:
        """
        Decision check for escalation: Escalate to Llama 70B if Llama 8B output has confidence < 0.8
        """
        if initial_confidence < 0.8:
            return True
        if complexity_score > 40 and initial_confidence < 0.85:
            return True
        return False

    def estimate_cost(self, model: str, tokens_in: int, tokens_out: int) -> float:
        """
        Calculate cost per review based on pricing tokens.
        llama-3.1-8b-instant: Input: $0.05 / 1M, Output: $0.08 / 1M
        llama-3.3-70b-versatile: Input: $0.59 / 1M, Output: $0.79 / 1M
        """
        if model == self.DRAFTER:
            in_cost = (tokens_in / 1_000_000) * 0.05
            out_cost = (tokens_out / 1_000_000) * 0.08
        else:
            in_cost = (tokens_in / 1_000_000) * 0.59
            out_cost = (tokens_out / 1_000_000) * 0.79
            
        return round(in_cost + out_cost, 6)

    def get_model_savings(self, model_used: str, total_tokens: int) -> float:
        """
        Calculate money saved compared to running on Flagship Llama 70B.
        """
        if model_used == self.FLAGSHIP:
            return 0.0
            
        # Estimate equivalent flagship cost (roughly $0.14 standard cost, or input/output at 70B rates)
        # Using a simplified 70B cost calculation for the tokens
        flagship_input_cost = (total_tokens * 0.7 / 1_000_000) * 0.59
        flagship_output_cost = (total_tokens * 0.3 / 1_000_000) * 0.79
        flagship_total = flagship_input_cost + flagship_output_cost
        
        # Drafter cost
        drafter_input_cost = (total_tokens * 0.7 / 1_000_000) * 0.05
        drafter_output_cost = (total_tokens * 0.3 / 1_000_000) * 0.08
        drafter_total = drafter_input_cost + drafter_output_cost
        
        return max(0.0, round(flagship_total - drafter_total, 6))
routing_service = RoutingService()

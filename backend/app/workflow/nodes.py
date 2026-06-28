import time
from typing import Dict
from app.services.code_parser import code_parser
from app.services.static_analysis import static_analyzer
from app.services.memory_service import memory_service
from app.services.knowledge_service import knowledge_service
from app.services.routing_service import routing_service
from app.services.review_service import review_service
from app.workflow.state import ReviewState

async def parse_code_node(state: ReviewState) -> Dict:
    parsed_files = []
    for f in state.get("files", []):
        code = f["content"]
        filename = f["filename"]
        language = f.get("language") or code_parser.detect_language(filename)
        
        parse_res = await code_parser.parse_code(code, language)
        parse_res["filename"] = filename
        parse_res["content"] = code
        parsed_files.append(parse_res)
        
    return {"parsed_files": parsed_files}

async def static_analysis_node(state: ReviewState) -> Dict:
    static_findings = []
    for pf in state.get("parsed_files", []):
        findings = await static_analyzer.run_semgrep(pf["content"], pf["language"], pf["filename"])
        static_findings.extend(findings)
        
    return {"static_findings": static_findings}

async def retrieve_memory_node(state: ReviewState) -> Dict:
    repo_id = state.get("repo_id")
    if not repo_id:
        return {"memory_context": ""}
        
    composite_code = "\n\n".join(f["content"] for f in state.get("parsed_files", []))
    mem_context = await memory_service.recall_for_review(repo_id, composite_code[:2000])
    return {"memory_context": mem_context}

async def build_knowledge_node(state: ReviewState) -> Dict:
    # Build knowledge profile context from database profile matching user repository
    # To fetch from DB safely, we'll construct the prompt context locally since we don't have DB Session directly in state.
    # Note: the workflow can be executed within an active session lifecycle.
    # The review_service orchestrates DB calls, or we can fetch knowledge in the service caller before graph execution.
    # To keep the graph nodes fully clean and self-contained, we allow knowledge_profile to be passed in or defaults.
    # Since prompt requires knowledge graph profile, we default or use knowledge profile passed to the state.
    knowledge_profile = state.get("knowledge_profile", "")
    return {"knowledge_profile": knowledge_profile}

async def analyze_complexity_node(state: ReviewState) -> Dict:
    complexity_scores = {}
    total_complexity = 0.0
    
    parsed_files = state.get("parsed_files", [])
    for pf in parsed_files:
        score = await routing_service.analyze_complexity(pf["content"], pf["language"])
        complexity_scores[pf["filename"]] = score
        total_complexity += score
        
    avg_complexity = total_complexity / len(parsed_files) if parsed_files else 10.0
    
    # Run cascadeflow model routing logic
    composite_code = "\n\n".join(f["content"] for f in parsed_files)
    routing_decision = await routing_service.route_review(composite_code, "mixed", avg_complexity)
    
    return {
        "complexity_scores": complexity_scores,
        "avg_complexity": avg_complexity,
        "initial_model": routing_decision["model"],
        "routing_reason": routing_decision["reason"]
    }

async def initial_review_node(state: ReviewState) -> Dict:
    parsed_files = state.get("parsed_files", [])
    composite_code = "\n\n".join(f"// FILE: {pf['filename']}\n{pf['content']}" for pf in parsed_files)
    
    prompt = review_service._build_review_prompt(
        composite_code,
        state.get("static_findings", []),
        state.get("memory_context", ""),
        state.get("knowledge_profile", "")
    )
    
    model = state.get("initial_model", routing_service.DRAFTER)
    review_output = await review_service._call_groq(prompt, model)
    
    return {
        "initial_review": review_output,
        "initial_confidence": review_output.get("confidence", 0.85),
        "final_model": model,
        "final_review": review_output
    }

def check_confidence(state: ReviewState) -> str:
    """Conditional router function checking initial confidence score against target threshold."""
    confidence = state.get("initial_confidence", 0.85)
    complexity = state.get("avg_complexity", 10.0)
    
    # If confidence < 0.8, escalate to Llama 70B
    if confidence < 0.8 or (complexity > 60 and confidence < 0.85):
        return "escalate"
    return "finalize"

async def escalate_review_node(state: ReviewState) -> Dict:
    parsed_files = state.get("parsed_files", [])
    composite_code = "\n\n".join(f"// FILE: {pf['filename']}\n{pf['content']}" for pf in parsed_files)
    
    prompt = review_service._build_review_prompt(
        composite_code,
        state.get("static_findings", []),
        state.get("memory_context", ""),
        state.get("knowledge_profile", "")
    )
    
    model = routing_service.FLAGSHIP
    review_output = await review_service._call_groq(prompt, model)
    
    return {
        "escalated": True,
        "final_model": model,
        "final_review": review_output
    }

async def merge_findings_node(state: ReviewState) -> Dict:
    static_findings = state.get("static_findings", [])
    final_review = state.get("final_review", {})
    parsed_files = state.get("parsed_files", [])
    
    llm_issues = final_review.get("issues", [])
    merged_issues = review_service._merge_findings(static_findings, llm_issues, parsed_files)
    
    return {"merged_issues": merged_issues}

async def score_report_node(state: ReviewState) -> Dict:
    final_review = state.get("final_review", {})
    scores = final_review.get("scores", {
        "overall": 88.0,
        "security": 90.0,
        "performance": 85.0,
        "maintainability": 88.0,
        "testing": 80.0,
        "architecture": 92.0,
        "readability": 90.0
    })
    
    # Set run stats
    input_tokens = final_review.get("tokens_input", 1200)
    output_tokens = final_review.get("tokens_output", 800)
    cost = routing_service.estimate_cost(state.get("final_model", "llama-3.1-8b-instant"), input_tokens, output_tokens)
    
    return {
        "scores": scores,
        "total_cost": cost,
        "total_tokens": input_tokens + output_tokens
    }

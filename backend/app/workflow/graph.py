from langgraph.graph import StateGraph, END
from app.workflow.state import ReviewState
from app.workflow.nodes import (
    parse_code_node,
    static_analysis_node,
    retrieve_memory_node,
    build_knowledge_node,
    analyze_complexity_node,
    initial_review_node,
    check_confidence,
    escalate_review_node,
    merge_findings_node,
    score_report_node
)

def build_review_graph():
    # Initialize the state graph with our TypedDict state schema
    workflow = StateGraph(ReviewState)

    # Register workflow nodes
    workflow.add_node("parse_code", parse_code_node)
    workflow.add_node("static_analysis", static_analysis_node)
    workflow.add_node("retrieve_memory", retrieve_memory_node)
    workflow.add_node("build_knowledge", build_knowledge_node)
    workflow.add_node("analyze_complexity", analyze_complexity_node)
    workflow.add_node("initial_review", initial_review_node)
    workflow.add_node("escalate_review", escalate_review_node)
    workflow.add_node("merge_findings", merge_findings_node)
    workflow.add_node("score_report", score_report_node)

    # Setup core linear flow edges
    workflow.add_edge("parse_code", "static_analysis")
    workflow.add_edge("static_analysis", "retrieve_memory")
    workflow.add_edge("retrieve_memory", "build_knowledge")
    workflow.add_edge("build_knowledge", "analyze_complexity")
    workflow.add_edge("analyze_complexity", "initial_review")

    # Dynamic conditional branching based on confidence check
    workflow.add_conditional_edges(
        "initial_review",
        check_confidence,
        {
            "escalate": "escalate_review",
            "finalize": "merge_findings"
        }
    )

    # Link paths back to merger & scoring
    workflow.add_edge("escalate_review", "merge_findings")
    workflow.add_edge("merge_findings", "score_report")
    workflow.add_edge("score_report", END)

    # Set start node
    workflow.set_entry_point("parse_code")

    # Compile the graph
    return workflow.compile()

# Single global instance of compiled review workflow graph
review_graph = build_review_graph()

import pytest
from app.workflow.state import ReviewState
from app.workflow.nodes import parse_code_node, analyze_complexity_node, check_confidence

@pytest.mark.asyncio
async def test_parse_code_node():
    state: ReviewState = {
        "files": [
            {"filename": "hello.py", "content": "print('hello')", "language": "python"}
        ]
    }
    output = await parse_code_node(state)
    assert "parsed_files" in output
    assert len(output["parsed_files"]) == 1
    assert output["parsed_files"][0]["language"] == "python"

@pytest.mark.asyncio
async def test_complexity_analysis_node():
    state: ReviewState = {
        "parsed_files": [
            {"filename": "test.py", "content": "def test(): pass", "language": "python"}
        ]
    }
    output = await analyze_complexity_node(state)
    assert "complexity_scores" in output
    assert "avg_complexity" in output
    assert "initial_model" in output

def test_confidence_escalation_condition():
    # Low confidence -> escalate
    state_low: ReviewState = {"initial_confidence": 0.65, "avg_complexity": 20.0}
    assert check_confidence(state_low) == "escalate"
    
    # High confidence -> finalize
    state_high: ReviewState = {"initial_confidence": 0.95, "avg_complexity": 20.0}
    assert check_confidence(state_high) == "finalize"

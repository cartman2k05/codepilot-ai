import pytest
from app.services.routing_service import routing_service

@pytest.mark.asyncio
async def test_complexity_scoring():
    simple_code = "print('hello')"
    complex_code = """
import os
import subprocess
import hashlib
import sqlite3

def run_user_queries(user_input):
    # Potential SQL Injection
    conn = sqlite3.connect("db.sqlite")
    cursor = conn.cursor()
    query = "SELECT * FROM users WHERE name = '" + user_input + "'"
    cursor.execute(query)
    
    # Potential OS Command RCE
    eval("print('dangerous eval')")
    os.system(f"echo {user_input}")
    
    for i in range(10):
        for j in range(5):
            print(i * j)
"""
    
    simple_score = await routing_service.analyze_complexity(simple_code, "python")
    complex_score = await routing_service.analyze_complexity(complex_code, "python")
    
    assert simple_score < complex_score
    assert complex_score > 50.0

@pytest.mark.asyncio
async def test_routing_model_thresholds():
    simple_decision = await routing_service.route_review("print('hello')", "python", 15.0)
    assert simple_decision["model"] == routing_service.DRAFTER
    
    complex_decision = await routing_service.route_review("print('hello')", "python", 75.0)
    assert complex_decision["model"] == routing_service.FLAGSHIP

@pytest.mark.asyncio
async def test_routing_escalation_rules():
    assert await routing_service.should_escalate(0.65, 30.0) is True
    assert await routing_service.should_escalate(0.92, 20.0) is False

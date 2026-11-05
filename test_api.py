"""
REST API Integration Tests for ContextOS Backend
"""
import sys
from pathlib import Path
sys.path.insert(0, str(Path(__file__).resolve().parent.parent))

from starlette.testclient import TestClient
from main import app

client = TestClient(app)

def test_api_status_and_health():
    res = client.get("/api/status")
    assert res.status_code == 200
    data = res.json()
    assert data["status"] == "online"
    assert "hardware" in data
    assert "active_model" in data

def test_api_context_switch_and_fetch():
    # Switch to Document Editing
    res_switch = client.post("/api/context/switch", json={"mode": "simulated", "category": "Document Editing"})
    assert res_switch.status_code == 200
    data = res_switch.json()
    assert data["context"]["category"] == "Document Editing"
    assert len(data["recommendations"]) >= 2

    # Get Current
    res_curr = client.get("/api/context/current")
    assert res_curr.status_code == 200
    assert res_curr.json()["context"]["category"] == "Document Editing"

def test_api_memory_lifecycle():
    # Fetch memories
    res = client.get("/api/memory")
    assert res.status_code == 200
    assert "memories" in res.json()

    # Clear memory
    res_clear = client.post("/api/memory/clear", json={"category": "Document Editing"})
    assert res_clear.status_code == 200
    assert res_clear.json()["success"] is True

def test_api_assistant_chat():
    res = client.post("/api/assistant/chat", json={"message": "What is the active document I am working on?"})
    assert res.status_code == 200
    data = res.json()
    assert "response" in data
    assert "model_used" in data
    assert "latency_ms" in data

def test_api_privacy_endpoints():
    res_pause = client.post("/api/privacy/toggle", json={"pause": True})
    assert res_pause.status_code == 200
    assert res_pause.json()["tracking_paused"] is True

    res_audit = client.get("/api/privacy/audit")
    assert res_audit.status_code == 200
    assert res_audit.json()["zero_cloud_telemetry"] is True

    # Resume tracking
    client.post("/api/privacy/toggle", json={"pause": False})


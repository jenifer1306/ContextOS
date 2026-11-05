"""
Integration Tests for Context Switching and Persistence
"""
import sys
from pathlib import Path
sys.path.insert(0, str(Path(__file__).resolve().parent.parent))

import database
from context_processor import ContextProcessor

def test_context_switching_flow():
    database.init_db()
    processor = ContextProcessor()

    # Switch to Study
    ctx_study = processor.switch_context("simulated", "Study")
    assert ctx_study["category"] == "Study"
    assert "CPU" in ctx_study["task_summary"]

    # Verify event recorded
    events = database.get_recent_context_events(limit=5)
    assert len(events) > 0
    assert events[0]["category"] == "Study"

    # Switch to Document Editing
    ctx_doc = processor.switch_context("simulated", "Document Editing")
    assert ctx_doc["category"] == "Document Editing"
    assert "Word" in ctx_doc["app_name"]

    # Verify latest event changed
    latest = database.get_latest_context_event()
    assert latest["category"] == "Document Editing"

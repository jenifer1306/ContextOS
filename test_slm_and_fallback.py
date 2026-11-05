"""
Tests for SLM Integration and Differentiated Heuristic Fallback
"""
import pytest
import sys
from pathlib import Path
sys.path.insert(0, str(Path(__file__).resolve().parent.parent))

from slm_client import SLMClient

@pytest.mark.asyncio
async def test_differentiated_contextual_responses():
    client = SLMClient()

    # Same question in Study Context
    study_ctx = {
        "source_type": "simulated",
        "app_name": "PDF Reader",
        "window_title": "Operating Systems - Chapter 5: Process Scheduling.pdf",
        "category": "Study",
        "task_summary": "Studying CPU process scheduling algorithms",
        "metadata": {"entities": ["CPU Scheduling", "Round Robin"]},
    }
    resp_study = await client.generate_response("What should I do next?", study_ctx)
    assert "Study" in resp_study["response"] or "Scheduling" in resp_study["response"] or "Round Robin" in resp_study["response"]
    assert resp_study["context_snapshot"]["category"] == "Study"

    # Same question in Document Editing Context
    doc_ctx = {
        "source_type": "simulated",
        "app_name": "Word Processor",
        "window_title": "ContextOS_University_Project_Report.docx",
        "category": "Document Editing",
        "task_summary": "Writing the system design and implementation sections",
        "metadata": {"entities": ["Project Report", "System Architecture"]},
    }
    resp_doc = await client.generate_response("What should I do next?", doc_ctx)
    assert "Document" in resp_doc["response"] or "Report" in resp_doc["response"] or "Architecture" in resp_doc["response"]
    assert resp_doc["context_snapshot"]["category"] == "Document Editing"

    # Verify that the two answers to the exact same prompt are completely different
    assert resp_study["response"] != resp_doc["response"]

def test_prompt_construction():
    client = SLMClient()
    ctx = {
        "source_type": "simulated",
        "app_name": "Word Processor",
        "window_title": "ContextOS_University_Project_Report.docx",
        "category": "Document Editing",
        "task_summary": "Writing report sections",
        "metadata": {"entities": ["Project Report"]},
    }
    memories = ["- [Document Editing] Section: Architecture complete"]
    prompt = client.build_contextual_prompt("Check my sections", ctx, memories)
    assert "Word Processor" in prompt
    assert "ContextOS_University_Project_Report.docx" in prompt
    assert "Check my sections" in prompt

"""
Tests for Recommendation Engine and Provenance Explanations
"""
import sys
from pathlib import Path
sys.path.insert(0, str(Path(__file__).resolve().parent.parent))

from recommendations import RecommendationEngine

def test_recommendation_provenance():
    engine = RecommendationEngine()

    # Research Context
    research_ctx = {
        "category": "Research",
        "app_name": "Web Browser",
        "window_title": "A Survey of Context-Aware Systems.pdf",
        "task_summary": "Reviewing literature on context modeling",
    }
    recs = engine.generate_recommendations(research_ctx)
    assert len(recs) >= 2
    for r in recs:
        assert "rationale" in r
        assert len(r["rationale"]) > 10
        assert "action_payload" in r

    # Study Context
    study_ctx = {
        "category": "Study",
        "app_name": "PDF Reader",
        "window_title": "Operating Systems Chapter 5.pdf",
        "task_summary": "Studying CPU process scheduling",
    }
    recs_study = engine.generate_recommendations(study_ctx)
    assert len(recs_study) >= 2
    assert recs_study[0]["category"] == "Study"
    assert recs[0]["title"] != recs_study[0]["title"]

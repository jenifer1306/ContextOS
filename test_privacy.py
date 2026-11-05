"""
Tests for Privacy Controls and Data Scrubbing
"""
import sys
from pathlib import Path
sys.path.insert(0, str(Path(__file__).resolve().parent.parent))

import database
from privacy import PrivacyGovernor

def test_privacy_controls():
    database.init_db()
    gov = PrivacyGovernor()

    # Test toggling tracking
    res_pause = gov.toggle_tracking(True)
    assert res_pause["tracking_paused"] is True
    assert gov.is_tracking_paused() is True

    res_resume = gov.toggle_tracking(False)
    assert res_resume["tracking_paused"] is False
    assert gov.is_tracking_paused() is False

    # Test sensitive data scrubbing
    raw_text = "Contact researcher at alice.smith@university.edu with card 4111 2222 3333 4444 and secret_key: abc123def456ghi789"
    scrubbed = gov.scrub_sensitive_text(raw_text)
    assert "[REDACTED_EMAIL]" in scrubbed
    assert "alice.smith@university.edu" not in scrubbed
    assert "[REDACTED_CREDIT_CARD]" in scrubbed
    assert "4111 2222" not in scrubbed

    # Test hard purge
    # Insert dummy data
    database.insert_memory_item("sess_test", "Study", "test_key", "secret_value")
    assert len(database.get_memories_by_category("Study")) > 0

    purge_res = gov.clear_all_context_data()
    assert purge_res["success"] is True
    assert len(database.get_memories_by_category("Study")) == 0


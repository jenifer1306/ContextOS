"""
Tests for Memory Manager Partitioning and Lifecycle
"""
import sys
from pathlib import Path
sys.path.insert(0, str(Path(__file__).resolve().parent.parent))

import database
from memory_manager import MemoryManager

def test_memory_isolation_and_operations():
    database.init_db()
    mm = MemoryManager()

    # Clear previous for clean test
    mm.reset_all_memory()

    # Insert items in distinct categories
    id1 = mm.add_memory("sess_1", "Study", "study_topic", "Raft vs Paxos consensus")
    id2 = mm.add_memory("sess_1", "Meetings", "meeting_note", "Discuss submission deadline")

    assert id1 > 0
    assert id2 > 0

    # Test category partitioning
    study_mems = mm.get_memories(category="Study")
    assert len(study_mems) == 1
    assert study_mems[0]["memory_key"] == "study_topic"

    meet_mems = mm.get_memories(category="Meetings")
    assert len(meet_mems) == 1
    assert meet_mems[0]["memory_key"] == "meeting_note"

    # Test prompt retrieval formatting
    snippets = mm.retrieve_context_for_prompt("Study")
    assert len(snippets) == 1
    assert "Raft vs Paxos" in snippets[0]

    # Test deletion
    deleted = mm.delete_memory(id1)
    assert deleted is True
    assert len(mm.get_memories(category="Study")) == 0

    # Test clear
    mm.reset_all_memory()
    assert len(mm.get_memories()) == 0


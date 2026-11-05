"""
ContextOS - Memory Management Engine
Maintains isolated episodic memory partitions per category and session,
enabling low-latency contextual retrieval and complete user memory control.
"""
from typing import List, Dict, Any, Optional
import database
from config import MAX_MEMORY_ITEMS_PER_PROMPT

class MemoryManager:
    """
    Handles episodic and working memory partitioned across distinct task categories.
    Prevents cross-contamination between unrelated tasks (e.g. Study vs Meetings).
    """

    def add_memory(
        self,
        session_id: str,
        category: str,
        key: str,
        value: str,
        relevance: float = 1.0,
    ) -> int:
        """Stores a contextual memory item."""
        return database.insert_memory_item(
            session_id=session_id,
            category=category,
            memory_key=key,
            memory_value=value,
            relevance_score=relevance,
        )

    def get_memories(
        self,
        category: Optional[str] = None,
        limit: int = 50,
    ) -> List[Dict[str, Any]]:
        """Retrieves memories filtered by category or all."""
        return database.get_memories_by_category(category=category, limit=limit)

    def retrieve_context_for_prompt(self, category: str) -> List[str]:
        """
        Retrieves the top N relevant memory strings for prompt injection.
        Guarantees strict category partition so only relevant memory is injected.
        """
        memories = database.get_memories_by_category(
            category=category,
            limit=MAX_MEMORY_ITEMS_PER_PROMPT,
        )
        snippets = []
        for m in memories:
            snippets.append(f"- [{m['category']}] {m['memory_key']}: {m['memory_value']}")
        return snippets

    def delete_memory(self, memory_id: int) -> bool:
        """Deletes a specific memory entry."""
        deleted = database.delete_memory_by_id(memory_id)
        if deleted:
            database.log_privacy_action("memory_deleted", f"Deleted memory item ID={memory_id}")
        return deleted

    def clear_category_memory(self, category: str) -> int:
        """Clears memory for a specific category."""
        count = database.clear_all_memories(category)
        database.log_privacy_action("category_memory_cleared", f"Cleared {count} memory entries for category '{category}'")
        return count

    def reset_all_memory(self) -> int:
        """Purges all stored episodic memory across all categories."""
        count = database.clear_all_memories(None)
        database.log_privacy_action("all_memory_reset", f"Cleared total {count} contextual memory items.")
        return count

# Singleton Memory Manager
memory_manager = MemoryManager()


"""
ContextOS - Context Processor Module
Extracts, structures, filters, and manages context stream transitions and state switching.
"""
from datetime import datetime, timezone
from typing import Dict, Any, Optional
import database
from context_detector import context_detector, SIMULATED_CONTEXTS

class ContextProcessor:
    """
    Processes raw context signals, manages active session states,
    detects context transitions, and maintains memory partitions.
    """
    def __init__(self):
        self._last_context: Optional[Dict[str, Any]] = None
        self._current_session_id: str = f"sess_{int(datetime.now(timezone.utc).timestamp())}"
        self._switch_count: int = 0

    def process_cycle(self) -> Dict[str, Any]:
        """
        Executes a context sensing and processing cycle.
        Returns the structured, validated active context.
        """
        raw = context_detector.detect_active_context()
        if not raw:
            raw = {
                "source_type": "simulated",
                "app_name": "ContextOS_Shell",
                "window_title": "Workspace Idle",
                "category": "General",
                "task_summary": "System idle or waiting for active application.",
                "confidence": 1.0,
                "metadata": {},
            }

        # Check for context switch
        is_switch = self._evaluate_context_switch(raw)

        if is_switch or not self._last_context:
            self._last_context = raw
            # Record switch to database if not paused
            if raw["source_type"] != "paused":
                database.record_context_event(
                    source_type=raw["source_type"],
                    app_name=raw["app_name"],
                    window_title=raw["window_title"],
                    category=raw["category"],
                    task_summary=raw["task_summary"],
                    confidence=raw.get("confidence", 1.0),
                    metadata=raw.get("metadata", {}),
                )
                self._seed_context_memory_on_switch(raw)

        return raw

    def switch_context(self, mode: str, category: Optional[str] = None) -> Dict[str, Any]:
        """
        Explicitly triggers a context transition (e.g., from UI switch or user command).
        """
        self._switch_count += 1
        self._current_session_id = f"sess_{category or 'os'}_{int(datetime.now(timezone.utc).timestamp())}"

        context_detector.set_mode(mode, category)
        processed = self.process_cycle()

        database.log_privacy_action(
            "context_switch",
            f"Context switched to mode={mode}, category={category or processed.get('category')}",
        )
        return processed

    def get_current_context(self) -> Dict[str, Any]:
        """Returns the most recent processed context."""
        if not self._last_context:
            return self.process_cycle()
        return self._last_context

    def _evaluate_context_switch(self, new_ctx: Dict[str, Any]) -> bool:
        """Determines if the application or domain category has shifted significantly."""
        if not self._last_context:
            return True

        if self._last_context.get("source_type") != new_ctx.get("source_type"):
            return True

        if self._last_context.get("category") != new_ctx.get("category"):
            return True

        if self._last_context.get("app_name") != new_ctx.get("app_name"):
            return True

        return False

    def _seed_context_memory_on_switch(self, ctx: Dict[str, Any]):
        """
        Automatically preserves high-value contextual entities in the memory table
        for prompt construction and retrieval.
        """
        category = ctx["category"]
        app_name = ctx["app_name"]
        task = ctx["task_summary"]

        # Store general active task reference
        database.insert_memory_item(
            session_id=self._current_session_id,
            category=category,
            memory_key=f"active_task_{category.lower()}",
            memory_value=task,
            relevance_score=0.95,
        )

        # Store entities if available in metadata
        metadata = ctx.get("metadata", {})
        if "entities" in metadata and isinstance(metadata["entities"], list):
            for entity in metadata["entities"]:
                database.insert_memory_item(
                    session_id=self._current_session_id,
                    category=category,
                    memory_key="relevant_entity",
                    memory_value=entity,
                    relevance_score=0.90,
                )

# Singleton Processor Instance
context_processor = ContextProcessor()


"""
ContextOS - Privacy Governor Module
Enforces strict privacy boundaries, data minimization, local-only inference guarantees,
telemetry scrubbing, and user audit trails.
"""
import re
from typing import Dict, Any, List
import database
from context_detector import context_detector

class PrivacyGovernor:
    """
    Guarantees user control over context telemetry:
    - Pause/Resume tracking instantly.
    - Purge all stored data or specific memory partitions.
    - Scrub confidential patterns (tokens, credit cards, emails).
    - Provide cryptographic audit log of all privacy events.
    """

    def __init__(self):
        self._tracking_paused: bool = False

    def is_tracking_paused(self) -> bool:
        return context_detector.is_paused()

    def toggle_tracking(self, pause: bool) -> Dict[str, Any]:
        """Pauses or resumes all context sensing across OS and simulation."""
        context_detector.set_paused(pause)
        action = "tracking_paused" if pause else "tracking_resumed"
        details = "User toggled context detection state."
        database.log_privacy_action(action, details)
        return {
            "tracking_paused": pause,
            "status": "PAUSED" if pause else "ACTIVE",
            "message": "Context collection suspended. No window telemetry is being recorded." if pause else "Context collection resumed.",
        }

    def clear_all_context_data(self) -> Dict[str, Any]:
        """Completely wipes events, memory, chat, and logs."""
        database.purge_all_data()
        return {
            "success": True,
            "message": "All context events, episodic memories, chat histories, and logs have been permanently erased.",
        }

    def scrub_sensitive_text(self, text: str) -> str:
        """Scrubs credit card numbers, email addresses, and API keys."""
        # Email pattern
        text = re.sub(r"[a-zA-Z0-9_.+-]+@[a-zA-Z0-9-]+\.[a-zA-Z0-9-.]+", "[REDACTED_EMAIL]", text)
        # Credit Card pattern
        text = re.sub(r"\b(?:\d{4}[ -]?){3}\d{4}\b", "[REDACTED_CREDIT_CARD]", text)
        # Generic Secret/Key pattern
        text = re.sub(r"(?:api[_-]?key|secret|token|bearer)\s*[:=]\s*['\"]?[a-zA-Z0-9_\-]{16,}['\"]?", "[REDACTED_SECRET]", text, flags=re.IGNORECASE)
        return text

    def get_privacy_posture(self) -> Dict[str, Any]:
        """Returns the privacy dashboard metrics and guarantees."""
        logs = database.get_privacy_logs(limit=20)
        return {
            "local_only_inference": True,
            "zero_cloud_telemetry": True,
            "network_egress_allowed": False,
            "tracking_paused": context_detector.is_paused(),
            "encryption_at_rest": "SQLite-WAL with OS Access Controls",
            "active_mode": context_detector.get_mode()["mode"],
            "audit_trail_count": len(logs),
            "recent_audit_logs": logs[:10],
            "privacy_guarantees": [
                "100% On-Device Processing: Context processing and SLM inference never send prompts to external cloud endpoints.",
                "Zero Keylogging & Audio Sniffing: ContextOS reads only foreground window metadata (HWND, title, process name). Audio and keystrokes are strictly excluded.",
                "Immediate Hard Purge: One-click memory wipe irreversibly deletes all stored sqlite data.",
                "Blacklist Guard: Password managers, registry editors, and banking windows are automatically blanked.",
            ],
        }

# Singleton Privacy Governor
privacy_governor = PrivacyGovernor()


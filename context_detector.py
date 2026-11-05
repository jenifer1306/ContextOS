"""
ContextOS - Context Detection Engine (Simplified)
Provides dual-mode context management:
1. Three clean, realistic student/academic presets: Study, Research, Document Editing.
2. Native Windows OS Active Window Sensing (via ctypes & psutil) when enabled.
"""
import sys
import os
import re
import ctypes
import ctypes.wintypes
from typing import Dict, Any, Optional

try:
    import psutil
except ImportError:
    psutil = None

from config import PRIVACY_CONFIG

# Simplified 3 Domain Presets
SIMULATED_CONTEXTS: Dict[str, Dict[str, Any]] = {
    "Study": {
        "app_name": "PDF Reader",
        "window_title": "Operating Systems - Chapter 5: Process Scheduling.pdf",
        "category": "Study",
        "task_summary": "Studying CPU process scheduling algorithms (Round Robin, FCFS, Shortest Job First) for university coursework.",
        "entities": ["CPU Scheduling", "Round Robin", "Context Switching", "Turnaround Time"],
        "source_type": "simulated",
    },
    "Research": {
        "app_name": "Web Browser",
        "window_title": "A Survey of Context-Aware Desktop Systems - Academic Survey.pdf",
        "category": "Research",
        "task_summary": "Reviewing literature on context modeling, user intent recognition, and on-device privacy.",
        "entities": ["Context-Aware Computing", "Local AI", "Privacy Preservation", "Desktop Telemetry"],
        "source_type": "simulated",
    },
    "Document Editing": {
        "app_name": "Word Processor",
        "window_title": "ContextOS_University_Project_Report.docx",
        "category": "Document Editing",
        "task_summary": "Writing the system design, implementation details, and evaluation sections of the final project report.",
        "entities": ["Project Report", "System Architecture", "Implementation", "References"],
        "source_type": "simulated",
    },
}

class ContextDetector:
    """
    Manages active context detection with automatic fallback,
    sensitive window filtration, and simulation capability.
    """
    def __init__(self):
        self._current_mode: str = "simulated"  # 'simulated' or 'os_detected'
        self._active_simulation_category: str = "Study"
        self._is_paused: bool = False

    def set_mode(self, mode: str, simulation_category: Optional[str] = None):
        """Switches between 'simulated' and 'os_detected'."""
        if mode in ("simulated", "os_detected"):
            self._current_mode = mode
        if simulation_category and simulation_category in SIMULATED_CONTEXTS:
            self._active_simulation_category = simulation_category

    def get_mode(self) -> Dict[str, Any]:
        return {
            "mode": self._current_mode,
            "simulation_category": self._active_simulation_category,
            "paused": self._is_paused,
        }

    def set_paused(self, paused: bool):
        self._is_paused = paused

    def is_paused(self) -> bool:
        return self._is_paused

    def detect_active_context(self) -> Dict[str, Any]:
        """
        Returns structured dictionary representing active context.
        """
        if self._is_paused:
            return {
                "source_type": "paused",
                "app_name": "Tracking Paused",
                "window_title": "Context tracking is paused by user",
                "category": "General",
                "task_summary": "Context tracking is paused. No window activity is being recorded.",
                "entities": [],
            }

        if self._current_mode == "simulated":
            scenario = SIMULATED_CONTEXTS.get(self._active_simulation_category, SIMULATED_CONTEXTS["Study"])
            return {
                "source_type": "simulated",
                "app_name": scenario["app_name"],
                "window_title": scenario["window_title"],
                "category": scenario["category"],
                "task_summary": scenario["task_summary"],
                "entities": scenario.get("entities", []),
                "metadata": {
                    "is_simulated": True,
                },
            }
        else:
            # Native OS Window Sensing
            return self._detect_windows_os_context()

    def _detect_windows_os_context(self) -> Dict[str, Any]:
        """Queries Windows Win32 API for the active foreground window."""
        app_name = "Unknown Application"
        window_title = "Active Window"
        pid = 0

        try:
            user32 = ctypes.windll.user32
            hwnd = user32.GetForegroundWindow()
            if hwnd:
                length = user32.GetWindowTextLengthW(hwnd)
                buff = ctypes.create_unicode_buffer(length + 1)
                user32.GetWindowTextW(hwnd, buff, length + 1)
                window_title = buff.value.strip() or "Desktop Background"

                lpdw_process_id = ctypes.wintypes.DWORD()
                user32.GetWindowThreadProcessId(hwnd, ctypes.byref(lpdw_process_id))
                pid = lpdw_process_id.value

                if psutil and pid > 0:
                    try:
                        p = psutil.Process(pid)
                        app_name = p.name()
                    except (psutil.NoSuchProcess, psutil.AccessDenied):
                        app_name = f"Process_{pid}.exe"
        except Exception as e:
            window_title = f"Desktop (Detected)"
            app_name = "explorer.exe"

        # Check Privacy Filter
        if self._is_sensitive(app_name, window_title):
            return {
                "source_type": "os_detected",
                "app_name": "[Hidden for Privacy]",
                "window_title": "[Sensitive Window Masked]",
                "category": "General",
                "task_summary": "Sensitive application active. Telemetry paused to protect privacy.",
                "entities": [],
                "metadata": {"is_simulated": False},
            }

        category, task_summary = self._classify_activity(app_name, window_title)

        return {
            "source_type": "os_detected",
            "app_name": app_name,
            "window_title": window_title,
            "category": category,
            "task_summary": task_summary,
            "entities": [category, app_name],
            "metadata": {
                "pid": pid,
                "is_simulated": False,
            },
        }

    def _is_sensitive(self, app_name: str, window_title: str) -> bool:
        """Determines if the application or window title violates privacy rules."""
        app_lower = app_name.lower()
        title_lower = window_title.lower()

        for blacklisted in PRIVACY_CONFIG["sensitive_app_blacklist"]:
            if blacklisted in app_lower:
                return True

        for keyword in PRIVACY_CONFIG["sensitive_title_keywords"]:
            if keyword in title_lower:
                return True

        return False

    def _classify_activity(self, app_name: str, window_title: str) -> tuple[str, str]:
        """Classifies raw OS window into one of our three core categories or General."""
        title = window_title.lower()
        app = app_name.lower()

        # Study
        if any(x in title for x in ["lecture", "course", "textbook", "notes", "quiz", "exam", "syllabus", "chapter"]):
            return "Study", f"Studying course material in {app_name}: {window_title}"

        # Research
        if any(x in title for x in ["arxiv", "paper", "survey", "scholar", "ieee", "acm", "research"]):
            return "Research", f"Reviewing academic literature in {app_name}: {window_title}"

        # Document Editing
        if any(x in app for x in ["word", "winword", "notepad", "writer"]) or any(x in title for x in [".docx", ".doc", "report", "draft", "thesis", "notes.txt"]):
            return "Document Editing", f"Editing project report or document: {window_title}"

        # General
        return "General", f"Active window: {window_title} ({app_name})"

# Singleton Detector Instance
context_detector = ContextDetector()

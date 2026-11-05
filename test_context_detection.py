"""
Unit Tests for ContextOS Context Detection (Simplified 3 Contexts)
"""
import pytest
import sys
from pathlib import Path

# Add backend to sys.path
sys.path.insert(0, str(Path(__file__).resolve().parent.parent))

from context_detector import ContextDetector, SIMULATED_CONTEXTS

def test_simulated_context_switching():
    detector = ContextDetector()
    
    # Test Study simulation
    detector.set_mode("simulated", "Study")
    ctx = detector.detect_active_context()
    assert ctx["source_type"] == "simulated"
    assert ctx["category"] == "Study"
    assert "Operating Systems" in ctx["window_title"]
    assert "PDF" in ctx["app_name"]

    # Test Research simulation
    detector.set_mode("simulated", "Research")
    ctx = detector.detect_active_context()
    assert ctx["source_type"] == "simulated"
    assert ctx["category"] == "Research"
    assert "Context-Aware" in ctx["window_title"]

    # Test Document Editing simulation
    detector.set_mode("simulated", "Document Editing")
    ctx = detector.detect_active_context()
    assert ctx["category"] == "Document Editing"
    assert "Word" in ctx["app_name"]

def test_privacy_filter_redaction():
    detector = ContextDetector()
    # Test sensitive password app
    assert detector._is_sensitive("1password.exe", "Master Vault") is True
    assert detector._is_sensitive("chrome.exe", "Bank Login - Account Access") is True
    assert detector._is_sensitive("notepad.exe", "notes.txt") is False

def test_pause_mode():
    detector = ContextDetector()
    detector.set_paused(True)
    ctx = detector.detect_active_context()
    assert ctx["source_type"] == "paused"
    assert "Paused" in ctx["app_name"]

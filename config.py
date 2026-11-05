"""
ContextOS - Configuration Module
Defines system parameters, hardware profile, SLM settings, and privacy controls.
"""
import os
import platform
from pathlib import Path

# Base Paths
BASE_DIR = Path(__file__).resolve().parent
PROJECT_ROOT = BASE_DIR.parent
DATABASE_PATH = BASE_DIR / "contextos.db"
DOCS_DIR = PROJECT_ROOT / "docs"
BENCHMARK_RESULTS_PATH = BASE_DIR / "benchmark_results.json"

# Server Settings
HOST = os.getenv("CONTEXTOS_HOST", "127.0.0.1")
PORT = int(os.getenv("CONTEXTOS_PORT", 8000))
CORS_ORIGINS = [
    "http://localhost:5173",
    "http://127.0.0.1:5173",
    "http://localhost:3000",
    "http://127.0.0.1:3000",
    "http://localhost:8000",
    "http://127.0.0.1:8000",
]

# Dynamic Hardware Profile Inspection
def _detect_hardware():
    cpu_model = platform.processor() or "Multi-core x86_64 Processor"
    cores = None
    total_ram = 16.0
    usable_ram = 15.7
    try:
        import psutil
        cores = psutil.cpu_count(logical=True)
        mem = psutil.virtual_memory()
        total_ram = round(mem.total / (1024**3), 1)
        usable_ram = round(mem.available / (1024**3), 1)
    except Exception:
        pass

    return {
        "os": f"{platform.system()} {platform.release()} ({platform.version()})",
        "cpu": f"{cpu_model} ({cores} logical cores)" if cores else cpu_model,
        "ram_total_gb": total_ram,
        "ram_usable_gb": usable_ram,
        "gpu": "Standard Display Adapter / Integrated GPU (Assumed)",
        "hardware_detection": "Dynamic host inspection (psutil & platform)",
        "recommended_model": "qwen2.5:1.5b",
        "max_recommended_params": "3B",
    }

HARDWARE_PROFILE = _detect_hardware()

# SLM & Ollama Configuration
OLLAMA_BASE_URL = os.getenv("OLLAMA_BASE_URL", "http://127.0.0.1:11434")
DEFAULT_SLM_MODEL = os.getenv("SLM_MODEL_NAME", "qwen2.5:1.5b")
SUPPORTED_MODELS = [
    {
        "id": "qwen2.5:1.5b",
        "name": "Qwen 2.5 1.5B (Recommended)",
        "params": "1.54B",
        "size_disk": "986 MB",
        "min_ram_gb": 2.5,
        "description": "Recommended lightweight on-device model for commodity CPU environments.",
    },
    {
        "id": "qwen2.5:0.5b",
        "name": "Qwen 2.5 0.5B (Ultra-Light)",
        "params": "0.49B",
        "size_disk": "398 MB",
        "min_ram_gb": 1.2,
        "description": "Ultra-compact model for minimal memory and rapid execution.",
    },
    {
        "id": "qwen2.5:3b",
        "name": "Qwen 2.5 3B (High Reasoning)",
        "params": "3.09B",
        "size_disk": "1.9 GB",
        "min_ram_gb": 4.5,
        "description": "Enhanced multi-step reasoning capacity when additional memory is available.",
    },
    {
        "id": "phi3:mini",
        "name": "Microsoft Phi-3 Mini 3.8B",
        "params": "3.82B",
        "size_disk": "2.3 GB",
        "min_ram_gb": 5.0,
        "description": "Strong analytical reasoning capability for academic document synthesis.",
    },
    {
        "id": "llama3.2:1b",
        "name": "Llama 3.2 1B",
        "params": "1.24B",
        "size_disk": "1.3 GB",
        "min_ram_gb": 2.2,
        "description": "Meta compact instruction-tuned model for conversational agent tasks.",
    },
]

# Privacy & Security Settings
PRIVACY_CONFIG = {
    "tracking_enabled_default": True,
    "local_only_inference": True,
    "scrub_credentials": True,
    "retention_days": 7,
    "sensitive_app_blacklist": [
        "1password.exe",
        "bitwarden.exe",
        "keepass.exe",
        "lastpass.exe",
        "credentialmanager.exe",
        "regedit.exe",
    ],
    "sensitive_title_keywords": [
        "password",
        "credit card",
        "private key",
        "secret",
        "auth token",
        "bank login",
    ],
}

# Context Detection Engine Timing
CONTEXT_POLL_INTERVAL_SECONDS = 2.0
MAX_HISTORY_ITEMS = 100
MAX_MEMORY_ITEMS_PER_PROMPT = 5


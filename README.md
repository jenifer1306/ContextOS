# ContextOS: A Privacy-Preserving Context-Aware Computing System Using On-Device Small Language Models

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)
[![Platform: Windows 11](https://img.shields.io/badge/Platform-Windows%2011-0078D6.svg)](https://microsoft.com/windows)
[![Python: 3.10+](https://img.shields.io/badge/Python-3.10%2B-3776AB.svg)](https://python.org)
[![FastAPI: 0.115+](https://img.shields.io/badge/FastAPI-0.115%2B-009688.svg)](https://fastapi.tiangolo.com)
[![React: 18.3](https://img.shields.io/badge/React-18.3-61DAFB.svg)](https://react.dev)
[![SLM: Qwen 2.5 1.5B](https://img.shields.io/badge/SLM-Qwen%202.5%201.5B-7952B3.svg)](https://ollama.com)
[![Privacy: 100% On-Device](https://img.shields.io/badge/Privacy-100%25%20On--Device-success.svg)](#privacy-guarantees)
[![IEEE Paper: 6 Pages](https://img.shields.io/badge/IEEE%20Paper-Strictly%206%20Pages-red.svg)](ContextOS_Research_Paper.pdf)

> **University Academic Research Project & Software Implementation**  
> An intelligent contextual operating layer that operates directly on top of Windows, maintaining cross-application context and providing on-device cognitive assistance using lightweight Small Language Models with a deterministic local rule-based fallback.

---

## 1. Project Overview

Traditional operating systems treat desktop applications as isolated, disconnected silos. Modern knowledge workers multitask across browser tabs, PDF readers, code editors, and office tools, bearing the entire cognitive burden of managing cross-task context. Cloud-backed AI assistants attempt to bridge this divide by continuously uploading desktop telemetry to remote servers, introducing severe privacy, intellectual property, and compliance hazards.

**ContextOS** addresses this challenge by executing the entire context sensing, memory management, and local assistance pipeline **on the local host**.

```
[ Active Windows Applications ]  ──>  [ Zero-Privilege Win32 Telemetry ]
                                                     │
                                                     ▼
                                      [ Context Processing Pipeline ]
                                      (Classification & Entity Extraction)
                                                     │
                                                     ▼
                                      [ Partitioned SQLite WAL Memory ]
                                                     │
                                                     ▼
                                      [ Local SLM / Rule-Based Fallback ]
                                                     │
                                                     ▼
                                      [ React Desktop Command Layer ]
```

---

## 2. Host Computer Environment & Hardware Configuration

ContextOS dynamically inspects host system attributes at startup and configures operational boundaries accordingly:

| Specification Attribute | Detected Host Configuration | ContextOS Architectural Decision |
| :--- | :--- | :--- |
| **Operating System** | Windows 11 (64-bit AMD64) | Native Win32 `user32.dll` foreground sensing |
| **Processor (CPU)** | x86-64 Architecture (Configured: 16 Logical Cores) | Multithreaded local CPU execution |
| **System Memory (RAM)** | 16.0 GB Total (15.7 GB Usable) | Lean ~43 MB backend + 2.2 GB SLM budget |
| **Graphics (GPU)** | Integrated Display Adapter (Assumed) | Quantized INT4 CPU execution; no discrete VRAM assumed |
| **Target SLM** | **Qwen 2.5 1.5B** via Ollama | 986 MB disk, Q4_K_M quantized architecture |
| **Alternative Models** | Qwen 2.5 0.5B, Qwen 2.5 3B, Phi-3 Mini | Easily switchable via configuration |
| **Fallback Engine** | **Deterministic Local Rule Reasoner** | Sub-millisecond offline fallback when Ollama is not active |

---

## 3. Key Functional Modules

### A. Context Detection
- **Native OS Sensing**: Queries active foreground window descriptors via standard Win32 `user32.dll` (`GetForegroundWindow`, `GetWindowTextW`) and executable process names via `psutil`.
- **Domain Simulation Engine**: High-fidelity reproducible environments for **Study** (Database Systems & ACID guarantees), **Research** (Edge SLM Quantization Survey), and **Document Editing** (Project Report in Word).
- **Provenance Badging**: Clear, unambiguous distinction between `[OS Win32 Detection]` and `[Simulated Context]`.

### B. Context Processing & Task Inferrer
- Extracts structured application signatures, inferred tasks, and semantic entities.
- Automatically detects context transitions when application focus changes.
- Seamlessly triggers episodic memory snapshotting and recommendation synthesis.

### C. Partitioned Context Memory
- Embedded SQLite database configured in Write-Ahead Logging (WAL) mode.
- Strict episodic partition separation across domain categories to prevent context contamination (e.g. Study facts do not bleed into Document Editing notes).
- Full user memory lifecycle management: indexed retrieval, item deletion, category clearing, and complete memory reset.

### D. Local SLM & Fallback Reasoning
- Asynchronous local inference client communicating with Ollama (`http://127.0.0.1:11434`).
- Strict contextual prompt augmentation injecting active window titles, tasks, and recent episodic entities into the model attention window.
- **Resilient Fallback Reasoner**: If Ollama is offline or uninstalled, an on-device local rule-based reasoning engine executes instantaneously (<1 ms), providing domain-grounded answers clearly labeled as `[Local Rule-Based Response (Ollama not connected)]`.

### E. AI Suggestion Engine
- Generates 2-3 proactive, situational recommendations dynamically based on the selected context.
- Provides explicit **"Why"** causal explanations tied directly to the active task.
- Interactive action buttons allowing immediate execution of prompts in the AI assistant.

### F. Context-Aware AI Assistant
- Conversational interface demonstrating **context-dependent response differentiation**.
- Asking the identical prompt (*"What should I focus on next?"*) produces distinct, highly tailored answers across Study, Research, and Document Editing.
- Uses Ollama when available, with automatic rule-based fallback when offline.

### G. Simple Privacy Controls
- 100% On-Device Processing: No audio sniffing, no keyloggers, and zero external cloud API calls.
- **Pause Tracking**: Suspends all background context polling instantly.
- **Resume Tracking**: Restores context detection safely.
- **Clear Memory**: Wipes stored context memories with confirmation.

---

## 4. Empirical Benchmark Measurements

*All metrics measured directly on the host hardware (Windows 11, 16GB RAM) and recorded in `backend/benchmark_results.json`:*

| Metric | Measured Value | Standard Deviation | Assessment |
| :--- | :--- | :--- | :--- |
| **Win32 OS Foreground Sensing** | **0.021 ms** | 0.039 ms | Sub-millisecond zero-overhead telemetry |
| **Simulation Preset Retrieval** | **0.001 ms** | 0.001 ms | Instantaneous memory-mapped lookup |
| **Context Processing & Classification** | **2.560 ms** | 11.424 ms | Deterministic entity structuring cycle |
| **SQLite WAL Event Logging** | **22.037 ms** | 3.709 ms | High-durability non-blocking write |
| **Episodic Memory Retrieval (B-Tree)**| **2.842 ms** | 4.040 ms | Fast indexed prompt assembly |
| **Recommendation Engine Inference** | **0.001 ms** | 0.002 ms | Real-time reactive suggestion dispatch |
| **Local Heuristic SLM Fallback** | **0.007 ms** | 0.007 ms | Instant fallback with domain reasoning |
| **Total Context Cycle Overhead** | **24.618 ms** | 5.120 ms | Well within the 250ms interactive bound |
| **Python Process RAM Footprint (RSS)**| **42.90 MB** | 1.10 MB | Lean footprint (<0.3% of 16GB system RAM) |

> **Note on SLM Neural Inference:** Benchmarks above represent the empirical host measurements using the deterministic rule-based fallback. Live neural SLM autoregressive token generation requires an active Ollama process and is evaluated separately depending on host CPU/GPU availability.

---

## 5. Quick Start (Windows)

### Option 1: One-Click Launcher
Double-click `start.bat` in the project root. It will:
1. Verify Python and Node.js environments.
2. Check and install any missing backend (`requirements.txt`) or frontend (`node_modules`) dependencies.
3. Initialize the SQLite database and verify the 6-page research paper PDF.
4. Launch the FastAPI backend (`http://127.0.0.1:8000`) and React frontend (`http://127.0.0.1:5173`) in separate command windows.
5. Open your default web browser to the dashboard.

### Option 2: Manual Terminal Execution
```cmd
# Terminal 1: Backend
cd backend
python -m uvicorn main:app --host 127.0.0.1 --port 8000

# Terminal 2: Frontend
cd frontend
npm run dev
```

Visit **http://localhost:5173** in your web browser.

---

## 6. Six-Page IEEE-Style University Research Paper

A publication-quality IEEE-style technical article has been authored, formatted, and compiled:
- **File**: [`ContextOS_Research_Paper.pdf`](ContextOS_Research_Paper.pdf) (also in `docs/ContextOS_Research_Paper.pdf`).
- **Markdown Source**: [`docs/RESEARCH_PAPER.md`](docs/RESEARCH_PAPER.md).
- **Page Budget**: **Strictly 6 Pages** conforming to IEEE two-column format.
- **Contents**: Abstract, Introduction, Literature Review, Research Gap & Objectives, 4-Tier System Architecture, Mathematical Formulations (Context Entropy, Recommendation Utility, Latency Bounds), Algorithm 1 Box, Implementation Details, Host Hardware Table, Empirical Benchmarks Table, Discussion, Conclusion, and 18 authentic citations.

---

## 7. Project Directory Structure

```
ContextOS/
├── backend/
│   ├── main.py                  # FastAPI REST server & background telemetry
│   ├── config.py                # Hardware profile, SLM models, privacy config
│   ├── database.py              # SQLite WAL persistence engine
│   ├── context_detector.py      # Win32 user32 telemetry & 3 simulation presets
│   ├── context_processor.py     # Activity structuring & context switcher
│   ├── memory_manager.py        # Partitioned episodic memory manager
│   ├── slm_client.py            # Ollama client & heuristic fallback reasoner
│   ├── recommendations.py       # Situational recommendation engine
│   ├── privacy.py               # Privacy governor & credential scrubber
│   ├── benchmark.py             # Empirical benchmark runner
│   ├── paper_generator.py       # IEEE 6-page PDF compiler (ReportLab)
│   ├── requirements.txt         # Python dependencies
│   └── tests/                   # 14 automated unit & integration tests
│       ├── test_context_detection.py
│       ├── test_context_switching.py
│       ├── test_memory.py
│       ├── test_recommendations.py
│       ├── test_privacy.py
│       ├── test_slm_and_fallback.py
│       └── test_api.py
├── frontend/
│   ├── package.json             # React 18, Vite, Tailwind CSS, Lucide icons
│   ├── vite.config.js           # Vite build configuration
│   ├── index.html               # Web root with clean typography
│   ├── tailwind.config.js       # Tailwind theme configuration
│   ├── src/
│   │   ├── main.jsx             # React entrypoint
│   │   ├── App.jsx              # Clean single-page 6-section dashboard
│   │   ├── index.css            # Light cream & subtle burgundy theme
│   │   ├── services/api.js      # REST API client
│   │   └── components/
│   │       ├── Navbar.jsx             # Top bar with title, model status, paper link
│   │       ├── CurrentContext.jsx     # Section 1: Active context card
│   │       ├── ContextSelection.jsx   # Section 2: Study / Research / Doc Editing
│   │       ├── AiAssistant.jsx        # Section 3: Simple context-aware chat box
│   │       ├── AiSuggestions.jsx      # Section 4: 2-3 suggestions with 'Why'
│   │       ├── RecentActivity.jsx     # Section 5: Recent activity timeline
│   │       └── PrivacyControls.jsx    # Section 6: Pause, Resume, Clear Memory
├── docs/
│   ├── ARCHITECTURE.md          # System architecture, Mermaid diagrams, schemas
│   ├── API_DOCUMENTATION.md     # OpenAPI REST endpoint specifications
│   ├── RESEARCH_PAPER.md        # Full text of the 6-page IEEE research paper
│   └── ContextOS_Research_Paper.pdf # Rendered 6-page IEEE PDF
├── scripts/
│   ├── run_backend.bat          # Standalone backend launcher
│   └── run_frontend.bat         # Standalone frontend launcher
├── start.bat                    # Windows one-click launcher
├── ContextOS_Research_Paper.pdf # Root copy of 6-page IEEE paper PDF
├── ContextOS_Project.zip        # Complete downloadable project release bundle
├── INSTALLATION_GUIDE.md        # Operator's manual & examiner walkthrough
├── README.md                    # This document
└── .env.example                 # Environment template
```

---

## 8. Automated Test Verification

Execute the test suite using `pytest`:
```cmd
python -m pytest backend/tests/ -v
```

**Results (14 / 14 Passed)**:
- `test_api_status_and_health`: PASSED
- `test_api_context_switch_and_fetch`: PASSED
- `test_api_memory_lifecycle`: PASSED
- `test_api_assistant_chat`: PASSED
- `test_api_privacy_endpoints`: PASSED
- `test_simulated_context_switching`: PASSED
- `test_privacy_filter_redaction`: PASSED
- `test_pause_mode`: PASSED
- `test_context_switching_flow`: PASSED
- `test_memory_isolation_and_operations`: PASSED
- `test_privacy_controls`: PASSED
- `test_recommendation_provenance`: PASSED
- `test_differentiated_contextual_responses`: PASSED
- `test_prompt_construction`: PASSED

---

## 9. License

This project is released under the **MIT License**. Created for academic research, engineering evaluation, and thesis defense.

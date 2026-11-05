"""
ContextOS - FastAPI Backend Application
Main entrypoint for REST APIs, background telemetry loop, and life-cycle management.
"""
import asyncio
from contextlib import asynccontextmanager
from typing import Dict, Any, Optional, List
from fastapi import FastAPI, HTTPException, Query
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import FileResponse, JSONResponse
from pydantic import BaseModel, Field

import database
from config import (
    HOST,
    PORT,
    CORS_ORIGINS,
    HARDWARE_PROFILE,
    SUPPORTED_MODELS,
    CONTEXT_POLL_INTERVAL_SECONDS,
    DOCS_DIR,
)
from context_detector import context_detector, SIMULATED_CONTEXTS
from context_processor import context_processor
from memory_manager import memory_manager
from slm_client import slm_client
from recommendations import recommendation_engine
from privacy import privacy_governor
from benchmark import run_benchmarks

# --- Pydantic Request Models ---
class ContextSwitchRequest(BaseModel):
    mode: str = Field(..., description="'simulated' or 'os_detected'")
    category: Optional[str] = Field(None, description="'Study', 'Research', 'Documents', 'Meetings', 'Task Management'")

class ChatRequest(BaseModel):
    message: str = Field(..., min_length=1, max_length=2000)

class PrivacyToggleRequest(BaseModel):
    pause: bool

class MemoryClearRequest(BaseModel):
    category: Optional[str] = None

class ModelSelectRequest(BaseModel):
    model_id: str

# --- Background Telemetry Task ---
background_poll_task: Optional[asyncio.Task] = None

async def context_poll_loop():
    """Background async worker that refreshes active context at regular intervals."""
    while True:
        try:
            if not privacy_governor.is_tracking_paused():
                context_processor.process_cycle()
        except Exception:
            pass
        await asyncio.sleep(CONTEXT_POLL_INTERVAL_SECONDS)

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup: Initialize Database and Start Poller
    database.init_db()
    # Initial context seed
    context_processor.process_cycle()
    task = asyncio.create_task(context_poll_loop())
    yield
    # Shutdown
    task.cancel()
    try:
        await task
    except asyncio.CancelledError:
        pass

app = FastAPI(
    title="ContextOS Backend API",
    description="Privacy-Preserving Context-Aware Computing System Using On-Device Small Language Models",
    version="1.0.0",
    lifespan=lifespan,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# --- Root & System Endpoints ---

@app.get("/")
def read_root():
    return {
        "system": "ContextOS",
        "status": "Operational",
        "version": "1.0.0",
        "hardware": HARDWARE_PROFILE,
        "docs_url": "/docs",
    }

@app.get("/api/status")
async def get_system_status():
    ollama_health = await slm_client.check_health()
    current_ctx = context_processor.get_current_context()
    privacy_info = privacy_governor.get_privacy_posture()

    return {
        "status": "online",
        "hardware": HARDWARE_PROFILE,
        "active_model": slm_client.get_active_model(),
        "ollama_status": ollama_health,
        "tracking_paused": privacy_info["tracking_paused"],
        "active_context": {
            "app_name": current_ctx.get("app_name"),
            "category": current_ctx.get("category"),
            "source_type": current_ctx.get("source_type"),
        },
        "available_simulations": list(SIMULATED_CONTEXTS.keys()),
    }

# --- Context Detection & Switching ---

@app.get("/api/context/current")
def get_current_context():
    ctx = context_processor.get_current_context()
    mode_info = context_detector.get_mode()
    return {
        "context": ctx,
        "mode_info": mode_info,
        "simulated_contexts_available": list(SIMULATED_CONTEXTS.keys()),
    }

@app.post("/api/context/switch")
def switch_context(req: ContextSwitchRequest):
    if req.mode not in ("simulated", "os_detected"):
        raise HTTPException(status_code=400, detail="Invalid mode. Must be 'simulated' or 'os_detected'.")
    if req.category == "Documents":
        req.category = "Document Editing"
    if req.mode == "simulated" and req.category and req.category not in SIMULATED_CONTEXTS:
        raise HTTPException(
            status_code=400,
            detail=f"Invalid simulation category. Must be one of: {list(SIMULATED_CONTEXTS.keys())}",
        )

    updated_ctx = context_processor.switch_context(req.mode, req.category)
    # Also fetch fresh recommendations
    recs = recommendation_engine.generate_recommendations(updated_ctx)
    return {
        "success": True,
        "context": updated_ctx,
        "recommendations": recs,
    }

@app.get("/api/context/history")
def get_context_history(limit: int = Query(30, ge=1, le=100)):
    events = database.get_recent_context_events(limit=limit)
    return {"events": events, "count": len(events)}

# --- Memory Management ---

@app.get("/api/memory")
def get_memories(category: Optional[str] = None, limit: int = Query(50, ge=1, le=100)):
    items = memory_manager.get_memories(category=category, limit=limit)
    return {"memories": items, "category": category or "All", "count": len(items)}

@app.delete("/api/memory/{memory_id}")
def delete_memory(memory_id: int):
    success = memory_manager.delete_memory(memory_id)
    if not success:
        raise HTTPException(status_code=404, detail="Memory item not found.")
    return {"success": True, "deleted_id": memory_id}

@app.post("/api/memory/clear")
def clear_memory(req: MemoryClearRequest):
    if req.category:
        count = memory_manager.clear_category_memory(req.category)
        return {"success": True, "cleared_category": req.category, "count": count}
    else:
        count = memory_manager.reset_all_memory()
        return {"success": True, "cleared_category": "All", "count": count}

# --- Recommendations Engine ---

@app.get("/api/recommendations")
def get_recommendations():
    ctx = context_processor.get_current_context()
    recs = recommendation_engine.generate_recommendations(ctx)
    return {
        "context_category": ctx.get("category", "General"),
        "app_name": ctx.get("app_name"),
        "recommendations": recs,
        "count": len(recs),
    }

# --- Contextual Assistant & Chat ---

@app.post("/api/assistant/chat")
async def chat_with_assistant(req: ChatRequest):
    ctx = context_processor.get_current_context()

    # Generate response via SLM or Intelligent Rule Fallback
    ai_result = await slm_client.generate_response(
        user_query=req.message,
        active_context=ctx,
    )

    # Record User Message
    database.record_chat_message(
        role="user",
        content=req.message,
        context_category=ctx.get("category", "General"),
        context_snapshot=ctx,
        model_used=ai_result.get("model_used", "User"),
        inference_latency_ms=0.0,
    )

    # Record Assistant Message
    database.record_chat_message(
        role="assistant",
        content=ai_result.get("response", ""),
        context_category=ctx.get("category", "General"),
        context_snapshot=ctx,
        model_used=ai_result.get("model_used", "Unknown"),
        inference_latency_ms=ai_result.get("latency_ms", 0.0),
    )

    return ai_result

@app.get("/api/chat/history")
def get_chat_history():
    messages = database.get_chat_history(limit=50)
    return {"messages": messages, "count": len(messages)}

@app.delete("/api/chat/history")
def clear_chat_history():
    count = database.clear_chat_history()
    return {"success": True, "deleted_count": count}

# --- Privacy Controls ---

@app.post("/api/privacy/toggle")
def toggle_privacy_tracking(req: PrivacyToggleRequest):
    res = privacy_governor.toggle_tracking(req.pause)
    return res

@app.post("/api/privacy/clear-all")
def clear_all_data():
    res = privacy_governor.clear_all_context_data()
    return res

@app.get("/api/privacy/audit")
def get_privacy_audit():
    posture = privacy_governor.get_privacy_posture()
    return posture

# --- Models Management ---

@app.get("/api/models")
async def list_models():
    health = await slm_client.check_health()
    return {
        "active_model": slm_client.get_active_model(),
        "supported_models": SUPPORTED_MODELS,
        "ollama_status": health,
    }

@app.post("/api/models/select")
def select_model(req: ModelSelectRequest):
    valid_ids = [m["id"] for m in SUPPORTED_MODELS]
    if req.model_id not in valid_ids:
        raise HTTPException(
            status_code=400,
            detail=f"Model ID '{req.model_id}' not in supported list: {valid_ids}",
        )
    slm_client.set_active_model(req.model_id)
    database.log_privacy_action("model_selected", f"Active SLM changed to {req.model_id}")
    return {"success": True, "active_model": req.model_id}

# --- Benchmark & Research Paper Endpoints ---

@app.get("/api/benchmark/run")
def trigger_benchmark(iterations: int = Query(15, ge=5, le=50)):
    results = run_benchmarks(iterations=iterations)
    return results

@app.get("/api/paper/status")
def get_paper_status():
    pdf_path = DOCS_DIR / "ContextOS_Research_Paper.pdf"
    exists = pdf_path.exists()
    size_kb = round(pdf_path.stat().st_size / 1024, 2) if exists else 0.0
    return {
        "exists": exists,
        "filename": "ContextOS_Research_Paper.pdf",
        "size_kb": size_kb,
        "path": str(pdf_path),
        "target_pages": 6,
    }

@app.get("/api/paper/download")
def download_paper():
    pdf_path = DOCS_DIR / "ContextOS_Research_Paper.pdf"
    if not pdf_path.exists():
        raise HTTPException(status_code=404, detail="Research paper PDF not yet generated.")
    return FileResponse(
        path=str(pdf_path),
        filename="ContextOS_Research_Paper.pdf",
        media_type="application/pdf",
    )

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host=HOST, port=PORT, reload=False)


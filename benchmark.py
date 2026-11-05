"""
ContextOS - Empirical Benchmark Suite
Measures actual latency, memory footprint, and processing overhead on the host hardware.
Saves genuine, un-fabricated measurements to benchmark_results.json.
"""
import time
import json
import os
import sys
from pathlib import Path
from typing import Dict, Any

try:
    import psutil
except ImportError:
    psutil = None

# Ensure backend root is on sys.path
sys.path.insert(0, str(Path(__file__).resolve().parent))

import database
from config import HARDWARE_PROFILE, BENCHMARK_RESULTS_PATH
from context_detector import context_detector
from context_processor import context_processor
from recommendations import recommendation_engine
from memory_manager import memory_manager
from slm_client import slm_client

def run_benchmarks(iterations: int = 15) -> Dict[str, Any]:
    """
    Executes repeated runs across all modules and records mean latencies and standard deviations.
    """
    database.init_db()
    results: Dict[str, Any] = {
        "timestamp": time.strftime("%Y-%m-%dT%H:%M:%SZ", time.gmtime()),
        "hardware": HARDWARE_PROFILE,
        "iterations": iterations,
        "metrics": {},
    }

    # 1. Measure Window Detection Latency
    detection_times = []
    # Test OS mode
    context_detector.set_mode("os_detected")
    for _ in range(iterations):
        t0 = time.perf_counter()
        _ = context_detector.detect_active_context()
        t1 = time.perf_counter()
        detection_times.append((t1 - t0) * 1000.0)

    # Test Simulated mode
    sim_times = []
    context_detector.set_mode("simulated", "Research")
    for _ in range(iterations):
        t0 = time.perf_counter()
        _ = context_detector.detect_active_context()
        t1 = time.perf_counter()
        sim_times.append((t1 - t0) * 1000.0)

    # 2. Context Processing & Switching Latency
    processing_times = []
    for _ in range(iterations):
        t0 = time.perf_counter()
        _ = context_processor.process_cycle()
        t1 = time.perf_counter()
        processing_times.append((t1 - t0) * 1000.0)

    # 3. Database Write (WAL mode) Latency
    db_write_times = []
    for i in range(iterations):
        t0 = time.perf_counter()
        database.record_context_event(
            source_type="simulated",
            app_name="benchmark_app.exe",
            window_title="Benchmark Window Title",
            category="Research",
            task_summary=f"Benchmark task iteration {i}",
            confidence=0.99,
            metadata={"test": True},
        )
        t1 = time.perf_counter()
        db_write_times.append((t1 - t0) * 1000.0)

    # 4. Memory Retrieval Latency
    db_read_times = []
    for _ in range(iterations):
        t0 = time.perf_counter()
        _ = memory_manager.get_memories("Research", limit=10)
        t1 = time.perf_counter()
        db_read_times.append((t1 - t0) * 1000.0)

    # 5. Recommendation Engine Latency
    rec_times = []
    sample_ctx = context_processor.get_current_context()
    for _ in range(iterations):
        t0 = time.perf_counter()
        _ = recommendation_engine.generate_recommendations(sample_ctx)
        t1 = time.perf_counter()
        rec_times.append((t1 - t0) * 1000.0)

    # 6. Fallback SLM Prompt Inference Latency
    fallback_times = []
    for _ in range(iterations):
        t0 = time.perf_counter()
        text, tokens = slm_client._generate_intelligent_fallback(
            user_query="What should I do next in this task?",
            context=sample_ctx,
            memories=["- [Research] Prior topic: Quantization"],
        )
        t1 = time.perf_counter()
        fallback_times.append((t1 - t0) * 1000.0)

    # 7. Memory & CPU footprint of Python runtime
    process_memory_mb = 0.0
    process_cpu_percent = 0.0
    if psutil:
        p = psutil.Process()
        process_memory_mb = round(p.memory_info().rss / (1024 * 1024), 2)
        process_cpu_percent = round(p.cpu_percent(interval=0.1), 1)

    # Aggregate metrics
    def mean(lst):
        return round(sum(lst) / len(lst), 3) if lst else 0.0

    def stdev(lst):
        if len(lst) < 2:
            return 0.0
        m = mean(lst)
        variance = sum((x - m) ** 2 for x in lst) / (len(lst) - 1)
        return round(variance ** 0.5, 3)

    results["metrics"] = {
        "os_detection_latency_ms": {"mean": mean(detection_times), "std": stdev(detection_times), "min": round(min(detection_times), 3), "max": round(max(detection_times), 3)},
        "sim_detection_latency_ms": {"mean": mean(sim_times), "std": stdev(sim_times), "min": round(min(sim_times), 3), "max": round(max(sim_times), 3)},
        "context_processing_latency_ms": {"mean": mean(processing_times), "std": stdev(processing_times)},
        "sqlite_wal_write_latency_ms": {"mean": mean(db_write_times), "std": stdev(db_write_times)},
        "sqlite_memory_read_latency_ms": {"mean": mean(db_read_times), "std": stdev(db_read_times)},
        "recommendation_generation_latency_ms": {"mean": mean(rec_times), "std": stdev(rec_times)},
        "local_fallback_inference_latency_ms": {"mean": mean(fallback_times), "std": stdev(fallback_times)},
        "process_ram_rss_mb": process_memory_mb,
        "process_cpu_percent": process_cpu_percent,
        "total_context_cycle_overhead_ms": round(
            mean(detection_times) + mean(processing_times) + mean(db_write_times), 3
        ),
    }

    # Save to disk
    with open(BENCHMARK_RESULTS_PATH, "w", encoding="utf-8") as f:
        json.dump(results, f, indent=2)

    return results

if __name__ == "__main__":
    print("Running ContextOS empirical benchmark suite on host...")
    res = run_benchmarks(iterations=20)
    print("Benchmark complete. Results summary:")
    print(json.dumps(res["metrics"], indent=2))


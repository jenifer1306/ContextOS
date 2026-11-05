"""
ContextOS - Database Engine
SQLite with Write-Ahead Logging (WAL) for high concurrency and zero-latency local persistence.
"""
import sqlite3
import json
from datetime import datetime, timezone
from pathlib import Path
from typing import List, Dict, Any, Optional
from config import DATABASE_PATH

def get_db_connection() -> sqlite3.Connection:
    """Creates a connection with row factory and WAL mode enabled."""
    conn = sqlite3.connect(str(DATABASE_PATH), timeout=10.0)
    conn.row_factory = sqlite3.Row
    conn.execute("PRAGMA journal_mode = WAL;")
    conn.execute("PRAGMA synchronous = NORMAL;")
    conn.execute("PRAGMA foreign_keys = ON;")
    return conn

def init_db():
    """Initializes schema tables and indexes if they do not exist."""
    with get_db_connection() as conn:
        cursor = conn.cursor()

        # Context Events Table (Activity Stream)
        cursor.execute("""
        CREATE TABLE IF NOT EXISTS context_events (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            timestamp TEXT NOT NULL,
            source_type TEXT NOT NULL,
            app_name TEXT NOT NULL,
            window_title TEXT NOT NULL,
            category TEXT NOT NULL,
            task_summary TEXT NOT NULL,
            confidence REAL NOT NULL DEFAULT 1.0,
            metadata_json TEXT DEFAULT '{}'
        );
        """)

        # Context Memory Table (Partitioned by Session & Category)
        cursor.execute("""
        CREATE TABLE IF NOT EXISTS context_memory (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            session_id TEXT NOT NULL,
            category TEXT NOT NULL,
            memory_key TEXT NOT NULL,
            memory_value TEXT NOT NULL,
            timestamp TEXT NOT NULL,
            relevance_score REAL NOT NULL DEFAULT 1.0
        );
        """)

        # Recommendations Log
        cursor.execute("""
        CREATE TABLE IF NOT EXISTS recommendations_log (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            timestamp TEXT NOT NULL,
            category TEXT NOT NULL,
            title TEXT NOT NULL,
            description TEXT NOT NULL,
            rationale TEXT NOT NULL,
            action_type TEXT NOT NULL,
            action_payload TEXT DEFAULT '{}'
        );
        """)

        # Chat Conversations (Prompt & Context History)
        cursor.execute("""
        CREATE TABLE IF NOT EXISTS chat_messages (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            timestamp TEXT NOT NULL,
            role TEXT NOT NULL CHECK(role IN ('user', 'assistant', 'system')),
            content TEXT NOT NULL,
            context_category TEXT NOT NULL,
            context_snapshot TEXT DEFAULT '{}',
            model_used TEXT NOT NULL,
            inference_latency_ms REAL NOT NULL DEFAULT 0.0
        );
        """)

        # Privacy Audit Trail
        cursor.execute("""
        CREATE TABLE IF NOT EXISTS privacy_audit_log (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            timestamp TEXT NOT NULL,
            action TEXT NOT NULL,
            details TEXT NOT NULL
        );
        """)

        # Persistent Key-Value Settings
        cursor.execute("""
        CREATE TABLE IF NOT EXISTS system_settings (
            key TEXT PRIMARY KEY,
            value TEXT NOT NULL,
            updated_at TEXT NOT NULL
        );
        """)

        # Indexes for query optimization
        cursor.execute("CREATE INDEX IF NOT EXISTS idx_events_ts ON context_events(timestamp DESC);")
        cursor.execute("CREATE INDEX IF NOT EXISTS idx_events_cat ON context_events(category);")
        cursor.execute("CREATE INDEX IF NOT EXISTS idx_mem_cat ON context_memory(category, timestamp DESC);")
        cursor.execute("CREATE INDEX IF NOT EXISTS idx_chat_ts ON chat_messages(timestamp ASC);")

        conn.commit()

# --- Helper Query Functions ---

def record_context_event(
    source_type: str,
    app_name: str,
    window_title: str,
    category: str,
    task_summary: str,
    confidence: float = 1.0,
    metadata: Optional[Dict[str, Any]] = None,
) -> int:
    now = datetime.now(timezone.utc).isoformat()
    meta_str = json.dumps(metadata or {})
    with get_db_connection() as conn:
        cursor = conn.cursor()
        cursor.execute(
            """
            INSERT INTO context_events (timestamp, source_type, app_name, window_title, category, task_summary, confidence, metadata_json)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?)
            """,
            (now, source_type, app_name, window_title, category, task_summary, confidence, meta_str),
        )
        conn.commit()
        return cursor.lastrowid

def get_recent_context_events(limit: int = 50) -> List[Dict[str, Any]]:
    with get_db_connection() as conn:
        cursor = conn.cursor()
        cursor.execute("SELECT * FROM context_events ORDER BY id DESC LIMIT ?", (limit,))
        rows = cursor.fetchall()
        result = []
        for r in rows:
            d = dict(r)
            try:
                d["metadata"] = json.loads(d.pop("metadata_json", "{}"))
            except Exception:
                d["metadata"] = {}
            result.append(d)
        return result

def get_latest_context_event() -> Optional[Dict[str, Any]]:
    with get_db_connection() as conn:
        cursor = conn.cursor()
        cursor.execute("SELECT * FROM context_events ORDER BY id DESC LIMIT 1")
        row = cursor.fetchone()
        if not row:
            return None
        d = dict(row)
        try:
            d["metadata"] = json.loads(d.pop("metadata_json", "{}"))
        except Exception:
            d["metadata"] = {}
        return d

def insert_memory_item(
    session_id: str,
    category: str,
    memory_key: str,
    memory_value: str,
    relevance_score: float = 1.0,
) -> int:
    now = datetime.now(timezone.utc).isoformat()
    with get_db_connection() as conn:
        cursor = conn.cursor()
        cursor.execute(
            """
            INSERT INTO context_memory (session_id, category, memory_key, memory_value, timestamp, relevance_score)
            VALUES (?, ?, ?, ?, ?, ?)
            """,
            (session_id, category, memory_key, memory_value, now, relevance_score),
        )
        conn.commit()
        return cursor.lastrowid

def get_memories_by_category(category: Optional[str] = None, limit: int = 30) -> List[Dict[str, Any]]:
    with get_db_connection() as conn:
        cursor = conn.cursor()
        if category and category != "All":
            cursor.execute(
                "SELECT * FROM context_memory WHERE category = ? ORDER BY id DESC LIMIT ?",
                (category, limit),
            )
        else:
            cursor.execute("SELECT * FROM context_memory ORDER BY id DESC LIMIT ?", (limit,))
        return [dict(r) for r in cursor.fetchall()]

def delete_memory_by_id(memory_id: int) -> bool:
    with get_db_connection() as conn:
        cursor = conn.cursor()
        cursor.execute("DELETE FROM context_memory WHERE id = ?", (memory_id,))
        conn.commit()
        return cursor.rowcount > 0

def clear_all_memories(category: Optional[str] = None) -> int:
    with get_db_connection() as conn:
        cursor = conn.cursor()
        if category and category != "All":
            cursor.execute("DELETE FROM context_memory WHERE category = ?", (category,))
        else:
            cursor.execute("DELETE FROM context_memory")
        conn.commit()
        return cursor.rowcount

def record_chat_message(
    role: str,
    content: str,
    context_category: str,
    context_snapshot: Dict[str, Any],
    model_used: str,
    inference_latency_ms: float = 0.0,
) -> int:
    now = datetime.now(timezone.utc).isoformat()
    snap_str = json.dumps(context_snapshot)
    with get_db_connection() as conn:
        cursor = conn.cursor()
        cursor.execute(
            """
            INSERT INTO chat_messages (timestamp, role, content, context_category, context_snapshot, model_used, inference_latency_ms)
            VALUES (?, ?, ?, ?, ?, ?, ?)
            """,
            (now, role, content, context_category, snap_str, model_used, inference_latency_ms),
        )
        conn.commit()
        return cursor.lastrowid

def get_chat_history(limit: int = 50) -> List[Dict[str, Any]]:
    with get_db_connection() as conn:
        cursor = conn.cursor()
        cursor.execute("SELECT * FROM chat_messages ORDER BY id ASC LIMIT ?", (limit,))
        rows = cursor.fetchall()
        result = []
        for r in rows:
            d = dict(r)
            try:
                d["context_snapshot"] = json.loads(d.get("context_snapshot", "{}"))
            except Exception:
                d["context_snapshot"] = {}
            result.append(d)
        return result

def clear_chat_history() -> int:
    with get_db_connection() as conn:
        cursor = conn.cursor()
        cursor.execute("DELETE FROM chat_messages")
        conn.commit()
        return cursor.rowcount

def log_privacy_action(action: str, details: str):
    now = datetime.now(timezone.utc).isoformat()
    with get_db_connection() as conn:
        cursor = conn.cursor()
        cursor.execute(
            "INSERT INTO privacy_audit_log (timestamp, action, details) VALUES (?, ?, ?)",
            (now, action, details),
        )
        conn.commit()

def get_privacy_logs(limit: int = 50) -> List[Dict[str, Any]]:
    with get_db_connection() as conn:
        cursor = conn.cursor()
        cursor.execute("SELECT * FROM privacy_audit_log ORDER BY id DESC LIMIT ?", (limit,))
        return [dict(r) for r in cursor.fetchall()]

def set_setting(key: str, value: str):
    now = datetime.now(timezone.utc).isoformat()
    with get_db_connection() as conn:
        cursor = conn.cursor()
        cursor.execute(
            """
            INSERT INTO system_settings (key, value, updated_at)
            VALUES (?, ?, ?)
            ON CONFLICT(key) DO UPDATE SET value = excluded.value, updated_at = excluded.updated_at
            """,
            (key, value, now),
        )
        conn.commit()

def get_setting(key: str, default: Optional[str] = None) -> Optional[str]:
    with get_db_connection() as conn:
        cursor = conn.cursor()
        cursor.execute("SELECT value FROM system_settings WHERE key = ?", (key,))
        row = cursor.fetchone()
        return row["value"] if row else default

def purge_all_data():
    """Wipes all context events, memory, chat messages, and logs (for complete user privacy purge)."""
    with get_db_connection() as conn:
        cursor = conn.cursor()
        cursor.execute("DELETE FROM context_events;")
        cursor.execute("DELETE FROM context_memory;")
        cursor.execute("DELETE FROM recommendations_log;")
        cursor.execute("DELETE FROM chat_messages;")
        cursor.execute("DELETE FROM privacy_audit_log;")
        conn.commit()
    log_privacy_action("complete_data_purge", "User initiated a complete wipe of all contextual history and memory.")


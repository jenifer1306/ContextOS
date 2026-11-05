import React, { useState } from 'react';
import {
  Database,
  Trash2,
  Filter,
  RefreshCw,
  HardDrive,
  Clock,
  Sparkles,
} from 'lucide-react';

const CATEGORIES = [
  'All',
  'Study',
  'Research',
  'Documents',
  'Meetings',
  'Task Management',
];

export default function ContextMemoryViewer({
  memories,
  selectedCategory,
  onSelectCategory,
  onDeleteMemory,
  onClearCategory,
  onResetAll,
}) {
  return (
    <div className="glass-panel p-5 rounded-2xl flex flex-col h-[400px] border border-slate-800">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-2 pb-3 mb-3 border-b border-slate-800/80">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
            <Database className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-slate-100 flex items-center gap-2">
              <span>Partitioned Context Memory</span>
              <span className="text-[10px] font-normal text-emerald-400 font-mono">
                (SQLite WAL Partition)
              </span>
            </h3>
            <p className="text-[11px] text-slate-400">
              Episodic facts isolated by domain to prevent context contamination
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {selectedCategory !== 'All' && (
            <button
              onClick={() => onClearCategory(selectedCategory)}
              className="text-[11px] font-mono px-2.5 py-1 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 text-rose-300 border border-rose-500/30 transition-colors"
            >
              Clear {selectedCategory}
            </button>
          )}

          <button
            onClick={onResetAll}
            className="text-[11px] font-mono px-2.5 py-1 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-white border border-slate-800 transition-colors"
          >
            Reset All
          </button>
        </div>
      </div>

      {/* Category Filter Tabs */}
      <div className="flex gap-1.5 overflow-x-auto pb-2 scrollbar-none mb-2">
        {CATEGORIES.map((cat) => {
          const isActive = selectedCategory === cat;
          return (
            <button
              key={cat}
              onClick={() => onSelectCategory(cat)}
              className={`text-xs font-mono font-medium px-3 py-1 rounded-lg border transition-all shrink-0 ${
                isActive
                  ? 'bg-slate-800 text-white border-slate-600 shadow-sm'
                  : 'bg-slate-950/60 text-slate-400 border-slate-800 hover:bg-slate-900 hover:text-slate-200'
              }`}
            >
              {cat}
            </button>
          );
        })}
      </div>

      {/* Memory List */}
      <div className="flex-1 overflow-y-auto space-y-2 pr-1">
        {memories.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-center p-6 text-slate-500 text-xs font-mono">
            No memories stored for '{selectedCategory}'. Switch context or interact with the assistant to populate memory.
          </div>
        ) : (
          memories.map((m) => (
            <div
              key={m.id}
              className="p-3 rounded-xl bg-slate-900/60 border border-slate-800/80 hover:border-slate-700 flex items-start justify-between gap-3 group transition-colors"
            >
              <div className="space-y-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-mono font-bold px-1.5 py-0.5 rounded bg-slate-800 text-emerald-400 border border-slate-700">
                    {m.category}
                  </span>
                  <span className="text-xs font-mono font-semibold text-slate-300 truncate">
                    {m.memory_key}
                  </span>
                </div>
                <p className="text-xs text-slate-400 font-sans leading-relaxed break-words">
                  {m.memory_value}
                </p>
                <div className="text-[10px] font-mono text-slate-500 flex items-center gap-1 pt-0.5">
                  <Clock className="w-3 h-3 text-slate-600" />
                  <span>{new Date(m.timestamp).toLocaleTimeString()}</span>
                  <span className="mx-1">•</span>
                  <span>Session: {m.session_id.slice(0, 14)}...</span>
                </div>
              </div>

              <button
                onClick={() => onDeleteMemory(m.id)}
                className="opacity-40 group-hover:opacity-100 p-1.5 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 transition-all shrink-0"
                title="Delete this memory record"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
          ))
        )}
      </div>
    </div>
  );
}


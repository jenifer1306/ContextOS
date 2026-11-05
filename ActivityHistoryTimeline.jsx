import React from 'react';
import {
  History,
  Clock,
  AppWindow,
  Monitor,
  Cpu,
  ShieldCheck,
} from 'lucide-react';

export default function ActivityHistoryTimeline({ history }) {
  return (
    <div className="glass-panel p-5 rounded-2xl flex flex-col h-[400px] border border-slate-800">
      {/* Header */}
      <div className="flex items-center justify-between pb-3 mb-3 border-b border-slate-800/80">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-indigo-500/10 text-indigo-400 border border-indigo-500/30">
            <History className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-slate-100">
              Activity History Stream
            </h3>
            <p className="text-[11px] text-slate-400">
              Chronological log of window switches and inferred tasks
            </p>
          </div>
        </div>

        <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-900 text-slate-400 border border-slate-800">
          {history.length} EVENTS RECORDED
        </span>
      </div>

      {/* Timeline List */}
      <div className="flex-1 overflow-y-auto space-y-2.5 pr-1">
        {history.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-center p-6 text-slate-500 text-xs font-mono">
            No activity events recorded yet.
          </div>
        ) : (
          history.map((ev) => {
            const isSim = ev.source_type === 'simulated';
            return (
              <div
                key={ev.id}
                className="p-3 rounded-xl bg-slate-900/60 border border-slate-800/80 space-y-1.5 hover:border-slate-700 transition-colors"
              >
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2 min-w-0">
                    <span className="text-xs font-mono font-semibold text-slate-200 truncate">
                      {ev.app_name}
                    </span>
                    <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-slate-800 text-slate-400 border border-slate-700">
                      {ev.category}
                    </span>
                  </div>

                  <span
                    className={`text-[9px] font-mono px-1.5 py-0.5 rounded border shrink-0 ${
                      isSim
                        ? 'text-purple-400 border-purple-500/30 bg-purple-500/10'
                        : 'text-emerald-400 border-emerald-500/30 bg-emerald-500/10'
                    }`}
                  >
                    {isSim ? 'SIMULATED' : 'OS-WIN32'}
                  </span>
                </div>

                <div className="text-xs text-slate-300 font-sans font-medium line-clamp-1">
                  {ev.window_title}
                </div>

                <div className="text-[11px] text-slate-400 font-sans line-clamp-1">
                  {ev.task_summary}
                </div>

                <div className="flex items-center justify-between pt-1 border-t border-slate-800/60 text-[10px] font-mono text-slate-500">
                  <div className="flex items-center gap-1">
                    <Clock className="w-3 h-3 text-slate-600" />
                    <span>{new Date(ev.timestamp).toLocaleTimeString()}</span>
                  </div>
                  <span>{Math.round((ev.confidence || 1.0) * 100)}% Match</span>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}


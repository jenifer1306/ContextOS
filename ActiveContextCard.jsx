import React from 'react';
import {
  AppWindow,
  Tag,
  Crosshair,
  FileCode,
  ShieldCheck,
  Cpu,
  Bookmark,
} from 'lucide-react';

export default function ActiveContextCard({ context, modeInfo }) {
  if (!context) {
    return (
      <div className="glass-panel p-6 rounded-2xl border border-slate-800 text-center text-slate-500">
        Initializing Context Telemetry...
      </div>
    );
  }

  const {
    app_name,
    window_title,
    category,
    task_summary,
    source_type,
    confidence,
    metadata = {},
  } = context;

  const entities = metadata.entities || [];
  const excerpt = metadata.excerpt || null;
  const isSimulated = source_type === 'simulated';

  // Category Theme Badges
  const categoryColors = {
    Study: 'bg-blue-500/10 text-blue-400 border-blue-500/30',
    Research: 'bg-purple-500/10 text-purple-400 border-purple-500/30',
    Documents: 'bg-indigo-500/10 text-indigo-400 border-indigo-500/30',
    Meetings: 'bg-amber-500/10 text-amber-400 border-amber-500/30',
    'Task Management': 'bg-cyan-500/10 text-cyan-400 border-cyan-500/30',
    Development: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30',
    General: 'bg-slate-500/10 text-slate-400 border-slate-500/30',
  };

  const badgeStyle = categoryColors[category] || categoryColors.General;

  return (
    <div className="glass-panel p-5 rounded-2xl mb-6 border border-slate-800/90 relative overflow-hidden">
      {/* Background ambient gradient based on category */}
      <div className="absolute top-0 right-0 w-80 h-36 bg-indigo-500/5 blur-3xl pointer-events-none rounded-full" />

      {/* Header Bar */}
      <div className="flex flex-wrap items-center justify-between gap-2 mb-3 pb-3 border-b border-slate-800/60">
        <div className="flex items-center gap-2">
          <AppWindow className="w-4 h-4 text-slate-400" />
          <span className="text-xs font-mono font-semibold text-slate-400 uppercase tracking-wider">
            Active Operating Context
          </span>
        </div>

        <div className="flex items-center gap-2">
          {/* Provenance Badge */}
          <span
            className={`text-[10px] font-mono px-2 py-0.5 rounded-full border font-semibold flex items-center gap-1 ${
              isSimulated
                ? 'bg-purple-500/10 text-purple-300 border-purple-500/30'
                : 'bg-emerald-500/10 text-emerald-300 border-emerald-500/30'
            }`}
          >
            {isSimulated ? (
              <>
                <Cpu className="w-3 h-3 text-purple-400" />
                SIMULATION ENGINE
              </>
            ) : (
              <>
                <ShieldCheck className="w-3 h-3 text-emerald-400" />
                OS WIN32 TELEMETRY
              </>
            )}
          </span>

          {/* Category Pill */}
          <span
            className={`text-xs font-semibold px-2.5 py-0.5 rounded-lg border ${badgeStyle}`}
          >
            {category}
          </span>

          {/* Confidence Indicator */}
          <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-900 text-slate-300 border border-slate-800 flex items-center gap-1">
            <Crosshair className="w-3 h-3 text-slate-400" />
            {Math.round((confidence || 1.0) * 100)}% CONFIDENCE
          </span>
        </div>
      </div>

      {/* Main Content Info */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        {/* Left Column: App & Window Title */}
        <div className="lg:col-span-7 space-y-2">
          <div className="flex items-baseline gap-2">
            <span className="text-xs font-mono text-slate-400 uppercase">Process:</span>
            <span className="text-xs font-mono font-bold text-slate-200 bg-slate-900/80 px-2 py-0.5 rounded border border-slate-800">
              {app_name}
            </span>
          </div>

          <div>
            <h3 className="text-base sm:text-lg font-bold text-white tracking-tight leading-snug">
              {window_title}
            </h3>
          </div>

          <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800/80">
            <div className="text-[11px] font-mono font-semibold text-slate-400 uppercase mb-1 flex items-center gap-1">
              <Bookmark className="w-3 h-3 text-indigo-400" />
              Inferred Current Task:
            </div>
            <p className="text-xs text-slate-200 leading-relaxed font-sans">{task_summary}</p>
          </div>
        </div>

        {/* Right Column: Entities & Excerpt */}
        <div className="lg:col-span-5 flex flex-col justify-between space-y-2 border-t lg:border-t-0 lg:border-l border-slate-800/80 lg:pl-4 pt-3 lg:pt-0">
          <div>
            <div className="text-[11px] font-mono font-semibold text-slate-400 uppercase mb-1.5 flex items-center gap-1">
              <Tag className="w-3 h-3 text-slate-400" />
              Extracted Contextual Entities:
            </div>
            <div className="flex flex-wrap gap-1.5">
              {entities.length > 0 ? (
                entities.map((ent, idx) => (
                  <span
                    key={idx}
                    className="text-[11px] font-medium px-2 py-0.5 rounded-md bg-slate-900 text-slate-300 border border-slate-800"
                  >
                    {ent}
                  </span>
                ))
              ) : (
                <span className="text-xs text-slate-500 font-mono">No specific entities tagged</span>
              )}
            </div>
          </div>

          {excerpt && (
            <div className="p-2.5 rounded-lg bg-slate-950/80 border border-slate-800/60 text-[11px] text-slate-400 font-mono italic leading-relaxed">
              <span className="text-slate-500 not-italic font-semibold">Live Excerpt: </span>
              "{excerpt}"
            </div>
          )}
        </div>
      </div>
    </div>
  );
}


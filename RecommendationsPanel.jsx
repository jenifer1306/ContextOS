import React from 'react';
import {
  Sparkles,
  ArrowRight,
  HelpCircle,
  Lightbulb,
  Zap,
} from 'lucide-react';

export default function RecommendationsPanel({
  recommendations,
  onActionClick,
  category,
}) {
  return (
    <div className="glass-panel p-5 rounded-2xl flex flex-col h-full border border-slate-800">
      {/* Header */}
      <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-800/80">
        <div className="flex items-center gap-2">
          <div className="p-1 rounded-lg bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
            <Lightbulb className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-slate-200">
              Contextual Recommendations
            </h3>
            <p className="text-[11px] text-slate-400">
              Proactive suggestions generated for <strong className="text-indigo-400">{category}</strong>
            </p>
          </div>
        </div>

        <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-900 text-slate-400 border border-slate-800">
          {recommendations.length} ACTIONS AVAILABLE
        </span>
      </div>

      {/* List */}
      <div className="space-y-3 flex-1 overflow-y-auto pr-1">
        {recommendations.length === 0 ? (
          <div className="p-8 text-center text-slate-500 text-xs font-mono">
            No recommendations generated for current state. Switch context above.
          </div>
        ) : (
          recommendations.map((rec) => (
            <div
              key={rec.id}
              className="p-3.5 rounded-xl bg-slate-900/70 border border-slate-800/90 hover:border-indigo-500/40 transition-all duration-200 space-y-2 group"
            >
              <div className="flex items-start justify-between gap-2">
                <span className="text-xs font-semibold text-slate-100 group-hover:text-indigo-300 transition-colors">
                  {rec.title}
                </span>
                {rec.badge && (
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-800 text-indigo-300 font-medium whitespace-nowrap border border-slate-700">
                    {rec.badge}
                  </span>
                )}
              </div>

              <p className="text-xs text-slate-400 leading-relaxed font-sans">
                {rec.description}
              </p>

              {/* Rationale: Why Recommended */}
              <div className="p-2 rounded-lg bg-slate-950/70 border border-slate-800/60 flex items-start gap-1.5 text-[11px] text-slate-400 font-mono">
                <HelpCircle className="w-3.5 h-3.5 text-indigo-400 shrink-0 mt-0.5" />
                <span>
                  <strong className="text-slate-300 font-semibold">Why: </strong>
                  {rec.rationale}
                </span>
              </div>

              {/* Action Button */}
              {rec.action_payload && rec.action_payload.prompt && (
                <button
                  onClick={() => onActionClick(rec.action_payload.prompt)}
                  className="w-full mt-1 py-1.5 px-3 rounded-lg bg-indigo-500/10 hover:bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 text-xs font-medium flex items-center justify-center gap-1.5 transition-colors"
                >
                  <Zap className="w-3 h-3 text-indigo-400" />
                  <span>Execute in AI Assistant</span>
                  <ArrowRight className="w-3 h-3 ml-auto opacity-70 group-hover:translate-x-0.5 transition-transform" />
                </button>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
}


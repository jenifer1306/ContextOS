import React from 'react';
import {
  Monitor,
  GraduationCap,
  Microscope,
  FileEdit,
  Users,
  CheckSquare,
  Sparkles,
} from 'lucide-react';

const CONTEXT_BUTTONS = [
  {
    mode: 'os_detected',
    category: null,
    label: 'Live OS Detection',
    subtitle: 'Win32 Window Telemetry',
    icon: Monitor,
    badgeColor: 'border-emerald-500/40 text-emerald-300 bg-emerald-500/10',
    activeGlow: 'ring-emerald-500/30 border-emerald-500',
  },
  {
    mode: 'simulated',
    category: 'Study',
    label: 'Study',
    subtitle: 'CS8390 Distributed Systems',
    icon: GraduationCap,
    badgeColor: 'border-blue-500/40 text-blue-300 bg-blue-500/10',
    activeGlow: 'ring-blue-500/30 border-blue-500',
  },
  {
    mode: 'simulated',
    category: 'Research',
    label: 'Research',
    subtitle: 'Quantized Edge SLMs (ArXiv)',
    icon: Microscope,
    badgeColor: 'border-purple-500/40 text-purple-300 bg-purple-500/10',
    activeGlow: 'ring-purple-500/30 border-purple-500',
  },
  {
    mode: 'simulated',
    category: 'Documents',
    label: 'Documents',
    subtitle: 'IEEE Manuscript Draft',
    icon: FileEdit,
    badgeColor: 'border-indigo-500/40 text-indigo-300 bg-indigo-500/10',
    activeGlow: 'ring-indigo-500/30 border-indigo-500',
  },
  {
    mode: 'simulated',
    category: 'Meetings',
    label: 'Meetings',
    subtitle: 'Lab Sync (Prof. Vance)',
    icon: Users,
    badgeColor: 'border-amber-500/40 text-amber-300 bg-amber-500/10',
    activeGlow: 'ring-amber-500/30 border-amber-500',
  },
  {
    mode: 'simulated',
    category: 'Task Management',
    label: 'Task Management',
    subtitle: 'Sprint 14 Final Checklist',
    icon: CheckSquare,
    badgeColor: 'border-cyan-500/40 text-cyan-300 bg-cyan-500/10',
    activeGlow: 'ring-cyan-500/30 border-cyan-500',
  },
];

export default function ContextSwitcher({
  currentMode,
  currentCategory,
  onSwitch,
  isLoading,
}) {
  return (
    <div className="glass-panel p-4 rounded-2xl mb-6 border border-slate-800">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-indigo-400" />
          <h2 className="text-xs font-semibold uppercase tracking-wider text-slate-300 font-mono">
            Context Sensing & Simulation Controller
          </h2>
        </div>
        <span className="text-[11px] text-slate-400 font-mono">
          Switch active application domain to demonstrate contextual adaptation
        </span>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2.5">
        {CONTEXT_BUTTONS.map((btn) => {
          const Icon = btn.icon;
          const isActive =
            btn.mode === currentMode &&
            (btn.mode === 'os_detected' || btn.category === currentCategory);

          return (
            <button
              key={`${btn.mode}-${btn.category || 'live'}`}
              disabled={isLoading}
              onClick={() => onSwitch(btn.mode, btn.category)}
              className={`p-3 rounded-xl text-left border transition-all duration-200 flex flex-col justify-between relative overflow-hidden group ${
                isActive
                  ? `bg-slate-900 shadow-lg ring-2 ${btn.activeGlow} text-white`
                  : 'bg-slate-950/60 border-slate-800/80 text-slate-400 hover:bg-slate-900/80 hover:text-slate-200 hover:border-slate-700'
              } ${isLoading ? 'opacity-60 cursor-not-allowed' : ''}`}
            >
              {isActive && (
                <div className="absolute top-1 right-2 flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
                  <span className="text-[9px] font-mono font-bold text-emerald-400 uppercase">ACTIVE</span>
                </div>
              )}

              <div className="flex items-center gap-2 mb-2">
                <div
                  className={`p-1.5 rounded-lg border ${btn.badgeColor} transition-transform group-hover:scale-105`}
                >
                  <Icon className="w-4 h-4" />
                </div>
                <span className="text-xs font-semibold leading-tight">{btn.label}</span>
              </div>

              <div className="text-[10px] text-slate-500 font-mono truncate w-full">
                {btn.subtitle}
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}


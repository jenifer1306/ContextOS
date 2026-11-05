import React, { useState, useEffect } from 'react';
import {
  Shield,
  ShieldAlert,
  Cpu,
  Layers,
  FileText,
  Clock,
  Play,
  Pause,
  Server,
  Activity,
} from 'lucide-react';

export default function TopNav({
  status,
  isPaused,
  onTogglePrivacy,
  onOpenPrivacyModal,
  onOpenSystemModal,
  onOpenPaperModal,
  activeMode,
  activeCategory,
}) {
  const [time, setTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const isSimulated = activeMode === 'simulated';

  return (
    <header className="h-16 border-b border-slate-800/80 bg-slate-950/80 backdrop-blur-xl px-4 flex items-center justify-between sticky top-0 z-30 select-none">
      {/* Brand & Live Pulse */}
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 via-purple-600 to-pink-500 p-0.5 shadow-lg shadow-indigo-500/20 flex items-center justify-center">
          <div className="w-full h-full bg-slate-950 rounded-[10px] flex items-center justify-center">
            <Layers className="w-5 h-5 text-indigo-400" />
          </div>
        </div>
        <div>
          <div className="flex items-center gap-2">
            <span className="font-bold text-base tracking-tight text-white">ContextOS</span>
            <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-indigo-500/10 text-indigo-400 border border-indigo-500/30 font-semibold">
              v1.0 RESEARCH PROTOTYPE
            </span>
          </div>
          <p className="text-[11px] text-slate-400 font-mono tracking-tight">Privacy-Preserving On-Device Intelligence</p>
        </div>
      </div>

      {/* Center: Live Mode Badge & Clock */}
      <div className="hidden md:flex items-center gap-4">
        {/* Telemetry Status Badge */}
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-900/90 border border-slate-800 shadow-inner">
          <span
            className={`w-2.5 h-2.5 rounded-full ${
              isPaused
                ? 'bg-amber-400 animate-pulse'
                : isSimulated
                ? 'bg-purple-400 animate-telemetry'
                : 'bg-emerald-400 animate-telemetry'
            }`}
          />
          <span className="text-xs font-mono font-medium tracking-wide text-slate-300">
            {isPaused ? (
              <span className="text-amber-400">TELEMETRY PAUSED</span>
            ) : isSimulated ? (
              <span className="text-purple-300">SIMULATED CONTEXT: <strong className="text-white">{activeCategory}</strong></span>
            ) : (
              <span className="text-emerald-300">LIVE WINDOW SENSING</span>
            )}
          </span>
        </div>

        {/* Live Clock */}
        <div className="flex items-center gap-1.5 text-xs font-mono text-slate-400 px-2.5 py-1 rounded bg-slate-900/50 border border-slate-800/60">
          <Clock className="w-3.5 h-3.5 text-slate-500" />
          <span>{time.toLocaleTimeString()}</span>
        </div>
      </div>

      {/* Right: Actions, Privacy, Model Status */}
      <div className="flex items-center gap-2">
        {/* Quick Pause / Resume Toggle */}
        <button
          onClick={onTogglePrivacy}
          className={`px-3 py-1.5 rounded-lg text-xs font-medium flex items-center gap-1.5 transition-all duration-200 border ${
            isPaused
              ? 'bg-emerald-500/10 text-emerald-300 border-emerald-500/30 hover:bg-emerald-500/20'
              : 'bg-amber-500/10 text-amber-300 border-amber-500/30 hover:bg-amber-500/20'
          }`}
          title={isPaused ? "Resume Context Telemetry" : "Pause Context Telemetry"}
        >
          {isPaused ? <Play className="w-3.5 h-3.5" /> : <Pause className="w-3.5 h-3.5" />}
          <span>{isPaused ? 'Resume Sensing' : 'Pause'}</span>
        </button>

        {/* Privacy Center Button */}
        <button
          onClick={onOpenPrivacyModal}
          className="px-3 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-200 text-xs font-medium border border-slate-800 flex items-center gap-1.5 transition-colors"
        >
          <Shield className="w-3.5 h-3.5 text-emerald-400" />
          <span className="hidden sm:inline">Privacy Center</span>
        </button>

        {/* System & Hardware Modal Button */}
        <button
          onClick={onOpenSystemModal}
          className="px-3 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-200 text-xs font-medium border border-slate-800 flex items-center gap-1.5 transition-colors"
        >
          <Cpu className="w-3.5 h-3.5 text-indigo-400" />
          <span className="hidden sm:inline">Hardware & SLM</span>
        </button>

        {/* Research Paper Download Button */}
        <button
          onClick={onOpenPaperModal}
          className="px-3 py-1.5 rounded-lg bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white text-xs font-medium shadow-md shadow-indigo-600/20 flex items-center gap-1.5 transition-all"
        >
          <FileText className="w-3.5 h-3.5" />
          <span>IEEE Paper PDF</span>
        </button>
      </div>
    </header>
  );
}


import React, { useState, useEffect } from 'react';
import {
  Shield,
  ShieldAlert,
  X,
  Trash2,
  CheckCircle2,
  AlertTriangle,
  Lock,
  Pause,
  Play,
  FileCheck,
} from 'lucide-react';

export default function PrivacyCenterModal({
  isOpen,
  onClose,
  privacyAudit,
  isPaused,
  onTogglePrivacy,
  onPurgeAll,
}) {
  const [purgeConfirm, setPurgeConfirm] = useState(false);

  if (!isOpen) return null;

  const handlePurge = () => {
    if (!purgeConfirm) {
      setPurgeConfirm(true);
      return;
    }
    onPurgeAll();
    setPurgeConfirm(false);
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4">
      <div className="glass-panel-elevated w-full max-w-2xl rounded-3xl p-6 border border-slate-700/80 max-h-[90vh] overflow-y-auto space-y-5">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
              <Shield className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white tracking-tight">
                ContextOS Privacy Center & Governance
              </h2>
              <p className="text-xs text-slate-400 font-mono">
                Cryptographic local boundary and zero cloud egress enforcement
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Core Privacy Guarantees */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div className="p-3.5 rounded-xl bg-slate-900/80 border border-slate-800 space-y-1">
            <div className="flex items-center gap-2 text-xs font-semibold text-emerald-400">
              <CheckCircle2 className="w-4 h-4" />
              <span>100% On-Device Inference</span>
            </div>
            <p className="text-[11px] text-slate-400">
              All SLM prompt construction and token decoding occur locally on your Intel CPU. Zero external cloud API calls.
            </p>
          </div>

          <div className="p-3.5 rounded-xl bg-slate-900/80 border border-slate-800 space-y-1">
            <div className="flex items-center gap-2 text-xs font-semibold text-emerald-400">
              <Lock className="w-4 h-4" />
              <span>No Audio / Keylogging</span>
            </div>
            <p className="text-[11px] text-slate-400">
              ContextOS monitors only foreground window metadata (HWND, title, process name). Keystrokes, mics, and screens are never recorded.
            </p>
          </div>
        </div>

        {/* Tracking Switch */}
        <div className="p-4 rounded-xl bg-slate-900/90 border border-slate-800 flex items-center justify-between">
          <div>
            <div className="text-xs font-semibold text-slate-200">
              Active Context Telemetry State
            </div>
            <p className="text-[11px] text-slate-400 font-mono mt-0.5">
              Status: {isPaused ? <span className="text-amber-400">PAUSED</span> : <span className="text-emerald-400">ACTIVE</span>}
            </p>
          </div>

          <button
            onClick={onTogglePrivacy}
            className={`px-4 py-2 rounded-xl text-xs font-semibold flex items-center gap-2 transition-all ${
              isPaused
                ? 'bg-emerald-600 hover:bg-emerald-500 text-white'
                : 'bg-amber-600 hover:bg-amber-500 text-white'
            }`}
          >
            {isPaused ? <Play className="w-4 h-4" /> : <Pause className="w-4 h-4" />}
            <span>{isPaused ? 'Resume Telemetry' : 'Pause Telemetry'}</span>
          </button>
        </div>

        {/* Audit Log */}
        <div>
          <div className="text-xs font-mono font-bold uppercase tracking-wider text-slate-300 mb-2 flex items-center gap-2">
            <FileCheck className="w-4 h-4 text-indigo-400" />
            <span>Audit Trail of Privacy Actions</span>
          </div>
          <div className="max-h-36 overflow-y-auto space-y-1.5 p-2 rounded-xl bg-slate-950 border border-slate-800 font-mono text-[11px]">
            {privacyAudit?.recent_audit_logs?.length > 0 ? (
              privacyAudit.recent_audit_logs.map((log) => (
                <div key={log.id} className="flex items-center justify-between text-slate-400 border-b border-slate-900 pb-1">
                  <span className="text-indigo-400 font-semibold">{log.action}</span>
                  <span className="text-slate-500 text-[10px]">{new Date(log.timestamp).toLocaleTimeString()}</span>
                </div>
              ))
            ) : (
              <div className="text-slate-600 text-center py-2">No privacy audit actions logged yet.</div>
            )}
          </div>
        </div>

        {/* Irreversible Purge Zone */}
        <div className="p-4 rounded-2xl bg-rose-950/20 border border-rose-500/30 space-y-3">
          <div className="flex items-center gap-2 text-rose-400 text-xs font-bold uppercase tracking-wider font-mono">
            <AlertTriangle className="w-4 h-4" />
            <span>Hard Privacy Purge Zone</span>
          </div>
          <p className="text-xs text-slate-300 leading-relaxed font-sans">
            Permanently erases all recorded context events, episodic memory records, assistant chat messages, and audit logs from your local SQLite database.
          </p>

          <button
            onClick={handlePurge}
            className={`px-4 py-2 rounded-xl text-xs font-semibold flex items-center gap-2 transition-all ${
              purgeConfirm
                ? 'bg-rose-600 hover:bg-rose-500 text-white animate-pulse'
                : 'bg-rose-500/10 hover:bg-rose-500/20 text-rose-300 border border-rose-500/30'
            }`}
          >
            <Trash2 className="w-4 h-4" />
            <span>{purgeConfirm ? 'Click Again to Confirm Irreversible Wipe' : 'Purge All ContextOS Data'}</span>
          </button>
        </div>
      </div>
    </div>
  );
}


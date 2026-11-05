import React, { useState } from 'react';
import { Shield, Pause, Play, Trash2, CheckCircle2 } from 'lucide-react';

export default function PrivacyControls({
  isPaused,
  onTogglePause,
  onClearMemory,
  message,
}) {
  const [showConfirm, setShowConfirm] = useState(false);

  const handleClear = () => {
    if (!showConfirm) {
      setShowConfirm(true);
      return;
    }
    onClearMemory();
    setShowConfirm(false);
  };

  return (
    <div className="clean-card p-5 h-[340px] flex flex-col justify-between">
      <div>
        <div className="flex items-center justify-between mb-3.5 pb-2.5 border-b border-[#f0eae1]">
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-lg bg-[#fbf0f2] text-[#7a1c30]">
              <Shield className="w-4 h-4" />
            </div>
            <h2 className="text-sm font-bold text-[#1f2937] uppercase tracking-wide">
              Privacy Controls
            </h2>
          </div>
          <span
            className={`text-xs px-2.5 py-0.5 rounded-full font-medium ${
              isPaused
                ? 'bg-amber-100 text-amber-800'
                : 'bg-emerald-100 text-emerald-800'
            }`}
          >
            {isPaused ? 'Tracking Paused' : 'Tracking Active'}
          </span>
        </div>

        <p className="text-xs text-[#4b5563] leading-relaxed mb-4">
          All context processing and AI inference run locally on this computer. You have full control over what is tracked and stored.
        </p>

        {/* Action Controls */}
        <div className="space-y-3">
          {/* Pause / Resume Button */}
          <button
            onClick={onTogglePause}
            className={`w-full py-2.5 px-4 rounded-lg text-xs font-semibold flex items-center justify-center gap-2 transition-colors ${
              isPaused
                ? 'bg-emerald-600 hover:bg-emerald-700 text-white'
                : 'bg-[#faf7f2] hover:bg-[#fbf0f2] text-[#7a1c30] border border-[#d4a5af]'
            }`}
          >
            {isPaused ? (
              <>
                <Play className="w-4 h-4" />
                <span>Resume Tracking</span>
              </>
            ) : (
              <>
                <Pause className="w-4 h-4" />
                <span>Pause Tracking</span>
              </>
            )}
          </button>

          {/* Clear Memory Button */}
          <button
            onClick={handleClear}
            className={`w-full py-2.5 px-4 rounded-lg text-xs font-semibold flex items-center justify-center gap-2 transition-all ${
              showConfirm
                ? 'bg-rose-700 text-white'
                : 'bg-white hover:bg-rose-50 text-rose-700 border border-rose-200'
            }`}
          >
            <Trash2 className="w-4 h-4" />
            <span>{showConfirm ? 'Click Again to Confirm Clear' : 'Clear Memory'}</span>
          </button>

          {message && (
            <div className="p-2.5 rounded bg-[#fbf0f2] border border-[#d4a5af] text-[11px] text-[#7a1c30] flex items-center gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />
              <span>{message}</span>
            </div>
          )}
        </div>
      </div>

      <div className="pt-3 border-t border-[#f0eae1] text-[11px] text-[#6b7280]">
        Privacy Guarantee: Zero network telemetry. Memory can be cleared at any time.
      </div>
    </div>
  );
}


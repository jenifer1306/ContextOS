import React from 'react';
import { BookOpen, FileText, CheckCircle2, AlertCircle } from 'lucide-react';

export default function Navbar({ ollamaStatus, onDownloadPaper }) {
  const isOllamaOnline = ollamaStatus?.is_available;

  return (
    <header className="bg-white border-b border-[#e5dfd3] py-3.5 px-6 sticky top-0 z-20">
      <div className="max-w-6xl mx-auto flex items-center justify-between">
        {/* Project Title & Badge */}
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-[#7a1c30] text-white flex items-center justify-center font-bold text-lg shadow-sm">
            C
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-lg font-bold text-[#1f2937] tracking-tight">ContextOS</h1>
            </div>
            <p className="text-xs text-[#6b7280]">
              Privacy-Preserving Context-Aware Computing Prototype
            </p>
          </div>
        </div>

        {/* Right Actions: AI Status & Research Paper */}
        <div className="flex items-center gap-3">
          {/* Simple AI Model Indicator */}
          <div className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#faf7f2] border border-[#e5dfd3] text-xs text-[#4b5563]">
            {isOllamaOnline ? (
              <>
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                <span>Ollama AI: <strong className="text-emerald-700">Connected</strong></span>
              </>
            ) : (
              <>
                <AlertCircle className="w-3.5 h-3.5 text-[#7a1c30]" />
                <span>AI Mode: <strong className="text-[#7a1c30]">Local Rule-Based</strong></span>
              </>
            )}
          </div>

          {/* Research Paper PDF Download */}
          <button
            onClick={onDownloadPaper}
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-[#7a1c30] hover:bg-[#5e1323] text-white text-xs font-medium shadow-sm transition-colors"
            title="Download the 6-Page IEEE Research Paper"
          >
            <FileText className="w-3.5 h-3.5" />
            <span>Research Paper (PDF)</span>
          </button>
        </div>
      </div>
    </header>
  );
}


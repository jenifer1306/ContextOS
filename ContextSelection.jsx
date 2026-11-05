import React from 'react';
import { BookOpen, Search, FileEdit, Monitor } from 'lucide-react';

const CONTEXT_OPTIONS = [
  {
    id: 'Study',
    title: 'Study',
    subtitle: 'Operating Systems Coursework',
    icon: BookOpen,
  },
  {
    id: 'Research',
    title: 'Research',
    subtitle: 'Academic Paper & Survey Review',
    icon: Search,
  },
  {
    id: 'Document Editing',
    title: 'Document Editing',
    subtitle: 'Project Report Writing',
    icon: FileEdit,
  },
];

export default function ContextSelection({
  currentMode,
  currentCategory,
  onSelectContext,
  onSelectLiveOS,
  isLoading,
}) {
  const isLiveOS = currentMode === 'os_detected';

  return (
    <div className="clean-card p-5">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-3.5 pb-2.5 border-b border-[#f0eae1]">
        <div>
          <h2 className="text-sm font-bold text-[#1f2937] uppercase tracking-wide">
            1. Select Context
          </h2>
          <p className="text-xs text-[#6b7280]">
            Choose an activity to see how ContextOS adapts its suggestions and answers:
          </p>
        </div>

        {/* Option to toggle live Windows detection */}
        <button
          onClick={onSelectLiveOS}
          disabled={isLoading}
          className={`px-3 py-1.5 rounded-lg text-xs font-medium border flex items-center gap-1.5 transition-all ${
            isLiveOS
              ? 'bg-[#7a1c30] text-white border-[#7a1c30]'
              : 'bg-white text-[#4b5563] border-[#d1c8bb] hover:bg-[#faf7f2]'
          }`}
        >
          <Monitor className="w-3.5 h-3.5" />
          <span>{isLiveOS ? 'Detecting Windows OS' : 'Use Active Windows Window'}</span>
        </button>
      </div>

      {/* The 3 Core Context Buttons */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        {CONTEXT_OPTIONS.map((opt) => {
          const Icon = opt.icon;
          const isSelected = !isLiveOS && currentCategory === opt.id;

          return (
            <button
              key={opt.id}
              disabled={isLoading}
              onClick={() => onSelectContext(opt.id)}
              className={`p-4 text-left transition-all ${
                isSelected
                  ? 'clean-card-selected bg-[#fbf0f2]'
                  : 'clean-card hover:border-[#b5a999] hover:bg-[#faf7f2]'
              } ${isLoading ? 'opacity-60 cursor-not-allowed' : ''}`}
            >
              <div className="flex items-center gap-2.5 mb-1.5">
                <div
                  className={`p-2 rounded-lg ${
                    isSelected
                      ? 'bg-[#7a1c30] text-white'
                      : 'bg-[#faf7f2] text-[#7a1c30] border border-[#e5dfd3]'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                </div>
                <span className={`text-sm font-bold ${isSelected ? 'text-[#7a1c30]' : 'text-[#1f2937]'}`}>
                  {opt.title}
                </span>
              </div>
              <p className="text-xs text-[#6b7280] leading-relaxed">
                {opt.subtitle}
              </p>
            </button>
          );
        })}
      </div>
    </div>
  );
}


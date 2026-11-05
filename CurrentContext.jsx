import React from 'react';
import { Tag, FileText, CheckCircle2 } from 'lucide-react';

export default function CurrentContext({ context }) {
  if (!context) {
    return (
      <div className="clean-card p-4 text-center text-xs text-[#6b7280]">
        Loading active context...
      </div>
    );
  }

  const {
    category = 'Study',
    app_name = 'Application',
    window_title = 'Untitled',
    task_summary = 'No task active',
    source_type = 'simulated',
  } = context;

  const isSimulated = source_type === 'simulated';

  return (
    <div className="clean-card p-5 border-l-4 border-l-[#7a1c30]">
      <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
        <div className="flex items-center gap-2">
          <span className="text-xs font-bold text-[#6b7280] uppercase tracking-wider">
            Current Context
          </span>
          <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-[#fbf0f2] text-[#7a1c30] border border-[#d4a5af]">
            {category}
          </span>
        </div>

        {/* Source Badge: Clearly identifies simulated vs live OS */}
        <span
          className={`text-xs px-2.5 py-0.5 rounded-full font-medium border ${
            isSimulated
              ? 'bg-[#faf7f2] text-[#4b5563] border-[#d1c8bb]'
              : 'bg-emerald-50 text-emerald-700 border-emerald-200'
          }`}
        >
          {isSimulated ? 'Source: Manual Selection' : 'Source: Windows OS Detection'}
        </span>
      </div>

      {/* Main Details */}
      <div className="space-y-1.5">
        <div className="flex items-baseline gap-2">
          <span className="text-xs font-semibold text-[#4b5563]">Active Document / Window:</span>
          <h3 className="text-sm font-bold text-[#1f2937]">
            {window_title}
          </h3>
        </div>

        <div className="flex items-baseline gap-2">
          <span className="text-xs font-semibold text-[#4b5563]">Application:</span>
          <span className="text-xs text-[#374151] font-medium">{app_name}</span>
        </div>

        <div className="mt-2 pt-2 border-t border-[#f0eae1]">
          <span className="text-xs font-semibold text-[#4b5563]">Inferred Task: </span>
          <span className="text-xs text-[#1f2937]">{task_summary}</span>
        </div>
      </div>
    </div>
  );
}


import React from 'react';
import { History, Clock } from 'lucide-react';

export default function RecentActivity({ activities }) {
  return (
    <div className="clean-card p-5 h-[340px] flex flex-col">
      <div className="flex items-center justify-between mb-3.5 pb-2.5 border-b border-[#f0eae1]">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-[#fbf0f2] text-[#7a1c30]">
            <History className="w-4 h-4" />
          </div>
          <h2 className="text-sm font-bold text-[#1f2937] uppercase tracking-wide">
            Recent Activity
          </h2>
        </div>
        <span className="text-xs text-[#6b7280]">
          {activities.length} recorded
        </span>
      </div>

      <div className="flex-1 overflow-y-auto space-y-2 pr-1">
        {activities.length === 0 ? (
          <div className="h-full flex items-center justify-center text-xs text-[#6b7280]">
            No recent activity recorded.
          </div>
        ) : (
          activities.map((item) => (
            <div
              key={item.id}
              className="p-3 rounded-lg border border-[#e5dfd3] bg-[#faf7f2] space-y-1 hover:border-[#d4a5af] transition-colors"
            >
              <div className="flex items-center justify-between text-xs">
                <span className="font-bold text-[#7a1c30]">
                  {item.category}
                </span>
                <span className="text-[11px] text-[#6b7280] flex items-center gap-1">
                  <Clock className="w-3 h-3 text-[#9ca3af]" />
                  {new Date(item.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </span>
              </div>
              <div className="text-xs text-[#1f2937] font-medium truncate">
                {item.window_title}
              </div>
              <div className="text-[11px] text-[#6b7280]">
                {item.app_name} • {item.source_type === 'simulated' ? 'Preset' : 'OS Telemetry'}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}


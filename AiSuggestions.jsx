import React from 'react';
import { Lightbulb, ArrowRight, HelpCircle } from 'lucide-react';

export default function AiSuggestions({ suggestions, onSelectSuggestion, category }) {
  return (
    <div className="clean-card p-5 h-full flex flex-col">
      <div className="flex items-center justify-between mb-3.5 pb-2.5 border-b border-[#f0eae1]">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-[#fbf0f2] text-[#7a1c30]">
            <Lightbulb className="w-4 h-4" />
          </div>
          <h2 className="text-sm font-bold text-[#1f2937] uppercase tracking-wide">
            AI Suggestions
          </h2>
        </div>
        <span className="text-xs text-[#6b7280]">
          For: <strong className="text-[#7a1c30]">{category}</strong>
        </span>
      </div>

      <div className="space-y-3 flex-1 overflow-y-auto pr-1">
        {suggestions.length === 0 ? (
          <p className="text-xs text-[#6b7280] py-4 text-center">
            No suggestions available. Select a context to generate suggestions.
          </p>
        ) : (
          suggestions.map((item) => (
            <div
              key={item.id}
              className="p-3.5 rounded-lg border border-[#e5dfd3] bg-[#faf7f2] space-y-2 hover:border-[#d4a5af] transition-colors"
            >
              <h3 className="text-xs font-bold text-[#1f2937]">
                {item.title}
              </h3>

              <p className="text-xs text-[#4b5563] leading-relaxed">
                {item.description}
              </p>

              {/* Simple 'Why' explanation */}
              <div className="flex items-start gap-1.5 text-[11px] text-[#6b7280] pt-1 border-t border-[#ede7de]">
                <HelpCircle className="w-3.5 h-3.5 text-[#7a1c30] shrink-0 mt-0.5" />
                <span>
                  <strong>Why:</strong> {item.rationale}
                </span>
              </div>

              {/* Action Button */}
              {item.action_payload?.prompt && (
                <button
                  onClick={() => onSelectSuggestion(item.action_payload.prompt)}
                  className="w-full mt-1.5 py-1.5 px-3 rounded text-xs font-medium bg-white hover:bg-[#fbf0f2] text-[#7a1c30] border border-[#d4a5af] flex items-center justify-center gap-1.5 transition-colors shadow-2xs"
                >
                  <span>Ask Assistant</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
}


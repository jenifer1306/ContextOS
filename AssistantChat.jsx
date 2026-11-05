import React, { useState, useRef, useEffect } from 'react';
import {
  Send,
  Bot,
  User,
  Trash2,
  Sparkles,
  Zap,
  Clock,
  Cpu,
  Layers,
} from 'lucide-react';

const QUICK_PROMPTS = [
  'What should I focus on next?',
  'Summarize my current active task',
  'Extract key entities from active window',
  'What are the high-priority deliverables?',
];

export default function AssistantChat({
  messages,
  onSendMessage,
  onClearChat,
  isLoading,
  activeContext,
  activeModel,
}) {
  const [input, setInput] = useState('');
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;
    onSendMessage(input.trim());
    setInput('');
  };

  const handleQuickPrompt = (prompt) => {
    if (isLoading) return;
    onSendMessage(prompt);
  };

  return (
    <div className="glass-panel p-5 rounded-2xl flex flex-col h-[560px] border border-slate-800 relative">
      {/* Header */}
      <div className="flex items-center justify-between pb-3 mb-3 border-b border-slate-800/80">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-indigo-500/10 text-indigo-400 border border-indigo-500/30">
            <Bot className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-slate-100 flex items-center gap-1.5">
              <span>Contextual AI Assistant</span>
              <span className="text-[10px] font-normal text-indigo-400 font-mono">
                ({activeModel})
              </span>
            </h3>
            <p className="text-[11px] text-slate-400">
              Answers adapt dynamically to active application & domain memory
            </p>
          </div>
        </div>

        <button
          onClick={onClearChat}
          className="p-1.5 rounded-lg text-slate-500 hover:text-rose-400 hover:bg-slate-900 border border-transparent hover:border-slate-800 transition-colors"
          title="Clear Conversation History"
        >
          <Trash2 className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Messages Scroll Area */}
      <div className="flex-1 overflow-y-auto space-y-3 pr-1">
        {messages.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-center p-6 space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400">
              <Sparkles className="w-6 h-6" />
            </div>
            <div>
              <p className="text-xs font-semibold text-slate-300">ContextOS Cognitive Assistant Ready</p>
              <p className="text-[11px] text-slate-500 font-mono mt-1">
                Ask any question or use quick prompts below to observe context-dependent responses.
              </p>
            </div>
          </div>
        ) : (
          messages.map((msg, idx) => {
            const isUser = msg.role === 'user';
            return (
              <div
                key={idx}
                className={`flex gap-2.5 ${isUser ? 'justify-end' : 'justify-start'}`}
              >
                {!isUser && (
                  <div className="w-7 h-7 rounded-lg bg-indigo-600/30 border border-indigo-500/40 text-indigo-300 flex items-center justify-center shrink-0 mt-0.5">
                    <Bot className="w-4 h-4" />
                  </div>
                )}

                <div
                  className={`max-w-[85%] rounded-2xl p-3 text-xs leading-relaxed space-y-2 ${
                    isUser
                      ? 'bg-indigo-600 text-white rounded-tr-none'
                      : 'bg-slate-900/90 border border-slate-800/90 text-slate-200 rounded-tl-none'
                  }`}
                >
                  <div className="whitespace-pre-wrap font-sans">{msg.content}</div>

                  {/* Context Provenance Footer for Assistant Responses */}
                  {!isUser && (
                    <div className="pt-2 border-t border-slate-800/80 flex flex-wrap items-center justify-between gap-1.5 text-[10px] font-mono text-slate-400">
                      <div className="flex items-center gap-1.5">
                        <Layers className="w-3 h-3 text-indigo-400" />
                        <span className="font-semibold text-slate-300">
                          {msg.context_category || activeContext?.category || 'Context'}:
                        </span>
                        <span className="truncate max-w-[140px] text-slate-400">
                          {msg.context_snapshot?.app || activeContext?.app_name || ''}
                        </span>
                      </div>

                      {msg.inference_latency_ms > 0 && (
                        <div className="flex items-center gap-1 text-slate-400">
                          <Clock className="w-3 h-3 text-slate-500" />
                          <span>{msg.inference_latency_ms} ms</span>
                        </div>
                      )}
                    </div>
                  )}
                </div>

                {isUser && (
                  <div className="w-7 h-7 rounded-lg bg-slate-800 border border-slate-700 text-slate-300 flex items-center justify-center shrink-0 mt-0.5">
                    <User className="w-4 h-4" />
                  </div>
                )}
              </div>
            );
          })
        )}

        {isLoading && (
          <div className="flex items-center gap-2 p-3 rounded-xl bg-slate-900/80 border border-slate-800 w-fit text-xs text-indigo-300 font-mono">
            <span className="w-2 h-2 rounded-full bg-indigo-400 animate-ping" />
            <span>SLM synthesizing response grounded in active {activeContext?.category} context...</span>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Quick Prompts */}
      <div className="pt-3 border-t border-slate-800/80">
        <div className="flex items-center gap-1.5 overflow-x-auto pb-2 scrollbar-none">
          <span className="text-[10px] font-mono text-slate-400 shrink-0 flex items-center gap-1">
            <Zap className="w-3 h-3 text-indigo-400" />
            Quick:
          </span>
          {QUICK_PROMPTS.map((qp, i) => (
            <button
              key={i}
              onClick={() => handleQuickPrompt(qp)}
              disabled={isLoading}
              className="text-[11px] font-medium px-2.5 py-1 rounded-lg bg-slate-900/90 hover:bg-slate-800 text-slate-300 hover:text-white border border-slate-800 hover:border-indigo-500/40 shrink-0 transition-colors"
            >
              {qp}
            </button>
          ))}
        </div>

        {/* Input Form */}
        <form onSubmit={handleSubmit} className="flex gap-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            disabled={isLoading}
            placeholder={`Ask ContextOS about your current ${activeContext?.category || 'task'}...`}
            className="flex-1 bg-slate-900/90 border border-slate-800 rounded-xl px-3.5 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 transition-colors font-sans"
          />
          <button
            type="submit"
            disabled={!input.trim() || isLoading}
            className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed text-white text-xs font-semibold flex items-center gap-1.5 shadow-md shadow-indigo-600/20 transition-all"
          >
            <Send className="w-3.5 h-3.5" />
            <span>Send</span>
          </button>
        </form>
      </div>
    </div>
  );
}


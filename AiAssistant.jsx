import React, { useState, useRef, useEffect } from 'react';
import { Send, Bot, User, Trash2 } from 'lucide-react';

const SAMPLE_QUESTIONS = [
  'What should I focus on next?',
  'Summarize my current task',
  'Give me 3 practice questions',
];

export default function AiAssistant({
  messages,
  onSendMessage,
  onClearChat,
  isLoading,
  currentContext,
}) {
  const [input, setInput] = useState('');
  const messagesEndRef = useRef(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;
    onSendMessage(input.trim());
    setInput('');
  };

  return (
    <div className="clean-card p-5 h-[480px] flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between mb-3 pb-2.5 border-b border-[#f0eae1]">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-[#fbf0f2] text-[#7a1c30]">
            <Bot className="w-4 h-4" />
          </div>
          <div>
            <h2 className="text-sm font-bold text-[#1f2937] uppercase tracking-wide">
              Context-Aware AI Assistant
            </h2>
            <p className="text-xs text-[#6b7280]">
              Answers adapt to your active context ({currentContext?.category || 'General'})
            </p>
          </div>
        </div>

        <button
          onClick={onClearChat}
          className="p-1.5 rounded text-[#6b7280] hover:text-[#7a1c30] hover:bg-[#faf7f2] transition-colors"
          title="Clear Conversation"
        >
          <Trash2 className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Messages Scroll View */}
      <div className="flex-1 overflow-y-auto space-y-3 pr-1">
        {messages.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-center p-6 text-[#6b7280] space-y-2">
            <p className="text-xs font-semibold text-[#374151]">
              ContextOS Assistant is ready to help.
            </p>
            <p className="text-xs max-w-sm">
              Type a question below or click a sample question to see how the assistant uses your current context.
            </p>
          </div>
        ) : (
          messages.map((msg, index) => {
            const isUser = msg.role === 'user';
            return (
              <div
                key={index}
                className={`flex gap-2.5 ${isUser ? 'justify-end' : 'justify-start'}`}
              >
                {!isUser && (
                  <div className="w-6 h-6 rounded-full bg-[#fbf0f2] text-[#7a1c30] border border-[#d4a5af] flex items-center justify-center shrink-0 mt-0.5 text-xs font-bold">
                    AI
                  </div>
                )}

                <div
                  className={`max-w-[85%] rounded-lg p-3 text-xs leading-relaxed ${
                    isUser
                      ? 'bg-[#7a1c30] text-white'
                      : 'bg-[#faf7f2] border border-[#e5dfd3] text-[#1f2937]'
                  }`}
                >
                  <div className="whitespace-pre-wrap">{msg.content}</div>

                  {!isUser && (
                    <div className="mt-2 pt-1 border-t border-[#ede7de] text-[10px] text-[#6b7280]">
                      Context: {msg.context_category || currentContext?.category || 'General'}
                    </div>
                  )}
                </div>

                {isUser && (
                  <div className="w-6 h-6 rounded-full bg-[#e5dfd3] text-[#4b5563] flex items-center justify-center shrink-0 mt-0.5 text-xs">
                    <User className="w-3.5 h-3.5" />
                  </div>
                )}
              </div>
            );
          })
        )}

        {isLoading && (
          <div className="flex items-center gap-2 p-2.5 rounded bg-[#faf7f2] border border-[#e5dfd3] text-xs text-[#7a1c30]">
            <span className="w-2 h-2 rounded-full bg-[#7a1c30] animate-ping" />
            <span>Generating answer using current {currentContext?.category} context...</span>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Sample Quick Questions */}
      <div className="pt-2 border-t border-[#f0eae1]">
        <div className="flex items-center gap-1.5 overflow-x-auto pb-2 scrollbar-none">
          <span className="text-[11px] text-[#6b7280] font-medium shrink-0">Sample:</span>
          {SAMPLE_QUESTIONS.map((q, idx) => (
            <button
              key={idx}
              disabled={isLoading}
              onClick={() => onSendMessage(q)}
              className="text-xs px-2.5 py-1 rounded bg-[#faf7f2] hover:bg-[#fbf0f2] text-[#4b5563] hover:text-[#7a1c30] border border-[#e5dfd3] shrink-0 transition-colors"
            >
              {q}
            </button>
          ))}
        </div>

        {/* Input Box */}
        <form onSubmit={handleSubmit} className="flex gap-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            disabled={isLoading}
            placeholder={`Ask a question in ${currentContext?.category || 'active'} context...`}
            className="flex-1 bg-white border border-[#d1c8bb] rounded-lg px-3.5 py-2 text-xs text-[#1f2937] placeholder-[#9ca3af] focus:outline-none focus:border-[#7a1c30] transition-colors"
          />
          <button
            type="submit"
            disabled={!input.trim() || isLoading}
            className="btn-burgundy text-xs flex items-center gap-1.5 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Send className="w-3.5 h-3.5" />
            <span>Send</span>
          </button>
        </form>
      </div>
    </div>
  );
}


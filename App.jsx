import React, { useState, useEffect, useCallback } from 'react';
import Navbar from './components/Navbar';
import CurrentContext from './components/CurrentContext';
import ContextSelection from './components/ContextSelection';
import AiSuggestions from './components/AiSuggestions';
import AiAssistant from './components/AiAssistant';
import RecentActivity from './components/RecentActivity';
import PrivacyControls from './components/PrivacyControls';
import { api } from './services/api';

export default function App() {
  // System State
  const [status, setStatus] = useState(null);
  const [currentContext, setCurrentContext] = useState(null);
  const [modeInfo, setModeInfo] = useState({ mode: 'simulated', simulation_category: 'Study' });
  const [isPaused, setIsPaused] = useState(false);

  // Content State
  const [suggestions, setSuggestions] = useState([]);
  const [messages, setMessages] = useState([]);
  const [activities, setActivities] = useState([]);
  const [privacyMessage, setPrivacyMessage] = useState('');

  // Loading Indicators
  const [isLoadingSwitch, setIsLoadingSwitch] = useState(false);
  const [isChatLoading, setIsChatLoading] = useState(false);

  // Initial Data Fetch
  const refreshData = useCallback(async () => {
    try {
      const [statusRes, ctxRes, recsRes, histRes, chatRes] = await Promise.all([
        api.getStatus().catch(() => null),
        api.getCurrentContext().catch(() => null),
        api.getRecommendations().catch(() => ({ recommendations: [] })),
        api.getContextHistory(10).catch(() => ({ events: [] })),
        api.getChatHistory().catch(() => ({ messages: [] })),
      ]);

      if (statusRes) {
        setStatus(statusRes);
        setIsPaused(statusRes.tracking_paused);
      }
      if (ctxRes) {
        setCurrentContext(ctxRes.context);
        setModeInfo(ctxRes.mode_info || { mode: 'simulated', simulation_category: 'Study' });
      }
      if (recsRes) setSuggestions(recsRes.recommendations || []);
      if (histRes) setActivities(histRes.events || []);
      if (chatRes) setMessages(chatRes.messages || []);
    } catch (err) {
      console.error('Failed to load initial data:', err);
    }
  }, []);

  useEffect(() => {
    refreshData();
    // Poll active context every 3 seconds
    const interval = setInterval(() => {
      api.getCurrentContext()
        .then((res) => {
          if (res?.context) {
            setCurrentContext(res.context);
          }
        })
        .catch(() => {});
    }, 3000);
    return () => clearInterval(interval);
  }, [refreshData]);

  // Context Selection Handler (Study, Research, Document Editing)
  const handleSelectContext = async (category) => {
    setIsLoadingSwitch(true);
    try {
      const res = await api.switchContext('simulated', category);
      setCurrentContext(res.context);
      setModeInfo({ mode: 'simulated', simulation_category: category });
      setSuggestions(res.recommendations || []);
      // Update recent activity
      const hist = await api.getContextHistory(10);
      setActivities(hist.events || []);
    } catch (err) {
      console.error('Error switching context:', err);
    } finally {
      setIsLoadingSwitch(false);
    }
  };

  // Toggle Live OS Detection
  const handleSelectLiveOS = async () => {
    setIsLoadingSwitch(true);
    try {
      const res = await api.switchContext('os_detected', null);
      setCurrentContext(res.context);
      setModeInfo({ mode: 'os_detected', simulation_category: null });
      setSuggestions(res.recommendations || []);
      const hist = await api.getContextHistory(10);
      setActivities(hist.events || []);
    } catch (err) {
      console.error('Error enabling live OS detection:', err);
    } finally {
      setIsLoadingSwitch(false);
    }
  };

  // Assistant Chat Message Handler
  const handleSendMessage = async (userText) => {
    setIsChatLoading(true);
    // Add user message to UI immediately
    setMessages((prev) => [
      ...prev,
      { role: 'user', content: userText, timestamp: new Date().toISOString() },
    ]);

    try {
      const res = await api.sendChatMessage(userText);
      setMessages((prev) => [
        ...prev,
        {
          role: 'assistant',
          content: res.response,
          context_category: res.context_snapshot?.category,
          timestamp: new Date().toISOString(),
        },
      ]);
    } catch (err) {
      setMessages((prev) => [
        ...prev,
        {
          role: 'assistant',
          content: `Unable to get response: ${err.message}`,
          timestamp: new Date().toISOString(),
        },
      ]);
    } finally {
      setIsChatLoading(false);
    }
  };

  // Clear Chat History
  const handleClearChat = async () => {
    try {
      await api.clearChatHistory();
      setMessages([]);
    } catch (err) {
      console.error('Failed to clear chat:', err);
    }
  };

  // Privacy: Toggle Pause / Resume
  const handleTogglePause = async () => {
    const nextState = !isPaused;
    try {
      const res = await api.togglePrivacy(nextState);
      setIsPaused(res.tracking_paused);
      setPrivacyMessage(res.message);
      setTimeout(() => setPrivacyMessage(''), 4000);
    } catch (err) {
      console.error('Failed to toggle tracking:', err);
    }
  };

  // Privacy: Clear Stored Memory
  const handleClearMemory = async () => {
    try {
      await api.clearMemories(null);
      setPrivacyMessage('Context memory successfully cleared.');
      setTimeout(() => setPrivacyMessage(''), 4000);
    } catch (err) {
      console.error('Failed to clear memory:', err);
    }
  };

  // Download IEEE Paper PDF
  const handleDownloadPaper = () => {
    window.open(api.getPaperDownloadUrl(), '_blank');
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#faf7f2] text-[#1f2937]">
      {/* Top Navigation */}
      <Navbar
        ollamaStatus={status?.ollama_status}
        onDownloadPaper={handleDownloadPaper}
      />

      {/* Main Content Dashboard */}
      <main className="flex-1 max-w-6xl w-full mx-auto p-4 sm:p-6 space-y-5">
        {/* Row 1: Context Selection (3 Presets) */}
        <ContextSelection
          currentMode={modeInfo.mode}
          currentCategory={currentContext?.category}
          onSelectContext={handleSelectContext}
          onSelectLiveOS={handleSelectLiveOS}
          isLoading={isLoadingSwitch}
        />

        {/* Row 2: Current Context Display */}
        <CurrentContext context={currentContext} />

        {/* Row 3: AI Suggestions (Left) + AI Assistant (Right) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
          <div className="lg:col-span-5">
            <AiSuggestions
              suggestions={suggestions}
              onSelectSuggestion={handleSendMessage}
              category={currentContext?.category || 'Study'}
            />
          </div>

          <div className="lg:col-span-7">
            <AiAssistant
              messages={messages}
              onSendMessage={handleSendMessage}
              onClearChat={handleClearChat}
              isLoading={isChatLoading}
              currentContext={currentContext}
            />
          </div>
        </div>

        {/* Row 4: Recent Activity (Left) + Privacy Controls (Right) */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
          <RecentActivity activities={activities} />

          <PrivacyControls
            isPaused={isPaused}
            onTogglePause={handleTogglePause}
            onClearMemory={handleClearMemory}
            message={privacyMessage}
          />
        </div>
      </main>

      {/* Simple Footer */}
      <footer className="py-4 text-center text-xs text-[#6b7280] border-t border-[#e5dfd3] bg-white">
        ContextOS &bull; 100% On-Device Processing
      </footer>
    </div>
  );
}

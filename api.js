/**
 * ContextOS Frontend API Client
 * Interfaces with the FastAPI local backend at http://127.0.0.1:8000
 */
const BASE_URL = 'http://127.0.0.1:8000';

async function request(endpoint, options = {}) {
  const url = `${BASE_URL}${endpoint}`;
  const headers = {
    'Content-Type': 'application/json',
    ...(options.headers || {}),
  };

  try {
    const res = await fetch(url, { ...options, headers });
    if (!res.ok) {
      const errorData = await res.json().catch(() => ({}));
      throw new Error(errorData.detail || `HTTP Error ${res.status}: ${res.statusText}`);
    }
    return await res.json();
  } catch (err) {
    console.error(`API Error on ${endpoint}:`, err);
    throw err;
  }
}

export const api = {
  // System Status & Hardware
  getStatus: () => request('/api/status'),

  // Context Detection & Switching
  getCurrentContext: () => request('/api/context/current'),
  switchContext: (mode, category = null) =>
    request('/api/context/switch', {
      method: 'POST',
      body: JSON.stringify({ mode, category }),
    }),
  getContextHistory: (limit = 30) => request(`/api/context/history?limit=${limit}`),

  // Context Memory
  getMemories: (category = null, limit = 50) => {
    const q = category && category !== 'All' ? `?category=${encodeURIComponent(category)}&limit=${limit}` : `?limit=${limit}`;
    return request(`/api/memory${q}`);
  },
  deleteMemory: (memoryId) =>
    request(`/api/memory/${memoryId}`, { method: 'DELETE' }),
  clearMemories: (category = null) =>
    request('/api/memory/clear', {
      method: 'POST',
      body: JSON.stringify({ category }),
    }),

  // Recommendations
  getRecommendations: () => request('/api/recommendations'),

  // Assistant & Chat
  sendChatMessage: (message) =>
    request('/api/assistant/chat', {
      method: 'POST',
      body: JSON.stringify({ message }),
    }),
  getChatHistory: () => request('/api/chat/history'),
  clearChatHistory: () => request('/api/chat/history', { method: 'DELETE' }),

  // Privacy Controls
  togglePrivacy: (pause) =>
    request('/api/privacy/toggle', {
      method: 'POST',
      body: JSON.stringify({ pause }),
    }),
  clearAllPrivacyData: () => request('/api/privacy/clear-all', { method: 'POST' }),
  getPrivacyAudit: () => request('/api/privacy/audit'),

  // Models & SLM Settings
  getModels: () => request('/api/models'),
  selectModel: (modelId) =>
    request('/api/models/select', {
      method: 'POST',
      body: JSON.stringify({ model_id: modelId }),
    }),

  // Benchmark & Paper
  runBenchmark: (iterations = 15) => request(`/api/benchmark/run?iterations=${iterations}`),
  getPaperStatus: () => request('/api/paper/status'),
  getPaperDownloadUrl: () => `${BASE_URL}/api/paper/download`,
};


// API Client for Typr_ Backend Services

const API_BASE = '/api';

export const apiClient = async (endpoint, { method = 'GET', body, headers = {} } = {}) => {
  const token = localStorage.getItem('typr_token');

  const config = {
    method,
    headers: {
      'Content-Type': 'application/json',
      ...headers
    }
  };

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  if (body) {
    config.body = JSON.stringify(body);
  }

  const response = await fetch(`${API_BASE}${endpoint}`, config);
  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || 'Network request failed');
  }

  return data;
};

// Auth endpoints
export const loginApi = (credentials) => apiClient('/auth/login', { method: 'POST', body: credentials });
export const registerApi = (userData) => apiClient('/auth/register', { method: 'POST', body: userData });
export const getMeApi = () => apiClient('/auth/me');

// Snippet endpoints
export const getRandomSnippetApi = (params = {}) => {
  const searchParams = new URLSearchParams(params).toString();
  return apiClient(`/snippets/random?${searchParams}`);
};

// Result endpoints
export const saveResultApi = (resultData) => apiClient('/results', { method: 'POST', body: resultData });
export const getMyResultsApi = () => apiClient('/results/my-history');
export const getMyStatsApi = () => apiClient('/results/my-stats');

// Leaderboard endpoints
export const getLeaderboardApi = (params = {}) => {
  const searchParams = new URLSearchParams(params).toString();
  return apiClient(`/leaderboard?${searchParams}`);
};

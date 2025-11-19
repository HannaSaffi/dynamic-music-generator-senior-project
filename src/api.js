import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

// Create axios instance
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add token to requests automatically
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Handle errors globally
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Unauthorized - clear token and redirect to login
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// ============ AUTH ENDPOINTS ============

export const authAPI = {
  register: async (userData) => {
    const response = await api.post('/auth/register', userData);
    if (response.data.token) {
      localStorage.setItem('token', response.data.token);
      localStorage.setItem('user', JSON.stringify(response.data.user));
    }
    return response.data;
  },

  login: async (credentials) => {
    const response = await api.post('/auth/login', credentials);
    if (response.data.token) {
      localStorage.setItem('token', response.data.token);
      localStorage.setItem('user', JSON.stringify(response.data.user));
    }
    return response.data;
  },

  logout: () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  },

  getCurrentUser: async () => {
    const response = await api.get('/auth/me');
    return response.data;
  },

  updateProfile: async (userData) => {
    const response = await api.put('/auth/update-profile', userData);
    return response.data;
  },
};

// ============ SONGS ENDPOINTS ============

export const songsAPI = {
  getAllSongs: async (params = {}) => {
    const response = await api.get('/songs', { params });
    return response.data;
  },

  getSongById: async (id) => {
    const response = await api.get(`/songs/${id}`);
    return response.data;
  },

  matchEmotion: async (emotion, musicParams = {}) => {
    const response = await api.get('/songs/match-emotion', {
      params: { emotion, ...musicParams },
    });
    return response.data;
  },

  favoriteSong: async (songId) => {
    const response = await api.post(`/songs/${songId}/favorite`);
    return response.data;
  },

  unfavoriteSong: async (songId) => {
    const response = await api.delete(`/songs/${songId}/favorite`);
    return response.data;
  },

  getFavorites: async () => {
    const response = await api.get('/songs/user/favorites');
    return response.data;
  },
};

// ============ SESSIONS ENDPOINTS ============

export const sessionsAPI = {
  getSessions: async (params = {}) => {
    const response = await api.get('/sessions', { params });
    return response.data;
  },

  getSessionById: async (id) => {
    const response = await api.get(`/sessions/${id}`);
    return response.data;
  },

  createSession: async (sessionData) => {
    const response = await api.post('/sessions', sessionData);
    return response.data;
  },

  updateSession: async (id, sessionData) => {
    const response = await api.put(`/sessions/${id}`, sessionData);
    return response.data;
  },

  addEmotionEntry: async (sessionId, emotionData) => {
    const response = await api.post(`/sessions/${sessionId}/emotion`, emotionData);
    return response.data;
  },

  addSongPlay: async (sessionId, songData) => {
    const response = await api.post(`/sessions/${sessionId}/song`, songData);
    return response.data;
  },

  endSession: async (sessionId) => {
    const response = await api.put(`/sessions/${sessionId}/end`);
    return response.data;
  },

  deleteSession: async (sessionId) => {
    const response = await api.delete(`/sessions/${sessionId}`);
    return response.data;
  },

  getStatistics: async () => {
    const response = await api.get('/sessions/stats/summary');
    return response.data;
  },
};

export default api;

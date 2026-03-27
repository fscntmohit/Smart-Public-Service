import axios from 'axios';

const rawBaseUrl = (import.meta.env.VITE_API_URL || '').trim();
const normalizedBaseUrl = rawBaseUrl
  ? `${rawBaseUrl.replace(/\/+$/, '')}${rawBaseUrl.includes('/api') ? '' : '/api'}`
  : 'http://localhost:5001/api';

const api = axios.create({
  baseURL: normalizedBaseUrl,
  headers: { 'Content-Type': 'application/json' },
});

// Attach Clerk token to every request
export const setAuthInterceptor = (getToken) => {
  api.interceptors.request.use(async (config) => {
    try {
      const token = await getToken();
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    } catch (err) {
      console.error('Token error:', err);
    }
    return config;
  });
};

export default api;

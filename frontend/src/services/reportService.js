import axios from 'axios';
import api from './api';

const rawApiUrl = (import.meta.env.VITE_API_URL || '').trim();
const normalizedEnvBase = rawApiUrl
  ? `${rawApiUrl.replace(/\/+$/, '')}${rawApiUrl.includes('/api') ? '' : '/api'}`
  : '';

const fallbackBases = ['http://localhost:5001/api', normalizedEnvBase]
  .map((base) => base.replace(/\/+$/, ''))
  .filter(Boolean)
  .filter((base, index, arr) => arr.indexOf(base) === index);

const reportPaths = ['/report', '/reports'];

export const downloadReportPdf = async (type, config = {}) => {
  const params = { ...(config.params || {}), type };

  const requestConfig = {
    ...config,
    params,
    responseType: 'blob',
  };

  let lastError;

  for (const path of reportPaths) {
    try {
      return await api.get(path, requestConfig);
    } catch (error) {
      const status = error?.response?.status;
      if (status === 401 || status === 403 || status === 400) {
        throw error;
      }
      lastError = error;
    }
  }

  for (const baseURL of fallbackBases) {
    for (const path of reportPaths) {
      try {
        return await axios.get(`${baseURL}${path}`, requestConfig);
      } catch (error) {
        const status = error?.response?.status;
        if (status === 401 || status === 403 || status === 400) {
          throw error;
        }
        lastError = error;
      }
    }
  }

  throw lastError;
};

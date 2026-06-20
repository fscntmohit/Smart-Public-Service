import api from './api';

export const downloadReportPdf = async (type, config = {}) => {
  // Use the authenticated api instance (interceptor attaches Clerk token)
  // responseType: 'blob' is required for PDF binary downloads
  return api.get('/reports', {
    ...config,
    params: { ...(config.params || {}), type },
    responseType: 'blob',
  });
};

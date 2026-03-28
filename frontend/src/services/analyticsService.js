import api from './api';

export const getStats = (config) => api.get('/analytics/stats', config);
export const getCategoryDistribution = (config) => api.get('/analytics/categories', config);
export const getMonthlyTrends = (config) => api.get('/analytics/trends', config);
export const getAreaDistribution = (config) => api.get('/analytics/areas', config);
export const getHeatmapData = (config) => api.get('/analytics/heatmap', config);
export const getOfficerPerformance = (config) => api.get('/analytics/performance', config);

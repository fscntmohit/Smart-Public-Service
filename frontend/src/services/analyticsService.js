import api from './api';

export const getStats = () => api.get('/analytics/stats');
export const getCategoryDistribution = () => api.get('/analytics/categories');
export const getMonthlyTrends = () => api.get('/analytics/trends');
export const getAreaDistribution = () => api.get('/analytics/areas');
export const getHeatmapData = () => api.get('/analytics/heatmap');
export const getOfficerPerformance = () => api.get('/analytics/performance');

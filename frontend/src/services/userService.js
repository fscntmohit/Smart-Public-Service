import api from './api';

export const syncUser = (data) => api.post('/users/sync', data);
export const getMe = () => api.get('/users/me');
export const getOfficers = () => api.get('/users/officers');
export const createOfficer = (data) => api.post('/users/officers', data);
export const updateOfficer = (id, data) => api.put(`/users/officers/${id}`, data);
export const deleteOfficer = (id) => api.delete(`/users/officers/${id}`);

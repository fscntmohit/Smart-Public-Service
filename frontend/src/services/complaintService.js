import api from './api';

export const createComplaint = (data) => api.post('/complaints', data);
export const getMyComplaints = () => api.get('/complaints/my');
export const getOfficerComplaints = (params) => api.get('/complaints/officer', { params });
export const getAllComplaints = (params) => api.get('/complaints', { params });
export const getComplaint = (id) => api.get(`/complaints/${id}`);
export const trackComplaintById = (complaintId) => api.get(`/complaints/track/${encodeURIComponent(complaintId)}`);
export const updateComplaintStatus = (id, data) => api.patch(`/complaints/${id}/status`, data);
export const assignOfficer = (id, officerId) => api.patch(`/complaints/${id}/assign`, { officerId });

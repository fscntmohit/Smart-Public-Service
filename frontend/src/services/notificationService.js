import api from './api';

const withAuthHeader = (token) => (
	token
		? { headers: { Authorization: `Bearer ${token}` } }
		: undefined
);

export const getMyNotifications = (token) => api.get('/notifications', withAuthHeader(token));
export const markNotificationRead = (id, token) => api.patch(`/notifications/${id}/read`, {}, withAuthHeader(token));
export const markAllNotificationsRead = (token) => api.patch('/notifications/read-all', {}, withAuthHeader(token));

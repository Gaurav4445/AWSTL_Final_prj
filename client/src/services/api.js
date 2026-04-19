import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: { 'Content-Type': 'application/json' },
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

export const userAPI = {
  register: (data) => api.post('/users/register', data),
  login:    (data) => api.post('/users/login', data),
  getMe:    ()     => api.get('/users/me'),
  update:   (data) => api.put('/users/me', data),
};

export const propertyAPI = {
  getAll:   ()         => api.get('/properties'),
  getById:  (id)       => api.get(`/properties/${id}`),
  create:   (data)     => api.post('/properties', data),
  update:   (id, data) => api.put(`/properties/${id}`, data),
  delete:   (id)       => api.delete(`/properties/${id}`),
};

export const taskAPI = {
  getAll:         ()           => api.get('/tasks'),
  getByProperty:  (propId)     => api.get(`/tasks/property/${propId}`),
  getTemplates:   ()           => api.get('/tasks/templates'),
  create:         (data)       => api.post('/tasks', data),
  update:         (id, data)   => api.put(`/tasks/${id}`, data),
  delete:         (id)         => api.delete(`/tasks/${id}`),
};

export const recordAPI = {
  getAll:           ()           => api.get('/records'),
  getByProperty:    (propId)     => api.get(`/records/property/${propId}`),
  getDashboardStats:()           => api.get('/records/stats/dashboard'),
  create:           (data)       => api.post('/records', data),
  update:           (id, data)   => api.put(`/records/${id}`, data),
  delete:           (id)         => api.delete(`/records/${id}`),
};

export const vendorAPI = {
  getAll:  ()           => api.get('/vendors'),
  create:  (data)       => api.post('/vendors', data),
  update:  (id, data)   => api.put(`/vendors/${id}`, data),
  delete:  (id)         => api.delete(`/vendors/${id}`),
};

export const notificationAPI = {
  getAll:       ()     => api.get('/notifications'),
  markAsRead:   (id)   => api.put(`/notifications/${id}/read`),
  markAllAsRead:()     => api.put('/notifications/read-all'),
};

// Extend userAPI with notification methods
userAPI.getNotifications = () => api.get('/notifications');
userAPI.markNotificationAsRead = (id) => api.put(`/notifications/${id}/read`);
userAPI.markAllNotificationsAsRead = () => api.put('/notifications/read-all');

export default api;
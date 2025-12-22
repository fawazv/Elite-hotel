import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:4000';

// Ensure we don't duplicate /api if it's already in the base URL
const cleanBaseUrl = API_BASE_URL.replace(/\/api\/?$/, '');
const apiClient = axios.create({
  baseURL: `${cleanBaseUrl}/api/notifications`,
  headers: {
    'Content-Type': 'application/json',
  },
});

apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const getNotifications = async (role?: string) => {
  const response = await apiClient.get('/', { params: { role } });
  return response.data;
};

export const markAsRead = async (id: string) => {
  const response = await apiClient.put(`/${id}/read`);
  return response.data;
};

export const markAllAsRead = async () => {
  const response = await apiClient.put('/read-all');
  return response.data;
};

export const deleteNotification = async (id: string) => {
  const response = await apiClient.delete(`/${id}`);
  return response.data;
};

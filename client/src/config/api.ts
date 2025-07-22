import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('admin_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle errors
api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    if (error.response?.status === 401) {
      // Token expired or invalid
      localStorage.removeItem('admin_token');
      window.location.href = '/admin/login';
    }
    return Promise.reject(error);
  }
);

export default api;

// API endpoints
export const endpoints = {
  // Auth
  auth: {
    login: '/auth/login',
    register: '/auth/register',
    me: '/auth/me',
    logout: '/auth/logout',
  },
  
  // Charities
  charities: {
    list: '/charities',
    create: '/charities',
    get: (id: string) => `/charities/${id}`,
    update: (id: string) => `/charities/${id}`,
    delete: (id: string) => `/charities/${id}`,
    toggleStatus: (id: string) => `/charities/${id}/toggle-status`,
    categories: '/charities/categories/list',
  },
  
  // Donations
  donations: {
    list: '/donations',
    create: '/donations',
    get: (id: string) => `/donations/${id}`,
    updateStatus: (id: string) => `/donations/${id}/status`,
    delete: (id: string) => `/donations/${id}`,
    charity: (charityId: string) => `/donations/charity/${charityId}`,
    stats: '/donations/stats/summary',
  },
  
  // Food Slots
  foodSlots: {
    list: '/food-slots',
    create: '/food-slots',
    get: (id: string) => `/food-slots/${id}`,
    update: (id: string) => `/food-slots/${id}`,
    delete: (id: string) => `/food-slots/${id}`,
    book: (id: string) => `/food-slots/${id}/book`,
    updateStatus: (id: string) => `/food-slots/${id}/status`,
    stats: '/food-slots/stats/summary',
  },
  
  // Notifications
  notifications: {
    list: '/notifications',
    create: '/notifications',
    delete: (id: string) => `/notifications/${id}`,
    charity: (charityId: string) => `/notifications/charity/${charityId}`,
    markAsRead: (id: string, charityId: string) => `/notifications/${id}/read/${charityId}`,
    unreadCount: (charityId: string) => `/notifications/unread/count/${charityId}`,
    markAllRead: (charityId: string) => `/notifications/mark-all-read/${charityId}`,
    stats: '/notifications/stats/summary',
  },
  
  // Reports
  reports: {
    dashboard: '/reports/dashboard',
    donations: '/reports/donations',
    foodSlots: '/reports/food-slots',
    charities: '/reports/charities',
    exportDonations: '/reports/export/donations',
    analyticsTrends: '/reports/analytics/trends',
  },
};
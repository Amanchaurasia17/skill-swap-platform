import axios from 'axios';

// Create axios instance with base configuration
const api = axios.create({
  baseURL: process.env.REACT_APP_API_URL || 'http://localhost:5000/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add auth token to requests if available
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('authToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Handle response errors globally
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Token expired or invalid
      localStorage.removeItem('authToken');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// API methods using the same naming as in our components
const apiMethods = {
  // Auth
  register: (userData) => api.post('/auth/register', userData),
  login: (credentials) => api.post('/auth/login', credentials),
  getCurrentUser: () => api.get('/auth/me'),
  
  // Users
  getAllUsers: () => api.get('/users'),
  getUserById: (id) => api.get(`/users/${id}`),
  updateProfile: (userData) => api.put('/users/profile', userData),
  deleteUser: (id) => api.delete(`/admin/users/${id}`),
  
  // Swap Requests
  createSwapRequest: (swapData) => api.post('/swaps', swapData),
  getUserSwapRequests: () => api.get('/swaps/my'),
  getSwapRequest: (id) => api.get(`/swaps/${id}`),
  updateSwapRequestStatus: (id, status) => api.put(`/swaps/${id}`, { status }),
  deleteSwapRequest: (id) => api.delete(`/admin/swaps/${id}`),
  getAllSwapRequests: () => api.get('/admin/swaps'),
  
  // Feedback
  submitFeedback: (requestId, feedbackData) => api.post(`/swaps/${requestId}/feedback`, feedbackData),
  
  // Admin
  getAdminStats: () => api.get('/admin/stats'),
};

// Export individual API categories (for backward compatibility)
export const authAPI = {
  register: apiMethods.register,
  login: apiMethods.login,
  getCurrentUser: apiMethods.getCurrentUser,
};

export const userAPI = {
  getAllUsers: apiMethods.getAllUsers,
  getUserById: apiMethods.getUserById,
  updateProfile: apiMethods.updateProfile,
};

export const swapAPI = {
  createSwapRequest: apiMethods.createSwapRequest,
  getUserSwapRequests: apiMethods.getUserSwapRequests,
  getSwapRequest: apiMethods.getSwapRequest,
  updateSwapRequestStatus: apiMethods.updateSwapRequestStatus,
  getAllSwapRequests: apiMethods.getAllSwapRequests,
};

export const adminAPI = {
  getAllUsers: apiMethods.getAllUsers,
  getAllSwapRequests: apiMethods.getAllSwapRequests,
  getAdminStats: apiMethods.getAdminStats,
  deleteUser: apiMethods.deleteUser,
  deleteSwapRequest: apiMethods.deleteSwapRequest,
};

// Utility functions
export const setAuthToken = (token) => {
  if (token) {
    localStorage.setItem('authToken', token);
    api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
  } else {
    localStorage.removeItem('authToken');
    delete api.defaults.headers.common['Authorization'];
  }
};

export const getAuthToken = () => {
  return localStorage.getItem('authToken');
};

export const isAuthenticated = () => {
  return !!getAuthToken();
};

// Export default API object with all methods
export default apiMethods;

import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

// Create axios instance
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      console.log('API Interceptor: Attaching token to request:', token);
      config.headers.Authorization = `Bearer ${token}`;
    }
    // Log request data
    console.log('API Request:', {
      method: config.method,
      url: config.url,
      data: config.data,
      headers: config.headers
    });
    return config;
  },
  (error) => {
    console.error('API Request Error:', error);
    return Promise.reject(error);
  }
);

// Response interceptor to handle errors
api.interceptors.response.use(
  (response) => {
    console.log('API Response:', {
      status: response.status,
      data: response.data
    });
    return response;
  },
  (error) => {
    console.error('API Error Response:', {
      status: error.response?.status,
      data: error.response?.data,
      message: error.message
    });
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Auth API calls
export const authAPI = {
  register: (userData) => api.post('/auth/register', userData),
  login: (credentials) => {
    console.log('Login attempt with credentials:', { ...credentials, password: '[REDACTED]' });
    return api.post('/auth/login', credentials);
  },
  getProfile: () => api.get('/auth/me'),
  updateProfile: (userData) => api.put('/auth/profile', userData),
};

// Blood Request API calls
export const bloodRequestAPI = {
  create: (requestData) => api.post('/blood-requests', requestData),
  getAll: (params) => api.get('/blood-requests', { params }),
  getById: (id) => api.get(`/blood-requests/${id}`),
  getMyRequests: () => api.get('/blood-requests/my-requests'),
  respond: (id, responseData) => api.post(`/blood-requests/${id}/respond`, responseData),
  fulfill: (id, fulfillmentData) => api.post(`/blood-requests/${id}/fulfill`, fulfillmentData),
  updateStatus: (id, status) => api.put(`/blood-requests/${id}/status`, { status }),
  markAsCompleted: (id) => api.post(`/blood-requests/${id}/complete`),
};

// User API calls
export const userAPI = {
  getNearbyDonors: (latitude, longitude, radius) => api.get('/user/nearby-donors', { params: { latitude, longitude, radius } }),
};

// Review API calls
export const reviewAPI = {
  create: (reviewData) => api.post('/reviews', reviewData),
  getAll: () => api.get('/reviews'),
};

// App Config API calls
export const appConfigAPI = {
  getFeatures: () => api.get('/app-config/features'),
  getStats: () => api.get('/app-config/stats'),
};

// General API call
export const apiCall = async (method, endpoint, data = null, params = null) => {
  try {
    const config = {
      method,
      url: endpoint,
      ...(data && { data }),
      ...(params && { params }),
    };
    
    const response = await api(config);
    return response.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};

export default api;
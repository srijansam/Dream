import axios from 'axios';

// Create an instance of axios with default config
const api = axios.create({
  baseURL: process.env.NODE_ENV === 'production' ? '' : 'http://localhost:5001',
  withCredentials: true,
  timeout: 30000 // 30 second timeout
});

// Add a request interceptor to include the JWT token in headers
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    console.error('Request error:', error);
    return Promise.reject(error);
  }
);

// Add a response interceptor to handle common errors
api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    // Handle session expiration or unauthorized access
    if (error.response && (error.response.status === 401 || error.response.status === 403)) {
      console.error('Authentication error:', error.response.data.message || 'Session expired');
      
      // You can uncomment this to automatically redirect to login page on auth errors
      // window.location.href = '/login';
    } else if (error.code === 'ECONNABORTED') {
      console.error('Request timeout. The server took too long to respond.');
    } else if (!error.response) {
      console.error('Network error. Please check your connection.');
    } else {
      console.error('API error:', error.response?.data?.message || error.message);
    }
    return Promise.reject(error);
  }
);

export default api; 
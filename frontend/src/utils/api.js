import axios from 'axios';

// Get the base URL from environment variables or use a default
const getBaseURL = () => {
    if (process.env.NODE_ENV === 'production') {
        // In production, use relative URLs (same domain)
        return '';
    }
    // In development, use localhost
    return 'http://localhost:5001';
};

// Create an instance of axios with default config
const api = axios.create({
    baseURL: getBaseURL(),
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
        if (error.response) {
            // The request was made and the server responded with a status code
            // that falls out of the range of 2xx
            if (error.response.status === 401 || error.response.status === 403) {
                console.error('Authentication error:', error.response.data.message);
                // Clear token if it's invalid/expired
                localStorage.removeItem('token');
                // Redirect to login page
                window.location.href = '/';
            } else {
                console.error('API error:', error.response.data.message || error.message);
            }
        } else if (error.code === 'ECONNABORTED') {
            console.error('Request timeout. The server took too long to respond.');
        } else if (!error.response) {
            console.error('Network error. Please check your connection.');
        }
        return Promise.reject(error);
    }
);

export default api; 
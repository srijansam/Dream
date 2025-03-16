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

// Retry configuration
const MAX_RETRIES = 3;
const INITIAL_RETRY_DELAY = 1000; // 1 second

// Helper function to wait
const wait = (ms) => new Promise(resolve => setTimeout(resolve, ms));

// Add a request interceptor to include the JWT token in headers
api.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('token');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        // Add retry count to config
        config.retryCount = config.retryCount || 0;
        return config;
    },
    (error) => {
        console.error('Request error:', error);
        return Promise.reject(error);
    }
);

// Add a response interceptor to handle common errors and retries
api.interceptors.response.use(
    (response) => {
        return response;
    },
    async (error) => {
        const config = error.config;

        // If we haven't reached max retries and either:
        // 1. No response (network error)
        // 2. Server error (500+)
        // 3. Rate limit (429)
        // 4. Timeout
        if (
            config.retryCount < MAX_RETRIES &&
            (
                !error.response ||
                error.response.status >= 500 ||
                error.response.status === 429 ||
                error.code === 'ECONNABORTED'
            )
        ) {
            config.retryCount += 1;

            // Exponential backoff
            const delayTime = INITIAL_RETRY_DELAY * Math.pow(2, config.retryCount - 1);
            console.log(`Retrying request (${config.retryCount}/${MAX_RETRIES}) after ${delayTime}ms`);
            
            await wait(delayTime);
            return api(config);
        }

        if (error.response) {
            // The request was made and the server responded with a status code
            // that falls out of the range of 2xx
            if (error.response.status === 401 || error.response.status === 403) {
                console.error('Authentication error:', error.response.data.message);
                // Clear token if it's invalid/expired
                localStorage.removeItem('token');
                // Redirect to login page
                window.location.href = '/login';
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

// Add convenience methods for common operations with loading state
api.withLoading = {
    get: async (url, config = {}) => {
        try {
            config.loading?.(true);
            const response = await api.get(url, config);
            return response;
        } finally {
            config.loading?.(false);
        }
    },
    post: async (url, data, config = {}) => {
        try {
            config.loading?.(true);
            const response = await api.post(url, data, config);
            return response;
        } finally {
            config.loading?.(false);
        }
    },
    put: async (url, data, config = {}) => {
        try {
            config.loading?.(true);
            const response = await api.put(url, data, config);
            return response;
        } finally {
            config.loading?.(false);
        }
    },
    delete: async (url, config = {}) => {
        try {
            config.loading?.(true);
            const response = await api.delete(url, config);
            return response;
        } finally {
            config.loading?.(false);
        }
    }
};

export default api; 
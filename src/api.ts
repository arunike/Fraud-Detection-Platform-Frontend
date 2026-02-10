import axios, { InternalAxiosRequestConfig } from 'axios';

const API_BASE_URL = 'http://localhost:8000/api';

// Create axios instance
const api = axios.create({
    baseURL: API_BASE_URL,
    headers: {
        'Content-Type': 'application/json',
    },
});

// Add auth token to requests
api.interceptors.request.use((config: InternalAxiosRequestConfig) => {
    const token = localStorage.getItem('token');
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

// Handle response errors (401 unauthorized)
api.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response?.status === 401) {
            // Token is invalid or expired
            const wasAuthenticated = !!localStorage.getItem('token');
            
            localStorage.removeItem('token');
            localStorage.removeItem('refreshToken');
            
            // Only show message if user was previously logged in
            if (wasAuthenticated && window.location.pathname !== '/login') {
                // Store a flag to show session expired message
                sessionStorage.setItem('sessionExpired', 'true');
            }
            
            // Redirect to login page if not already there
            if (window.location.pathname !== '/login') {
                window.location.href = '/login';
            }
        } else if (error.response?.status === 500) {
            console.error('Server error:', error.response.data);
        } else if (!error.response) {
            console.error('Network error: Cannot connect to server');
        }
        return Promise.reject(error);
    }
);

// Auth API types
interface AuthResponse {
    access: string;
    refresh: string;
}

// Auth API
export const auth = {
    login: async (username: string, password: string): Promise<AuthResponse> => {
        const response = await api.post<AuthResponse>('/token/', { username, password });
        if (response.data.access) {
            localStorage.setItem('token', response.data.access);
            localStorage.setItem('refreshToken', response.data.refresh);
            // Store login timestamp for server restart detection
            localStorage.setItem('loginTime', Date.now().toString());
        }
        return response.data;
    },

    register: async (username: string, password: string, email: string): Promise<any> => {
        const response = await api.post('/register/', { username, password, email });
        return response.data;
    },

    logout: (): void => {
        localStorage.removeItem('token');
        localStorage.removeItem('refreshToken');
        localStorage.removeItem('loginTime');
    },

    isAuthenticated: (): boolean => {
        return !!localStorage.getItem('token');
    },

    checkServerRestart: async (): Promise<boolean> => {
        try {
            const response = await api.get('/health/');
            const serverStartTime = response.data.server_start_time;
            const loginTime = localStorage.getItem('loginTime');
            
            if (loginTime) {
                // Convert login time from milliseconds to seconds for comparison
                const loginTimeSec = parseInt(loginTime) / 1000;
                // If server started after user logged in, session is invalid
                return serverStartTime > loginTimeSec;
            }
            return false;
        } catch (error) {
            console.error('Failed to check server restart:', error);
            return false;
        }
    },
};

// Modules API
export const modulesAPI = {
    getModules: async () => {
        const response = await api.get('/modules/');
        return response.data;
    },
};

// Metrics API
export const metricsAPI = {
    getMetrics: async () => {
        const response = await api.get('/metrics/');
        return response.data;
    },
};

// AML API
export const amlAPI = {
    detect: (data: any) => api.post('/aml/detect/', data),
    list: (params: any) => api.get('/aml/', { params }),
    getStatistics: () => api.get('/statistics/'),
    clearHistory: () => api.delete('/clear-history/'),
};

// Credit Risk API
export const creditAPI = {
    assess: (data: any) => api.post('/credit/assess/', data),
    list: (params: any) => api.get('/credit/', { params }),
};

// Insurance Fraud API
export const insuranceAPI = {
    detect: (data: any) => api.post('/insurance/detect/', data),
    list: (params: any) => api.get('/insurance/', { params }),
};

// Market Manipulation API
export const marketAPI = {
    detect: (data: any) => api.post('/market/detect/', data),
    list: (params: any) => api.get('/market/', { params }),
};

// Batch Detection API
export const batchAPI = {
    detect: (data: any) => api.post('/batch/detect/', data),
};

export default api;

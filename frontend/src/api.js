import axios from 'axios';
// --- ✅ 1. Import your configuration from the single source of truth ---
import API_CONFIG from './api/config';

// --- ✅ 2. Use the imported configuration object to create the client ---
const apiClient = axios.create(API_CONFIG);

// Request interceptor - add auth token (No changes needed here)
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('access_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor - handle errors globally (No changes needed here)
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('access_token');
      if (window.location.pathname !== '/login') {
        window.location.href = '/login';
      }
    }
    
    if (!error.response) {
      console.error('Network error - check if backend is running on port 8000');
      console.error('Make sure backend services are running:');
      console.error('- FastAPI server: uvicorn app.main:app --reload');
      console.error('- MongoDB: mongod');
      console.error('- Redis: redis-server');
    }
    
    // ... other error handling ...
    
    return Promise.reject(error);
  }
);

export default apiClient;

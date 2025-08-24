import axios from 'axios'

const API = axios.create({ 
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:8000',
  timeout: 10000,
})

// Request interceptor - add auth token
API.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

// Response interceptor - handle errors globally
API.interceptors.response.use(
  (response) => response,
  (error) => {
    // Handle 401 errors globally
    if (error.response?.status === 401) {
      localStorage.removeItem('token')
      // Force page refresh to redirect to login
      if (window.location.pathname !== '/login') {
        window.location.href = '/login'
      }
    }
    
    // Handle network errors
    if (!error.response) {
      console.error('Network error - check if backend is running on port 8000')
    }
    
    return Promise.reject(error)
  }
)

export default API

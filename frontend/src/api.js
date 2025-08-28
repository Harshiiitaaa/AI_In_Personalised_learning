import axios from 'axios'

const API = axios.create({ 
  baseURL: 'http://127.0.0.1:8000'|| 'http://localhost:8000',
  timeout: 10000,
})

// Request interceptor - add auth token
API.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('access_token')
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
      localStorage.removeItem('access_token')
      // Force page refresh to redirect to login
      if (window.location.pathname !== '/login') {
        window.location.href = '/login'
      }
    }
    
    // Handle network errors
    if (!error.response) {
      console.error('Network error - check if backend is running on port 8000')
      console.error('Make sure backend services are running:')
      console.error('- FastAPI server: uvicorn app.main:app --reload')
      console.error('- MongoDB: mongod')
      console.error('- Redis: redis-server')
    }
    
    if (error.response?.status === 404) {
      console.error('API endpoint not found:', error.config?.url)
    }

    if (error.response?.status >= 500) {
      console.error('Server error - check backend logs')
    }
    
    return Promise.reject(error)
  }
)

export default API
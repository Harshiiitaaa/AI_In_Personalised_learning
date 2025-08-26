import API from '../api';

// Language ID mappings for Judge0 API
const LANGUAGE_MAPPINGS = {
  'javascript': 63,
  'python': 71,
  'java': 62,
  'cpp': 54,
  'c': 50
};

export const authService = {
  // Login user - CORRECTED: Fixed token storage key
  login: async (credentials) => {
    try {
      const response = await API.post('/auth/login', credentials);
      if (response.data.access_token) {
        localStorage.setItem('access_token', response.data.access_token); // ✅ Fixed: use access_token
      }
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Login failed' };
    }
  },

  // Register user - CORRECTED: Fixed endpoint path
  register: async (userData) => {
    try {
      const response = await API.post('/auth/signup', userData); // ✅ Fixed: signup not register
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Registration failed' };
    }
  },

  // Get current user
  getCurrentUser: async () => {
    const response = await API.get('/auth/me');
    return response.data;
  },

  // Logout user - CORRECTED: Fixed token storage key
  logout: () => {
    localStorage.removeItem('access_token'); // ✅ Fixed: use access_token
  },

  // Check if user is authenticated - CORRECTED: Fixed token storage key
  isAuthenticated: () => {
    return !!localStorage.getItem('access_token'); // ✅ Fixed: use access_token
  },
};
import API from '../api';

export const authService = {
  // Login user
  login: async (credentials) => {
    try {
      const response = await API.post('/auth/login', credentials);
      if (response.data.access_token) {
        localStorage.setItem('token', response.data.access_token);
      }
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Login failed' };
    }
  },

  // Register user
  register: async (userData) => {
    try {
      const response = await API.post('/auth/register', userData);
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

  // Logout user
  logout: () => {
    localStorage.removeItem('token');
  },

  // Check if user is authenticated
  isAuthenticated: () => {
    return !!localStorage.getItem('token');
  },
};

export const practiceService = {
  // Start practice session
  startSession: async (sessionData) => {
    const response = await API.post('/practice/start', sessionData);
    return response.data;
  },

  // Submit solution
  submitSolution: async (submissionData) => {
    const response = await API.post('/practice/submit', submissionData);
    return response.data;
  },

  // Run code
  runCode: async (codeData) => {
    const response = await API.post('/practice/run', codeData);
    return response.data;
  },

  // Get user stats
  getUserStats: async () => {
    const response = await API.get('/practice/stats');
    return response.data;
  },

  // Get next problem
  getNextProblem: async () => {
    const response = await API.get('/practice/next');
    return response.data;
  },
};

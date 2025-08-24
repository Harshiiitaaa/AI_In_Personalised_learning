import apiClient from './client';

export const authService = {
    login: async (credentials) => {
        try {
            const response = await apiClient.post('/auth/login', credentials);
            if (response.data.access_token) {
                localStorage.setItem('access_token', response.data.access_token);
            }
            return response.data;
        } catch (error) {
            throw error.response?.data || { message: 'Login failed' };
        }
    },

   register: async (userData) => {
        try {
            const response = await apiClient.post('/auth/register', userData);
            return response.data;
        } catch (error) {
            throw error.response?.data || { message: 'Registration failed' };
        }
    },

  logout: () => {
    localStorage.removeItem('access_token');
  },

  getCurrentUser: async () => {
    const response = await apiClient.get('/auth/me');
    return response.data;
  },
};

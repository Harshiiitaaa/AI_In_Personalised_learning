import apiClient from './client';

export const practiceService = {
  startSession: async (sessionData) => {
    const response = await apiClient.post('/practice/start', sessionData);
    return response.data;
  },

  submitSolution: async (submissionData) => {
    const response = await apiClient.post('/practice/submit', submissionData);
    return response.data;
  },

  runCode: async (codeData) => {
    const response = await apiClient.post('/practice/run', codeData);
    return response.data;
  },

  getUserStats: async () => {
    const response = await apiClient.get('/practice/stats');
    return response.data;
  },
};

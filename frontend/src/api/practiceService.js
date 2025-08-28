import API from '../api';

// Language ID mappings for Judge0 API
const LANGUAGE_MAPPINGS = {
  'javascript': 63,
  'python': 71,
  'java': 62,
  'cpp': 54,
  'c': 50
};

export const practiceService = {
  // Start practice session
  startSession: async (sessionData) => {
    const response = await API.post('/practice/start', sessionData);
    return response.data;
  },

  // CORRECTED: Fixed API parameters for backend compatibility
  runCode: async (codeData) => {
    // Map frontend parameters to backend expected format
    const backendData = {
      language_id: LANGUAGE_MAPPINGS[codeData.language] || 63, // Default to JavaScript
      source_code: codeData.code,
      stdin: codeData.stdin || '' // Optional input
    };

    const response = await API.post('/practice/run', backendData);
    return response.data;
  },

  // CORRECTED: Fixed API parameters for backend compatibility
  submitSolution: async (submissionData) => {
    // Map frontend parameters to backend expected format
    const backendData = {
      question_name: submissionData.question_name,
      question_url: submissionData.question_url || '',
      status: submissionData.status || 'Accepted',
      started_at: submissionData.started_at, // Unix timestamp
      ended_at: submissionData.ended_at // Unix timestamp
    };

    const response = await API.post('/practice/submit', backendData);
    return response.data;
  },

  // CORRECTED: Fixed endpoint path and enhanced response
  getUserStats: async () => {
    const response = await API.get('/stats/profile'); // ✅ Fixed: correct endpoint
    
    // Enhanced: Add calculated fields for frontend compatibility
    const data = response.data;
    const successRate = data.attempts_total > 0 
      ? Math.round((data.accepted_total / data.attempts_total) * 100) 
      : 0;

    return {
      ...data,
      success_rate: successRate,
      current_streak: data.current_streak || 0,
      total_points: data.total_points || data.solved_count * 10, // Fallback calculation
      recent_problems: data.recent_problems || []
    };
  },

  // ADDED: Helper functions
  getSupportedLanguages: () => {
    return Object.keys(LANGUAGE_MAPPINGS);
  },

  getLanguageId: (language) => {
    return LANGUAGE_MAPPINGS[language.toLowerCase()] || 63;
  }
};

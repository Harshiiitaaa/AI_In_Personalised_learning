import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

export default function PracticeStart() {
  const { state } = useLocation();
  const navigate = useNavigate();
  
  // This state will now be the single source of truth for the problems in the session.
  const [sessionProblems, setSessionProblems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const company = state?.company || '';
  const topic = state?.topic || '';

  useEffect(() => {
    // This effect now correctly handles the session's problem list
    
    // Attempt to load the session from the browser's sessionStorage
    const savedSession = sessionStorage.getItem('practiceSession');
    let currentProblems = savedSession ? JSON.parse(savedSession) : [];

    if (state?.sessionData && currentProblems.length === 0) {
      // --- Case 1: Initial load from Dashboard ---
      // This is the very start of a new session.
      currentProblems = state.sessionData.problem 
        ? [state.sessionData.problem] 
        : state.sessionData.problems || [];
    } else if (state?.nextProblem) {
      // --- Case 2: Returning from Practice Page with a new problem ---
      const { nextProblem, solvedProblemName } = state;
      
      // Mark the solved problem
      currentProblems = currentProblems.map(p => 
        p.name === solvedProblemName ? { ...p, isSolved: true } : p
      );

      // Add the new problem if it's not already in the list
      const isNewProblemInList = currentProblems.some(p => p.name === nextProblem.name);
      if (!isNewProblemInList) {
        currentProblems.push(nextProblem);
      }
    } else if (state?.solvedProblemName) {
      // --- Case 3: Returning from Practice Page with no new problem ---
      currentProblems = currentProblems.map(p => 
        p.name === state.solvedProblemName ? { ...p, isSolved: true } : p
      );
    }

    if (currentProblems.length > 0) {
        // Save the updated list to sessionStorage to persist it
        sessionStorage.setItem('practiceSession', JSON.stringify(currentProblems));
        setSessionProblems(currentProblems);
    } else if (!savedSession) { // Only set error if there's no saved session
        setError("No practice session found. Please start from the dashboard.");
    }

    setLoading(false);

  }, [state]); // Re-run when navigation state changes

  const startProblem = (problem) => {
    navigate('/practice', {
      state: {
        question: problem,
      }
    });
  };
  
  const endSession = () => {
      // Clear the session storage and navigate to the dashboard
      sessionStorage.removeItem('practiceSession');
      navigate('/dashboard');
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-code-green"></div>
      </div>
    );
  }

  if (error) {
    return (
        <div className="max-w-4xl mx-auto py-8 px-6 text-center">
            <div className="bg-dark-secondary p-8 rounded-lg border border-gray-700">
                <h2 className="text-2xl font-bold text-white mb-4">Error</h2>
                <p className="text-gray-300 mb-6">{error}</p>
                <button onClick={endSession} className="px-6 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded">
                    Back to Dashboard
                </button>
            </div>
        </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto py-8 px-6">
      <div className="mb-6 flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-white">
            Practice Session
            {company && ` - ${company}`}
            {topic && ` - ${topic}`}
          </h2>
          <p className="text-gray-400 mt-1">
            Your dynamic list of problems for this session.
          </p>
        </div>
        <button
          onClick={endSession}
          className="px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded"
        >
          End Session
        </button>
      </div>

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {sessionProblems.map((problem) => (
          <div 
            key={problem.id || problem.name} 
            className={`bg-dark-secondary p-6 rounded-lg border flex flex-col transition-all duration-300 
              ${problem.isSolved 
                ? 'opacity-60 border-green-800' 
                : 'border-gray-700 hover:border-code-green'
              }`
            }
          >
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-lg font-semibold text-white">{problem.name}</h3>
              {problem.isSolved && (
                <span className="bg-green-600 text-white px-2 py-1 rounded text-xs">
                  ✓ Solved
                </span>
              )}
            </div>
            <div className="flex items-center mb-3">
               <span className={`text-sm font-medium px-2 py-1 rounded ${
                problem.difficulty === "Easy" ? "bg-green-600 text-white" :
                problem.difficulty === "Medium" ? "bg-yellow-600 text-white" : "bg-red-600 text-white"
              }`}>
                {problem.difficulty}
              </span>
            </div>
            <p className="text-gray-400 mb-4 flex-1 text-sm">
              {problem.description?.substring(0, 100) + '...'}
            </p>
            <div className="mt-auto flex space-x-2">
               {problem.url && (
                <a 
                  href={problem.url} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 text-sm"
                >
                  LeetCode
                </a>
              )}
              <button
                onClick={() => startProblem(problem)}
                className="w-full px-4 py-2 bg-code-green text-white rounded hover:bg-green-600 text-sm disabled:opacity-50"
                disabled={problem.isSolved}
              >
                {problem.isSolved ? "Completed" : "Solve Problem"}
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

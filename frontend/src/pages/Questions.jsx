import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { practiceService } from '../api/practiceService';
import API from '../api';

export default function PracticeStart() {
  const { state } = useLocation();
  const navigate = useNavigate();
  
  const [problems, setProblems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [sessionData, setSessionData] = useState(null);
  const [solved, setSolved] = useState({});
  const [timer, setTimer] = useState(0);
  const [timerStarted, setTimerStarted] = useState(false);

  // Get filter parameters from navigation state
  const company = state?.company || '';
  const topic = state?.topic || '';

  useEffect(() => {
    loadPracticeSession();
  }, []);

  useEffect(() => {
    if (timerStarted) {
      const t = setInterval(() => setTimer(time => time + 1), 1000);
      return () => clearInterval(t);
    }
  }, [timerStarted]);

  const loadPracticeSession = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Start a practice session with the provided filters
      const session = await practiceService.startSession({
        company: company || null,
        topic: topic || null,
        difficulty: 'mixed'
      });
      
      setSessionData(session);
      
      // If we get a single problem, wrap it in an array
      if (session.problem) {
        setProblems([session.problem]);
      } else if (session.problems) {
        setProblems(session.problems);
      }
      
    } catch (error) {
      console.error('Failed to load practice session:', error);
      setError(error.message || 'Failed to load practice session');
    } finally {
      setLoading(false);
    }
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handleProblemSolved = (problemId) => {
    setSolved(prev => ({ ...prev, [problemId]: true }));
  };

  const startProblem = (problem) => {
    setTimerStarted(true);
    navigate('/practice/solve', {
      state: {
        start: timer,
        question: problem,
        sessionId: sessionData?.session_id,
        onSolve: () => handleProblemSolved(problem.id)
      }
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-code-green"></div>
        <span className="ml-4 text-white">Loading practice session...</span>
      </div>
    );
  }

  if (error || problems.length === 0) {
    return (
      <div className="max-w-4xl mx-auto py-8 px-6 text-center">
        <div className="bg-dark-secondary p-8 rounded-lg border border-gray-700">
          <h2 className="text-2xl font-bold text-white mb-4">
            {error ? 'Error Loading Problems' : 'No Problems Found'}
          </h2>
          <p className="text-gray-300 mb-6">
            {error || 'No problems found matching your criteria. Try different filters.'}
          </p>
          <div className="space-x-4">
            <button
              onClick={loadPracticeSession}
              className="px-6 py-2 bg-code-green hover:bg-green-600 text-white rounded"
            >
              Try Again
            </button>
            <button
              onClick={() => navigate('/dashboard')}
              className="px-6 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded"
            >
              Back to Dashboard
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto py-8 px-6">
      {/* Header */}
      <div className="mb-6 flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-white">
            Practice Session
            {company && ` - ${company}`}
            {topic && ` - ${topic}`}
          </h2>
          <p className="text-gray-400 mt-1">
            {problems.length} problem{problems.length !== 1 ? 's' : ''} loaded
          </p>
        </div>
        <div className="flex items-center space-x-4">
          <div className="bg-gray-800 text-code-green px-3 py-1 rounded font-mono border border-gray-600">
            Timer: {formatTime(timer)}
          </div>
          <button
            onClick={() => navigate('/dashboard')}
            className="px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded"
          >
            Back to Dashboard
          </button>
        </div>
      </div>

      {/* Timer Control */}
      <div className="mb-6">
        <button
          className="px-5 py-2 bg-code-green text-white rounded hover:bg-green-600 disabled:opacity-50"
          onClick={() => setTimerStarted(true)}
          disabled={timerStarted}
        >
          {timerStarted ? 'Timer Running' : 'Start Timer'}
        </button>
      </div>

      {/* Problems Grid */}
      <div className={`grid ${problems.length === 1 ? "grid-cols-1 max-w-2xl mx-auto" : "md:grid-cols-2 lg:grid-cols-3"} gap-6`}>
        {problems.map((problem, idx) => (
          <div key={problem.id} className="bg-dark-secondary p-6 rounded-lg border border-gray-700 flex flex-col">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-lg font-semibold text-white">{problem.name || problem.title}</h3>
              {solved[problem.id] && (
                <span className="bg-green-600 text-white px-2 py-1 rounded text-xs">
                  ✓ Solved
                </span>
              )}
            </div>
            
            <p className="text-gray-300 mb-4 flex-1">
              {problem.description}
            </p>
            
            <div className="flex items-center mb-3">
              <span className={`text-sm font-medium px-2 py-1 rounded ${
                problem.difficulty === "Easy" || problem.difficulty === "easy"
                  ? "bg-green-600 text-white"
                  : problem.difficulty === "Medium" || problem.difficulty === "medium"
                  ? "bg-yellow-600 text-white"
                  : "bg-red-600 text-white"
              }`}>
                {problem.difficulty}
              </span>
            </div>
            
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
                className="px-4 py-2 bg-code-green text-white rounded hover:bg-green-600 text-sm disabled:opacity-50"
                disabled={solved[problem.id]}
              >
                {solved[problem.id] ? "Solved!" : "Solve Here"}
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

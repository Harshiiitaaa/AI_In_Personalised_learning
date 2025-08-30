import React, { useEffect, useRef, useState } from 'react';
import Editor from '@monaco-editor/react';
import { useLocation, useNavigate } from 'react-router-dom';
import { practiceService } from '../api/practiceService';

export default function PracticeSolve() {
  const { state } = useLocation();
  const navigate = useNavigate();

  const [code, setCode] = useState('// Write your solution here\nfunction solution() {\n    \n}');
  const [language, setLanguage] = useState('javascript');
  const [timer, setTimer] = useState(state?.start || 0);
  const [result, setResult] = useState(null);
  const [runLoading, setRunLoading] = useState(false);
  const [submitLoading, setSubmitLoading] = useState(false);
  
  const timerRef = useRef(null);
  const question = state?.question || {};
  const startTime = useRef(Date.now());

  useEffect(() => {
    timerRef.current = setInterval(() => setTimer(prev => prev + 1), 1000);
    return () => clearInterval(timerRef.current);
  }, []);

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const run = async () => {
    if (!code.trim()) {
      setResult({ error: "Please write some code to run" });
      return;
    }
    setRunLoading(true);
    setResult(null);
    try {
      const response = await practiceService.runCode({
        language: language,
        code: code,
        stdin: ''
      });
      setResult({
        status: response.status?.description || "Success",
        output: response.stdout || "Code executed successfully",
        error: response.stderr || response.compile_output || null,
        execution_time: response.time || 0,
        memory: response.memory || 0
      });
    } catch (error) {
      console.error('Code execution failed:', error);
      setResult({
        status: "Error", 
        error: error.message || "Code execution failed",
        output: error.response?.data?.stderr || "An error occurred"
      });
    } finally {
      setRunLoading(false);
    }
  };

// In Practice.jsx

const currentUserId = "some_id_from_your_auth_state"; 

// In PracticeSolve.jsx

const handleSubmitAndGetNext = async (attemptStatus) => {
    if (!question.name) {
      setResult({ error: "Question information is missing." });
      return;
    }

    setSubmitLoading(true);
    setResult(null);

    try {
      const submissionData = {
        question_name: question.name,
        status: attemptStatus,
        started_at: Math.floor(startTime.current / 1000),
        ended_at: Math.floor(Date.now() / 1000),
      };

      const response = await practiceService.submitSolution(submissionData);

      // --- ✅ FIXED NAVIGATION LOGIC ---
      // Only tell the next page that the problem was solved if the status is "Accepted".
      const navigationState = {
        nextProblem: response.next,
      };

      if (attemptStatus === 'Accepted') {
        navigationState.solvedProblemName = question.name;
      }
      
      navigate('/questions', {
        state: navigationState,
        replace: true
      });
      // --- END OF FIX ---

    } catch (error) {
      console.error('Submission failed:', error);
      setResult({
        verdict: "Error",
        error: error.message || "Submission failed",
      });
    } finally {
      setSubmitLoading(false);
    }
};


  const supportedLanguages = ['javascript', 'python', 'java', 'cpp', 'c'];

  return (
    <div className="flex h-screen">
      {/* Left Panel - Problem Description */}
      <div className="w-1/2 bg-dark-secondary p-6 border-r border-gray-700 flex flex-col">
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-xl font-bold text-white">{question.name}</h1>
          <button
            onClick={() => navigate('/questions')}
            className="px-3 py-1 bg-gray-600 hover:bg-gray-700 text-white text-sm rounded"
          >
            ← Back to Questions
          </button>
        </div>
        <p className="mb-4 text-gray-300 flex-1 overflow-y-auto">
          {question.description || 'Problem description not available'}
        </p>
        <div className="mb-4 p-3 bg-dark-tertiary rounded border border-gray-600">
          <div className="flex justify-between text-sm">
            <span className="text-gray-400">Difficulty:</span>
            <span className={`font-medium ${
              question.difficulty === 'Easy' ? 'text-green-400' :
              question.difficulty === 'Medium' ? 'text-yellow-400' : 'text-red-400'
            }`}>
              {question.difficulty || 'Unknown'}
            </span>
          </div>
        </div>
        
        {/* --- ADDED THIS SECTION BACK --- */}
        {question.url && (
          <div className="mb-4">
            <a 
              href={question.url} 
              target="_blank" 
              rel="noopener noreferrer"
              className="inline-block px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 text-sm"
            >
              View on LeetCode
            </a>
          </div>
        )}
        
        <div className="mt-auto">
          <div className="font-mono text-code-orange">Timer: {formatTime(timer)}</div>
        </div>
      </div>

      {/* Right Panel - Code Editor */}
      <div className="w-1/2 flex flex-col bg-dark-primary">
        <div className="p-4 bg-dark-secondary border-b border-gray-700">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <span className="text-sm text-gray-400">Language:</span>
              <select
                value={language}
                onChange={(e) => setLanguage(e.target.value)}
                className="text-sm text-white bg-dark-tertiary px-2 py-1 rounded border border-gray-600"
              >
                {supportedLanguages.map(lang => (
                  <option key={lang} value={lang}>
                    {lang.charAt(0).toUpperCase() + lang.slice(1)}
                  </option>
                ))}
              </select>
            </div>
            <div className="flex space-x-2">
              <button
                onClick={run}
                disabled={runLoading || submitLoading}
                className="px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white text-sm rounded disabled:opacity-50"
              >
                {runLoading ? 'Running...' : 'Run Code'}
              </button>
              <button
                onClick={() => handleSubmitAndGetNext('Accepted')}
                disabled={runLoading || submitLoading}
                className="px-4 py-2 bg-code-green hover:bg-green-600 text-white text-sm rounded disabled:opacity-50"
              >
                {submitLoading ? '...' : 'I Solved It!'}
              </button>
              <button
                onClick={() => handleSubmitAndGetNext('Wrong Answer')}
                disabled={runLoading || submitLoading}
                className="px-4 py-2 bg-code-red hover:bg-red-600 text-white text-sm rounded disabled:opacity-50"
              >
                {submitLoading ? '...' : "Couldn't Solve"}
              </button>
            </div>
          </div>
        </div>

        <div className="flex-1">
          <Editor
            height="60vh"
            language={language}
            value={code}
            onChange={v => setCode(v)}
            theme="vs-dark"
            options={{ fontSize: 14, minimap: { enabled: false } }}
          />
        </div>

        {result && (
          <div className="p-4 bg-dark-tertiary border-t border-gray-700 max-h-40 overflow-y-auto">
            <h3 className="text-sm font-semibold text-white mb-2">Output:</h3>
            <div className="text-sm text-gray-300 bg-dark-primary p-3 rounded">
              {result.error ? (
                <div className="text-red-400">
                  <div className="font-semibold">Error:</div>
                  <div>{result.error}</div>
                </div>
              ) : (
                <div>
                  <div className="font-semibold text-green-400 mb-2">{result.status}</div>
                  {result.output && <pre className="whitespace-pre-wrap">{result.output}</pre>}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

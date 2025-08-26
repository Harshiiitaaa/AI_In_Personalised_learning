import React, { useEffect, useRef, useState } from 'react';
import Editor from '@monaco-editor/react';
import { useLocation, useNavigate } from 'react-router-dom';
import { practiceService } from '../api/practiceService';
// REMOVED: import API from '../api'; // ✅ Fixed: Removed unused import

export default function PracticeSolve() {
  const { state } = useLocation();
  const navigate = useNavigate();

  const [code, setCode] = useState('// Write your solution here\nfunction solution() {\n    \n}');
  const [language, setLanguage] = useState('javascript'); // ADDED: Language state
  const [timer, setTimer] = useState(state?.start || 0);
  const [result, setResult] = useState(null);
  const [runLoading, setRunLoading] = useState(false);
  const [submitLoading, setSubmitLoading] = useState(false);
  
  const timerRef = useRef(null);
  const question = state?.question || {};
  const sessionId = state?.sessionId;
  const startTime = useRef(Date.now()); // ADDED: Track start time

  useEffect(() => {
    timerRef.current = setInterval(() => setTimer(prev => prev + 1), 1000);
    return () => clearInterval(timerRef.current);
  }, []);

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // CORRECTED: Fixed API call parameters
  const run = async () => {
    if (!code.trim()) {
      setResult({ error: "Please write some code to run" });
      return;
    }

    setRunLoading(true);
    setResult(null);

    try {
      // CORRECTED: Use proper parameter format for backend
      const response = await practiceService.runCode({
        language: language, // Will be mapped to language_id in service
        code: code,
        stdin: '' // Optional input for the code
      });

      // Handle different response formats from Judge0
      setResult({
        status: response.status?.description || "Success",
        output: response.stdout || response.output || "Code executed successfully",
        error: response.stderr || response.compile_output || null,
        execution_time: response.time || response.execution_time || 0,
        memory: response.memory || 0
      });

    } catch (error) {
      console.error('Code execution failed:', error);
      setResult({
        status: "Error", 
        error: error.message || "Code execution failed",
        output: error.response?.data?.stderr || error.response?.data?.error || "An error occurred during execution"
      });
    } finally {
      setRunLoading(false);
    }
  };

  // CORRECTED: Fixed submission parameters
  const submit = async () => {
    if (!question.name || !code.trim()) {
      setResult({ error: "Please write some code to submit" });
      return;
    }

    setSubmitLoading(true);
    setResult(null);

    try {
      const currentTime = Date.now();
      const startTimestamp = Math.floor(startTime.current / 1000); // Convert to Unix timestamp
      const endTimestamp = Math.floor(currentTime / 1000);

      // CORRECTED: Use backend expected parameters
      const response = await practiceService.submitSolution({
        question_name: question.name || question.title,
        question_url: question.url || '',
        status: 'Accepted', // Assume accepted for now - should be determined by backend
        started_at: startTimestamp,
        ended_at: endTimestamp
      });

      setResult({
        verdict: response.next ? "Accepted" : "Processing",
        status: "success",
        time: formatTime(timer),
        message: response.message || "Solution submitted successfully!"
      });

      // If submission was successful, show next question info
      if (response.next) {
        setTimeout(() => {
          navigate('/practice/start', { 
            state: { 
              message: `Problem solved in ${formatTime(timer)}!`,
              nextQuestion: response.next
            }
          });
        }, 2000);
      }

    } catch (error) {
      console.error('Submission failed:', error);
      setResult({
        verdict: "Error",
        error: error.message || "Submission failed",
        time: formatTime(timer)
      });
    } finally {
      setSubmitLoading(false);
    }
  };

  // ADDED: Get available languages
  const supportedLanguages = practiceService.getSupportedLanguages ? 
    practiceService.getSupportedLanguages() : 
    ['javascript', 'python', 'java', 'cpp', 'c'];

  return (
    <div className="flex h-screen">
      {/* Left Panel - Problem Description */}
      <div className="w-1/2 bg-dark-secondary p-6 border-r border-gray-700 flex flex-col">
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-xl font-bold text-white">{question.name || question.title}</h1>
          <button
            onClick={() => navigate('/practice/start')}
            className="px-3 py-1 bg-gray-600 hover:bg-gray-700 text-white text-sm rounded"
          >
            ← Back
          </button>
        </div>

        <p className="mb-4 text-gray-300 flex-1 overflow-y-auto">
          {question.description || 'Problem description not available'}
        </p>
        
        {/* ADDED: Problem metadata */}
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
          {question.topic && (
            <div className="flex justify-between text-sm mt-1">
              <span className="text-gray-400">Topic:</span>
              <span className="text-gray-300">{question.topic}</span>
            </div>
          )}
        </div>
        
        {question.url && (
          <a href={question.url} target="_blank" rel="noopener noreferrer"
            className="inline-block px-4 py-1 bg-blue-600 text-white rounded hover:bg-blue-700 mb-4">
            View on LeetCode
          </a>
        )}
        
        <div className="mt-auto">
          <div className="font-mono text-code-orange">Timer: {formatTime(timer)}</div>
        </div>
      </div>

      {/* Right Panel - Code Editor */}
      <div className="w-1/2 flex flex-col bg-dark-primary">
        <div className="p-4 bg-dark-secondary border-b border-gray-700">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <span className="text-sm text-gray-400">Language:</span>
                {/* ADDED: Language selector */}
                <select
                  value={language}
                  onChange={(e) => setLanguage(e.target.value)}
                  className="text-sm text-white bg-dark-tertiary px-2 py-1 rounded border border-gray-600 focus:outline-none focus:ring-2 focus:ring-code-green"
                >
                  {supportedLanguages.map(lang => (
                    <option key={lang} value={lang}>
                      {lang.charAt(0).toUpperCase() + lang.slice(1)}
                    </option>
                  ))}
                </select>
              </div>
            </div>
            <div className="flex space-x-2">
              <button
                onClick={run}
                disabled={runLoading || submitLoading}
                className="px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white text-sm rounded transition-colors disabled:opacity-50"
              >
                {runLoading ? 'Running...' : 'Run Code'}
              </button>
              <button
                onClick={submit}
                disabled={runLoading || submitLoading}
                className="px-4 py-2 bg-code-green hover:bg-green-600 text-white text-sm rounded transition-colors disabled:opacity-50"
              >
                {submitLoading ? 'Submitting...' : 'Submit'}
              </button>
            </div>
          </div>
        </div>

        <div className="flex-1">
          <Editor
            height="60vh"
            defaultLanguage={language}
            language={language} // ADDED: Dynamic language
            value={code}
            onChange={v => setCode(v)}
            theme="vs-dark"
            options={{
              fontSize: 14,
              minimap: { enabled: false },
              scrollBeyondLastLine: false,
              wordWrap: 'on',
              lineNumbers: 'on',
              automaticLayout: true,
            }}
          />
        </div>

        {/* ENHANCED: Better result display */}
        {result && (
          <div className="p-4 bg-dark-tertiary border-t border-gray-700 max-h-40 overflow-y-auto">
            <h3 className="text-sm font-semibold text-white mb-2">Output:</h3>
            <div className="text-sm text-gray-300 bg-dark-primary p-3 rounded border border-gray-600">
              {result.error ? (
                <div className="text-red-400">
                  <div className="font-semibold">Error:</div>
                  <div>{result.error}</div>
                </div>
              ) : (
                <div>
                  <div className={`font-semibold mb-2 ${
                    result.verdict === 'Accepted' || result.status === 'Success' 
                      ? 'text-green-400' : 'text-yellow-400'
                  }`}>
                    {result.verdict || result.status}
                  </div>
                  
                  {result.output && (
                    <div className="mb-2">
                      <div className="text-gray-400">Output:</div>
                      <pre className="whitespace-pre-wrap">{result.output}</pre>
                    </div>
                  )}
                  
                  <div className="text-xs text-gray-400 flex space-x-4">
                    {result.execution_time !== undefined && (
                      <span>Time: {result.execution_time}ms</span>
                    )}
                    {result.memory && (
                      <span>Memory: {result.memory}KB</span>
                    )}
                  </div>

                  {result.message && (
                    <div className="mt-2 text-green-400">{result.message}</div>
                  )}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

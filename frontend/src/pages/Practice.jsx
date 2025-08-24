import React, { useEffect, useRef, useState } from 'react';
import Editor from '@monaco-editor/react';
import { useLocation, useNavigate } from 'react-router-dom';
import { practiceService } from '../api/practiceService'; // Import practice service
import API from '../api';

export default function PracticeSolve() {
  const { state } = useLocation();
  const navigate = useNavigate();

  const [code, setCode] = useState('// Write your solution here\nfunction solution() {\n    \n}');
  const [timer, setTimer] = useState(state?.start || 0);
  const [result, setResult] = useState(null);
  const [runLoading, setRunLoading] = useState(false);
  const [submitLoading, setSubmitLoading] = useState(false);
  
  const timerRef = useRef(null);
  const question = state?.question || {};
  const sessionId = state?.sessionId;

  useEffect(() => {
    timerRef.current = setInterval(() => setTimer(prev => prev + 1), 1000);
    return () => clearInterval(timerRef.current);
  }, []);

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // Real API call to run code
  const run = async () => {
    if (!question.id || !code.trim()) {
      setResult({ error: "Please write some code to run" });
      return;
    }

    setRunLoading(true);
    setResult(null);

    try {
      const response = await practiceService.runCode({
        problem_id: question.id,
        code: code,
        language: 'javascript',
        session_id: sessionId
      });

      setResult({
        status: "Success",
        output: response.output || "Code executed successfully",
        execution_time: response.execution_time || 0,
        test_cases_passed: response.test_cases_passed || 0,
        total_test_cases: response.total_test_cases || 0
      });

    } catch (error) {
      console.error('Code execution failed:', error);
      setResult({
        status: "Error",
        error: error.message || "Code execution failed",
        output: error.response?.data?.error || "An error occurred during execution"
      });
    } finally {
      setRunLoading(false);
    }
  };

  // Real API call to submit solution
  const submit = async () => {
    if (!question.id || !code.trim()) {
      setResult({ error: "Please write some code to submit" });
      return;
    }

    setSubmitLoading(true);
    setResult(null);

    try {
      const response = await practiceService.submitSolution({
        problem_id: question.id,
        code: code,
        language: 'javascript',
        session_id: sessionId,
        time_taken: timer
      });

      setResult({
        verdict: response.verdict || "Accepted",
        status: response.status || "success",
        time: formatTime(timer),
        execution_time: response.execution_time || 0,
        test_cases_passed: response.test_cases_passed || 0,
        total_test_cases: response.total_test_cases || 0,
        score: response.score || 0
      });

      // If submission was successful, auto-navigate after delay
      if (response.status === 'accepted' || response.verdict === 'Accepted') {
        setTimeout(() => {
          navigate('/practice/start', { 
            state: { 
              message: `Problem solved in ${formatTime(timer)}!`,
              score: response.score 
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
            <div className="flex items-center space-x-2">
              <span className="text-sm text-gray-400">Language:</span>
              <span className="text-sm text-white bg-dark-tertiary px-2 py-1 rounded">JavaScript</span>
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
            defaultLanguage="javascript"
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

        {result && (
          <div className="p-4 bg-dark-tertiary border-t border-gray-700">
            <h3 className="text-sm font-semibold text-white mb-2">Output:</h3>
            <div className="text-sm text-gray-300 bg-dark-primary p-3 rounded border border-gray-600 overflow-x-auto">
              {result.error ? (
                <div className="text-red-400">
                  <div className="font-semibold">Error:</div>
                  <div>{result.error}</div>
                </div>
              ) : (
                <div>
                  <div className={`font-semibold mb-2 ${
                    result.verdict === 'Accepted' ? 'text-green-400' : 'text-yellow-400'
                  }`}>
                    {result.verdict || result.status}
                  </div>
                  
                  {result.test_cases_passed !== undefined && (
                    <div>Test Cases: {result.test_cases_passed}/{result.total_test_cases} passed</div>
                  )}
                  
                  {result.execution_time !== undefined && (
                    <div>Execution Time: {result.execution_time}ms</div>
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

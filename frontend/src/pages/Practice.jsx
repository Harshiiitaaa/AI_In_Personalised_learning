import React, { useEffect, useRef, useState } from 'react';
import Editor from '@monaco-editor/react';
import { useLocation, useNavigate } from 'react-router-dom';

export default function PracticeSolve() {
  const { state } = useLocation();
  const navigate = useNavigate();

  const [code, setCode] = useState('// Write your solution here\nfunction solution() {\n    \n}');
  const [timer, setTimer] = useState(state?.start || 0);
  const [result, setResult] = useState(null);
  const timerRef = useRef(null);
  const question = state?.question || {};
  const handleSolved = state?.onSolve;

  useEffect(() => {
    timerRef.current = setInterval(() => setTimer(prev => prev + 1), 1000);
    return () => clearInterval(timerRef.current);
  }, []);

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // "Run" and "Submit" are mocked
  const run = () =>
    setResult({ status: "Success", output: "All tests passed (mock)." });

  const submit = () => {
    setResult({
      verdict: "Accepted",
      time: formatTime(timer)
    });
    // Mark as solved and go back
    if (handleSolved) handleSolved();
    setTimeout(() => navigate('/practice/start'), 1000); // auto-redirect after submit
  };

  return (
    <div className="flex h-screen">
      {/* Left Panel - Problem Description */}
      <div className="w-1/2 bg-dark-secondary p-6 border-r border-gray-700 flex flex-col">
        <h1 className="text-xl font-bold mb-2 text-white">{question.name}</h1>
        <p className="mb-4 text-gray-300">{question.description}</p>
        <a href={question.url} target="_blank" rel="noopener noreferrer"
          className="inline-block px-4 py-1 bg-blue-600 text-white rounded hover:bg-blue-700">View on LeetCode</a>
        <div className="mt-8 font-mono text-code-orange">Timer: {formatTime(timer)}</div>
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
                className="px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white text-sm rounded transition-colors"
              >Run Code</button>
              <button
                onClick={submit}
                className="px-4 py-2 bg-code-green hover:bg-green-600 text-white text-sm rounded transition-colors"
              >Submit</button>
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
            <pre className="text-sm text-gray-300 bg-dark-primary p-3 rounded border border-gray-600 overflow-x-auto">
              {JSON.stringify(result, null, 2)}
            </pre>
          </div>
        )}
      </div>
    </div>
  );
}

import React, { useEffect, useRef, useState } from 'react'
import API from '../api'
import Editor from '@monaco-editor/react'

export default function Practice() {
  const [question, setQuestion] = useState(null)
  const [code, setCode] = useState('// Write your solution here\nfunction solution() {\n    \n}')
  const [result, setResult] = useState(null)
  const [start, setStart] = useState(0)
  const [timer, setTimer] = useState(0)
  const timerRef = useRef(null)

  async function startSession() {
    const r = await API.post('/practice/start')
    const qs = r.data.questions || []
    if (qs.length > 0) {
      setQuestion(qs[0])
      setStart(Date.now() / 1000)
      timerRef.current = setInterval(() => setTimer(prev => prev + 1), 1000)
    }
  }

  function stopTimer() {
    if (timerRef.current) {
      clearInterval(timerRef.current)
      timerRef.current = null
    }
  }

  async function run() {
    const r = await API.post('/practice/run', { 
      language_id: 62, 
      source_code: code, 
      stdin: "" 
    })
    setResult(r.data)
  }

  async function submit(status = 'Accepted') {
    const ended = Date.now() / 1000
    stopTimer()
    const r = await API.post('/practice/submit', null, {
      params: {
        question_name: question?.name || '',
        question_url: question?.url || '',
        status,
        started_at: start,
        ended_at: ended
      }
    })
    setResult(r.data)
    if (r.data.next) {
      setQuestion(r.data.next)
      setStart(Date.now() / 1000)
      setTimer(0)
      timerRef.current = setInterval(() => setTimer(prev => prev + 1), 1000)
    }
  }

  useEffect(() => {
    return () => stopTimer()
  }, [])

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
  }

  const getDifficultyColor = (difficulty) => {
    switch (difficulty?.toLowerCase()) {
      case 'easy': return 'text-code-green bg-green-900/20 border-code-green'
      case 'medium': return 'text-code-orange bg-orange-900/20 border-code-orange'
      case 'hard': return 'text-code-red bg-red-900/20 border-code-red'
      default: return 'text-gray-400 bg-gray-800/20 border-gray-400'
    }
  }

  return (
    <div className="h-screen bg-dark-primary text-white overflow-hidden">
      {!question ? (
        <div className="flex items-center justify-center h-full">
          <div className="text-center">
            <div className="mb-8">
              <div className="w-20 h-20 bg-code-green rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-10 h-10 text-white" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-8.293l-3-3a1 1 0 00-1.414 0l-3 3a1 1 0 001.414 1.414L9 9.414V13a1 1 0 102 0V9.414l1.293 1.293a1 1 0 001.414-1.414z" clipRule="evenodd" />
                </svg>
              </div>
              <h1 className="text-3xl font-bold text-white mb-2">Ready to Practice?</h1>
              <p className="text-gray-400 mb-8">Start a coding session and improve your skills</p>
            </div>
            <button
              onClick={startSession}
              className="px-8 py-3 bg-code-green hover:bg-green-600 text-white rounded-lg font-medium text-lg transition-colors"
            >
              Start Practice Session
            </button>
          </div>
        </div>
      ) : (
        <div className="flex h-full">
          {/* Left Panel - Problem Description */}
          <div className="w-1/2 bg-dark-secondary border-r border-gray-700 flex flex-col">
            <div className="p-6 border-b border-gray-700">
              <div className="flex items-center justify-between mb-4">
                <h1 className="text-xl font-bold text-white">{question.name}</h1>
                <div className="flex items-center space-x-3">
                  <span className={`px-2 py-1 text-xs rounded border ${getDifficultyColor(question.difficulty)}`}>
                    {question.difficulty}
                  </span>
                  <div className="bg-dark-tertiary px-3 py-1 rounded border border-gray-600">
                    <span className="text-sm font-mono text-code-orange">{formatTime(timer)}</span>
                  </div>
                </div>
              </div>
              <a
                href={question.url}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center text-blue-400 hover:text-blue-300 text-sm transition-colors"
              >
                View on LeetCode
                <svg className="w-4 h-4 ml-1" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z" clipRule="evenodd" />
                </svg>
              </a>
            </div>
            <div className="flex-1 p-6 overflow-y-auto">
              <div className="text-gray-300 mb-4">
                <p>Problem description will be loaded from the LeetCode link above.</p>
                <p className="mt-2 text-sm text-gray-400">
                  Click the "View on LeetCode" link to read the full problem statement, examples, and constraints.
                </p>
              </div>
            </div>
          </div>

          {/* Right Panel - Code Editor */}
          <div className="w-1/2 flex flex-col">
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
                  >
                    Run Code
                  </button>
                  <button
                    onClick={() => submit('Accepted')}
                    className="px-4 py-2 bg-code-green hover:bg-green-600 text-white text-sm rounded transition-colors"
                  >
                    Submit
                  </button>
                  <button
                    onClick={() => submit('Wrong Answer')}
                    className="px-4 py-2 bg-code-red hover:bg-red-600 text-white text-sm rounded transition-colors"
                  >
                    Mark Wrong
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
                  roundedSelection: false,
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
      )}
    </div>
  )
}

import React, { useEffect, useRef, useState } from 'react'
import API from '../api'
import Editor from '@monaco-editor/react'

export default function Practice() {
  const [question, setQuestion] = useState(null)
  const [code, setCode] = useState('// Write your code here and start the timer!')
  const [result, setResult] = useState(null)
  const [start, setStart] = useState(0)
  const [timer, setTimer] = useState(0)
  const timerRef = useRef(null)

  async function startSession() {
    const r = await API.post('/practice/start')
    const qs = r.data.questions || []
    if (qs.length > 0) {
      setQuestion(qs[0])
      setResult(null)
      setCode('// Happy coding!')
      setStart(Date.now() / 1000)
      setTimer(0)
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
    const r = await API.post('/practice/run', { language_id: 62, source_code: code, stdin: "" })
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

  function formatTime(seconds) {
    const h = Math.floor(seconds / 3600).toString().padStart(2, '0');
    const m = Math.floor((seconds % 3600) / 60).toString().padStart(2, '0');
    const s = (seconds % 60).toString().padStart(2, '0');
    return `${h}:${m}:${s}`;
  }

  return (
    <div>
      <h2 className="text-3xl font-bold mb-6 text-white">Practice Session</h2>
      {!question ? (
        <div className="text-center py-20">
          <button onClick={startSession} className="bg-cyan-600 hover:bg-cyan-700 text-white font-bold py-3 px-8 rounded-lg text-xl transition-transform transform hover:scale-105">
            Start New Session
          </button>
        </div>
      ) : (
        <div className="bg-gray-800 p-6 rounded-lg shadow-xl">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-2xl font-bold text-white">{question.name} <span className="text-base font-normal text-gray-400">[{question.difficulty}]</span></h3>
            <a href={question.url} target="_blank" rel="noopener noreferrer" className="text-cyan-400 hover:underline">Open on LeetCode</a>
          </div>
          <p className="text-2xl font-mono text-center my-4 bg-gray-900 py-2 rounded-md">{formatTime(timer)}</p>
          <div className="border border-gray-700 rounded-lg overflow-hidden my-4">
            <Editor
              height="50vh"
              defaultLanguage="javascript"
              value={code}
              onChange={v => setCode(v)}
              theme="vs-dark"
            />
          </div>
          <div className="mt-4 flex flex-wrap gap-4 items-center">
            <button onClick={run} className="bg-gray-600 hover:bg-gray-700 text-white font-semibold py-2 px-5 rounded-md transition-colors">Run Code</button>
            <button onClick={() => submit('Accepted')} className="bg-green-600 hover:bg-green-700 text-white font-semibold py-2 px-5 rounded-md transition-colors">Submit (Accepted)</button>
            <button onClick={() => submit('Wrong Answer')} className="bg-yellow-600 hover:bg-yellow-700 text-white font-semibold py-2 px-5 rounded-md transition-colors">Submit (Not Accepted)</button>
          </div>
          {result && (
            <div className="mt-6">
                <h4 className="text-lg font-semibold mb-2">Result:</h4>
                <pre className="bg-gray-900 text-white p-4 rounded-lg overflow-x-auto text-sm">{JSON.stringify(result, null, 2)}</pre>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
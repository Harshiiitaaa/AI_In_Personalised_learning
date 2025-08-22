import React, { useEffect, useRef, useState } from 'react'
import API from '../api'
import Editor from '@monaco-editor/react'

export default function Practice(){
  const [question, setQuestion] = useState(null)
  const [code, setCode] = useState('// write code here')
  const [result, setResult] = useState(null)
  const [start, setStart] = useState(0)
  const [timer, setTimer] = useState(0)
  const timerRef = useRef(null)

  async function startSession(){
    const r = await API.post('/practice/start')
    const qs = r.data.questions || []
    if(qs.length>0){
      setQuestion(qs[0])
      setStart(Date.now()/1000)
      timerRef.current = setInterval(()=> setTimer(prev => prev+1), 1000)
    }
  }
  function stopTimer(){
    if(timerRef.current){
      clearInterval(timerRef.current)
      timerRef.current = null
    }
  }
  async function run(){
    const r = await API.post('/practice/run', { language_id: 62, source_code: code, stdin: "" })
    setResult(r.data)
  }
  async function submit(status='Accepted'){
    const ended = Date.now()/1000
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
    if(r.data.next){
      setQuestion(r.data.next)
      setStart(Date.now()/1000)
      setTimer(0)
      timerRef.current = setInterval(()=> setTimer(prev => prev+1), 1000)
    }
  }

  useEffect(()=>()=>stopTimer(),[])

  return (
    <div className="p-6">
      <h2 className="text-2xl font-semibold mb-4">Practice</h2>
      {!question ? (
        <button onClick={startSession} className="px-4 py-2 bg-yellow-500 hover:bg-yellow-400 text-black rounded">Start Session</button>
      ) : (
        <div className="space-y-4">
          <h3 className="text-xl">{question.name} <span className="text-gray-400">[{question.difficulty}]</span></h3>
          <p><a href={question.url} target="_blank" className="text-yellow-400">Open on LeetCode</a></p>
          <p className="italic text-sm">Time: {timer}s</p>
          <Editor height="40vh" defaultLanguage="javascript" value={code} onChange={v=>setCode(v)} theme="vs-dark" />
          <div className="flex gap-4">
            <button onClick={run} className="px-4 py-2 bg-blue-500 hover:bg-blue-400 rounded">Run Code</button>
            <button onClick={()=>submit('Accepted')} className="px-4 py-2 bg-green-500 hover:bg-green-400 rounded">Submit (Accepted)</button>
            <button onClick={()=>submit('Wrong Answer')} className="px-4 py-2 bg-red-500 hover:bg-red-400 rounded">Submit (Not Accepted)</button>
          </div>
          {result ? (
            <pre className="bg-gray-800 p-4 rounded text-sm overflow-auto">{JSON.stringify(result, null, 2)}</pre>
          ) : null}
        </div>
      )}
    </div>
  )
}

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
    const r = await API.post('/practice/run', { language_id: 62, source_code: code, stdin: "" }) // 62 = JavaScript (Node) on Judge0
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
      // load next
      setQuestion(r.data.next)
      setStart(Date.now()/1000)
      setTimer(0)
      timerRef.current = setInterval(()=> setTimer(prev => prev+1), 1000)
    }
  }

  useEffect(()=>{
    return ()=> stopTimer()
  },[])

  return (
    <div style={{padding:24}}>
      <h2>Practice</h2>
      {!question ? (
        <button onClick={startSession}>Start Session</button>
      ) : (
        <div>
          <h3>{question.name} [{question.difficulty}]</h3>
          <p><a href={question.url} target="_blank">Open on LeetCode</a></p>
          <p><i>Time: {timer}s</i></p>
          <Editor height="40vh" defaultLanguage="javascript" value={code} onChange={v=>setCode(v)} />
          <div style={{marginTop:12, display:'flex', gap:8}}>
            <button onClick={run}>Run Code</button>
            <button onClick={()=>submit('Accepted')}>Submit (Accepted)</button>
            <button onClick={()=>submit('Wrong Answer')}>Submit (Not Accepted)</button>
          </div>
          {result ? (
            <pre style={{marginTop:12, background:'#f7f7f7', padding:12}}>{JSON.stringify(result, null, 2)}</pre>
          ) : null}
        </div>
      )}
    </div>
  )
}
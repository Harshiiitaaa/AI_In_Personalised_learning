import React, { useEffect, useState } from 'react'
import API from '../api'

export default function Dashboard(){
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [username, setUsername] = useState('')
  const [mode, setMode] = useState('login')
  const [info, setInfo] = useState(null)

  useEffect(()=>{
    const token = localStorage.getItem('token')
    if(token){
      API.get('/auth/me').then(r=>setInfo(r.data)).catch(()=>{})
    }
  }, [])

  async function onSignup(){
    const r = await API.post('/auth/signup', {username, email, password})
    alert('Signed up! Now log in.')
    setMode('login')
  }
  async function onLogin(){
    const r = await API.post('/auth/login', {email, password})
    localStorage.setItem('token', r.data.access_token)
    const me = await API.get('/auth/me')
    setInfo(me.data)
  }

  return (
    <div style={{padding:24}}>
      <h2>Dashboard</h2>
      {info ? (
        <div>
          <p>Welcome, {info.username}</p>
          <p>Solved: {info.solved_count}</p>
        </div>
      ) : (
        <div style={{display:'flex', gap:24}}>
          {mode==='login' ? (
            <div>
              <h3>Login</h3>
              <input placeholder="email" value={email} onChange={e=>setEmail(e.target.value)} /><br/>
              <input placeholder="password" type="password" value={password} onChange={e=>setPassword(e.target.value)} /><br/>
              <button onClick={onLogin}>Login</button>
              <p>or <button onClick={()=>setMode('signup')}>Create account</button></p>
            </div>
          ) : (
            <div>
              <h3>Signup</h3>
              <input placeholder="username" value={username} onChange={e=>setUsername(e.target.value)} /><br/>
              <input placeholder="email" value={email} onChange={e=>setEmail(e.target.value)} /><br/>
              <input placeholder="password" type="password" value={password} onChange={e=>setPassword(e.target.value)} /><br/>
              <button onClick={onSignup}>Sign up</button>
              <p>or <button onClick={()=>setMode('login')}>Login</button></p>
            </div>
          )}
        </div>
      )}
      <div style={{marginTop:24}}>
        <h3>Start Practice</h3>
        <StartPractice />
      </div>
    </div>
  )
}

function StartPractice(){
  const [company, setCompany] = useState('')
  const [topic, setTopic] = useState('')
  const [qs, setQs] = useState([])

  async function start(){
    const r = await API.post('/practice/start', null, { params:{ company, topic } })
    setQs(r.data.questions || [])
  }

  return (
    <div>
      <input placeholder="Company (e.g., Google)" value={company} onChange={e=>setCompany(e.target.value)} />
      <input placeholder="Topic (e.g., Arrays)" value={topic} onChange={e=>setTopic(e.target.value)} />
      <button onClick={start}>Start</button>
      <ul>
        {qs.map((q,i)=> (
          <li key={i}>
            <b>{q.name}</b> [{q.difficulty}] - <a href={q.url} target="_blank">LeetCode</a>
          </li>
        ))}
      </ul>
    </div>
  )
}
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
    await API.post('/auth/signup', {username, email, password})
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
    <div className="p-6">
      <h2 className="text-2xl font-semibold mb-4">Dashboard</h2>

      {info ? (
        <div className="bg-gray-800 p-4 rounded-lg shadow">
          <p>Welcome, <span className="text-yellow-400">{info.username}</span></p>
          <p>Solved: {info.solved_count}</p>
        </div>
      ) : (
        <div className="flex gap-12">
          {mode==='login' ? (
            <div className="bg-gray-800 p-6 rounded-lg w-80 shadow">
              <h3 className="text-xl mb-3">Login</h3>
              <input className="w-full p-2 mb-3 rounded bg-gray-700" placeholder="email" value={email} onChange={e=>setEmail(e.target.value)} />
              <input className="w-full p-2 mb-3 rounded bg-gray-700" placeholder="password" type="password" value={password} onChange={e=>setPassword(e.target.value)} />
              <button onClick={onLogin} className="w-full bg-yellow-500 hover:bg-yellow-400 text-black p-2 rounded">Login</button>
              <p className="mt-3 text-sm">or <button className="text-yellow-400" onClick={()=>setMode('signup')}>Create account</button></p>
            </div>
          ) : (
            <div className="bg-gray-800 p-6 rounded-lg w-80 shadow">
              <h3 className="text-xl mb-3">Signup</h3>
              <input className="w-full p-2 mb-3 rounded bg-gray-700" placeholder="username" value={username} onChange={e=>setUsername(e.target.value)} />
              <input className="w-full p-2 mb-3 rounded bg-gray-700" placeholder="email" value={email} onChange={e=>setEmail(e.target.value)} />
              <input className="w-full p-2 mb-3 rounded bg-gray-700" placeholder="password" type="password" value={password} onChange={e=>setPassword(e.target.value)} />
              <button onClick={onSignup} className="w-full bg-green-500 hover:bg-green-400 text-black p-2 rounded">Sign up</button>
              <p className="mt-3 text-sm">or <button className="text-yellow-400" onClick={()=>setMode('login')}>Login</button></p>
            </div>
          )}
        </div>
      )}

      <div className="mt-6">
        <h3 className="text-xl mb-2">Start Practice</h3>
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
    <div className="bg-gray-800 p-4 rounded-lg w-full max-w-lg shadow">
      <input className="w-full p-2 mb-3 rounded bg-gray-700" placeholder="Company (e.g., Google)" value={company} onChange={e=>setCompany(e.target.value)} />
      <input className="w-full p-2 mb-3 rounded bg-gray-700" placeholder="Topic (e.g., Arrays)" value={topic} onChange={e=>setTopic(e.target.value)} />
      <button onClick={start} className="w-full bg-yellow-500 hover:bg-yellow-400 text-black p-2 rounded mb-3">Start</button>
      <ul className="space-y-2">
        {qs.map((q,i)=> (
          <li key={i} className="p-2 bg-gray-700 rounded">
            <b>{q.name}</b> <span className="text-sm text-gray-400">[{q.difficulty}]</span> - <a href={q.url} target="_blank" className="text-yellow-400">LeetCode</a>
          </li>
        ))}
      </ul>
    </div>
  )
}

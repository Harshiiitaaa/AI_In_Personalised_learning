import React, { useEffect, useState } from 'react'
import API from '../api'
import { Link } from 'react-router-dom'

export default function Dashboard() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [username, setUsername] = useState('')
  const [mode, setMode] = useState('login')
  const [info, setInfo] = useState(null)

  useEffect(() => {
    const token = localStorage.getItem('token')
    if (token) {
      API.get('/auth/me').then(r => setInfo(r.data)).catch(() => {})
    }
  }, [])

  async function onSignup() {
    try {
      await API.post('/auth/signup', { username, email, password })
      alert('Signed up successfully! Please log in.')
      setMode('login')
      setUsername('')
      setEmail('')
      setPassword('')
    } catch (error) {
      alert('Signup failed. Please try again.')
    }
  }

  async function onLogin() {
    try {
      const r = await API.post('/auth/login', { email, password })
      localStorage.setItem('token', r.data.access_token)
      const me = await API.get('/auth/me')
      setInfo(me.data)
    } catch (error) {
       alert('Login failed. Check your credentials.')
    }
  }

  const inputStyles = "w-full bg-gray-700 border border-gray-600 rounded px-3 py-2 mb-4 text-gray-200 focus:outline-none focus:ring-2 focus:ring-cyan-500 transition"
  const buttonStyles = "w-full bg-cyan-600 hover:bg-cyan-700 text-white font-bold py-2 px-4 rounded transition-colors"
  const switchModeButtonStyles = "bg-transparent text-cyan-400 hover:underline"

  return (
    <div>
      <h2 className="text-3xl font-bold mb-6 text-white">Dashboard</h2>
      {info ? (
        <div className="space-y-8">
            <div className="bg-gray-800 p-6 rounded-lg shadow-lg">
              <h3 className="text-2xl font-semibold mb-4 text-white">Welcome, {info.username}!</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-lg">
                  <p>Questions Solved: <span className="font-bold text-cyan-400">{info.solved_count}</span></p>
              </div>
            </div>
            <div className="bg-gray-800 p-6 rounded-lg shadow-lg">
                <StartPractice />
            </div>
        </div>
      ) : (
        <div className="flex justify-center items-center">
          <div className="bg-gray-800 p-8 rounded-lg shadow-xl w-full max-w-md">
            {mode === 'login' ? (
              <div>
                <h3 className="text-2xl font-semibold text-center mb-6 text-white">Login</h3>
                <input placeholder="Email" value={email} onChange={e => setEmail(e.target.value)} className={inputStyles} />
                <input placeholder="Password" type="password" value={password} onChange={e => setPassword(e.target.value)} className={inputStyles} />
                <button onClick={onLogin} className={buttonStyles}>Login</button>
                <p className="text-center mt-4">Don't have an account? <button onClick={() => setMode('signup')} className={switchModeButtonStyles}>Create one</button></p>
              </div>
            ) : (
              <div>
                <h3 className="text-2xl font-semibold text-center mb-6 text-white">Create Account</h3>
                <input placeholder="Username" value={username} onChange={e => setUsername(e.target.value)} className={inputStyles} />
                <input placeholder="Email" value={email} onChange={e => setEmail(e.target.value)} className={inputStyles} />
                <input placeholder="Password" type="password" value={password} onChange={e => setPassword(e.target.value)} className={inputStyles} />
                <button onClick={onSignup} className={buttonStyles}>Sign up</button>
                <p className="text-center mt-4">Already have an account? <button onClick={() => setMode('login')} className={switchModeButtonStyles}>Login</button></p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}

function StartPractice() {
  const [company, setCompany] = useState('')
  const [topic, setTopic] = useState('')
  const [qs, setQs] = useState([])

  async function start() {
    const r = await API.post('/practice/start', null, { params: { company, topic } })
    setQs(r.data.questions || [])
  }

  return (
    <div>
        <h3 className="text-2xl font-semibold mb-4 text-white">Start a Custom Session</h3>
        <div className="flex flex-col md:flex-row gap-4 mb-4">
            <input placeholder="Company (e.g., Google)" value={company} onChange={e => setCompany(e.target.value)} className="flex-grow bg-gray-700 border border-gray-600 rounded px-3 py-2 text-gray-200 focus:outline-none focus:ring-2 focus:ring-cyan-500" />
            <input placeholder="Topic (e.g., Arrays)" value={topic} onChange={e => setTopic(e.target.value)} className="flex-grow bg-gray-700 border border-gray-600 rounded px-3 py-2 text-gray-200 focus:outline-none focus:ring-2 focus:ring-cyan-500" />
            <button onClick={start} className="bg-cyan-600 hover:bg-cyan-700 text-white font-bold py-2 px-6 rounded transition-colors">Start</button>
        </div>
        {qs.length > 0 && (
            <ul className="mt-6 space-y-3">
            {qs.map((q, i) => (
                <li key={i} className="bg-gray-700 p-4 rounded-md flex justify-between items-center">
                <div>
                    <span className="font-bold text-white">{q.name}</span>
                    <span className="ml-2 text-sm text-gray-400">[{q.difficulty}]</span>
                </div>
                <a href={q.url} target="_blank" rel="noopener noreferrer" className="text-cyan-400 hover:underline">View on LeetCode</a>
                </li>
            ))}
            </ul>
        )}
    </div>
  )
}
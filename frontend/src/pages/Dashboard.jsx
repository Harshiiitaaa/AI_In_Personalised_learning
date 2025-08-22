import React, { useEffect, useState } from 'react'
import API from '../api'

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
    const r = await API.post('/auth/signup', { username, email, password })
    alert('Signed up! Now log in.')
    setMode('login')
  }

  async function onLogin() {
    const r = await API.post('/auth/login', { email, password })
    localStorage.setItem('token', r.data.access_token)
    const me = await API.get('/auth/me')
    setInfo(me.data)
  }

  return (
    <div className="max-w-6xl mx-auto p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white mb-2">Dashboard</h1>
        <p className="text-gray-400">Track your coding progress and start practicing</p>
      </div>

      {info ? (
        <div className="bg-dark-secondary rounded-lg p-6 mb-8 border border-gray-700">
          <div className="flex items-center space-x-4 mb-6">
            <div className="w-12 h-12 bg-code-green rounded-full flex items-center justify-center">
              <span className="text-lg font-bold text-white">{info.username.charAt(0).toUpperCase()}</span>
            </div>
            <div>
              <h2 className="text-xl font-semibold text-white">Welcome back, {info.username}!</h2>
              <p className="text-gray-400">Keep up the great work</p>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-dark-tertiary p-4 rounded-lg border border-gray-600">
              <div className="text-2xl font-bold text-code-green">{info.solved_count}</div>
              <div className="text-sm text-gray-400">Problems Solved</div>
            </div>
            <div className="bg-dark-tertiary p-4 rounded-lg border border-gray-600">
              <div className="text-2xl font-bold text-code-orange">0</div>
              <div className="text-sm text-gray-400">Current Streak</div>
            </div>
            <div className="bg-dark-tertiary p-4 rounded-lg border border-gray-600">
              <div className="text-2xl font-bold text-blue-400">0</div>
              <div className="text-sm text-gray-400">Points Earned</div>
            </div>
          </div>
        </div>
      ) : (
        <div className="bg-dark-secondary rounded-lg p-8 mb-8 border border-gray-700">
          <div className="max-w-md mx-auto">
            {mode === 'login' ? (
              <div>
                <h2 className="text-2xl font-bold text-white mb-6 text-center">Sign In</h2>
                <div className="space-y-4">
                  <input
                    placeholder="Email address"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    className="w-full p-3 bg-dark-tertiary border border-gray-600 rounded-md text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-code-green focus:border-transparent"
                  />
                  <input
                    placeholder="Password"
                    type="password"
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    className="w-full p-3 bg-dark-tertiary border border-gray-600 rounded-md text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-code-green focus:border-transparent"
                  />
                  <button
                    onClick={onLogin}
                    className="w-full bg-code-green hover:bg-green-600 text-white py-3 rounded-md font-medium transition-colors"
                  >
                    Sign In
                  </button>
                  <p className="text-center text-gray-400">
                    Don't have an account?{' '}
                    <button
                      onClick={() => setMode('signup')}
                      className="text-code-green hover:text-green-400 font-medium"
                    >
                      Create one
                    </button>
                  </p>
                </div>
              </div>
            ) : (
              <div>
                <h2 className="text-2xl font-bold text-white mb-6 text-center">Create Account</h2>
                <div className="space-y-4">
                  <input
                    placeholder="Username"
                    value={username}
                    onChange={e => setUsername(e.target.value)}
                    className="w-full p-3 bg-dark-tertiary border border-gray-600 rounded-md text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-code-green focus:border-transparent"
                  />
                  <input
                    placeholder="Email address"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    className="w-full p-3 bg-dark-tertiary border border-gray-600 rounded-md text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-code-green focus:border-transparent"
                  />
                  <input
                    placeholder="Password"
                    type="password"
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    className="w-full p-3 bg-dark-tertiary border border-gray-600 rounded-md text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-code-green focus:border-transparent"
                  />
                  <button
                    onClick={onSignup}
                    className="w-full bg-code-green hover:bg-green-600 text-white py-3 rounded-md font-medium transition-colors"
                  >
                    Create Account
                  </button>
                  <p className="text-center text-gray-400">
                    Already have an account?{' '}
                    <button
                      onClick={() => setMode('login')}
                      className="text-code-green hover:text-green-400 font-medium"
                    >
                      Sign in
                    </button>
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      <div className="bg-dark-secondary rounded-lg p-6 border border-gray-700">
        <h2 className="text-xl font-semibold text-white mb-4">Start Practice Session</h2>
        <StartPractice />
      </div>
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

  const getDifficultyColor = (difficulty) => {
    switch (difficulty?.toLowerCase()) {
      case 'easy': return 'text-code-green'
      case 'medium': return 'text-code-orange'
      case 'hard': return 'text-code-red'
      default: return 'text-gray-400'
    }
  }

  return (
    <div>
      <div className="flex flex-col md:flex-row gap-4 mb-6">
        <input
          placeholder="Company (e.g., Google, Meta, Amazon)"
          value={company}
          onChange={e => setCompany(e.target.value)}
          className="flex-1 p-3 bg-dark-tertiary border border-gray-600 rounded-md text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-code-green focus:border-transparent"
        />
        <input
          placeholder="Topic (e.g., Arrays, Dynamic Programming)"
          value={topic}
          onChange={e => setTopic(e.target.value)}
          className="flex-1 p-3 bg-dark-tertiary border border-gray-600 rounded-md text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-code-green focus:border-transparent"
        />
        <button
          onClick={start}
          className="px-6 py-3 bg-code-green hover:bg-green-600 text-white rounded-md font-medium transition-colors"
        >
          Generate Questions
        </button>
      </div>

      {qs.length > 0 && (
        <div className="bg-dark-tertiary rounded-lg border border-gray-600">
          <div className="p-4 border-b border-gray-600">
            <h3 className="text-lg font-semibold text-white">Practice Questions ({qs.length})</h3>
          </div>
          <div className="divide-y divide-gray-600">
            {qs.map((q, i) => (
              <div key={i} className="p-4 hover:bg-dark-accent transition-colors">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <h4 className="font-medium text-white mb-1">{q.name}</h4>
                    <div className="flex items-center space-x-2">
                      <span className={`text-sm font-medium ${getDifficultyColor(q.difficulty)}`}>
                        {q.difficulty}
                      </span>
                      <span className="text-gray-500">•</span>
                      <span className="text-sm text-gray-400">Problem #{i + 1}</span>
                    </div>
                  </div>
                  <a
                    href={q.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="ml-4 px-3 py-1 bg-blue-600 hover:bg-blue-700 text-white text-sm rounded-md transition-colors"
                  >
                    Open in LeetCode
                  </a>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

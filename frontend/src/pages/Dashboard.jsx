import React, { useEffect, useState } from 'react';
import API from '../api';
import { useNavigate } from 'react-router-dom';

export default function Dashboard() {
  const [info, setInfo] = useState(null);
  const navigate = useNavigate();

  // On mount, fetch user info (profile) if we have a token:
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      // If not authenticated, redirect to sign in
      navigate('/signin', { replace: true });
    } else {
      API.get('/auth/me')
        .then(r => setInfo(r.data))
        .catch(() => {
          localStorage.removeItem('token');
          navigate('/signin', { replace: true });
        });
    }
  }, [navigate]);

  // If still loading or not logged in, you could show a spinner or nothing:
  if (!info) {
    return null;
  }

  return (
    <div className="max-w-6xl mx-auto p-6">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white mb-2">Dashboard</h1>
        <p className="text-gray-400">Track your coding progress and start practicing</p>
      </div>
      {/* Profile Section */}
      <div className="bg-dark-secondary rounded-lg p-6 mb-8 border border-gray-700">
        <div className="flex items-center space-x-4 mb-6">
          <div className="w-12 h-12 bg-code-green rounded-full flex items-center justify-center">
            <span className="text-lg font-bold text-white">{info.username?.charAt(0).toUpperCase()}</span>
          </div>
          <div>
            <h2 className="text-xl font-semibold text-white">Welcome back, {info.username}!</h2>
            <p className="text-gray-400">Keep up the great work</p>
          </div>
        </div>
        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-dark-tertiary p-4 rounded-lg border border-gray-600">
            <div className="text-2xl font-bold text-code-green">{info.solved_count}</div>
            <div className="text-sm text-gray-400">Problems Solved</div>
          </div>
          <div className="bg-dark-tertiary p-4 rounded-lg border border-gray-600">
            <div className="text-2xl font-bold text-code-orange">{info.streak || 0}</div>
            <div className="text-sm text-gray-400">Current Streak</div>
          </div>
          <div className="bg-dark-tertiary p-4 rounded-lg border border-gray-600">
            <div className="text-2xl font-bold text-blue-400">{info.points || 0}</div>
            <div className="text-sm text-gray-400">Points Earned</div>
          </div>
        </div>
      </div>

      {/* Practice Section */}
      <div className="bg-dark-secondary rounded-lg p-6 border border-gray-700">
        <h2 className="text-xl font-semibold text-white mb-4">Start Practice Session</h2>
        <StartPractice />
      </div>
    </div>
  );
}

// Practice section: unchanged from your code except its now a child only of the Dashboard
function StartPractice() {
  const [company, setCompany] = useState('');
  const [topic, setTopic] = useState('');
  const [qs, setQs] = useState([]);

  async function start() {
    const r = await API.post('/practice/start', null, { params: { company, topic } });
    setQs(r.data.questions || []);
  }

  const getDifficultyColor = (difficulty) => {
    switch (difficulty?.toLowerCase()) {
      case 'easy': return 'text-code-green';
      case 'medium': return 'text-code-orange';
      case 'hard': return 'text-code-red';
      default: return 'text-gray-400';
    }
  };

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
  );
}

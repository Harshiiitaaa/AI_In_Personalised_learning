import React, { useEffect, useState } from 'react'
import API from '../api'

export default function Profile() {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    API.get('/stats/profile')
      .then(r => {
        setData(r.data)
        setLoading(false)
      })
      .catch(() => {
        setLoading(false)
      })
  }, [])

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-cyan-400"></div>
      </div>
    )
  }

  if (!data) {
    return (
      <div className="text-center py-20">
        <div className="mb-4">
          <svg className="w-16 h-16 text-gray-500 mx-auto" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
          </svg>
        </div>
        <h2 className="text-2xl text-gray-400 mb-2">Please log in to view your profile.</h2>
        <p className="text-gray-500">Access your stats and track your progress</p>
      </div>
    )
  }

  // Calculate success rate
  const successRate = data.attempts_total > 0 
    ? Math.round((data.accepted_total / data.attempts_total) * 100) 
    : 0

  return (
    <div className="max-w-6xl mx-auto p-6">
      <h2 className="text-3xl font-bold mb-8 text-white">Profile & Stats</h2>
      
      {/* Main Profile Card */}
      <div className="bg-gray-800 p-8 rounded-lg shadow-xl mb-8">
        {/* Profile Header */}
        <div className="flex items-center mb-8 pb-6 border-b border-gray-700">
          <div className="w-20 h-20 bg-cyan-400 rounded-full flex items-center justify-center mr-6">
            <span className="text-2xl font-bold text-gray-900">
              {data.username.charAt(0).toUpperCase()}
            </span>
          </div>
          <div>
            <h3 className="text-2xl font-bold text-white mb-1">{data.username}</h3>
            <p className="text-gray-400">{data.email}</p>
            <div className="mt-2">
              <span className="bg-green-600 text-white px-3 py-1 rounded-full text-sm">
                Active Member
              </span>
            </div>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="bg-gray-700 p-6 rounded-lg text-center hover:bg-gray-650 transition-colors">
            <div className="text-4xl font-bold text-cyan-400 mb-2">{data.solved_count}</div>
            <p className="text-lg text-gray-300">Problems Solved</p>
          </div>
          <div className="bg-gray-700 p-6 rounded-lg text-center hover:bg-gray-650 transition-colors">
            <div className="text-4xl font-bold text-white mb-2">{data.attempts_total}</div>
            <p className="text-lg text-gray-300">Total Attempts</p>
          </div>
          <div className="bg-gray-700 p-6 rounded-lg text-center hover:bg-gray-650 transition-colors">
            <div className="text-4xl font-bold text-green-400 mb-2">{data.accepted_total}</div>
            <p className="text-lg text-gray-300">Accepted</p>
          </div>
          <div className="bg-gray-700 p-6 rounded-lg text-center hover:bg-gray-650 transition-colors">
            <div className="text-4xl font-bold text-yellow-400 mb-2">{successRate}%</div>
            <p className="text-lg text-gray-300">Success Rate</p>
          </div>
        </div>
      </div>

      {/* Additional Stats */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Progress Chart */}
        <div className="bg-gray-800 p-6 rounded-lg shadow-xl">
          <h3 className="text-xl font-bold text-white mb-4">Progress Overview</h3>
          <div className="space-y-4">
            <div>
              <div className="flex justify-between text-sm text-gray-300 mb-1">
                <span>Accepted Solutions</span>
                <span>{data.accepted_total}/{data.attempts_total}</span>
              </div>
              <div className="w-full bg-gray-700 rounded-full h-2">
                <div 
                  className="bg-green-400 h-2 rounded-full transition-all duration-300" 
                  style={{ width: `${successRate}%` }}
                ></div>
              </div>
            </div>
          </div>
        </div>

        {/* Recent Activity */}
        <div className="bg-gray-800 p-6 rounded-lg shadow-xl">
          <h3 className="text-xl font-bold text-white mb-4">Recent Activity</h3>
          <div className="space-y-3">
            <div className="flex items-center p-3 bg-gray-700 rounded-lg">
              <div className="w-2 h-2 bg-green-400 rounded-full mr-3"></div>
              <span className="text-gray-300">Problem solved today</span>
            </div>
            <div className="flex items-center p-3 bg-gray-700 rounded-lg">
              <div className="w-2 h-2 bg-yellow-400 rounded-full mr-3"></div>
              <span className="text-gray-300">Practice session completed</span>
            </div>
            <div className="flex items-center p-3 bg-gray-700 rounded-lg">
              <div className="w-2 h-2 bg-cyan-400 rounded-full mr-3"></div>
              <span className="text-gray-300">Profile updated</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

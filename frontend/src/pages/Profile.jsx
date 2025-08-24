import React, { useEffect, useState } from 'react'
import { authService } from '../api/authService'
import { practiceService } from '../api/practiceService'
import { useNavigate } from 'react-router-dom'
import API from '../api';

export default function Profile() {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const navigate = useNavigate()

  useEffect(() => {
    loadProfileData()
  }, [])

  const loadProfileData = async () => {
    try {
      setLoading(true)
      setError(null)
      
      // Fetch user profile and stats in parallel
      const [userProfile, userStats] = await Promise.all([
        authService.getCurrentUser(),
        practiceService.getUserStats()
      ])
      
      // Combine the data
      const combinedData = {
        ...userProfile,
        ...userStats,
        solved_count: userStats.solved_count || 0,
        attempts_total: userStats.attempts_total || userStats.total_attempts || 0,
        accepted_total: userStats.accepted_total || userStats.solved_count || 0,
      }
      
      setData(combinedData)
      
    } catch (error) {
      console.error('Failed to load profile data:', error)
      setError(error.message || 'Failed to load profile data')
      
      // If unauthorized, redirect to login
      if (error.response?.status === 401) {
        authService.logout()
        navigate('/login')
      }
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-cyan-400"></div>
      </div>
    )
  }

  if (error || !data) {
    return (
      <div className="text-center py-20">
        <div className="mb-4">
          <svg className="w-16 h-16 text-gray-500 mx-auto" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
          </svg>
        </div>
        <h2 className="text-2xl text-gray-400 mb-2">
          {error ? 'Error loading profile' : 'Please log in to view your profile.'}
        </h2>
        <p className="text-gray-500">
          {error || 'Access your stats and track your progress'}
        </p>
        <button
          onClick={loadProfileData}
          className="mt-4 px-4 py-2 bg-cyan-600 hover:bg-cyan-700 text-white rounded"
        >
          Try Again
        </button>
      </div>
    )
  }

  // Calculate success rate
  const successRate = data.attempts_total > 0 
    ? Math.round((data.accepted_total / data.attempts_total) * 100) 
    : 0

  return (
    <div className="max-w-6xl mx-auto p-6">
      <div className="flex items-center justify-between mb-8">
        <h2 className="text-3xl font-bold text-white">Profile & Stats</h2>
        <button
          onClick={loadProfileData}
          className="px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded text-sm"
        >
          Refresh
        </button>
      </div>
      
      {/* Main Profile Card */}
      <div className="bg-gray-800 p-8 rounded-lg shadow-xl mb-8">
        {/* Profile Header */}
        <div className="flex items-center mb-8 pb-6 border-b border-gray-700">
          <div className="w-20 h-20 bg-cyan-400 rounded-full flex items-center justify-center mr-6">
            <span className="text-2xl font-bold text-gray-900">
              {(data.username || data.name || 'User').charAt(0).toUpperCase()}
            </span>
          </div>
          <div>
            <h3 className="text-2xl font-bold text-white mb-1">
              {data.username || data.name || 'User'}
            </h3>
            <p className="text-gray-400">{data.email || 'No email provided'}</p>
            <div className="mt-2">
              <span className="bg-green-600 text-white px-3 py-1 rounded-full text-sm">
                Active Member
              </span>
              {data.current_streak && data.current_streak > 0 && (
                <span className="bg-orange-600 text-white px-3 py-1 rounded-full text-sm ml-2">
                  {data.current_streak} Day Streak 🔥
                </span>
              )}
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

      {/* Recent Activity */}
      <div className="bg-gray-800 p-6 rounded-lg shadow-xl">
        <h3 className="text-xl font-bold text-white mb-4">Recent Activity</h3>
        <div className="space-y-3">
          {data.recent_problems && data.recent_problems.length > 0 ? (
            data.recent_problems.slice(0, 5).map((problem, index) => (
              <div key={index} className="flex items-center p-3 bg-gray-700 rounded-lg">
                <div className={`w-2 h-2 rounded-full mr-3 ${
                  problem.status === 'solved' || problem.status === 'accepted' 
                    ? 'bg-green-400' 
                    : 'bg-red-400'
                }`}></div>
                <div className="flex-1">
                  <span className="text-gray-300">{problem.title || problem.name}</span>
                  <div className="text-xs text-gray-500">
                    {problem.difficulty} • {problem.status}
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="text-gray-400 text-center py-4">
              Start solving problems to see your activity here
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

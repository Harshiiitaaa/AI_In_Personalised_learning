import React, { useEffect, useState } from 'react'
import API from '../api'

export default function Profile() {
  const [data, setData] = useState(null)

  useEffect(() => {
    API.get('/stats/profile').then(r => setData(r.data)).catch(() => {})
  }, [])

  if (!data) {
    return (
      <div className="text-center py-20">
        <h2 className="text-2xl text-gray-400">Please log in to view your profile.</h2>
      </div>
    )
  }

  return (
    <div>
      <h2 className="text-3xl font-bold mb-6 text-white">Profile & Stats</h2>
      <div className="bg-gray-800 p-8 rounded-lg shadow-xl max-w-3xl mx-auto">
        <div className="mb-6 pb-6 border-b border-gray-700">
            <p className="text-lg text-gray-400">Username</p>
            <p className="text-2xl font-semibold text-white">{data.username}</p>
        </div>
        <div className="mb-6">
            <p className="text-lg text-gray-400">Email</p>
            <p className="text-2xl font-semibold text-white">{data.email}</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-6 border-t border-gray-700">
            <div className="bg-gray-700 p-4 rounded-lg text-center">
                <p className="text-lg text-gray-300">Total Solved</p>
                <p className="text-4xl font-bold text-cyan-400">{data.solved_count}</p>
            </div>
            <div className="bg-gray-700 p-4 rounded-lg text-center">
                <p className="text-lg text-gray-300">Total Attempts</p>
                <p className="text-4xl font-bold text-white">{data.attempts_total}</p>
            </div>
            <div className="bg-gray-700 p-4 rounded-lg text-center">
                <p className="text-lg text-gray-300">Accepted</p>
                <p className="text-4xl font-bold text-green-400">{data.accepted_total}</p>
            </div>
        </div>
      </div>
    </div>
  )
}
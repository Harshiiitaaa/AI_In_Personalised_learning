import React, { useEffect, useState } from 'react'
import API from '../api'

export default function Profile(){
  const [data, setData] = useState(null)
  useEffect(()=>{
    API.get('/stats/profile').then(r=>setData(r.data)).catch(()=>{})
  },[])
  if(!data) return <div className="p-6">Login to see your profile.</div>
  return (
    <div className="p-6">
      <h2 className="text-2xl font-semibold mb-4">Profile</h2>
      <div className="bg-gray-800 p-6 rounded-lg shadow space-y-2">
        <p><span className="font-semibold">User:</span> {data.username} <span className="text-gray-400">({data.email})</span></p>
        <p><span className="font-semibold">Solved:</span> {data.solved_count}</p>
        <p><span className="font-semibold">Attempts:</span> {data.attempts_total} | <span className="font-semibold">Accepted:</span> {data.accepted_total}</p>
      </div>
    </div>
  )
}

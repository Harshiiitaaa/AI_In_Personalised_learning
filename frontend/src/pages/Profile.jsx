import React, { useEffect, useState } from 'react'
import API from '../api'

export default function Profile(){
  const [data, setData] = useState(null)
  useEffect(()=>{
    API.get('/stats/profile').then(r=>setData(r.data)).catch(()=>{})
  },[])
  if(!data) return <div style={{padding:24}}>Login to see your profile.</div>
  return (
    <div style={{padding:24}}>
      <h2>Profile</h2>
      <p>User: {data.username} ({data.email})</p>
      <p>Solved: {data.solved_count}</p>
      <p>Attempts: {data.attempts_total} | Accepted: {data.accepted_total}</p>
    </div>
  )
}
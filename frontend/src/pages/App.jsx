import React from 'react'
import { Outlet, Link, useNavigate } from 'react-router-dom'

export default function App() {
  const nav = useNavigate()
  const token = localStorage.getItem('token')
  function logout(){
    localStorage.removeItem('token')
    nav('/')
    location.reload()
  }
  return (
    <div>
      <nav style={{display:'flex', gap:16, padding:12, borderBottom:'1px solid #eee'}}>
        <Link to="/">Dashboard</Link>
        <Link to="/practice">Practice</Link>
        <Link to="/profile">Profile</Link>
        <div style={{marginLeft:'auto'}}>
          {token ? <button onClick={logout}>Logout</button> : null}
        </div>
      </nav>
      <Outlet />
    </div>
  )
}

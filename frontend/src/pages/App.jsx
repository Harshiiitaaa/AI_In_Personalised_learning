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
    <div className="min-h-screen bg-gray-900 text-gray-100">
      <nav className="flex gap-6 px-6 py-4 border-b border-gray-700 bg-gray-800">
        <Link to="/" className="hover:text-yellow-400">Dashboard</Link>
        <Link to="/practice" className="hover:text-yellow-400">Practice</Link>
        <Link to="/profile" className="hover:text-yellow-400">Profile</Link>
        <div className="ml-auto">
          {token ? (
            <button 
              onClick={logout} 
              className="px-4 py-1 bg-red-600 rounded hover:bg-red-500 transition"
            >
              Logout
            </button>
          ) : null}
        </div>
      </nav>
      <Outlet />
    </div>
  )
}

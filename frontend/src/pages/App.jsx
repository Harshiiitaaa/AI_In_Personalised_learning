import React from 'react'
import { Outlet, Link, useNavigate, NavLink } from 'react-router-dom'

export default function App() {
  const nav = useNavigate()
  const token = localStorage.getItem('token')

  function logout() {
    localStorage.removeItem('token')
    nav('/')
    location.reload()
  }

  const linkStyle = "px-3 py-2 rounded-md text-sm font-medium text-gray-300 hover:bg-gray-700 hover:text-white transition-colors"
  const activeLinkStyle = "bg-gray-900 text-white"

  return (
    <div className="bg-gray-900 text-gray-200 min-h-screen font-sans">
      <nav className="bg-gray-800 border-b border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center">
              <span className="font-bold text-xl text-white mr-6">CodeTrack</span>
              <div className="flex items-baseline space-x-4">
                <NavLink to="/" className={({ isActive }) => `${linkStyle} ${isActive ? activeLinkStyle : ''}`}>Dashboard</NavLink>
                <NavLink to="/practice" className={({ isActive }) => `${linkStyle} ${isActive ? activeLinkStyle : ''}`}>Practice</NavLink>
                <NavLink to="/profile" className={({ isActive }) => `${linkStyle} ${isActive ? activeLinkStyle : ''}`}>Profile</NavLink>
              </div>
            </div>
            <div className="ml-auto">
              {token ? (
                <button 
                  onClick={logout} 
                  className="bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-4 rounded-md text-sm transition-colors"
                >
                  Logout
                </button>
              ) : null}
            </div>
          </div>
        </div>
      </nav>
      <main>
        <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
          <Outlet />
        </div>
      </main>
    </div>
  )
}
import React from 'react';
import { Outlet, Link, useNavigate } from 'react-router-dom';
import { authService } from './api/authService'; // Import your API client

export default function Layout({ user, setIsAuthenticated }) {
  const navigate = useNavigate();

  const logout = async () => {
    try {
      authService.logout();

      setIsAuthenticated(false);

      navigate('/login');
    } catch (error) {
      console.error('Logout error:', error);

      localStorage.removeItem('access_token');

      setIsAuthenticated(false);
      navigate('/login');
    }
  };

  return (
    <div className="min-h-screen bg-dark-primary text-white">
      {/* Navigation Bar */}
      <nav className="bg-dark-secondary border-b border-gray-700 shadow-lg">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-8">
              <div className="text-xl font-bold text-code-green">DSAWithAI</div>
              <div className="flex space-x-6">
                <Link 
                  to="/dashboard" 
                  className="text-gray-300 hover:text-white hover:bg-dark-tertiary px-3 py-2 rounded-md text-sm font-medium transition-colors">
                  Dashboard
                </Link>
                {/* <Link 
                  to="/practice" 
                  className="text-gray-300 hover:text-white hover:bg-dark-tertiary px-3 py-2 rounded-md text-sm font-medium transition-colors">
                  Practice
                </Link> */}
                <Link 
                  to="/questions" 
                  className="text-gray-300 hover:text-white hover:bg-dark-tertiary px-3 py-2 rounded-md text-sm font-medium transition-colors">
                  Questions
                </Link>
                <Link 
                  to="/profile" 
                  className="text-gray-300 hover:text-white hover:bg-dark-tertiary px-3 py-2 rounded-md text-sm font-medium transition-colors">
                  Profile
                </Link>
              </div>
            </div>
            <div>
              <button
                onClick={logout}
                className="bg-code-red hover:bg-red-600 text-white px-4 py-2 rounded-md text-sm font-medium transition-colors">
                Logout
              </button>
            </div>
          </div>
        </div>
      </nav>
      
      <main className="flex-1">
        <Outlet context={{ user }} />
      </main>
    </div>
  );
}

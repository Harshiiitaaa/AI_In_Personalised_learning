import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { useState, useEffect } from "react";
import SignIn from "./pages/SignIn";
import Dashboard from "./pages/Dashboard";
import Practice from "./pages/Practice";
import Questions from "./pages/Questions";
import Profile from "./pages/Profile";
import Layout from "./Layout";
import Register from "./pages/Register";
import API from './api';

// Protected route to guard authenticated pages
function ProtectedRoute({ isAuthenticated, children }) {
  return isAuthenticated ? children : <Navigate to="/login" />;
}

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Check authentication on app load
  useEffect(() => {
    checkAuthenticationStatus();
  }, []);

  // CORRECTED: Fixed token storage key consistency
  const checkAuthenticationStatus = async () => {
    const token = localStorage.getItem('access_token');
    
    if (!token) {
      setIsAuthenticated(false);
      setLoading(false);
      return;
    }

    try {
      // Verify token with backend
      const response = await API.get('/auth/me'); 
      setIsAuthenticated(true);
      setUser(response.data);
    } catch (error) {
      console.error('Token validation failed:', error);
      localStorage.removeItem('access_token');
      setIsAuthenticated(false);
    } finally {
      setLoading(false);
    }
  };

  // Show loading spinner while checking authentication
  if (loading) {
    return (
      <div className="min-h-screen bg-dark-primary flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-code-green"></div>
        <span className="ml-4 text-white">Loading...</span>
      </div>
    );
  }

  return (
    <Router>
      <Routes>
        {/* Public Routes */}
        <Route 
          path="/login" 
          element={
            isAuthenticated ? 
            <Navigate to="/dashboard" replace /> : 
            <SignIn setIsAuthenticated={setIsAuthenticated} />
          } 
        />
        <Route 
          path="/register" 
          element={
            isAuthenticated ? 
            <Navigate to="/dashboard" replace /> : 
            <Register />
          } 
        />

        {/* Protected Routes: All inside Layout */}
        <Route
          path="/"
          element={
            <ProtectedRoute isAuthenticated={isAuthenticated}>
              <Layout user = {user} setIsAuthenticated={setIsAuthenticated} />
            </ProtectedRoute>
          }
        >
          <Route index element={<Dashboard />} />
          <Route path="dashboard" element={<Dashboard />} />
          <Route path="practice" element={<Practice />} />
          <Route path="profile" element={<Profile />} />
          <Route path="questions" element={<Questions />} />
        </Route>

        {/* Catch-all: any undefined route redirects based on auth */}
        <Route 
          path="*" 
          element={<Navigate to={isAuthenticated ? "/dashboard" : "/login"} />} 
        />
      </Routes>
    </Router>
  );
}

export default App;
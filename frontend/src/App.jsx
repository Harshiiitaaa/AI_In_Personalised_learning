import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { useState } from "react";
import SignIn from "./pages/SignIn";
import Dashboard from "./pages/Dashboard";
import Practice from "./pages/Practice";
import Questions from "./pages/Questions";
import Profile from "./pages/Profile";
import Layout from "./Layout";
import Register from './pages/Register';

// Protected route to guard authenticated pages
function ProtectedRoute({ isAuthenticated, children }) {
  return isAuthenticated ? children : <Navigate to="/login" />;
}

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(() =>
    localStorage.getItem('token') ? true : false
  );

  return (
    <Router>
      <Routes>
        {/* Public Route: Login */}
        <Route path="/login" element={<SignIn setIsAuthenticated={setIsAuthenticated} />} />
        <Route path="register" element={<Register />} />

        {/* Protected Routes: All inside Layout */}
        <Route
          path="/"
          element={
            <ProtectedRoute isAuthenticated={isAuthenticated}>
              <Layout />
            </ProtectedRoute>
          }
        >
          <Route index element={<Dashboard />} />
          <Route path="dashboard" element={<Dashboard />} />
          <Route path="practice" element={<Practice />} />
          <Route path="profile" element={<Profile />} />
          <Route path="questions" element={<Questions />} />
        </Route>

        {/* Catch-all: any undefined route redirects to login */}
        <Route path="*" element={<Navigate to="/login" />} />
      </Routes>
    </Router>
  );
}

export default App;

import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Link } from "react-router-dom";
import { authService } from "../api/authService";
import API from '../api';

export default function SignIn({ setIsAuthenticated }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      // Use authService instead of direct fetch
      const response = await authService.login({ email, password });
      
      console.log("Login successful:", response);
      
      // Set authentication state
      setIsAuthenticated(true);
      
      // Navigate to dashboard
      navigate("/dashboard");
      
    } catch (error) {
      console.error("Login failed:", error);
      
      // Handle different types of errors
      let errorMessage = "Invalid credentials";
      
      if (error.response?.data?.detail) {
        // FastAPI error format
        errorMessage = error.response.data.detail;
      } else if (error.response?.data?.message) {
        // Custom error format
        errorMessage = error.response.data.message;
      } else if (error.message) {
        // Generic error message
        errorMessage = error.message;
      }
      
      setError(errorMessage);
      
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex h-screen items-center justify-center bg-gray-900 text-white">
      <div className="w-full max-w-md p-8 space-y-6 bg-gray-800 rounded-xl shadow">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-2">Sign In</h2>
          <p className="text-gray-400">Welcome back to DSAWithAI</p>
        </div>
        
        {/* Display error message if exists */}
        {error && (
          <div className="bg-red-600 text-white p-3 rounded text-center text-sm">
            {error}
          </div>
        )}
        
        <form className="space-y-4" onSubmit={handleSubmit}>
          <input
            type="email"
            placeholder="Email address"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full px-4 py-2 rounded bg-gray-700 border border-gray-600 focus:outline-none focus:border-emerald-500"
            required
            disabled={loading}
          />
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full px-4 py-2 rounded bg-gray-700 border border-gray-600 focus:outline-none focus:border-emerald-500"
            required
            disabled={loading}
          />
          <button
            type="submit"
            className="w-full bg-emerald-500 hover:bg-emerald-600 text-white py-2 rounded disabled:opacity-60 disabled:cursor-not-allowed transition-colors"
            disabled={loading}
          >
            {loading ? "Signing in..." : "Sign In"}
          </button>
        </form>
        
        <p className="text-center text-gray-400">
          Don't have an account?{" "}
          <Link to="/register" className="text-emerald-400 hover:underline">
            Create one
          </Link>
        </p>
      </div>
    </div>
  );
}

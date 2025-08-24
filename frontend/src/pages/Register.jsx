import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { authService } from "../api/authService"; // Import the auth service we created
import API from '../api';

export default function Register() {
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(""); // Add error state for better UX
  const navigate = useNavigate();

  const handleRegister = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(""); // Clear previous errors

    try {
      // Use the authService instead of direct fetch
      const response = await authService.register({ 
        username, 
        email, 
        password 
      });
      
      console.log("Registration successful:", response);
      alert("Registration successful! Now you can sign in.");
      navigate("/login");
      
    } catch (error) {
      console.error("Registration failed:", error);
      
      // Handle different types of errors
      let errorMessage = "Registration failed.";
      
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
      alert(errorMessage);
      
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex h-screen items-center justify-center bg-gray-900 text-white">
      <div className="w-full max-w-md p-8 space-y-6 bg-gray-800 rounded-xl shadow">
        <h2 className="text-center text-2xl font-bold">Create Account</h2>
        
        {/* Display error message if exists */}
        {error && (
          <div className="bg-red-600 text-white p-3 rounded text-center text-sm">
            {error}
          </div>
        )}
        
        <form className="space-y-4" onSubmit={handleRegister}>
          <input
            type="text"
            placeholder="Username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            className="w-full px-4 py-2 rounded bg-gray-700 border border-gray-600 focus:outline-none focus:border-emerald-500"
            required
            disabled={loading} // Disable during loading
          />
          <input
            type="email"
            placeholder="Email address"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full px-4 py-2 rounded bg-gray-700 border border-gray-600 focus:outline-none focus:border-emerald-500"
            required
            disabled={loading} // Disable during loading
          />
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full px-4 py-2 rounded bg-gray-700 border border-gray-600 focus:outline-none focus:border-emerald-500"
            required
            disabled={loading} // Disable during loading
            minLength="6" // Add minimum password length
          />
          <button
            type="submit"
            className="w-full bg-emerald-500 hover:bg-emerald-600 text-white py-2 rounded disabled:opacity-60 disabled:cursor-not-allowed transition-colors"
            disabled={loading}
          >
            {loading ? "Creating account..." : "Create Account"}
          </button>
        </form>
        <p className="text-center text-gray-400">
          Already have an account?{" "}
          <a href="/login" className="text-emerald-400 hover:underline">
            Sign in
          </a>
        </p>
      </div>
    </div>
  );
}

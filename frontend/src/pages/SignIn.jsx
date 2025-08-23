import { useState } from "react";
import { useNavigate } from "react-router-dom";

export default function SignIn({ setIsAuthenticated }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Call backend for login
    const response = await fetch("http://localhost:5000/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });

    if (response.ok) {
      setIsAuthenticated(true);
      navigate("/dashboard");
    } else {
      alert("Invalid credentials");
    }
  };

  return (
    <div className="flex h-screen items-center justify-center bg-gray-900 text-white">
      <div className="w-full max-w-md p-8 space-y-6 bg-gray-800 rounded-xl shadow">
        <h2 className="text-center text-2xl font-bold">Sign In</h2>
        <form className="space-y-4" onSubmit={handleSubmit}>
          <input
            type="email"
            placeholder="Email address"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full px-4 py-2 rounded bg-gray-700 border border-gray-600 focus:outline-none"
          />
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full px-4 py-2 rounded bg-gray-700 border border-gray-600 focus:outline-none"
          />
          <button
            type="submit"
            className="w-full bg-emerald-500 hover:bg-emerald-600 text-white py-2 rounded"
          >
            Sign In
          </button>
        </form>
        <p className="text-center text-gray-400">
          Don’t have an account?{" "}
          <a href="/register" className="text-emerald-400 hover:underline">
            Create one
          </a>
        </p>
      </div>
    </div>
  );
}

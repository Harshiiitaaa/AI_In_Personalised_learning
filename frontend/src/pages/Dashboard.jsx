import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import API from "../api";

export default function Dashboard() {
  const [info, setInfo] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      navigate("/signin", { replace: true });
    } else {
      API.get("/auth/me")
        .then((r) => setInfo(r.data))
        .catch(() => {
          localStorage.removeItem("token");
          navigate("/signin", { replace: true });
        });
    }
  }, [navigate]);

  if (!info) return null;

  return (
    <div className="max-w-6xl mx-auto p-6">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white mb-2">Dashboard</h1>
        <p className="text-gray-400">Track your coding progress and start practicing</p>
      </div>
      {/* Profile Section */}
      <div className="bg-dark-secondary rounded-lg p-6 mb-8 border border-gray-700">
        <div className="flex items-center space-x-4 mb-6">
          <div className="w-12 h-12 bg-code-green rounded-full flex items-center justify-center">
            <span className="text-lg font-bold text-white">
              {info.username?.charAt(0).toUpperCase()}
            </span>
          </div>
          <div>
            <h2 className="text-xl font-semibold text-white">
              Welcome back, {info.username}!
            </h2>
            <p className="text-gray-400">Keep up the great work</p>
          </div>
        </div>
        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-dark-tertiary p-4 rounded-lg border border-gray-600">
            <div className="text-2xl font-bold text-code-green">{info.solved_count}</div>
            <div className="text-sm text-gray-400">Problems Solved</div>
          </div>
          <div className="bg-dark-tertiary p-4 rounded-lg border border-gray-600">
            <div className="text-2xl font-bold text-code-orange">{info.streak || 0}</div>
            <div className="text-sm text-gray-400">Current Streak</div>
          </div>
          <div className="bg-dark-tertiary p-4 rounded-lg border border-gray-600">
            <div className="text-2xl font-bold text-blue-400">{info.points || 0}</div>
            <div className="text-sm text-gray-400">Points Earned</div>
          </div>
        </div>
      </div>

      {/* Practice Section */}
      <PracticeLauncher />
    </div>
  );
}

function PracticeLauncher() {
  const [company, setCompany] = useState("");
  const [topic, setTopic] = useState("");
  const navigate = useNavigate();

  const start = () => {
    navigate("/questions", {
      state: { company, topic },
    });
  };

  return (
    <div className="bg-dark-secondary rounded-lg p-6 border border-gray-700">
      <h2 className="text-xl font-semibold text-white mb-4">Start Practice Session</h2>
      <div className="flex flex-col md:flex-row gap-4 mb-6">
        <input
          placeholder="Company (e.g., Google, Meta, Amazon)"
          value={company}
          onChange={(e) => setCompany(e.target.value)}
          className="flex-1 p-3 bg-dark-tertiary border border-gray-600 rounded-md text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-code-green focus:border-transparent"
        />
        <input
          placeholder="Topic (e.g., Arrays, Dynamic Programming)"
          value={topic}
          onChange={(e) => setTopic(e.target.value)}
          className="flex-1 p-3 bg-dark-tertiary border border-gray-600 rounded-md text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-code-green focus:border-transparent"
        />
        <button
          onClick={start}
          className="px-6 py-3 bg-code-green hover:bg-green-600 text-white rounded-md font-medium transition-colors"
        >
          Generate Questions
        </button>
      </div>
    </div>
  );
}

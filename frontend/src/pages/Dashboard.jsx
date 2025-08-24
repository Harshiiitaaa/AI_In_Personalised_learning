import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { authService } from '../api/authService';
import { practiceService } from '../api/practiceService';
import API from '../api';

export default function Dashboard() {
  const [company, setCompany] = useState('');
  const [topic, setTopic] = useState('');
  const [userInfo, setUserInfo] = useState(null);
  const [userStats, setUserStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [startSessionLoading, setStartSessionLoading] = useState(false);
  const navigate = useNavigate();

  // Load user data and statistics on component mount
  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      
      // Fetch user info and stats in parallel
      const [user, stats] = await Promise.all([
        authService.getCurrentUser(),
        practiceService.getUserStats()
      ]);
      
      setUserInfo(user);
      setUserStats(stats);
      
    } catch (error) {
      console.error('Failed to load dashboard data:', error);
      // If user fetch fails, might need to re-login
      if (error.response?.status === 401) {
        authService.logout();
        navigate('/login');
      }
    } finally {
      setLoading(false);
    }
  };

  // Start a practice session with real API call
  const startPracticeSession = async () => {
    setStartSessionLoading(true);
    
    try {
      // Call the practice service to start a session
      const sessionData = await practiceService.startSession({
        company: company.trim() || null,
        topic: topic.trim() || null,
        difficulty: 'mixed'
      });
      
      // Navigate to the practice solve page with the session data
      navigate('/practice/solve', {
        state: {
          question: sessionData.problem,
          sessionId: sessionData.session_id,
          start: 0,
          company: company,
          topic: topic
        }
      });
      
    } catch (error) {
      console.error('Failed to start practice session:', error);
      alert(error.message || 'Failed to start practice session. Please try again.');
    } finally {
      setStartSessionLoading(false);
    }
  };

  // Loading state
  if (loading) {
    return (
      <div className="max-w-6xl mx-auto p-6">
        <div className="flex items-center justify-center h-64">
          <div className="text-white text-lg">Loading dashboard...</div>
        </div>
      </div>
    );
  }

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
              {userInfo?.username?.charAt(0).toUpperCase() || userInfo?.name?.charAt(0).toUpperCase() || 'U'}
            </span>
          </div>
          <div>
            <h2 className="text-xl font-semibold text-white">
              Welcome back, {userInfo?.username || userInfo?.name || 'User'}!
            </h2>
            <p className="text-gray-400">Keep up the great work</p>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-dark-tertiary p-4 rounded-lg border border-gray-600">
            <div className="text-2xl font-bold text-code-green">
              {userStats?.solved_count || 0}
            </div>
            <div className="text-sm text-gray-400">Problems Solved</div>
          </div>
          <div className="bg-dark-tertiary p-4 rounded-lg border border-gray-600">
            <div className="text-2xl font-bold text-code-orange">
              {userStats?.current_streak || 0}
            </div>
            <div className="text-sm text-gray-400">Current Streak</div>
          </div>
          <div className="bg-dark-tertiary p-4 rounded-lg border border-gray-600">
            <div className="text-2xl font-bold text-blue-400">
              {userStats?.total_points || userStats?.points || 0}
            </div>
            <div className="text-sm text-gray-400">Points Earned</div>
          </div>
          <div className="bg-dark-tertiary p-4 rounded-lg border border-gray-600">
            <div className="text-2xl font-bold text-purple-400">
              {userStats?.success_rate ? `${userStats.success_rate}%` : '0%'}
            </div>
            <div className="text-sm text-gray-400">Success Rate</div>
          </div>
        </div>
      </div>

      {/* Practice Section */}
      <div className="bg-dark-secondary rounded-lg p-6 border border-gray-700">
        <h2 className="text-xl font-semibold text-white mb-4">Start Practice Session</h2>
        <div>
          <div className="flex flex-col md:flex-row gap-4 mb-6">
            <input
              placeholder="Company (e.g., Google, Meta, Amazon)"
              value={company}
              onChange={e => setCompany(e.target.value)}
              className="flex-1 p-3 bg-dark-tertiary border border-gray-600 rounded-md text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-code-green focus:border-transparent"
            />
            <input
              placeholder="Topic (e.g., Arrays, Dynamic Programming)"
              value={topic}
              onChange={e => setTopic(e.target.value)}
              className="flex-1 p-3 bg-dark-tertiary border border-gray-600 rounded-md text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-code-green focus:border-transparent"
            />
            <button
              onClick={startPracticeSession}
              disabled={startSessionLoading}
              className="px-6 py-3 bg-code-green hover:bg-green-600 text-white rounded-md font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {startSessionLoading ? 'Starting...' : 'Start Practice'}
            </button>
          </div>
          
          {/* Quick start buttons */}
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => setCompany('Google')}
              className="px-3 py-1 bg-gray-700 hover:bg-gray-600 text-white text-sm rounded"
            >
              Google Problems
            </button>
            <button
              onClick={() => setTopic('Arrays')}
              className="px-3 py-1 bg-gray-700 hover:bg-gray-600 text-white text-sm rounded"
            >
              Array Problems
            </button>
            <button
              onClick={() => setTopic('Dynamic Programming')}
              className="px-3 py-1 bg-gray-700 hover:bg-gray-600 text-white text-sm rounded"
            >
              DP Problems
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

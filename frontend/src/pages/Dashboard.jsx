import React, { useState, useEffect } from 'react';
import {  useOutletContext, useNavigate } from 'react-router-dom';
import { authService } from '../api/authService';
import { practiceService } from '../api/practiceService';

export default function Dashboard() {
  const { user } = useOutletContext(); 
  
  const [company, setCompany] = useState('');
  const [topic, setTopic] = useState('');
  const [userStats, setUserStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [startSessionLoading, setStartSessionLoading] = useState(false); 
  const navigate = useNavigate();

  useEffect(() => {
    // Now you only need to fetch the stats
    const loadStats = async () => {
      try {
        setLoading(true);
        const stats = await practiceService.getUserStats();
        setUserStats(stats);
      } catch (error) {
        console.error('Failed to load dashboard stats:', error);
      } finally {
        setLoading(false);
      }
    };
    loadStats();
  }, []);

  // Start a practice session with real API call
  const startPracticeSession = async () => {
    console.log("1. 'Start Practice' button clicked.");
    setStartSessionLoading(true);
    
    try {
      // Call the practice service to start a session
      console.log("2. Calling practiceService.startSession with:", { company, topic });
      const sessionData = await practiceService.startSession({
        company: company.trim() || null,
        topic: topic.trim() || null,
        difficulty: 'mixed'
      });
      
      console.log("3. Received sessionData from backend:", sessionData);

      const questionToSolve = sessionData.problem || (sessionData.problems && sessionData.problems[0]);

      console.log("4. Extracted questionToSolve:", questionToSolve);

      // Navigate to the practice solve page with the session data
      if (questionToSolve){
        console.log("5. A question was found. Navigating to /practice...");
        navigate('/questions', {
        state: {
          sessionData: sessionData, 
          // Pass the filters too
          company: company,
          topic: topic,
        }
      });
      } else{
        console.log("5. No question found in the response. Showing alert.");
        alert("No practice questions found for the selected criteria. Please try again.");
      }
    } catch (error) {
      console.error('Failed to start practice session:', error);
      alert(error.message || 'Failed to start practice session. Please try again.');
    } finally {
      console.log("6. Finished startPracticeSession function.");
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
              {user?.username?.charAt(0).toUpperCase() || 'U'}
            </span>
          </div>
          <div>
            <h2 className="text-xl font-semibold text-white">
              Welcome back, {user?.username || 'User'}!
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

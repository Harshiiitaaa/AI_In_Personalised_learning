import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

// Dummy/mock "easy" questions data with all the content you'd get from an API
const EASY_QUESTIONS = [
  {
    id: "1",
    name: "Two Sum",
    description:
      "Given an array of integers, return indices of the two numbers such that they add up to a specific target.",
    difficulty: "Easy",
    url: "https://leetcode.com/problems/two-sum/"
  },
  {
    id: "2",
    name: "Isomorphic Strings",
    description:
      "Given two strings, determine if they are isomorphic.",
    difficulty: "Easy",
    url: "https://leetcode.com/problems/isomorphic-strings/"
  }
];

// For demo, let's add a medium and hard question
const MEDIUM_QUESTION = {
  id: "3",
  name: "Longest Substring Without Repeating Characters",
  description:
    "Given a string, find the length of the longest substring without repeating characters.",
  difficulty: "Medium",
  url: "https://leetcode.com/problems/longest-substring-without-repeating-characters/"
};
const HARD_QUESTION = {
  id: "4",
  name: "Median of Two Sorted Arrays",
  description:
    "Given two sorted arrays nums1 and nums2, return the median of the two sorted arrays.",
  difficulty: "Hard",
  url: "https://leetcode.com/problems/median-of-two-sorted-arrays/"
};

export default function PracticeStart() {
  const { state } = useLocation();
  const navigate = useNavigate();
  // Initially, only two easy questions
  const [questions, setQuestions] = useState(EASY_QUESTIONS);
  const [solved, setSolved] = useState({});
  const [timer, setTimer] = useState(0);
  const [timerStarted, setTimerStarted] = useState(false);

  useEffect(() => {
    if (timerStarted) {
      const t = setInterval(() => setTimer(time => time + 1), 1000);
      return () => clearInterval(t);
    }
  }, [timerStarted]);

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // After both easy questions solved, show next question per logic
  useEffect(() => {
    if (Object.keys(solved).length === 2 && !questions.find(q => q.difficulty !== "Easy")) {
      if (timer <= 20 * 60) setQuestions([HARD_QUESTION]);
      else if (timer <= 40 * 60) setQuestions([MEDIUM_QUESTION]);
    }
  }, [solved, timer, questions]);

  return (
    <div className="max-w-4xl mx-auto py-8 px-6">
      <div className="mb-6 flex justify-between items-center">
        <h2 className="text-2xl font-bold text-white">
          {questions.every(q => q.difficulty === "Easy")
            ? `Easy Questions for ${state?.company || "Company"}`
            : questions[0]?.difficulty === "Hard"
              ? `Hard Question`
              : `Medium Question`}
        </h2>
        <div className="bg-gray-800 text-code-green px-3 py-1 rounded font-mono border border-gray-600">
          Timer: {formatTime(timer)}
        </div>
      </div>
      <button
        className="mb-6 px-5 py-2 bg-code-green text-white rounded hover:bg-green-600"
        onClick={() => setTimerStarted(true)}
        disabled={timerStarted}
      >
        {timerStarted ? 'Timer Running' : 'Start Timer'}
      </button>
      <div className={`grid ${questions.length === 1 ? "grid-cols-1" : "md:grid-cols-2"} gap-6`}>
        {questions.map((q, idx) => (
          <div key={q.id} className="bg-dark-secondary p-6 rounded-lg border border-gray-700 flex flex-col">
            <h3 className="text-lg font-semibold mb-2 text-white">{q.name}</h3>
            <p className="text-gray-300 mb-4">{q.description}</p>
            <div className="flex items-center mb-3">
              <span className={`text-sm font-medium ${
                q.difficulty === "Easy"
                  ? "text-code-green"
                  : q.difficulty === "Medium"
                  ? "text-code-orange"
                  : "text-code-red"
              }`}>
                {q.difficulty}
              </span>
            </div>
            <div className="mt-auto flex space-x-2">
              <a href={q.url} target="_blank" rel="noopener noreferrer"
                className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700">Solve in LeetCode</a>
              <button
                onClick={() => {
                  setTimerStarted(true);
                  navigate(`/practice/solve/${q.id}`, {
                    state: {
                      start: timer,
                      question: q,
                      onSolve: () =>
                        setSolved(prev => ({ ...prev, [q.id]: true }))
                    }
                  });
                }}
                className="px-4 py-2 bg-code-green text-white rounded hover:bg-green-600"
                disabled={solved[q.id]}
              >{solved[q.id] ? "Solved!" : "Solve here"}</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

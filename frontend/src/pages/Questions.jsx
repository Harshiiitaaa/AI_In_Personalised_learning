import React, { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import API from "../api";

export default function Questions() {
  const location = useLocation();
  const navigate = useNavigate();
  const { company, topic } = location.state || {};
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    API.post("/practice/start", null, { params: { company, topic } })
      .then((r) => {
        // Filter only Easy questions and take 2
        const easyQs = (r.data.questions || []).filter(q => (q.difficulty || '').toLowerCase() === 'easy').slice(0, 2);
        setQuestions(easyQs);
      })
      .finally(() => setLoading(false));
  }, [company, topic]);

  if (loading) return <div className="p-8 text-white">Loading questions...</div>;

  return (
    <div className="max-w-3xl mx-auto p-6">
      <h2 className="text-2xl font-bold text-white mb-4">Easy Questions for {company || "Selected Company"}</h2>
      {questions.length === 0 && <div className="text-gray-300">No easy questions found for this selection.</div>}
      {questions.map((q, idx) => (
        <div className="bg-dark-secondary mb-6 p-6 rounded border border-gray-700" key={idx}>
          <h3 className="text-xl font-bold text-white">{q.name}</h3>
          <div className="text-gray-400 mb-2 capitalize">{q.difficulty} | <span className="text-sm">Problem #{idx + 1}</span></div>
          <div className="mb-3 text-gray-200">{q.description || "No description provided."}</div>
          <a
            href={q.url}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-block text-blue-400 underline mr-3 mb-2"
          >
            Open in LeetCode
          </a>
          <button
            className="bg-code-green text-white px-4 py-2 rounded ml-3"
            onClick={() => navigate("/practice", { state: { question: q } })}
          >
            Start Solving
          </button>
        </div>
      ))}
    </div>
  );
}

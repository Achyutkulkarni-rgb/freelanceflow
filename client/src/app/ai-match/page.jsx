'use client';
import { useState } from 'react';
import Link from 'next/link';
import api from '@/lib/axios';

export default function AIMatchPage() {
  const [skills, setSkills] = useState('');
  const [experience, setExperience] = useState('');
  const [preference, setPreference] = useState('');
  const [suggestions, setSuggestions] = useState('');
  const [loading, setLoading] = useState(false);

  const generateMatch = async () => {
    if (!skills.trim()) return;
    setLoading(true);
    setSuggestions('');
    try {
      const { data } = await api.post('/ai/match', { skills, experience, preference });
      const text = data.suggestions;
      let i = 0;
      const interval = setInterval(() => {
        setSuggestions(text.slice(0, i));
        i++;
        if (i > text.length) clearInterval(interval);
      }, 8);
    } catch (err) {
      setSuggestions('Failed to generate suggestions. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white border-b border-gray-100">
        <div className="max-w-4xl mx-auto px-4 py-4 flex items-center justify-between">
          <Link href="/" className="text-2xl font-bold text-blue-600">FreelanceFlow</Link>
          <Link href="/dashboard" className="text-sm text-gray-500 hover:text-blue-600">← Dashboard</Link>
        </div>
      </nav>

      <div className="max-w-2xl mx-auto px-4 py-10">
        <div className="text-center mb-8">
          <span className="text-5xl">🎯</span>
          <h1 className="text-2xl font-bold text-gray-900 mt-3 mb-2">AI Job Matcher</h1>
          <p className="text-gray-500">Tell us your skills and AI will suggest the best jobs for you</p>
        </div>

        <div className="bg-white rounded-2xl border border-gray-100 p-6 space-y-4 mb-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Your Skills *</label>
            <input placeholder="e.g. React, Node.js, MongoDB"
              value={skills} onChange={(e) => setSkills(e.target.value)}
              className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"/>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Experience</label>
            <input placeholder="e.g. 2 years fullstack development"
              value={experience} onChange={(e) => setExperience(e.target.value)}
              className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"/>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Preference</label>
            <input placeholder="e.g. short projects, UI work, APIs"
              value={preference} onChange={(e) => setPreference(e.target.value)}
              className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"/>
          </div>
          <button onClick={generateMatch} disabled={loading || !skills.trim()}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 rounded-xl transition disabled:opacity-50 flex items-center justify-center gap-2">
            {loading ? (
              <><div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"/> Finding matches...</>
            ) : '🎯 Find My Jobs'}
          </button>
        </div>

        {suggestions && (
          <div className="bg-white rounded-2xl border border-gray-100 p-6">
            <h2 className="font-semibold text-gray-900 mb-4">Your Job Matches</h2>
            <p className="text-gray-700 text-sm leading-relaxed whitespace-pre-wrap">{suggestions}</p>
          </div>
        )}
      </div>
    </div>
  );
}
'use client';
import { useState } from 'react';
import Link from 'next/link';
import api from '@/lib/axios';
import useAuthStore from '@/store/authStore';

export default function AIProposalPage() {
  const { user } = useAuthStore();
  const [jobTitle, setJobTitle] = useState('');
  const [skills, setSkills] = useState('');
  const [experience, setExperience] = useState('');
  const [proposal, setProposal] = useState('');
  const [loading, setLoading] = useState(false);

const generateProposal = async () => {
  if (!jobTitle.trim()) return;
  setLoading(true);
  setProposal('');

  try {
    const { data } = await api.post('/ai/proposal', {
      jobTitle,
      skills,
      experience,
    });

    const text = data.proposal;
    let i = 0;
    const interval = setInterval(() => {
      setProposal(text.slice(0, i));
      i++;
      if (i > text.length) clearInterval(interval);
    }, 10);

  } catch (err) {
    setProposal('Failed to generate proposal. Please try again.');
  } finally {
    setLoading(false);
  }
};

  const copyToClipboard = () => {
    navigator.clipboard.writeText(proposal);
    alert('Copied to clipboard!');
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white border-b border-gray-100">
        <div className="max-w-4xl mx-auto px-4 py-4 flex items-center justify-between">
          <Link href="/" className="text-2xl font-bold text-blue-600">FreelanceFlow</Link>
          <Link href="/dashboard" className="text-sm text-gray-500 hover:text-blue-600">
            ← Dashboard
          </Link>
        </div>
      </nav>

      <div className="max-w-2xl mx-auto px-4 py-10">
        {/* Header */}
        <div className="text-center mb-8">
          <span className="text-5xl">🤖</span>
          <h1 className="text-2xl font-bold text-gray-900 mt-3 mb-2">
            AI Proposal Generator
          </h1>
          <p className="text-gray-500">
            Fill in the details and let AI write a winning proposal for you
          </p>
        </div>

        {/* Form */}
        <div className="bg-white rounded-2xl border border-gray-100 p-6 space-y-4 mb-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Job Title <span className="text-red-400">*</span>
            </label>
            <input
              placeholder="e.g. Build a React e-commerce website"
              value={jobTitle}
              onChange={(e) => setJobTitle(e.target.value)}
              className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Your Skills
            </label>
            <input
              placeholder="e.g. React, Node.js, MongoDB, Tailwind"
              value={skills}
              onChange={(e) => setSkills(e.target.value)}
              className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Your Experience
            </label>
            <input
              placeholder="e.g. 2 years building fullstack apps"
              value={experience}
              onChange={(e) => setExperience(e.target.value)}
              className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <button
            onClick={generateProposal}
            disabled={loading || !jobTitle.trim()}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 rounded-xl transition disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {loading ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"/>
                Generating...
              </>
            ) : (
              <>🤖 Generate Proposal</>
            )}
          </button>
        </div>

        {/* Output */}
        {proposal && (
          <div className="bg-white rounded-2xl border border-gray-100 p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-semibold text-gray-900">Your Proposal</h2>
              <button
                onClick={copyToClipboard}
                className="text-xs bg-gray-100 hover:bg-gray-200 text-gray-700 px-3 py-1.5 rounded-lg transition">
                Copy
              </button>
            </div>
            <p className="text-gray-700 text-sm leading-relaxed whitespace-pre-wrap">
              {proposal}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import api from '@/lib/axios';
import useAuthStore from '@/store/authStore';
import toast, { Toaster } from 'react-hot-toast';

export default function ProfilePage() {
  const { user, loadAuth, setAuth, token } = useAuthStore();
  const [loading, setLoading] = useState(false);
  const [findingJobs, setFindingJobs] = useState(false);
  const [jobs, setJobs] = useState([]);
  const [form, setForm] = useState({
    name: '', bio: '', skills: '', experience: '',
    location: '', lookingFor: '', expectedSalary: '', availability: 'freelance',
  });

  useEffect(() => { loadAuth(); }, []);

  useEffect(() => {
    if (user) {
      setForm({
        name: user.name || '',
        bio: user.bio || '',
        skills: user.skills?.join(', ') || '',
        experience: user.experience || '',
        location: user.location || '',
        lookingFor: user.lookingFor || '',
        expectedSalary: user.expectedSalary || '',
        availability: user.availability || 'freelance',
      });
    }
  }, [user]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const { data } = await api.put('/auth/profile', {
        ...form,
        skills: form.skills.split(',').map(s => s.trim()).filter(Boolean),
      });
      setAuth(data, token);
      toast.success('Profile updated!');
    } catch (err) {
      toast.error('Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  const findJobs = async () => {
    setFindingJobs(true);
    setJobs([]);
    try {
      const { data } = await api.post('/ai/find-jobs', {
        skills: form.skills,
        experience: form.experience,
        location: form.location,
        lookingFor: form.lookingFor,
        availability: form.availability,
      });
      setJobs(data.jobs);
      if (data.jobs.length === 0) toast.error('No jobs found, try different keywords');
      else toast.success(`Found ${data.jobs.length} real jobs for you!`);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to find jobs');
    } finally {
      setFindingJobs(false);
    }
  };

  if (!user) return (
    <div className="min-h-screen flex items-center justify-center">
      <Link href="/login" className="bg-blue-600 text-white px-6 py-3 rounded-xl">Sign in</Link>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50">
      <Toaster />
      <nav className="bg-white border-b border-gray-100">
        <div className="max-w-4xl mx-auto px-4 py-4 flex items-center justify-between">
          <Link href="/" className="text-2xl font-bold text-blue-600">FreelanceFlow</Link>
          <Link href="/dashboard" className="text-sm text-gray-500 hover:text-blue-600">← Dashboard</Link>
        </div>
      </nav>

      <div className="max-w-2xl mx-auto px-4 py-10 space-y-6">

        {/* Profile Card */}
        <div className="bg-white rounded-2xl border border-gray-100 p-8">
          <div className="flex items-center gap-5 mb-8">
            <div className="w-20 h-20 rounded-full bg-blue-500 flex items-center justify-center text-white text-3xl font-bold">
              {user.name?.[0]?.toUpperCase()}
            </div>
            <div>
              <h1 className="text-xl font-bold text-gray-900">{user.name}</h1>
              <p className="text-gray-500 text-sm">{user.email}</p>
              <span className={`text-xs font-medium px-2 py-1 rounded-full mt-1 inline-block ${
                user.role === 'freelancer' ? 'bg-blue-100 text-blue-700' : 'bg-green-100 text-green-700'
              }`}>{user.role}</span>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Full name</label>
                <input required value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"/>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Location</label>
                <input placeholder="e.g. Bangalore"
                  value={form.location}
                  onChange={(e) => setForm({ ...form, location: e.target.value })}
                  className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"/>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Bio</label>
              <textarea rows={3} placeholder="Tell clients about yourself..."
                value={form.bio} onChange={(e) => setForm({ ...form, bio: e.target.value })}
                className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"/>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Skills <span className="text-gray-400 font-normal">(comma separated)</span>
              </label>
              <input placeholder="React, Node.js, MongoDB, Tailwind"
                value={form.skills}
                onChange={(e) => setForm({ ...form, skills: e.target.value })}
                className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"/>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Experience</label>
                <input placeholder="e.g. 2 years fullstack"
                  value={form.experience}
                  onChange={(e) => setForm({ ...form, experience: e.target.value })}
                  className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"/>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Expected Salary</label>
                <input placeholder="e.g. 8-12 LPA"
                  value={form.expectedSalary}
                  onChange={(e) => setForm({ ...form, expectedSalary: e.target.value })}
                  className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"/>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Looking for</label>
                <input placeholder="e.g. Fullstack Developer"
                  value={form.lookingFor}
                  onChange={(e) => setForm({ ...form, lookingFor: e.target.value })}
                  className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"/>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Availability</label>
                <select value={form.availability}
                  onChange={(e) => setForm({ ...form, availability: e.target.value })}
                  className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
                  <option value="full-time">Full-time</option>
                  <option value="part-time">Part-time</option>
                  <option value="freelance">Freelance</option>
                  <option value="internship">Internship</option>
                </select>
              </div>
            </div>

            <button type="submit" disabled={loading}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 rounded-xl transition disabled:opacity-50">
              {loading ? 'Saving...' : 'Save Profile'}
            </button>
          </form>
        </div>

        {/* AI Job Finder */}
        <div className="bg-white rounded-2xl border border-gray-100 p-8">
          <h2 className="text-lg font-bold text-gray-900">🔍 Real Job Finder</h2>
          <p className="text-sm text-gray-500 mt-1 mb-4">
            Finds real live job postings based on your skills — with direct apply links
          </p>

          <div className="bg-blue-50 rounded-xl p-4 mb-4 text-sm text-blue-700">
            <p className="font-medium mb-1">How it works:</p>
            <p>1. Fill your skills and location above</p>
            <p>2. Click Find Jobs — we search real job boards</p>
            <p>3. Click Apply Now — goes directly to the job posting</p>
          </div>

          <button onClick={findJobs}
            disabled={findingJobs || !form.skills.trim()}
            className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold py-3 rounded-xl transition disabled:opacity-50 flex items-center justify-center gap-2">
            {findingJobs ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"/>
                Searching real job boards...
              </>
            ) : '🚀 Find Real Jobs For Me'}
          </button>

          {!form.skills.trim() && (
            <p className="text-xs text-orange-500 text-center mt-2">
              Add your skills above first
            </p>
          )}
        </div>

        {/* Job Results */}
        {jobs.length > 0 && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-bold text-gray-900">
                🎯 {jobs.length} Real Jobs Found
              </h2>
              <span className="text-xs text-gray-400 bg-gray-100 px-3 py-1 rounded-full">
                Live from Adzuna
              </span>
            </div>

            {jobs.map((job, i) => (
              <div key={i}
                className="bg-white rounded-2xl border border-gray-100 p-6 hover:shadow-md transition">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1 mr-3">
                    <h3 className="font-bold text-gray-900">{job.title}</h3>
                    <p className="text-blue-600 font-medium text-sm mt-0.5">{job.company}</p>
                  </div>
                  <span className="bg-green-100 text-green-700 text-xs font-medium px-3 py-1 rounded-full whitespace-nowrap">
                    {job.salary}
                  </span>
                </div>

                <p className="text-gray-600 text-sm mb-3 line-clamp-2">
                  {job.description}
                </p>

                <div className="flex flex-wrap gap-2 mb-4">
                  <span className="bg-gray-100 text-gray-600 text-xs px-3 py-1 rounded-full">
                    📍 {job.location}
                  </span>
                  {job.category && (
                    <span className="bg-purple-50 text-purple-600 text-xs px-3 py-1 rounded-full">
                      {job.category}
                    </span>
                  )}
                  {job.created && (
                    <span className="bg-blue-50 text-blue-600 text-xs px-3 py-1 rounded-full">
                      🕒 {new Date(job.created).toLocaleDateString('en-IN', {
                        day: 'numeric', month: 'short', year: 'numeric'
                      })}
                    </span>
                  )}
                </div>

                <a href={job.link} target="_blank" rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 bg-blue-600 text-white text-sm px-5 py-2.5 rounded-xl hover:bg-blue-700 transition font-medium">
                  Apply Now →
                </a>
              </div>
            ))}
          </div>
        )}

      </div>
    </div>
  );
}

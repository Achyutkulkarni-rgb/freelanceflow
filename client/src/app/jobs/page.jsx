'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import api from '@/lib/axios';
import useAuthStore from '@/store/authStore';

export default function JobsPage() {
  const { user, loadAuth } = useAuthStore();
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    loadAuth();
    fetchJobs();
  }, []);

  const fetchJobs = async (s = '') => {
    try {
      setLoading(true);
      const { data } = await api.get('/jobs', { params: s ? { search: s } : {} });
      setJobs(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white border-b border-gray-100 sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
          <Link href="/" className="text-2xl font-bold text-blue-600">FreelanceFlow</Link>
          <div className="flex items-center gap-4">
            {user ? (
              <>
                <Link href="/dashboard" className="text-sm text-gray-600 hover:text-blue-600">Dashboard</Link>
                {user.role === 'client' && (
                  <Link href="/jobs/create" className="bg-blue-600 text-white text-sm px-4 py-2 rounded-xl hover:bg-blue-700 transition">
                    + Post Job
                  </Link>
                )}
              </>
            ) : (
              <Link href="/login" className="bg-blue-600 text-white text-sm px-4 py-2 rounded-xl">Sign in</Link>
            )}
          </div>
        </div>
      </nav>

      <div className="max-w-4xl mx-auto px-4 py-10">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold text-gray-900">Browse Jobs</h1>
          <div className="flex gap-2">
            <input
              placeholder="Search jobs..."
              value={search}
              onChange={(e) => { setSearch(e.target.value); fetchJobs(e.target.value); }}
              className="border border-gray-200 rounded-xl px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>

        {loading ? (
          <div className="space-y-4">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="bg-white rounded-2xl p-6 animate-pulse h-32"/>
            ))}
          </div>
        ) : jobs.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-2xl border border-gray-100">
            <p className="text-4xl mb-3">💼</p>
            <p className="text-gray-500 mb-4">No jobs posted yet</p>
            {user?.role === 'client' && (
              <Link href="/jobs/create" className="bg-blue-600 text-white px-6 py-3 rounded-xl text-sm">
                Post the first job
              </Link>
            )}
          </div>
        ) : (
          <div className="space-y-4">
            {jobs.map((job) => (
              <Link href={`/jobs/${job._id}`} key={job._id}>
                <div className="bg-white rounded-2xl p-6 border border-gray-100 hover:shadow-md transition cursor-pointer">
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <h2 className="font-semibold text-gray-900 text-lg">{job.title}</h2>
                      <p className="text-sm text-gray-500 mt-0.5">
                        Posted by {job.client?.name} · {new Date(job.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                    <span className="bg-green-100 text-green-700 text-xs font-medium px-3 py-1 rounded-full">
                      ₹{job.budget}
                    </span>
                  </div>
                  <p className="text-gray-600 text-sm line-clamp-2 mb-3">{job.description}</p>
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="bg-blue-50 text-blue-600 text-xs px-3 py-1 rounded-full">{job.category}</span>
                    {job.skills?.map(s => (
                      <span key={s} className="bg-gray-100 text-gray-600 text-xs px-3 py-1 rounded-full">{s}</span>
                    ))}
                    <span className="ml-auto text-xs text-gray-400">{job.bids?.length || 0} bids</span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
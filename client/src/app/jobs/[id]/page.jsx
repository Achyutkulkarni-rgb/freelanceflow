'use client';
import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import api from '@/lib/axios';
import useAuthStore from '@/store/authStore';
import toast, { Toaster } from 'react-hot-toast';

export default function JobDetailPage() {
  const { id } = useParams();
  const { user, loadAuth } = useAuthStore();
  const [job, setJob] = useState(null);
  const [loading, setLoading] = useState(true);
  const [bidding, setBidding] = useState(false);
  const [showBidForm, setShowBidForm] = useState(false);
  const [bid, setBid] = useState({ amount: '', proposal: '' });

  useEffect(() => { loadAuth(); fetchJob(); }, []);

  const fetchJob = async () => {
    try {
      const { data } = await api.get(`/jobs/${id}`);
      setJob(data);
    } catch (err) {
      toast.error('Job not found');
    } finally {
      setLoading(false);
    }
  };

  const submitBid = async (e) => {
    e.preventDefault();
    setBidding(true);
    try {
      await api.post(`/jobs/${id}/bid`, {
        amount: Number(bid.amount),
        proposal: bid.proposal,
      });
      toast.success('Bid submitted!');
      setShowBidForm(false);
      fetchJob();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to submit bid');
    } finally {
      setBidding(false);
    }
  };

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600"/>
    </div>
  );

  if (!job) return (
    <div className="min-h-screen flex items-center justify-center">
      <p className="text-gray-500">Job not found</p>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50">
      <Toaster />
      <nav className="bg-white border-b border-gray-100 sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
          <Link href="/" className="text-2xl font-bold text-blue-600">FreelanceFlow</Link>
          <Link href="/jobs" className="text-sm text-gray-500 hover:text-blue-600">← Back to jobs</Link>
        </div>
      </nav>

      <div className="max-w-4xl mx-auto px-4 py-10 grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white rounded-2xl p-6 border border-gray-100">
            <div className="flex items-start justify-between mb-4">
              <div>
                <span className="bg-blue-50 text-blue-600 text-xs px-3 py-1 rounded-full">{job.category}</span>
                <h1 className="text-xl font-bold text-gray-900 mt-2">{job.title}</h1>
                <p className="text-sm text-gray-500 mt-1">
                  Posted by {job.client?.name} · {new Date(job.createdAt).toLocaleDateString()}
                </p>
              </div>
              <span className="text-xl font-bold text-green-600">₹{job.budget}</span>
            </div>
            <p className="text-gray-600 leading-relaxed">{job.description}</p>
            {job.skills?.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-4">
                {job.skills.map(s => (
                  <span key={s} className="bg-gray-100 text-gray-600 text-xs px-3 py-1 rounded-full">{s}</span>
                ))}
              </div>
            )}
          </div>

          {/* Bids */}
          <div className="bg-white rounded-2xl p-6 border border-gray-100">
            <h2 className="font-semibold text-gray-900 mb-4">
              Bids ({job.bids?.length || 0})
            </h2>
            {job.bids?.length === 0 ? (
              <p className="text-gray-400 text-sm">No bids yet — be the first!</p>
            ) : (
              <div className="space-y-4">
                {job.bids?.map((bid, i) => (
                  <div key={i} className="flex items-start gap-3 p-4 bg-gray-50 rounded-xl">
                    <div className="w-9 h-9 rounded-full bg-blue-500 flex items-center justify-center text-white text-sm font-bold flex-shrink-0">
                      {bid.freelancer?.name?.[0]?.toUpperCase()}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <p className="font-medium text-gray-900 text-sm">{bid.freelancer?.name}</p>
                        <span className="text-green-600 font-bold text-sm">₹{bid.amount}</span>
                      </div>
                      <p className="text-gray-600 text-sm mt-1">{bid.proposal}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Right — Bid card */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-2xl border border-gray-100 p-6 sticky top-24 space-y-4">
            <h2 className="font-semibold text-gray-900">Submit a Bid</h2>

            {!user ? (
              <Link href="/login" className="block w-full text-center bg-blue-600 text-white py-3 rounded-xl text-sm font-medium">
                Sign in to bid
              </Link>
            ) : user.role === 'client' ? (
              <p className="text-sm text-gray-400 text-center">Clients cannot bid on jobs</p>
            ) : !showBidForm ? (
              <button onClick={() => setShowBidForm(true)}
                className="w-full bg-blue-600 text-white py-3 rounded-xl text-sm font-semibold hover:bg-blue-700 transition">
                Place a Bid
              </button>
            ) : (
              <form onSubmit={submitBid} className="space-y-3">
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">Your bid (₹)</label>
                  <input required type="number" min="1" placeholder="4500"
                    value={bid.amount} onChange={(e) => setBid({ ...bid, amount: e.target.value })}
                    className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"/>
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">Proposal</label>
                  <textarea required rows={4} placeholder="Why are you the best fit?"
                    value={bid.proposal} onChange={(e) => setBid({ ...bid, proposal: e.target.value })}
                    className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"/>
                </div>
                <button type="submit" disabled={bidding}
                  className="w-full bg-blue-600 text-white py-2.5 rounded-xl text-sm font-semibold hover:bg-blue-700 transition disabled:opacity-50">
                  {bidding ? 'Submitting...' : 'Submit Bid'}
                </button>
                <button type="button" onClick={() => setShowBidForm(false)}
                  className="w-full text-gray-500 text-sm py-2">
                  Cancel
                </button>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
'use client';
import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import api from '@/lib/axios';
import useAuthStore from '@/store/authStore';
import toast, { Toaster } from 'react-hot-toast';

export default function GigDetailPage() {
  const { id } = useParams();
  const router = useRouter();
  const { user } = useAuthStore();
  const [gig, setGig] = useState(null);
  const [loading, setLoading] = useState(true);
  const [ordering, setOrdering] = useState(false);
  const [requirements, setRequirements] = useState('');

  useEffect(() => {
    fetchGig();
  }, [id]);

  const fetchGig = async () => {
    try {
      const { data } = await api.get(`/gigs/${id}`);
      setGig(data);
    } catch (err) {
      toast.error('Gig not found');
    } finally {
      setLoading(false);
    }
  };

  const handleOrder = async () => {
    if (!user) {
      router.push('/login');
      return;
    }
    setOrdering(true);
    try {
      await api.post('/orders', { gigId: id, requirements });
      toast.success('Order placed successfully!');
      router.push('/dashboard');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to place order');
    } finally {
      setOrdering(false);
    }
  };

  if (loading) return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600"/>
    </div>
  );

  if (!gig) return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <p className="text-gray-500">Gig not found</p>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50">
      <Toaster />
      {/* Navbar */}
      <nav className="bg-white border-b border-gray-100 sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
          <Link href="/" className="text-2xl font-bold text-blue-600">FreelanceFlow</Link>
          <Link href="/" className="text-sm text-gray-500 hover:text-blue-600">← Back to gigs</Link>
        </div>
      </nav>

      <div className="max-w-6xl mx-auto px-4 py-10 grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left — Gig Info */}
        <div className="lg:col-span-2 space-y-6">
          <div>
            <span className="text-xs font-medium text-blue-600 bg-blue-50 px-3 py-1 rounded-full">
              {gig.category}
            </span>
            <h1 className="text-2xl font-bold text-gray-900 mt-3 mb-2">{gig.title}</h1>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center text-white text-sm font-bold">
                  {gig.freelancer?.name?.[0]?.toUpperCase()}
                </div>
                <span className="text-sm font-medium text-gray-700">{gig.freelancer?.name}</span>
              </div>
              <div className="flex items-center gap-1">
                <span className="text-yellow-400">★</span>
                <span className="text-sm text-gray-600">
                  {gig.rating > 0 ? gig.rating.toFixed(1) : 'New'} ({gig.totalOrders} orders)
                </span>
              </div>
            </div>
          </div>

          {/* Gig Image */}
          <div className="rounded-2xl overflow-hidden h-72 bg-gradient-to-br from-blue-100 to-purple-100 flex items-center justify-center">
            {gig.images?.[0] ? (
              <img src={gig.images[0]} alt={gig.title} className="w-full h-full object-cover"/>
            ) : (
              <span className="text-8xl">💼</span>
            )}
          </div>

          {/* Description */}
          <div className="bg-white rounded-2xl p-6 border border-gray-100">
            <h2 className="text-lg font-semibold text-gray-900 mb-3">About this gig</h2>
            <p className="text-gray-600 leading-relaxed">{gig.description}</p>
          </div>

          {/* Tags */}
          {gig.tags?.length > 0 && (
            <div className="bg-white rounded-2xl p-6 border border-gray-100">
              <h2 className="text-lg font-semibold text-gray-900 mb-3">Tags</h2>
              <div className="flex flex-wrap gap-2">
                {gig.tags.map((tag) => (
                  <span key={tag} className="bg-gray-100 text-gray-600 text-xs px-3 py-1 rounded-full">
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Freelancer Info */}
          <div className="bg-white rounded-2xl p-6 border border-gray-100">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">About the seller</h2>
            <div className="flex items-center gap-4 mb-4">
              <div className="w-14 h-14 rounded-full bg-blue-500 flex items-center justify-center text-white text-xl font-bold">
                {gig.freelancer?.name?.[0]?.toUpperCase()}
              </div>
              <div>
                <p className="font-semibold text-gray-900">{gig.freelancer?.name}</p>
                <p className="text-sm text-gray-500">{gig.freelancer?.bio || 'Freelancer'}</p>
              </div>
            </div>
            {gig.freelancer?.skills?.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {gig.freelancer.skills.map((skill) => (
                  <span key={skill} className="bg-blue-50 text-blue-600 text-xs px-3 py-1 rounded-full">
                    {skill}
                  </span>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Right — Order Card */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-2xl border border-gray-100 p-6 sticky top-24 space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-2xl font-bold text-gray-900">₹{gig.price}</span>
              <span className="text-sm text-gray-500 bg-gray-100 px-3 py-1 rounded-full">
                {gig.deliveryDays} day delivery
              </span>
            </div>

            <p className="text-sm text-gray-600">{gig.description?.slice(0, 100)}...</p>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Your requirements
              </label>
              <textarea
                rows={4}
                placeholder="Describe what you need..."
                value={requirements}
                onChange={(e) => setRequirements(e.target.value)}
                className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
              />
            </div>

            <button
              onClick={handleOrder}
              disabled={ordering || user?.role === 'freelancer'}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 rounded-xl transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {ordering ? 'Placing order...' :
               user?.role === 'freelancer' ? 'Freelancers cannot order' :
               user ? 'Place Order' : 'Sign in to Order'}
            </button>

            <div className="text-center text-xs text-gray-400">
              No payment required for demo
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
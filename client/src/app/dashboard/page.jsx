'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import api from '@/lib/axios';
import useAuthStore from '@/store/authStore';
import toast, { Toaster } from 'react-hot-toast';

export default function DashboardPage() {
  const router = useRouter();
  const { user, loadAuth, logout } = useAuthStore();
  const [orders, setOrders] = useState([]);
  const [gigs, setGigs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('orders');

  useEffect(() => {
    loadAuth();
  }, []);

  useEffect(() => {
    if (user) {
      fetchOrders();
      if (user.role === 'freelancer') fetchMyGigs();
    }
  }, [user]);

  const fetchOrders = async () => {
    try {
      const { data } = await api.get('/orders/my');
      setOrders(data);
    } catch (err) {
      toast.error('Failed to fetch orders');
    } finally {
      setLoading(false);
    }
  };

  const fetchMyGigs = async () => {
    try {
      const { data } = await api.get('/gigs');
      const myGigs = data.filter(g => g.freelancer?._id === user.id);
      setGigs(myGigs);
    } catch (err) {
      console.error(err);
    }
  };

  const updateOrderStatus = async (orderId, status) => {
    try {
      await api.patch(`/orders/${orderId}/status`, { status });
      toast.success('Order updated!');
      fetchOrders();
    } catch (err) {
      toast.error('Failed to update order');
    }
  };

  const deleteGig = async (gigId) => {
    if (!confirm('Delete this gig?')) return;
    try {
      await api.delete(`/gigs/${gigId}`);
      toast.success('Gig deleted!');
      fetchMyGigs();
    } catch (err) {
      toast.error('Failed to delete gig');
    }
  };

  const statusColors = {
    pending: 'bg-yellow-100 text-yellow-700',
    active: 'bg-blue-100 text-blue-700',
    delivered: 'bg-purple-100 text-purple-700',
    completed: 'bg-green-100 text-green-700',
    cancelled: 'bg-red-100 text-red-700',
  };

  if (!user) return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="text-center">
        <p className="text-gray-500 mb-4">Please login to view dashboard</p>
        <Link href="/login" className="bg-blue-600 text-white px-6 py-3 rounded-xl">
          Sign in
        </Link>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50">
      <Toaster />

      {/* Navbar */}
      <nav className="bg-white border-b border-gray-100 sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
          <Link href="/" className="text-2xl font-bold text-blue-600">FreelanceFlow</Link>
          <div className="flex items-center gap-4">
            <span className="text-sm text-gray-600">Hi, {user.name}</span>
            {user.role === 'freelancer' && (
              <Link href="/gigs/create"
                className="bg-blue-600 text-white text-sm font-medium px-4 py-2 rounded-xl hover:bg-blue-700 transition">
                + New Gig
              </Link>
            )}
            <button onClick={() => { logout(); router.push('/'); }}
              className="text-sm text-gray-500 hover:text-red-500 transition">
              Logout
            </button>
          </div>
        </div>
      </nav>

      <div className="max-w-6xl mx-auto px-4 py-10">

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          {[
            { label: 'Total Orders', value: orders.length, color: 'blue' },
            { label: 'Active', value: orders.filter(o => o.status === 'active').length, color: 'purple' },
            { label: 'Completed', value: orders.filter(o => o.status === 'completed').length, color: 'green' },
            { label: user.role === 'freelancer' ? 'My Gigs' : 'Pending', 
              value: user.role === 'freelancer' ? gigs.length : orders.filter(o => o.status === 'pending').length, 
              color: 'orange' },
          ].map(({ label, value, color }) => (
            <div key={label} className="bg-white rounded-2xl p-5 border border-gray-100">
              <p className="text-sm text-gray-500 mb-1">{label}</p>
              <p className={`text-3xl font-bold text-${color}-600`}>{value}</p>
            </div>
          ))}
        </div>

        {/* Tabs */}
        {user.role === 'freelancer' && (
          <div className="flex gap-2 mb-6">
            {['orders', 'gigs'].map((tab) => (
              <button key={tab} onClick={() => setActiveTab(tab)}
                className={`px-5 py-2 rounded-xl text-sm font-medium transition capitalize ${
                  activeTab === tab
                    ? 'bg-blue-600 text-white'
                    : 'bg-white text-gray-600 border border-gray-200 hover:border-blue-400'
                }`}>
                {tab === 'orders' ? 'My Orders' : 'My Gigs'}
              </button>
            ))}
          </div>
        )}

        {/* Orders Tab */}
        {activeTab === 'orders' && (
          <div className="space-y-4">
            <h2 className="text-lg font-semibold text-gray-900">
              {user.role === 'freelancer' ? 'Orders received' : 'My orders'}
            </h2>

            {loading ? (
              <div className="space-y-3">
                {[...Array(3)].map((_, i) => (
                  <div key={i} className="bg-white rounded-2xl p-5 animate-pulse h-24"/>
                ))}
              </div>
            ) : orders.length === 0 ? (
              <div className="bg-white rounded-2xl p-10 text-center border border-gray-100">
                <p className="text-4xl mb-3">📋</p>
                <p className="text-gray-500">No orders yet</p>
                {user.role === 'client' && (
                  <Link href="/" className="text-blue-600 text-sm font-medium mt-2 block">
                    Browse gigs →
                  </Link>
                )}
              </div>
            ) : (
              orders.map((order) => (
                <div key={order._id}
                  className="bg-white rounded-2xl p-5 border border-gray-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 rounded-xl bg-blue-50 flex items-center justify-center text-xl">
                      💼
                    </div>
                    <div>
                      <p className="font-semibold text-gray-900 text-sm">
                        {order.gig?.title || 'Gig'}
                      </p>
                      <p className="text-xs text-gray-500 mt-0.5">
                        {user.role === 'freelancer'
                          ? `Client: ${order.client?.name}`
                          : `Freelancer: ${order.freelancer?.name}`}
                      </p>
                      <p className="text-xs text-gray-400 mt-0.5">
                        ₹{order.price} · Due {new Date(order.deliveryDate).toLocaleDateString()}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <span className={`text-xs font-medium px-3 py-1 rounded-full ${statusColors[order.status]}`}>
                      {order.status}
                    </span>

                    {user.role === 'freelancer' && order.status === 'pending' && (
                      <button
                        onClick={() => updateOrderStatus(order._id, 'active')}
                        className="text-xs bg-blue-600 text-white px-3 py-1.5 rounded-lg hover:bg-blue-700 transition">
                        Accept
                      </button>
                    )}
                    {user.role === 'freelancer' && order.status === 'active' && (
                      <button
                        onClick={() => updateOrderStatus(order._id, 'delivered')}
                        className="text-xs bg-purple-600 text-white px-3 py-1.5 rounded-lg hover:bg-purple-700 transition">
                        Mark Delivered
                      </button>
                    )}
                    {user.role === 'client' && order.status === 'delivered' && (
                      <button
                        onClick={() => updateOrderStatus(order._id, 'completed')}
                        className="text-xs bg-green-600 text-white px-3 py-1.5 rounded-lg hover:bg-green-700 transition">
                        Complete
                      </button>
                    )}

                    <Link href={`/chat/${
                      user.role === 'freelancer' ? order.client?._id : order.freelancer?._id
                    }`}
                      className="text-xs bg-gray-100 text-gray-700 px-3 py-1.5 rounded-lg hover:bg-gray-200 transition">
                      Chat
                    </Link>
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {/* Gigs Tab (freelancer only) */}
        {activeTab === 'gigs' && user.role === 'freelancer' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold text-gray-900">My gigs</h2>
              <Link href="/gigs/create"
                className="text-sm bg-blue-600 text-white px-4 py-2 rounded-xl hover:bg-blue-700 transition">
                + New Gig
              </Link>
            </div>

            {gigs.length === 0 ? (
              <div className="bg-white rounded-2xl p-10 text-center border border-gray-100">
                <p className="text-4xl mb-3">🎯</p>
                <p className="text-gray-500 mb-4">No gigs yet</p>
                <Link href="/gigs/create"
                  className="bg-blue-600 text-white px-6 py-3 rounded-xl text-sm font-medium">
                  Create your first gig
                </Link>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {gigs.map((gig) => (
                  <div key={gig._id} className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
                    <div className="h-32 bg-gradient-to-br from-blue-100 to-purple-100 flex items-center justify-center">
                      <span className="text-4xl">💼</span>
                    </div>
                    <div className="p-4">
                      <p className="font-semibold text-gray-900 text-sm line-clamp-2 mb-1">{gig.title}</p>
                      <p className="text-blue-600 font-bold text-sm mb-3">₹{gig.price}</p>
                      <div className="flex gap-2">
                        <Link href={`/gigs/${gig._id}`}
                          className="flex-1 text-center text-xs bg-gray-100 text-gray-700 px-3 py-2 rounded-lg hover:bg-gray-200 transition">
                          View
                        </Link>
                        <button onClick={() => deleteGig(gig._id)}
                          className="flex-1 text-xs bg-red-50 text-red-500 px-3 py-2 rounded-lg hover:bg-red-100 transition">
                          Delete
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
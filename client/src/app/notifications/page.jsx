'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import api from '@/lib/axios';
import useAuthStore from '@/store/authStore';

export default function NotificationsPage() {
  const { user, loadAuth } = useAuthStore();
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadAuth();
    fetchNotifications();
  }, []);

  const fetchNotifications = async () => {
    try {
      const { data } = await api.get('/notifications');
      setNotifications(data);
      await api.put('/notifications/read');
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const typeIcons = {
    order: '📦',
    message: '💬',
    review: '⭐',
    bid: '🎯',
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
        <h1 className="text-2xl font-bold text-gray-900 mb-6">Notifications</h1>

        {loading ? (
          <div className="space-y-3">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="bg-white rounded-2xl p-5 animate-pulse h-20"/>
            ))}
          </div>
        ) : notifications.length === 0 ? (
          <div className="bg-white rounded-2xl p-10 text-center border border-gray-100">
            <p className="text-4xl mb-3">🔔</p>
            <p className="text-gray-500">No notifications yet</p>
          </div>
        ) : (
          <div className="space-y-3">
            {notifications.map((n) => (
              <Link href={n.link || '/dashboard'} key={n._id}>
                <div className={`bg-white rounded-2xl p-5 border transition hover:shadow-sm cursor-pointer ${
                  !n.read ? 'border-blue-200 bg-blue-50' : 'border-gray-100'
                }`}>
                  <div className="flex items-start gap-3">
                    <span className="text-2xl">{typeIcons[n.type] || '🔔'}</span>
                    <div className="flex-1">
                      <p className="text-sm text-gray-800 font-medium">{n.message}</p>
                      <p className="text-xs text-gray-400 mt-1">
                        {new Date(n.createdAt).toLocaleString()}
                      </p>
                    </div>
                    {!n.read && (
                      <div className="w-2 h-2 rounded-full bg-blue-500 mt-1.5 flex-shrink-0"/>
                    )}
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
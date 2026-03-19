'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { io } from 'socket.io-client';
import api from '@/lib/axios';
import useAuthStore from '@/store/authStore';

export default function NotificationBell() {
  const { user } = useAuthStore();
  const [count, setCount] = useState(0);

  useEffect(() => {
    if (!user) return;
    fetchUnread();

    const socket = io(process.env.NEXT_PUBLIC_SOCKET_URL);
    socket.emit('join', user.id);
    socket.on('newNotification', () => {
      setCount(prev => prev + 1);
    });

    return () => socket.disconnect();
  }, [user]);

  const fetchUnread = async () => {
    try {
      const { data } = await api.get('/notifications');
      setCount(data.filter(n => !n.read).length);
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <Link href="/notifications" className="relative">
      <span className="text-xl">🔔</span>
      {count > 0 && (
        <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs w-4 h-4 rounded-full flex items-center justify-center font-bold">
          {count > 9 ? '9+' : count}
        </span>
      )}
    </Link>
  );
}
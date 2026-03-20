'use client';
import { useEffect, useState, useRef } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { io } from 'socket.io-client';
import api from '@/lib/axios';
import useAuthStore from '@/store/authStore';

export default function ChatPage() {
  const { userId } = useParams();
  const router = useRouter();
  const { user, loadAuth } = useAuthStore();
  const [messages, setMessages] = useState([]);
  const [text, setText] = useState('');
  const [receiver, setReceiver] = useState(null);
  const [connected, setConnected] = useState(false);
  const socketRef = useRef(null);
  const bottomRef = useRef(null);

  useEffect(() => {
    loadAuth();
  }, []);

  const fetchMessages = async () => {
    try {
      const { data } = await api.get(`/messages/${userId}`);
      setMessages(data);
    } catch (err) {
      console.error(err);
    }
  };

  const fetchReceiver = async () => {
    try {
      await api.get(`/auth/me`);
      setReceiver({ name: 'User', id: userId });
    } catch (err) {
      console.error(err);
    }
  };

  const connectSocket = () => {
    const socket = io(process.env.NEXT_PUBLIC_SOCKET_URL);
    socketRef.current = socket;

    socket.on('connect', () => {
      setConnected(true);
      socket.emit('join', user.id);
    });

    socket.on('receiveMessage', (message) => {
      setMessages((prev) => [...prev, message]);
    });

    socket.on('messageSent', (message) => {
      setMessages((prev) => [...prev, message]);
    });

    socket.on('disconnect', () => setConnected(false));
  };
// eslint-disable-next-line react-hooks/set-state-in-effect
  useEffect(() => {
    if (!user) return;
    fetchMessages();
    fetchReceiver();
    connectSocket();
    return () => socketRef.current?.disconnect();
  }, [user]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const sendMessage = () => {
    if (!text.trim() || !socketRef.current) return;

    socketRef.current.emit('sendMessage', {
      senderId: user.id,
      receiverId: userId,
      text: text.trim(),
    });

    setText('');
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  if (!user) return (
    <div className="min-h-screen flex items-center justify-center">
      <Link href="/login" className="bg-blue-600 text-white px-6 py-3 rounded-xl">
        Sign in to chat
      </Link>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Header */}
      <div className="bg-white border-b border-gray-100 px-4 py-4 flex items-center gap-4 sticky top-0 z-50">
        <button onClick={() => router.back()}
          className="text-gray-500 hover:text-gray-700 transition">
          ←
        </button>
        <div className="w-9 h-9 rounded-full bg-blue-500 flex items-center justify-center text-white font-bold">
          U
        </div>
        <div>
          <p className="font-semibold text-gray-900 text-sm">Chat</p>
          <p className={`text-xs ${connected ? 'text-green-500' : 'text-gray-400'}`}>
            {connected ? 'Online' : 'Connecting...'}
          </p>
        </div>
        <div className="ml-auto">
          <Link href="/" className="text-2xl font-bold text-blue-600">FreelanceFlow</Link>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-4 py-6 space-y-3 max-w-3xl mx-auto w-full">
        {messages.length === 0 && (
          <div className="text-center py-20">
            <p className="text-4xl mb-3">💬</p>
            <p className="text-gray-500 text-sm">No messages yet. Say hello!</p>
          </div>
        )}

        {messages.map((msg, i) => {
          const isMe = msg.sender === user.id || msg.sender?._id === user.id;
          return (
            <div key={i} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
              <div className={`max-w-xs lg:max-w-md px-4 py-2.5 rounded-2xl text-sm ${
                isMe
                  ? 'bg-blue-600 text-white rounded-br-sm'
                  : 'bg-white text-gray-800 border border-gray-100 rounded-bl-sm'
              }`}>
                <p>{msg.text}</p>
                <p className={`text-xs mt-1 ${isMe ? 'text-blue-200' : 'text-gray-400'}`}>
                  {new Date(msg.createdAt).toLocaleTimeString([], {
                    hour: '2-digit', minute: '2-digit'
                  })}
                </p>
              </div>
            </div>
          );
        })}
        <div ref={bottomRef}/>
      </div>

      {/* Input */}
      <div className="bg-white border-t border-gray-100 px-4 py-4 sticky bottom-0">
        <div className="max-w-3xl mx-auto flex gap-3 items-end">
          <textarea
            rows={1}
            placeholder="Type a message... (Enter to send)"
            value={text}
            onChange={(e) => setText(e.target.value)}
            onKeyDown={handleKeyDown}
            className="flex-1 border border-gray-200 rounded-2xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
          />
          <button
            onClick={sendMessage}
            disabled={!text.trim()}
            className="bg-blue-600 hover:bg-blue-700 text-white p-3 rounded-2xl transition disabled:opacity-40">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 24 24" fill="currentColor">
              <path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z"/>
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
}
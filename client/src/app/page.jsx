'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import api from '@/lib/axios';
import useAuthStore from '@/store/authStore';
import NotificationBell from '@/components/NotificationBell';

export default function HomePage() {
  const { user, loadAuth, logout } = useAuthStore();
  const [gigs, setGigs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('');

  const categories = [
    { name: 'All', icon: '✦' },
    { name: 'Design', icon: '🎨' },
    { name: 'Development', icon: '⚡' },
    { name: 'Writing', icon: '✍️' },
    { name: 'Marketing', icon: '📈' },
    { name: 'Video', icon: '🎬' },
    { name: 'Music', icon: '🎵' },
  ];

  useEffect(() => {
    loadAuth();
    fetchGigs();
  }, []);

  const fetchGigs = async (searchTerm = '', cat = '') => {
    try {
      setLoading(true);
      const params = {};
      if (searchTerm) params.search = searchTerm;
      if (cat) params.category = cat;
      const { data } = await api.get('/gigs', { params });
      setGigs(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    fetchGigs(search, category);
  };

  const handleCategory = (cat) => {
    const c = cat === 'All' ? '' : cat;
    setCategory(c);
    fetchGigs(search, c);
  };

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Syne:wght@400;600;700;800&family=DM+Sans:wght@300;400;500&display=swap');

        * { box-sizing: border-box; margin: 0; padding: 0; }

        body {
          font-family: 'DM Sans', sans-serif;
          background: #0a0a0f;
          color: #e8e6f0;
          min-height: 100vh;
        }

        .ff-nav {
          position: sticky;
          top: 0;
          z-index: 100;
          background: rgba(10, 10, 15, 0.85);
          backdrop-filter: blur(20px);
          border-bottom: 1px solid rgba(255,255,255,0.06);
          padding: 0 2rem;
        }

        .ff-nav-inner {
          max-width: 1200px;
          margin: 0 auto;
          height: 64px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 1rem;
        }

        .ff-logo {
          font-family: 'Syne', sans-serif;
          font-weight: 800;
          font-size: 1.4rem;
          background: linear-gradient(135deg, #a78bfa, #60a5fa);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          text-decoration: none;
          letter-spacing: -0.5px;
        }

        .ff-nav-links {
          display: flex;
          align-items: center;
          gap: 0.25rem;
          flex-wrap: wrap;
        }

        .ff-nav-link {
          color: rgba(232,230,240,0.6);
          text-decoration: none;
          font-size: 0.85rem;
          font-weight: 500;
          padding: 0.4rem 0.75rem;
          border-radius: 8px;
          transition: all 0.2s;
        }

        .ff-nav-link:hover {
          color: #e8e6f0;
          background: rgba(255,255,255,0.06);
        }

        .ff-nav-btn {
          background: linear-gradient(135deg, #7c3aed, #2563eb);
          color: white;
          text-decoration: none;
          font-size: 0.85rem;
          font-weight: 600;
          padding: 0.5rem 1.25rem;
          border-radius: 10px;
          transition: all 0.2s;
          border: none;
          cursor: pointer;
        }

        .ff-nav-btn:hover {
          opacity: 0.85;
          transform: translateY(-1px);
        }

        .ff-nav-btn-outline {
          background: transparent;
          color: rgba(232,230,240,0.7);
          border: 1px solid rgba(255,255,255,0.12);
          cursor: pointer;
        }

        .ff-nav-btn-outline:hover {
          background: rgba(255,255,255,0.06);
          color: #e8e6f0;
        }

        /* Hero */
        .ff-hero {
          position: relative;
          overflow: hidden;
          padding: 7rem 2rem 5rem;
          text-align: center;
        }

        .ff-hero-bg {
          position: absolute;
          inset: 0;
          background:
            radial-gradient(ellipse 80% 60% at 50% -10%, rgba(124,58,237,0.25) 0%, transparent 60%),
            radial-gradient(ellipse 60% 40% at 80% 50%, rgba(37,99,235,0.15) 0%, transparent 50%),
            radial-gradient(ellipse 40% 30% at 20% 70%, rgba(167,139,250,0.1) 0%, transparent 50%);
        }

        .ff-hero-grid {
          position: absolute;
          inset: 0;
          background-image:
            linear-gradient(rgba(255,255,255,0.03) 1px, transparent 1px),
            linear-gradient(90deg, rgba(255,255,255,0.03) 1px, transparent 1px);
          background-size: 60px 60px;
          mask-image: radial-gradient(ellipse 80% 80% at 50% 50%, black 40%, transparent 100%);
        }

        .ff-hero-content {
          position: relative;
          max-width: 760px;
          margin: 0 auto;
        }

        .ff-hero-badge {
          display: inline-flex;
          align-items: center;
          gap: 0.5rem;
          background: rgba(124,58,237,0.15);
          border: 1px solid rgba(124,58,237,0.3);
          border-radius: 100px;
          padding: 0.35rem 1rem;
          font-size: 0.8rem;
          color: #a78bfa;
          font-weight: 500;
          margin-bottom: 1.5rem;
          animation: fadeUp 0.6s ease both;
        }

        .ff-hero-title {
          font-family: 'Syne', sans-serif;
          font-size: clamp(2.8rem, 6vw, 4.5rem);
          font-weight: 800;
          line-height: 1.05;
          letter-spacing: -2px;
          margin-bottom: 1.25rem;
          animation: fadeUp 0.6s 0.1s ease both;
        }

        .ff-hero-title span {
          background: linear-gradient(135deg, #a78bfa 0%, #60a5fa 50%, #34d399 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
        }

        .ff-hero-sub {
          font-size: 1.1rem;
          color: rgba(232,230,240,0.55);
          font-weight: 300;
          margin-bottom: 2.5rem;
          line-height: 1.7;
          animation: fadeUp 0.6s 0.2s ease both;
        }

        .ff-search-wrap {
          display: flex;
          gap: 0.75rem;
          max-width: 560px;
          margin: 0 auto 3rem;
          animation: fadeUp 0.6s 0.3s ease both;
        }

        .ff-search-input {
          flex: 1;
          background: rgba(255,255,255,0.06);
          border: 1px solid rgba(255,255,255,0.1);
          border-radius: 14px;
          padding: 0.875rem 1.25rem;
          color: #e8e6f0;
          font-size: 0.95rem;
          font-family: 'DM Sans', sans-serif;
          outline: none;
          transition: all 0.2s;
        }

        .ff-search-input::placeholder { color: rgba(232,230,240,0.35); }

        .ff-search-input:focus {
          border-color: rgba(124,58,237,0.5);
          background: rgba(255,255,255,0.08);
          box-shadow: 0 0 0 3px rgba(124,58,237,0.12);
        }

        .ff-search-btn {
          background: linear-gradient(135deg, #7c3aed, #2563eb);
          color: white;
          border: none;
          border-radius: 14px;
          padding: 0.875rem 1.75rem;
          font-weight: 600;
          font-size: 0.95rem;
          cursor: pointer;
          font-family: 'DM Sans', sans-serif;
          transition: all 0.2s;
          white-space: nowrap;
        }

        .ff-search-btn:hover {
          opacity: 0.85;
          transform: translateY(-1px);
        }

        .ff-stats {
          display: flex;
          justify-content: center;
          gap: 3rem;
          animation: fadeUp 0.6s 0.4s ease both;
        }

        .ff-stat {
          text-align: center;
        }

        .ff-stat-num {
          font-family: 'Syne', sans-serif;
          font-size: 1.6rem;
          font-weight: 800;
          background: linear-gradient(135deg, #a78bfa, #60a5fa);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
        }

        .ff-stat-label {
          font-size: 0.8rem;
          color: rgba(232,230,240,0.4);
          margin-top: 0.2rem;
        }

        /* Categories */
        .ff-cats {
          max-width: 1200px;
          margin: 0 auto;
          padding: 2.5rem 2rem 1.5rem;
          display: flex;
          gap: 0.5rem;
          flex-wrap: wrap;
        }

        .ff-cat-btn {
          display: flex;
          align-items: center;
          gap: 0.4rem;
          background: rgba(255,255,255,0.04);
          border: 1px solid rgba(255,255,255,0.08);
          border-radius: 100px;
          padding: 0.5rem 1rem;
          color: rgba(232,230,240,0.6);
          font-size: 0.85rem;
          font-weight: 500;
          cursor: pointer;
          transition: all 0.2s;
          font-family: 'DM Sans', sans-serif;
        }

        .ff-cat-btn:hover {
          background: rgba(255,255,255,0.08);
          color: #e8e6f0;
          border-color: rgba(255,255,255,0.15);
        }

        .ff-cat-btn.active {
          background: linear-gradient(135deg, rgba(124,58,237,0.3), rgba(37,99,235,0.3));
          border-color: rgba(124,58,237,0.5);
          color: #a78bfa;
        }

        /* Gigs section */
        .ff-section {
          max-width: 1200px;
          margin: 0 auto;
          padding: 1rem 2rem 5rem;
        }

        .ff-section-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-bottom: 1.5rem;
        }

        .ff-section-title {
          font-family: 'Syne', sans-serif;
          font-size: 1.4rem;
          font-weight: 700;
          letter-spacing: -0.5px;
        }

        .ff-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(270px, 1fr));
          gap: 1.25rem;
        }

        /* Gig Card */
        .ff-card {
          background: rgba(255,255,255,0.03);
          border: 1px solid rgba(255,255,255,0.07);
          border-radius: 18px;
          overflow: hidden;
          text-decoration: none;
          color: inherit;
          transition: all 0.3s;
          display: block;
        }

        .ff-card:hover {
          background: rgba(255,255,255,0.055);
          border-color: rgba(124,58,237,0.3);
          transform: translateY(-4px);
          box-shadow: 0 20px 40px rgba(0,0,0,0.4), 0 0 0 1px rgba(124,58,237,0.1);
        }

        .ff-card-img {
          height: 180px;
          background: linear-gradient(135deg, rgba(124,58,237,0.2), rgba(37,99,235,0.2));
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 3rem;
          position: relative;
          overflow: hidden;
        }

        .ff-card-img img {
          width: 100%;
          height: 100%;
          object-fit: cover;
          transition: transform 0.4s;
        }

        .ff-card:hover .ff-card-img img {
          transform: scale(1.05);
        }

        .ff-card-body {
          padding: 1.1rem;
        }

        .ff-card-seller {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          margin-bottom: 0.6rem;
        }

        .ff-avatar {
          width: 24px;
          height: 24px;
          border-radius: 50%;
          background: linear-gradient(135deg, #7c3aed, #2563eb);
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 0.65rem;
          font-weight: 700;
          color: white;
          flex-shrink: 0;
        }

        .ff-seller-name {
          font-size: 0.8rem;
          color: rgba(232,230,240,0.5);
        }

        .ff-card-title {
          font-size: 0.9rem;
          font-weight: 500;
          line-height: 1.45;
          margin-bottom: 0.75rem;
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }

        .ff-card-footer {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding-top: 0.75rem;
          border-top: 1px solid rgba(255,255,255,0.06);
        }

        .ff-rating {
          display: flex;
          align-items: center;
          gap: 0.3rem;
          font-size: 0.8rem;
          color: rgba(232,230,240,0.5);
        }

        .ff-star { color: #f59e0b; }

        .ff-price {
          font-family: 'Syne', sans-serif;
          font-weight: 700;
          font-size: 1rem;
          background: linear-gradient(135deg, #a78bfa, #60a5fa);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
        }

        /* Skeleton */
        .ff-skeleton {
          background: rgba(255,255,255,0.03);
          border: 1px solid rgba(255,255,255,0.06);
          border-radius: 18px;
          overflow: hidden;
          animation: pulse 1.5s ease-in-out infinite;
        }

        .ff-skeleton-img { height: 180px; background: rgba(255,255,255,0.05); }
        .ff-skeleton-body { padding: 1.1rem; }
        .ff-skeleton-line {
          height: 10px;
          background: rgba(255,255,255,0.06);
          border-radius: 6px;
          margin-bottom: 0.6rem;
        }

        /* Empty state */
        .ff-empty {
          grid-column: 1 / -1;
          text-align: center;
          padding: 5rem 2rem;
        }

        .ff-empty-icon {
          font-size: 4rem;
          margin-bottom: 1rem;
          opacity: 0.5;
        }

        .ff-empty-title {
          font-family: 'Syne', sans-serif;
          font-size: 1.3rem;
          font-weight: 700;
          margin-bottom: 0.5rem;
        }

        .ff-empty-sub {
          color: rgba(232,230,240,0.4);
          font-size: 0.9rem;
          margin-bottom: 1.5rem;
        }

        /* Animations */
        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }

        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.5; }
        }

        /* Footer bar */
        .ff-footer {
          border-top: 1px solid rgba(255,255,255,0.06);
          padding: 2rem;
          text-align: center;
          color: rgba(232,230,240,0.25);
          font-size: 0.8rem;
        }
      `}</style>

      <div style={{ minHeight: '100vh', background: '#0a0a0f' }}>

        {/* Navbar */}
        <nav className="ff-nav">
          <div className="ff-nav-inner">
            <Link href="/" className="ff-logo">FreelanceFlow</Link>
            <div className="ff-nav-links">
              {user ? (
                <>
                  <span style={{ fontSize: '0.85rem', color: 'rgba(232,230,240,0.4)', padding: '0 0.5rem' }}>
                    Hi, {user.name?.split(' ')[0]}
                  </span>
                  <Link href="/dashboard" className="ff-nav-link">Dashboard</Link>
                  <Link href="/jobs" className="ff-nav-link">Jobs</Link>
                  <Link href="/ai-proposal" className="ff-nav-link">🤖 AI</Link>
                  <Link href="/ai-match" className="ff-nav-link">🎯 Match</Link>
                  <Link href="/profile" className="ff-nav-link">Profile</Link>
                  <NotificationBell />
                  {user.role === 'freelancer' && (
                    <Link href="/gigs/create" className="ff-nav-btn" style={{ marginLeft: '0.5rem' }}>
                      + Post Gig
                    </Link>
                  )}
                  {user.role === 'client' && (
                    <Link href="/jobs/create" className="ff-nav-btn" style={{ marginLeft: '0.5rem', background: 'linear-gradient(135deg,#059669,#0d9488)' }}>
                      + Post Job
                    </Link>
                  )}
                  <button onClick={logout} className="ff-nav-btn ff-nav-btn-outline" style={{ marginLeft: '0.25rem' }}>
                    Logout
                  </button>
                </>
              ) : (
                <>
                  <Link href="/jobs" className="ff-nav-link">Browse Jobs</Link>
                  <Link href="/login" className="ff-nav-btn ff-nav-btn-outline" style={{ marginLeft: '0.5rem' }}>
                    Sign in
                  </Link>
                  <Link href="/register" className="ff-nav-btn" style={{ marginLeft: '0.25rem' }}>
                    Get Started →
                  </Link>
                </>
              )}
            </div>
          </div>
        </nav>

        {/* Hero */}
        <section className="ff-hero">
          <div className="ff-hero-bg"/>
          <div className="ff-hero-grid"/>
          <div className="ff-hero-content">
            <div className="ff-hero-badge">
              ✦ India&apos;s smartest freelance marketplace
            </div>
            <h1 className="ff-hero-title">
              Find top talent.<br/>
              <span>Ship faster.</span>
            </h1>
            <p className="ff-hero-sub">
              Connect with verified freelancers in design, development,<br/>
              writing and more — powered by AI job matching.
            </p>
            <form onSubmit={handleSearch} className="ff-search-wrap">
              <input
                className="ff-search-input"
                type="text"
                placeholder="Search for any service..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
              <button type="submit" className="ff-search-btn">Search</button>
            </form>
            <div className="ff-stats">
              <div className="ff-stat">
                <div className="ff-stat-num">500+</div>
                <div className="ff-stat-label">Freelancers</div>
              </div>
              <div className="ff-stat">
                <div className="ff-stat-num">1,200+</div>
                <div className="ff-stat-label">Projects Done</div>
              </div>
              <div className="ff-stat">
                <div className="ff-stat-num">98%</div>
                <div className="ff-stat-label">Satisfaction</div>
              </div>
            </div>
          </div>
        </section>

        {/* Categories */}
        <div className="ff-cats">
          {categories.map((cat) => (
            <button
              key={cat.name}
              onClick={() => handleCategory(cat.name)}
              className={`ff-cat-btn ${(cat.name === 'All' && category === '') || cat.name === category ? 'active' : ''}`}
            >
              <span>{cat.icon}</span>
              {cat.name}
            </button>
          ))}
        </div>

        {/* Gigs Grid */}
        <div className="ff-section">
          <div className="ff-section-header">
            <h2 className="ff-section-title">
              {category ? `${category} Services` : 'All Services'}
            </h2>
            <span style={{ fontSize: '0.85rem', color: 'rgba(232,230,240,0.35)' }}>
              {gigs.length} results
            </span>
          </div>

          <div className="ff-grid">
            {loading ? (
              [...Array(8)].map((_, i) => (
                <div key={i} className="ff-skeleton">
                  <div className="ff-skeleton-img"/>
                  <div className="ff-skeleton-body">
                    <div className="ff-skeleton-line" style={{ width: '40%' }}/>
                    <div className="ff-skeleton-line"/>
                    <div className="ff-skeleton-line" style={{ width: '70%' }}/>
                  </div>
                </div>
              ))
            ) : gigs.length === 0 ? (
              <div className="ff-empty">
                <div className="ff-empty-icon">✦</div>
                <h3 className="ff-empty-title">No gigs yet</h3>
                <p className="ff-empty-sub">Be the first to post a service!</p>
                {user?.role === 'freelancer' && (
                  <Link href="/gigs/create" className="ff-nav-btn" style={{ display: 'inline-block', textDecoration: 'none' }}>
                    Post a Gig
                  </Link>
                )}
              </div>
            ) : (
              gigs.map((gig) => (
                <Link href={`/gigs/${gig._id}`} key={gig._id} className="ff-card">
                  <div className="ff-card-img">
                    {gig.images?.[0] ? (
                      <img src={gig.images[0]} alt={gig.title}/>
                    ) : (
                      <span>💼</span>
                    )}
                  </div>
                  <div className="ff-card-body">
                    <div className="ff-card-seller">
                      <div className="ff-avatar">
                        {gig.freelancer?.name?.[0]?.toUpperCase()}
                      </div>
                      <span className="ff-seller-name">{gig.freelancer?.name}</span>
                    </div>
                    <p className="ff-card-title">{gig.title}</p>
                    <div className="ff-card-footer">
                      <div className="ff-rating">
                        <span className="ff-star">★</span>
                        {gig.rating > 0 ? gig.rating.toFixed(1) : 'New'}
                      </div>
                      <div className="ff-price">₹{gig.price}</div>
                    </div>
                  </div>
                </Link>
              ))
            )}
          </div>
        </div>

        <div className="ff-footer">
          © 2026 FreelanceFlow · Built with ❤️ in India
        </div>
      </div>
    </>
  );
}
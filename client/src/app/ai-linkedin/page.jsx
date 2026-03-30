'use client';
import { useState } from 'react';
import Link from 'next/link';

export default function AILinkedInPage() {
  const [form, setForm] = useState({
    name: '',
    currentRole: '',
    skills: '',
    experience: '',
    achievements: '',
    education: '',
    targetRole: '',
  });
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');
  const [copied, setCopied] = useState('');

  const handleSubmit = async () => {
    if (!form.name.trim() && !form.skills.trim()) {
      setError('Please enter at least your name and skills.');
      return;
    }
    setError('');
    setLoading(true);
    setResult(null);

    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/ai/linkedin-bio`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify(form),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Failed');
      setResult(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = (text, key) => {
    navigator.clipboard.writeText(text);
    setCopied(key);
    setTimeout(() => setCopied(''), 2000);
  };

  const CopyBtn = ({ text, id }) => (
    <button onClick={() => handleCopy(text, id)}
      style={{ background: copied === id ? 'rgba(5,150,105,0.2)' : 'rgba(255,255,255,0.06)', border: `1px solid ${copied === id ? 'rgba(5,150,105,0.4)' : 'rgba(255,255,255,0.12)'}`, color: copied === id ? '#34d399' : 'rgba(232,230,240,0.6)', borderRadius: '8px', padding: '0.3rem 0.75rem', fontSize: '0.75rem', cursor: 'pointer', fontFamily: 'DM Sans', transition: 'all 0.2s' }}>
      {copied === id ? '✅ Copied!' : '📋 Copy'}
    </button>
  );

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Syne:wght@700;800&family=DM+Sans:wght@300;400;500&display=swap');
        .li-page { font-family: 'DM Sans', sans-serif; background: #0a0a0f; color: #e8e6f0; min-height: 100vh; }
        .li-input { width: 100%; background: rgba(255,255,255,0.06); border: 1px solid rgba(255,255,255,0.12); border-radius: 12px; padding: 0.75rem 1rem; color: #e8e6f0; font-size: 0.9rem; outline: none; font-family: 'DM Sans', sans-serif; }
        .li-input::placeholder { color: rgba(232,230,240,0.3); }
        .li-input:focus { border-color: rgba(124,58,237,0.6); box-shadow: 0 0 0 3px rgba(124,58,237,0.12); }
        .li-card { background: rgba(255,255,255,0.04); border: 1px solid rgba(255,255,255,0.08); border-radius: 20px; padding: 1.5rem; margin-bottom: 1.25rem; }
        .li-result-box { background: rgba(255,255,255,0.03); border: 1px solid rgba(255,255,255,0.08); border-radius: 12px; padding: 1rem; margin-bottom: 1rem; }
        .li-label { display: block; font-size: 0.8rem; font-weight: 500; color: rgba(232,230,240,0.6); margin-bottom: 0.4rem; }
        .li-section-title { font-size: 0.75rem; font-weight: 600; color: #a78bfa; text-transform: uppercase; letter-spacing: 0.05em; margin-bottom: 0.5rem; display: flex; align-items: center; justify-content: space-between; }
        .li-text { font-size: 0.875rem; line-height: 1.7; color: #e8e6f0; white-space: pre-wrap; }
        @keyframes spin { to { transform: rotate(360deg); } }
        @keyframes fadeIn { from { opacity:0; transform:translateY(8px); } to { opacity:1; transform:translateY(0); } }
        .fade-in { animation: fadeIn 0.4s ease both; }
        @media (max-width: 640px) { .li-grid { grid-template-columns: 1fr !important; } }
      `}</style>

      <div className="li-page">
        <nav style={{ background: 'rgba(10,10,15,0.95)', borderBottom: '1px solid rgba(255,255,255,0.06)', padding: '0 1.5rem', position: 'sticky', top: 0, zIndex: 100 }}>
          <div style={{ maxWidth: '1000px', margin: '0 auto', height: '60px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <Link href="/" style={{ fontFamily: 'Syne', fontWeight: 800, fontSize: '1.3rem', background: 'linear-gradient(135deg,#a78bfa,#60a5fa)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', textDecoration: 'none' }}>FreelanceFlow</Link>
            <Link href="/" style={{ fontSize: '0.85rem', color: 'rgba(232,230,240,0.5)', textDecoration: 'none' }}>← Back</Link>
          </div>
        </nav>

        <div style={{ maxWidth: '1000px', margin: '0 auto', padding: '2rem 1.5rem' }}>

          <div style={{ marginBottom: '2rem' }}>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', background: 'rgba(10,102,194,0.15)', border: '1px solid rgba(10,102,194,0.35)', borderRadius: '100px', padding: '0.35rem 1rem', fontSize: '0.8rem', color: '#60a5fa', marginBottom: '1rem' }}>
              💼 LinkedIn Optimized
            </div>
            <h1 style={{ fontFamily: 'Syne', fontSize: 'clamp(1.8rem, 4vw, 2.5rem)', fontWeight: 800, letterSpacing: '-1px', marginBottom: '0.5rem' }}>
              AI LinkedIn Bio Generator
            </h1>
            <p style={{ color: 'rgba(232,230,240,0.5)', fontSize: '0.95rem' }}>
              Generate a <strong style={{ color: '#60a5fa' }}>recruiter-optimized</strong> LinkedIn profile — headline, about section, connection message and more.
            </p>
          </div>

          <div className="li-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1.4fr', gap: '1.5rem' }}>

            {/* Left — Form */}
            <div>
              <div className="li-card">
                <h2 style={{ fontFamily: 'Syne', fontSize: '1rem', fontWeight: 700, marginBottom: '1.25rem' }}>👤 Your Details</h2>

                {[
                  { key: 'name', label: 'Full Name *', placeholder: 'e.g. Achyut Kulkarni' },
                  { key: 'currentRole', label: 'Current Role', placeholder: 'e.g. Full Stack Developer' },
                  { key: 'targetRole', label: 'Target Role', placeholder: 'e.g. Senior React Developer' },
                  { key: 'skills', label: 'Skills *', placeholder: 'React, Node.js, MongoDB, AWS...' },
                  { key: 'experience', label: 'Experience', placeholder: 'e.g. 2 years in full stack development' },
                  { key: 'achievements', label: 'Key Achievements', placeholder: 'e.g. Built app with 10k users, reduced load time by 40%' },
                  { key: 'education', label: 'Education', placeholder: 'e.g. B.Tech ECE, Sharnbasva University' },
                ].map(({ key, label, placeholder }) => (
                  <div key={key} style={{ marginBottom: '0.875rem' }}>
                    <label className="li-label">{label}</label>
                    <input className="li-input" placeholder={placeholder} value={form[key]} onChange={e => setForm({ ...form, [key]: e.target.value })} />
                  </div>
                ))}

                {error && (
                  <div style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)', borderRadius: '10px', padding: '0.75rem 1rem', color: '#f87171', fontSize: '0.85rem', marginBottom: '1rem' }}>
                    {error}
                  </div>
                )}

                <button onClick={handleSubmit} disabled={loading || (!form.name.trim() && !form.skills.trim())}
                  style={{ width: '100%', background: 'linear-gradient(135deg,#0a66c2,#0284c7)', color: 'white', border: 'none', borderRadius: '12px', padding: '0.875rem', fontWeight: 600, fontSize: '0.95rem', cursor: 'pointer', fontFamily: 'DM Sans', opacity: loading || (!form.name.trim() && !form.skills.trim()) ? 0.5 : 1 }}>
                  {loading ? (
                    <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}>
                      <span style={{ width: '16px', height: '16px', border: '2px solid rgba(255,255,255,0.3)', borderTopColor: 'white', borderRadius: '50%', display: 'inline-block', animation: 'spin 0.8s linear infinite' }}/>
                      Generating LinkedIn profile...
                    </span>
                  ) : '💼 Generate LinkedIn Bio'}
                </button>
              </div>
            </div>

            {/* Right — Results */}
            <div>
              {!result && !loading && (
                <div className="li-card" style={{ textAlign: 'center', padding: '5rem 2rem' }}>
                  <div style={{ fontSize: '4rem', marginBottom: '1rem' }}>💼</div>
                  <h3 style={{ fontFamily: 'Syne', fontSize: '1.2rem', fontWeight: 700, marginBottom: '0.5rem' }}>Stand Out on LinkedIn</h3>
                  <p style={{ color: 'rgba(232,230,240,0.4)', fontSize: '0.9rem' }}>Fill in your details and get a complete recruiter-optimized LinkedIn profile kit</p>
                </div>
              )}

              {loading && (
                <div className="li-card" style={{ textAlign: 'center', padding: '5rem 2rem' }}>
                  <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>🤖</div>
                  <p style={{ fontSize: '0.95rem', marginBottom: '0.5rem' }}>Crafting your LinkedIn presence...</p>
                  <p style={{ fontSize: '0.8rem', color: 'rgba(232,230,240,0.35)' }}>Optimizing for recruiter searches. Takes 10-20 seconds.</p>
                </div>
              )}

              {result && (
                <div className="fade-in">
                  {/* Headline */}
                  <div className="li-result-box">
                    <div className="li-section-title">
                      <span>🏷️ LinkedIn Headline</span>
                      <CopyBtn text={result.headline} id="headline" />
                    </div>
                    <p className="li-text" style={{ fontWeight: 600, fontSize: '1rem', color: '#60a5fa' }}>{result.headline}</p>
                  </div>

                  {/* About */}
                  <div className="li-result-box">
                    <div className="li-section-title">
                      <span>📝 About Section</span>
                      <CopyBtn text={result.about} id="about" />
                    </div>
                    <p className="li-text">{result.about}</p>
                  </div>

                  {/* Skills */}
                  <div className="li-result-box">
                    <div className="li-section-title">
                      <span>⚡ Top Skills to Add</span>
                      <CopyBtn text={result.skills?.join(', ')} id="skills" />
                    </div>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                      {result.skills?.map((skill, i) => (
                        <span key={i} style={{ background: 'rgba(10,102,194,0.15)', border: '1px solid rgba(10,102,194,0.3)', color: '#60a5fa', borderRadius: '100px', padding: '0.25rem 0.75rem', fontSize: '0.8rem', fontWeight: 500 }}>
                          {skill}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Connection Message */}
                  <div className="li-result-box">
                    <div className="li-section-title">
                      <span>🤝 Connection Request Message</span>
                      <CopyBtn text={result.connectionMessage} id="connection" />
                    </div>
                    <p className="li-text">{result.connectionMessage}</p>
                  </div>

                  {/* Open to Work */}
                  <div className="li-result-box">
                    <div className="li-section-title">
                      <span>🟢 Open to Work Text</span>
                      <CopyBtn text={result.openToWork} id="opentowork" />
                    </div>
                    <p className="li-text">{result.openToWork}</p>
                  </div>

                  {/* Regenerate */}
                  <button onClick={handleSubmit} disabled={loading}
                    style={{ width: '100%', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.12)', color: 'rgba(232,230,240,0.7)', borderRadius: '12px', padding: '0.75rem', fontWeight: 500, fontSize: '0.9rem', cursor: 'pointer', fontFamily: 'DM Sans', marginTop: '0.5rem' }}>
                    🔄 Regenerate
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
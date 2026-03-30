'use client';
import { useState } from 'react';
import Link from 'next/link';

export default function AIColdEmailPage() {
  const [form, setForm] = useState({
    senderName: '',
    senderRole: '',
    skills: '',
    targetCompany: '',
    targetRole: '',
    recruiterName: '',
  });
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');
  const [copied, setCopied] = useState('');
  const [activeEmail, setActiveEmail] = useState(0);

  const handleSubmit = async () => {
    if (!form.senderName.trim() || !form.targetCompany.trim()) {
      setError('Please enter your name and target company.');
      return;
    }
    setError('');
    setLoading(true);
    setResult(null);

    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/ai/cold-email`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify(form),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Failed');
      setResult(data);
      setActiveEmail(0);
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

  const typeColors = {
    'Short & Punchy': { bg: 'rgba(124,58,237,0.15)', border: 'rgba(124,58,237,0.3)', color: '#a78bfa' },
    'Value-Focused': { bg: 'rgba(37,99,235,0.15)', border: 'rgba(37,99,235,0.3)', color: '#60a5fa' },
    'Story-Driven': { bg: 'rgba(5,150,105,0.15)', border: 'rgba(5,150,105,0.3)', color: '#34d399' },
  };

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Syne:wght@700;800&family=DM+Sans:wght@300;400;500&display=swap');
        .ce-page { font-family: 'DM Sans', sans-serif; background: #0a0a0f; color: #e8e6f0; min-height: 100vh; }
        .ce-input { width: 100%; background: rgba(255,255,255,0.06); border: 1px solid rgba(255,255,255,0.12); border-radius: 12px; padding: 0.75rem 1rem; color: #e8e6f0; font-size: 0.9rem; outline: none; font-family: 'DM Sans', sans-serif; }
        .ce-input::placeholder { color: rgba(232,230,240,0.3); }
        .ce-input:focus { border-color: rgba(124,58,237,0.6); box-shadow: 0 0 0 3px rgba(124,58,237,0.12); }
        .ce-card { background: rgba(255,255,255,0.04); border: 1px solid rgba(255,255,255,0.08); border-radius: 20px; padding: 1.5rem; margin-bottom: 1.25rem; }
        .ce-label { display: block; font-size: 0.8rem; font-weight: 500; color: rgba(232,230,240,0.6); margin-bottom: 0.4rem; }
        .ce-tab { padding: 0.5rem 1rem; border-radius: 10px; border: 1px solid rgba(255,255,255,0.1); background: rgba(255,255,255,0.04); color: rgba(232,230,240,0.5); font-size: 0.82rem; cursor: pointer; transition: all 0.2s; font-family: 'DM Sans', sans-serif; font-weight: 500; }
        .ce-tab.active { background: rgba(124,58,237,0.2); border-color: rgba(124,58,237,0.4); color: #a78bfa; }
        @keyframes spin { to { transform: rotate(360deg); } }
        @keyframes fadeIn { from { opacity:0; transform:translateY(8px); } to { opacity:1; transform:translateY(0); } }
        .fade-in { animation: fadeIn 0.3s ease both; }
        @media (max-width: 640px) { .ce-grid { grid-template-columns: 1fr !important; } }
      `}</style>

      <div className="ce-page">
        <nav style={{ background: 'rgba(10,10,15,0.95)', borderBottom: '1px solid rgba(255,255,255,0.06)', padding: '0 1.5rem', position: 'sticky', top: 0, zIndex: 100 }}>
          <div style={{ maxWidth: '1000px', margin: '0 auto', height: '60px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <Link href="/" style={{ fontFamily: 'Syne', fontWeight: 800, fontSize: '1.3rem', background: 'linear-gradient(135deg,#a78bfa,#60a5fa)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', textDecoration: 'none' }}>FreelanceFlow</Link>
            <Link href="/" style={{ fontSize: '0.85rem', color: 'rgba(232,230,240,0.5)', textDecoration: 'none' }}>← Back</Link>
          </div>
        </nav>

        <div style={{ maxWidth: '1000px', margin: '0 auto', padding: '2rem 1.5rem' }}>

          <div style={{ marginBottom: '2rem' }}>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', background: 'rgba(124,58,237,0.15)', border: '1px solid rgba(124,58,237,0.3)', borderRadius: '100px', padding: '0.35rem 1rem', fontSize: '0.8rem', color: '#a78bfa', marginBottom: '1rem' }}>
              ✦ AI Powered
            </div>
            <h1 style={{ fontFamily: 'Syne', fontSize: 'clamp(1.8rem, 4vw, 2.5rem)', fontWeight: 800, letterSpacing: '-1px', marginBottom: '0.5rem' }}>
              AI Cold Email Generator
            </h1>
            <p style={{ color: 'rgba(232,230,240,0.5)', fontSize: '0.95rem' }}>
              Generate <strong style={{ color: '#a78bfa' }}>3 personalized cold emails</strong> to recruiters — short, value-focused and story-driven versions.
            </p>
          </div>

          <div className="ce-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1.4fr', gap: '1.5rem' }}>

            {/* Left — Form */}
            <div>
              <div className="ce-card">
                <h2 style={{ fontFamily: 'Syne', fontSize: '1rem', fontWeight: 700, marginBottom: '1.25rem' }}>📧 Email Details</h2>

                {[
                  { key: 'senderName', label: 'Your Name *', placeholder: 'e.g. Achyut Kulkarni' },
                  { key: 'senderRole', label: 'Your Role/Title', placeholder: 'e.g. Full Stack Developer' },
                  { key: 'skills', label: 'Your Key Skills', placeholder: 'React, Node.js, MongoDB...' },
                  { key: 'targetCompany', label: 'Target Company *', placeholder: 'e.g. Google, Swiggy, Zepto' },
                  { key: 'targetRole', label: 'Role You Want', placeholder: 'e.g. Software Engineer' },
                  { key: 'recruiterName', label: "Recruiter's Name", placeholder: 'e.g. Priya (or leave blank)' },
                ].map(({ key, label, placeholder }) => (
                  <div key={key} style={{ marginBottom: '0.875rem' }}>
                    <label className="ce-label">{label}</label>
                    <input className="ce-input" placeholder={placeholder} value={form[key]} onChange={e => setForm({ ...form, [key]: e.target.value })} />
                  </div>
                ))}

                {error && (
                  <div style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)', borderRadius: '10px', padding: '0.75rem 1rem', color: '#f87171', fontSize: '0.85rem', marginBottom: '1rem' }}>
                    {error}
                  </div>
                )}

                <button onClick={handleSubmit} disabled={loading || !form.senderName.trim() || !form.targetCompany.trim()}
                  style={{ width: '100%', background: 'linear-gradient(135deg,#7c3aed,#2563eb)', color: 'white', border: 'none', borderRadius: '12px', padding: '0.875rem', fontWeight: 600, fontSize: '0.95rem', cursor: 'pointer', fontFamily: 'DM Sans', opacity: loading || !form.senderName.trim() || !form.targetCompany.trim() ? 0.5 : 1 }}>
                  {loading ? (
                    <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}>
                      <span style={{ width: '16px', height: '16px', border: '2px solid rgba(255,255,255,0.3)', borderTopColor: 'white', borderRadius: '50%', display: 'inline-block', animation: 'spin 0.8s linear infinite' }}/>
                      Writing your emails...
                    </span>
                  ) : '✉️ Generate Cold Emails'}
                </button>
              </div>
            </div>

            {/* Right — Results */}
            <div>
              {!result && !loading && (
                <div className="ce-card" style={{ textAlign: 'center', padding: '5rem 2rem' }}>
                  <div style={{ fontSize: '4rem', marginBottom: '1rem' }}>✉️</div>
                  <h3 style={{ fontFamily: 'Syne', fontSize: '1.2rem', fontWeight: 700, marginBottom: '0.5rem' }}>Get Recruiter Attention</h3>
                  <p style={{ color: 'rgba(232,230,240,0.4)', fontSize: '0.9rem' }}>Fill in your details and get 3 different cold email variations to send to recruiters</p>
                </div>
              )}

              {loading && (
                <div className="ce-card" style={{ textAlign: 'center', padding: '5rem 2rem' }}>
                  <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>✍️</div>
                  <p style={{ fontSize: '0.95rem', marginBottom: '0.5rem' }}>Writing personalized cold emails...</p>
                  <p style={{ fontSize: '0.8rem', color: 'rgba(232,230,240,0.35)' }}>Crafting 3 variations. Takes 10-15 seconds.</p>
                </div>
              )}

              {result && result.emails && (
                <div className="fade-in">
                  {/* Email type tabs */}
                  <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.25rem', flexWrap: 'wrap' }}>
                    {result.emails.map((email, i) => (
                      <button key={i} className={`ce-tab ${activeEmail === i ? 'active' : ''}`} onClick={() => setActiveEmail(i)}>
                        {email.type}
                      </button>
                    ))}
                  </div>

                  {result.emails[activeEmail] && (
                    <div className="ce-card fade-in" style={{ border: `1px solid ${typeColors[result.emails[activeEmail].type]?.border || 'rgba(255,255,255,0.1)'}`, background: typeColors[result.emails[activeEmail].type]?.bg || 'rgba(255,255,255,0.04)' }}>
                      {/* Subject */}
                      <div style={{ marginBottom: '1rem' }}>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                          <span style={{ fontSize: '0.75rem', fontWeight: 600, color: typeColors[result.emails[activeEmail].type]?.color || '#a78bfa', textTransform: 'uppercase', letterSpacing: '0.05em' }}>📌 Subject Line</span>
                          <button onClick={() => handleCopy(result.emails[activeEmail].subject, `subject-${activeEmail}`)}
                            style={{ background: copied === `subject-${activeEmail}` ? 'rgba(5,150,105,0.2)' : 'rgba(255,255,255,0.06)', border: `1px solid ${copied === `subject-${activeEmail}` ? 'rgba(5,150,105,0.4)' : 'rgba(255,255,255,0.12)'}`, color: copied === `subject-${activeEmail}` ? '#34d399' : 'rgba(232,230,240,0.6)', borderRadius: '8px', padding: '0.25rem 0.6rem', fontSize: '0.72rem', cursor: 'pointer', fontFamily: 'DM Sans' }}>
                            {copied === `subject-${activeEmail}` ? '✅ Copied' : '📋 Copy'}
                          </button>
                        </div>
                        <p style={{ fontSize: '0.9rem', fontWeight: 600, color: '#e8e6f0', background: 'rgba(255,255,255,0.04)', padding: '0.6rem 0.875rem', borderRadius: '8px' }}>
                          {result.emails[activeEmail].subject}
                        </p>
                      </div>

                      {/* Body */}
                      <div>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                          <span style={{ fontSize: '0.75rem', fontWeight: 600, color: typeColors[result.emails[activeEmail].type]?.color || '#a78bfa', textTransform: 'uppercase', letterSpacing: '0.05em' }}>✉️ Email Body</span>
                          <button onClick={() => handleCopy(result.emails[activeEmail].body, `body-${activeEmail}`)}
                            style={{ background: copied === `body-${activeEmail}` ? 'rgba(5,150,105,0.2)' : 'rgba(255,255,255,0.06)', border: `1px solid ${copied === `body-${activeEmail}` ? 'rgba(5,150,105,0.4)' : 'rgba(255,255,255,0.12)'}`, color: copied === `body-${activeEmail}` ? '#34d399' : 'rgba(232,230,240,0.6)', borderRadius: '8px', padding: '0.25rem 0.6rem', fontSize: '0.72rem', cursor: 'pointer', fontFamily: 'DM Sans' }}>
                            {copied === `body-${activeEmail}` ? '✅ Copied' : '📋 Copy'}
                          </button>
                        </div>
                        <p style={{ fontSize: '0.875rem', lineHeight: 1.8, color: 'rgba(232,230,240,0.85)', background: 'rgba(255,255,255,0.04)', padding: '0.875rem', borderRadius: '8px', whiteSpace: 'pre-wrap' }}>
                          {result.emails[activeEmail].body}
                        </p>
                      </div>
                    </div>
                  )}

                  <button onClick={handleSubmit} disabled={loading}
                    style={{ width: '100%', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.12)', color: 'rgba(232,230,240,0.7)', borderRadius: '12px', padding: '0.75rem', fontWeight: 500, fontSize: '0.9rem', cursor: 'pointer', fontFamily: 'DM Sans', marginTop: '0.5rem' }}>
                    🔄 Regenerate Emails
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
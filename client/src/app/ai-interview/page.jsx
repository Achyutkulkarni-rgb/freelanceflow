'use client';
import { useState } from 'react';
import Link from 'next/link';

export default function AIInterviewPage() {
  const [form, setForm] = useState({
    jobTitle: '',
    jobDescription: '',
    skills: '',
    experience: '',
  });
  const [loading, setLoading] = useState(false);
  const [questions, setQuestions] = useState([]);
  const [error, setError] = useState('');
  const [activeCategory, setActiveCategory] = useState('All');
  const [expandedId, setExpandedId] = useState(null);

  const categories = ['All', 'Technical', 'Behavioral', 'HR', 'Company/Role'];

  const handleSubmit = async () => {
    if (!form.jobTitle.trim() && !form.jobDescription.trim()) {
      setError('Please enter a job title or description.');
      return;
    }
    setError('');
    setLoading(true);
    setQuestions([]);

    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/ai/interview-prep`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(form),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Failed');
      setQuestions(data.questions);
      setActiveCategory('All');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const filtered = activeCategory === 'All'
    ? questions
    : questions.filter(q => q.category === activeCategory);

  const difficultyColor = (d) => {
    if (d === 'Easy') return { bg: 'rgba(5,150,105,0.15)', color: '#34d399' };
    if (d === 'Medium') return { bg: 'rgba(245,158,11,0.15)', color: '#fbbf24' };
    return { bg: 'rgba(239,68,68,0.15)', color: '#f87171' };
  };

  const categoryColor = (c) => {
    if (c === 'Technical') return '#60a5fa';
    if (c === 'Behavioral') return '#a78bfa';
    if (c === 'HR') return '#34d399';
    return '#f97316';
  };

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Syne:wght@700;800&family=DM+Sans:wght@300;400;500&display=swap');
        .ai-page { font-family: 'DM Sans', sans-serif; background: #0a0a0f; color: #e8e6f0; min-height: 100vh; }
        .ai-input { width: 100%; background: rgba(255,255,255,0.06); border: 1px solid rgba(255,255,255,0.12); border-radius: 12px; padding: 0.75rem 1rem; color: #e8e6f0; font-size: 0.9rem; outline: none; font-family: 'DM Sans', sans-serif; }
        .ai-input::placeholder { color: rgba(232,230,240,0.3); }
        .ai-input:focus { border-color: rgba(124,58,237,0.6); box-shadow: 0 0 0 3px rgba(124,58,237,0.12); }
        .ai-input option { background: #1a1a2e; color: #e8e6f0; }
        .ai-card { background: rgba(255,255,255,0.04); border: 1px solid rgba(255,255,255,0.08); border-radius: 20px; padding: 1.5rem; margin-bottom: 1rem; }
        .ai-btn { background: linear-gradient(135deg,#7c3aed,#2563eb); color: white; border: none; border-radius: 12px; padding: 0.875rem 1.5rem; font-weight: 600; font-size: 0.95rem; cursor: pointer; font-family: 'DM Sans', sans-serif; width: 100%; transition: opacity 0.2s; }
        .ai-btn:disabled { opacity: 0.5; cursor: not-allowed; }
        .ai-btn:hover:not(:disabled) { opacity: 0.9; }
        .q-card { background: rgba(255,255,255,0.03); border: 1px solid rgba(255,255,255,0.07); border-radius: 16px; padding: 1.25rem; margin-bottom: 0.75rem; cursor: pointer; transition: all 0.2s; }
        .q-card:hover { background: rgba(255,255,255,0.055); border-color: rgba(124,58,237,0.3); }
        .q-card.expanded { background: rgba(124,58,237,0.06); border-color: rgba(124,58,237,0.3); }
        .cat-btn { padding: 0.4rem 1rem; border-radius: 100px; border: 1px solid rgba(255,255,255,0.1); background: rgba(255,255,255,0.04); color: rgba(232,230,240,0.6); font-size: 0.8rem; cursor: pointer; transition: all 0.2s; font-family: 'DM Sans', sans-serif; }
        .cat-btn.active { background: rgba(124,58,237,0.2); border-color: rgba(124,58,237,0.5); color: #a78bfa; }
        .answer-text { font-size: 0.875rem; line-height: 1.8; color: rgba(232,230,240,0.85); white-space: pre-wrap; }
        @keyframes spin { to { transform: rotate(360deg); } }
        @keyframes fadeIn { from { opacity:0; transform:translateY(10px); } to { opacity:1; transform:translateY(0); } }
        .fade-in { animation: fadeIn 0.3s ease both; }
        @media (max-width: 640px) { .ai-grid { grid-template-columns: 1fr !important; } }
      `}</style>

      <div className="ai-page">
        {/* Navbar */}
        <nav style={{ background: 'rgba(10,10,15,0.95)', borderBottom: '1px solid rgba(255,255,255,0.06)', padding: '0 1.5rem', position: 'sticky', top: 0, zIndex: 100 }}>
          <div style={{ maxWidth: '1000px', margin: '0 auto', height: '60px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <Link href="/" style={{ fontFamily: 'Syne', fontWeight: 800, fontSize: '1.3rem', background: 'linear-gradient(135deg,#a78bfa,#60a5fa)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', textDecoration: 'none' }}>
              FreelanceFlow
            </Link>
            <Link href="/" style={{ fontSize: '0.85rem', color: 'rgba(232,230,240,0.5)', textDecoration: 'none' }}>← Back</Link>
          </div>
        </nav>

        <div style={{ maxWidth: '1000px', margin: '0 auto', padding: '2rem 1.5rem' }}>

          {/* Header */}
          <div style={{ marginBottom: '2rem' }}>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', background: 'rgba(124,58,237,0.15)', border: '1px solid rgba(124,58,237,0.3)', borderRadius: '100px', padding: '0.35rem 1rem', fontSize: '0.8rem', color: '#a78bfa', marginBottom: '1rem' }}>
              ✦ AI Powered
            </div>
            <h1 style={{ fontFamily: 'Syne', fontSize: 'clamp(1.8rem, 4vw, 2.5rem)', fontWeight: 800, letterSpacing: '-1px', marginBottom: '0.5rem' }}>
              AI Interview Prep
            </h1>
            <p style={{ color: 'rgba(232,230,240,0.5)', fontSize: '0.95rem' }}>
              Get <strong style={{ color: '#a78bfa' }}>30 real interview questions</strong> with detailed answers based on actual company interviews — Technical, Behavioral, HR & more.
            </p>
          </div>

          {/* Input Form */}
          <div className="ai-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '1.5rem', marginBottom: '2rem' }}>
            <div>
              <div className="ai-card">
                <h2 style={{ fontFamily: 'Syne', fontSize: '1rem', fontWeight: 700, marginBottom: '1.25rem' }}>🎯 Job Details</h2>

                <div style={{ marginBottom: '1rem' }}>
                  <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 500, color: 'rgba(232,230,240,0.6)', marginBottom: '0.4rem' }}>Job Title *</label>
                  <input className="ai-input" placeholder="e.g. React Developer, Data Analyst" value={form.jobTitle} onChange={e => setForm({ ...form, jobTitle: e.target.value })} />
                </div>

                <div style={{ marginBottom: '1rem' }}>
                  <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 500, color: 'rgba(232,230,240,0.6)', marginBottom: '0.4rem' }}>Your Skills</label>
                  <input className="ai-input" placeholder="React, Node.js, MongoDB..." value={form.skills} onChange={e => setForm({ ...form, skills: e.target.value })} />
                </div>

                <div style={{ marginBottom: '1rem' }}>
                  <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 500, color: 'rgba(232,230,240,0.6)', marginBottom: '0.4rem' }}>Experience Level</label>
                  <select className="ai-input" value={form.experience} onChange={e => setForm({ ...form, experience: e.target.value })} style={{ cursor: 'pointer' }}>
                    <option value="">Select level</option>
                    <option value="Fresher (0-1 years)">Fresher (0-1 years)</option>
                    <option value="Junior (1-3 years)">Junior (1-3 years)</option>
                    <option value="Mid-level (3-5 years)">Mid-level (3-5 years)</option>
                    <option value="Senior (5+ years)">Senior (5+ years)</option>
                  </select>
                </div>

                <div style={{ marginBottom: '1.25rem' }}>
                  <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 500, color: 'rgba(232,230,240,0.6)', marginBottom: '0.4rem' }}>Job Description</label>
                  <textarea className="ai-input" rows={5} placeholder="Paste job description for more targeted questions..." value={form.jobDescription} onChange={e => setForm({ ...form, jobDescription: e.target.value })} style={{ resize: 'none' }} />
                </div>

                {error && (
                  <div style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)', borderRadius: '10px', padding: '0.75rem 1rem', color: '#f87171', fontSize: '0.85rem', marginBottom: '1rem' }}>
                    {error}
                  </div>
                )}

                <button className="ai-btn" onClick={handleSubmit} disabled={loading || (!form.jobTitle.trim() && !form.jobDescription.trim())}>
                  {loading ? (
                    <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}>
                      <span style={{ width: '16px', height: '16px', border: '2px solid rgba(255,255,255,0.3)', borderTopColor: 'white', borderRadius: '50%', display: 'inline-block', animation: 'spin 0.8s linear infinite' }}/>
                      Generating questions...
                    </span>
                  ) : '🎯 Generate Interview Questions'}
                </button>

                {questions.length > 0 && (
                  <div style={{ marginTop: '1rem', background: 'rgba(5,150,105,0.1)', border: '1px solid rgba(5,150,105,0.2)', borderRadius: '10px', padding: '0.75rem 1rem', fontSize: '0.85rem', color: '#34d399', textAlign: 'center' }}>
                    ✅ {questions.length} questions generated!
                  </div>
                )}
              </div>
            </div>

            {/* Questions Panel */}
            <div>
              {questions.length === 0 && !loading && (
                <div className="ai-card" style={{ textAlign: 'center', padding: '5rem 2rem' }}>
                  <div style={{ fontSize: '4rem', marginBottom: '1rem' }}>🎤</div>
                  <h3 style={{ fontFamily: 'Syne', fontSize: '1.2rem', fontWeight: 700, marginBottom: '0.5rem' }}>Ready to Prep?</h3>
                  <p style={{ color: 'rgba(232,230,240,0.4)', fontSize: '0.9rem' }}>Fill in the job details and get 30 real interview questions with detailed answers</p>
                </div>
              )}

              {loading && (
                <div className="ai-card" style={{ textAlign: 'center', padding: '5rem 2rem' }}>
                  <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>🤖</div>
                  <p style={{ fontSize: '0.95rem', marginBottom: '0.5rem' }}>AI is generating detailed interview questions...</p>
                  <p style={{ fontSize: '0.8rem', color: 'rgba(232,230,240,0.35)' }}>Analyzing patterns from top companies. Takes 20-40 seconds.</p>
                </div>
              )}

              {questions.length > 0 && (
                <div className="fade-in">
                  {/* Category filter */}
                  <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', marginBottom: '1.25rem' }}>
                    {categories.map(cat => (
                      <button key={cat} className={`cat-btn ${activeCategory === cat ? 'active' : ''}`} onClick={() => setActiveCategory(cat)}>
                        {cat} {cat === 'All' ? `(${questions.length})` : `(${questions.filter(q => q.category === cat).length})`}
                      </button>
                    ))}
                  </div>

                 {/* Questions list */}
                  <div style={{ maxHeight: '70vh', overflowY: 'auto', paddingRight: '0.25rem' }}>
                    {filtered.map((q, i) => (
                      <div
                        key={q.id || i}
                        className={`q-card ${expandedId === (q.id || i) ? 'expanded' : ''}`}
                        onClick={() => setExpandedId(expandedId === (q.id || i) ? null : (q.id || i))}
                      >
                        <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.75rem' }}>
                          <span style={{ background: 'rgba(124,58,237,0.2)', color: '#a78bfa', borderRadius: '8px', padding: '0.2rem 0.5rem', fontSize: '0.75rem', fontWeight: 700, flexShrink: 0, minWidth: '28px', textAlign: 'center' }}>
                            {q.id || i + 1}
                          </span>
                          <div style={{ flex: 1 }}>
                            <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', marginBottom: '0.5rem' }}>
                              <span style={{ fontSize: '0.7rem', fontWeight: 600, padding: '0.15rem 0.6rem', borderRadius: '100px', background: `${categoryColor(q.category)}22`, color: categoryColor(q.category) }}>
                                {q.category}
                              </span>
                              <span style={{ fontSize: '0.7rem', fontWeight: 600, padding: '0.15rem 0.6rem', borderRadius: '100px', background: difficultyColor(q.difficulty).bg, color: difficultyColor(q.difficulty).color }}>
                                {q.difficulty}
                              </span>
                            </div>
                            <p style={{ fontSize: '0.9rem', fontWeight: 500, lineHeight: 1.5, marginBottom: expandedId === (q.id || i) ? '1rem' : 0 }}>
                              {q.question}
                            </p>

                            {expandedId === (q.id || i) && (
                              <div className="fade-in">
                                <div style={{ background: 'rgba(255,255,255,0.04)', borderRadius: '10px', padding: '1rem', marginBottom: '0.75rem' }}>
                                  <p style={{ fontSize: '0.75rem', fontWeight: 600, color: '#60a5fa', marginBottom: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>📝 Detailed Answer</p>
                                  <p className="answer-text">{q.answer}</p>
                                </div>
                                {q.tip && (
                                  <div style={{ background: 'rgba(245,158,11,0.08)', border: '1px solid rgba(245,158,11,0.2)', borderRadius: '8px', padding: '0.6rem 0.875rem' }}>
                                    <p style={{ fontSize: '0.8rem', color: '#fbbf24' }}>💡 <strong>Tip:</strong> {q.tip}</p>
                                  </div>
                                )}
                              </div>
                            )}
                          </div>
                          <span style={{ color: 'rgba(232,230,240,0.3)', fontSize: '0.8rem', flexShrink: 0 }}>
                            {expandedId === (q.id || i) ? '▲' : '▼'}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Regenerate button */}
                  <button
                    onClick={() => {
                      setQuestions([]);
                      setExpandedId(null);
                      setActiveCategory('All');
                      handleSubmit();
                    }}
                    disabled={loading}
                    style={{
                      width: '100%',
                      marginTop: '1rem',
                      background: 'rgba(124,58,237,0.15)',
                      border: '1px solid rgba(124,58,237,0.3)',
                      color: '#a78bfa',
                      borderRadius: '12px',
                      padding: '0.75rem',
                      fontWeight: 600,
                      fontSize: '0.9rem',
                      cursor: loading ? 'not-allowed' : 'pointer',
                      fontFamily: 'DM Sans',
                      opacity: loading ? 0.5 : 1,
                      transition: 'all 0.2s',
                    }}
                  >
                    🔄 Generate 30 New Questions
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
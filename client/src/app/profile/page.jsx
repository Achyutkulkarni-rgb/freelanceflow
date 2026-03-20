'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import api from '@/lib/axios';
import useAuthStore from '@/store/authStore';
import toast, { Toaster } from 'react-hot-toast';

export default function ProfilePage() {
  const { user, loadAuth, setAuth, token } = useAuthStore();
  const [loading, setLoading] = useState(false);
  const [findingJobs, setFindingJobs] = useState(false);
  const [jobs, setJobs] = useState([]);
  const [form, setForm] = useState({
    name: '', bio: '', skills: '', experience: '',
    location: '', lookingFor: '', expectedSalary: '', availability: 'freelance',
  });

  useEffect(() => { loadAuth(); }, []);

  useEffect(() => {
    if (user) {
      setForm({
        name: user.name || '',
        bio: user.bio || '',
        skills: user.skills?.join(', ') || '',
        experience: user.experience || '',
        location: user.location || '',
        lookingFor: user.lookingFor || '',
        expectedSalary: user.expectedSalary || '',
        availability: user.availability || 'freelance',
      });
    }
  }, [user]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const { data } = await api.put('/auth/profile', {
        ...form,
        skills: form.skills.split(',').map(s => s.trim()).filter(Boolean),
      });
      setAuth(data, token);
      toast.success('Profile updated!');
    } catch (err) {
      toast.error('Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  const findJobs = async () => {
    setFindingJobs(true);
    setJobs([]);
    try {
      const { data } = await api.post('/ai/find-jobs', {
        skills: form.skills,
        experience: form.experience,
        location: form.location,
        lookingFor: form.lookingFor,
        availability: form.availability,
      });
      setJobs(data.jobs);
      if (data.jobs.length === 0) toast.error('No jobs found, try different keywords');
      else toast.success(`Found ${data.jobs.length} real jobs for you!`);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to find jobs');
    } finally {
      setFindingJobs(false);
    }
  };

  if (!user) return (
    <div style={{ minHeight: '100vh', background: '#0a0a0f', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <Link href="/login" style={{ background: 'linear-gradient(135deg,#7c3aed,#2563eb)', color: 'white', padding: '0.75rem 1.5rem', borderRadius: '12px', textDecoration: 'none' }}>Sign in</Link>
    </div>
  );

  const inputStyle = {
    width: '100%',
    background: 'rgba(255,255,255,0.06)',
    border: '1px solid rgba(255,255,255,0.12)',
    borderRadius: '12px',
    padding: '0.75rem 1rem',
    color: '#e8e6f0',
    fontSize: '0.9rem',
    outline: 'none',
    fontFamily: 'inherit',
  };

  const labelStyle = {
    display: 'block',
    fontSize: '0.8rem',
    fontWeight: '500',
    color: 'rgba(232,230,240,0.6)',
    marginBottom: '0.4rem',
  };

  const cardStyle = {
    background: 'rgba(255,255,255,0.04)',
    border: '1px solid rgba(255,255,255,0.08)',
    borderRadius: '20px',
    padding: '1.5rem',
    marginBottom: '1.5rem',
  };

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Syne:wght@700;800&family=DM+Sans:wght@300;400;500&display=swap');
        .profile-page * { box-sizing: border-box; }
        .profile-page { font-family: 'DM Sans', sans-serif; background: #0a0a0f; color: #e8e6f0; min-height: 100vh; }
        .profile-input:focus { border-color: rgba(124,58,237,0.6) !important; box-shadow: 0 0 0 3px rgba(124,58,237,0.12); }
        .profile-input::placeholder { color: rgba(232,230,240,0.3); }
        .profile-input option { background: #1a1a2e; color: #e8e6f0; }
        .two-col { display: grid; grid-template-columns: 1fr 1fr; gap: 1rem; }
        @media (max-width: 600px) {
          .two-col { grid-template-columns: 1fr !important; }
          .profile-nav-inner { flex-direction: column; align-items: flex-start; gap: 0.5rem; }
          .profile-avatar { width: 56px !important; height: 56px !important; font-size: 1.5rem !important; }
          .profile-user-name { font-size: 1rem !important; }
          .job-card-header { flex-direction: column !important; gap: 0.5rem; }
        }
      `}</style>

      <div className="profile-page">
        <Toaster />

        {/* Navbar */}
        <nav style={{ background: 'rgba(10,10,15,0.9)', borderBottom: '1px solid rgba(255,255,255,0.06)', padding: '0 1.5rem', position: 'sticky', top: 0, zIndex: 100 }}>
          <div className="profile-nav-inner" style={{ maxWidth: '860px', margin: '0 auto', height: '60px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <Link href="/" style={{ fontFamily: 'Syne', fontWeight: 800, fontSize: '1.3rem', background: 'linear-gradient(135deg,#a78bfa,#60a5fa)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', textDecoration: 'none' }}>
              FreelanceFlow
            </Link>
            <Link href="/dashboard" style={{ fontSize: '0.85rem', color: 'rgba(232,230,240,0.5)', textDecoration: 'none' }}>← Dashboard</Link>
          </div>
        </nav>

        <div style={{ maxWidth: '860px', margin: '0 auto', padding: '2rem 1rem' }}>

          {/* Profile Card */}
          <div style={cardStyle}>
            {/* User Header */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '2rem', flexWrap: 'wrap' }}>
              <div className="profile-avatar" style={{ width: '72px', height: '72px', borderRadius: '50%', background: 'linear-gradient(135deg,#7c3aed,#2563eb)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontSize: '2rem', fontWeight: 700, flexShrink: 0 }}>
                {user.name?.[0]?.toUpperCase()}
              </div>
              <div>
                <h1 className="profile-user-name" style={{ fontSize: '1.2rem', fontWeight: 700, marginBottom: '0.2rem' }}>{user.name}</h1>
                <p style={{ color: 'rgba(232,230,240,0.45)', fontSize: '0.85rem', marginBottom: '0.4rem' }}>{user.email}</p>
                <span style={{ fontSize: '0.75rem', fontWeight: 600, padding: '0.25rem 0.75rem', borderRadius: '100px', background: user.role === 'freelancer' ? 'rgba(37,99,235,0.2)' : 'rgba(5,150,105,0.2)', color: user.role === 'freelancer' ? '#60a5fa' : '#34d399' }}>
                  {user.role}
                </span>
              </div>
            </div>

            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div className="two-col">
                <div>
                  <label style={labelStyle}>Full name</label>
                  <input required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })}
                    className="profile-input" style={inputStyle} />
                </div>
                <div>
                  <label style={labelStyle}>Location</label>
                  <input placeholder="e.g. Bangalore" value={form.location} onChange={(e) => setForm({ ...form, location: e.target.value })}
                    className="profile-input" style={inputStyle} />
                </div>
              </div>

              <div>
                <label style={labelStyle}>Bio</label>
                <textarea rows={3} placeholder="Tell clients about yourself..." value={form.bio} onChange={(e) => setForm({ ...form, bio: e.target.value })}
                  className="profile-input" style={{ ...inputStyle, resize: 'none' }} />
              </div>

              <div>
                <label style={labelStyle}>Skills <span style={{ color: 'rgba(232,230,240,0.3)', fontWeight: 400 }}>(comma separated)</span></label>
                <input placeholder="React, Node.js, MongoDB, Tailwind" value={form.skills} onChange={(e) => setForm({ ...form, skills: e.target.value })}
                  className="profile-input" style={inputStyle} />
              </div>

              <div className="two-col">
                <div>
                  <label style={labelStyle}>Experience</label>
                  <input placeholder="e.g. 2 years fullstack" value={form.experience} onChange={(e) => setForm({ ...form, experience: e.target.value })}
                    className="profile-input" style={inputStyle} />
                </div>
                <div>
                  <label style={labelStyle}>Expected Salary</label>
                  <input placeholder="e.g. 8-12 LPA" value={form.expectedSalary} onChange={(e) => setForm({ ...form, expectedSalary: e.target.value })}
                    className="profile-input" style={inputStyle} />
                </div>
              </div>

              <div className="two-col">
                <div>
                  <label style={labelStyle}>Looking for</label>
                  <input placeholder="e.g. Fullstack Developer" value={form.lookingFor} onChange={(e) => setForm({ ...form, lookingFor: e.target.value })}
                    className="profile-input" style={inputStyle} />
                </div>
                <div>
                  <label style={labelStyle}>Availability</label>
                  <select value={form.availability} onChange={(e) => setForm({ ...form, availability: e.target.value })}
                    className="profile-input" style={inputStyle}>
                    <option value="full-time">Full-time</option>
                    <option value="part-time">Part-time</option>
                    <option value="freelance">Freelance</option>
                    <option value="internship">Internship</option>
                  </select>
                </div>
              </div>

              <button type="submit" disabled={loading} style={{ width: '100%', background: 'linear-gradient(135deg,#7c3aed,#2563eb)', color: 'white', fontWeight: 600, padding: '0.875rem', borderRadius: '12px', border: 'none', cursor: 'pointer', fontSize: '0.95rem', opacity: loading ? 0.6 : 1 }}>
                {loading ? 'Saving...' : 'Save Profile'}
              </button>
            </form>
          </div>

          {/* AI Job Finder */}
          <div style={cardStyle}>
            <h2 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '0.3rem' }}>🔍 Real Job Finder</h2>
            <p style={{ color: 'rgba(232,230,240,0.45)', fontSize: '0.85rem', marginBottom: '1rem' }}>
              Finds real live job postings based on your skills — with direct apply links
            </p>

            <div style={{ background: 'rgba(37,99,235,0.1)', border: '1px solid rgba(37,99,235,0.2)', borderRadius: '12px', padding: '1rem', marginBottom: '1rem', fontSize: '0.85rem', color: '#93c5fd' }}>
              <p style={{ fontWeight: 600, marginBottom: '0.4rem' }}>How it works:</p>
              <p>1. Fill your skills and location above</p>
              <p>2. Click Find Jobs — we search real job boards</p>
              <p>3. Click Apply Now — goes directly to the job posting</p>
            </div>

            <button onClick={findJobs} disabled={findingJobs || !form.skills.trim()}
              style={{ width: '100%', background: 'linear-gradient(135deg,#7c3aed,#2563eb)', color: 'white', fontWeight: 600, padding: '0.875rem', borderRadius: '12px', border: 'none', cursor: findingJobs || !form.skills.trim() ? 'not-allowed' : 'pointer', fontSize: '0.95rem', opacity: findingJobs || !form.skills.trim() ? 0.5 : 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}>
              {findingJobs ? (<><div style={{ width: '16px', height: '16px', border: '2px solid rgba(255,255,255,0.3)', borderTopColor: 'white', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }}/> Searching real job boards...</>) : '🚀 Find Real Jobs For Me'}
            </button>
            {!form.skills.trim() && (
              <p style={{ fontSize: '0.8rem', color: '#f97316', textAlign: 'center', marginTop: '0.5rem' }}>Add your skills above first</p>
            )}
          </div>

          {/* Job Results */}
          {jobs.length > 0 && (
            <div>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem', flexWrap: 'wrap', gap: '0.5rem' }}>
                <h2 style={{ fontSize: '1.1rem', fontWeight: 700 }}>🎯 {jobs.length} Real Jobs Found</h2>
                <span style={{ fontSize: '0.75rem', color: 'rgba(232,230,240,0.4)', background: 'rgba(255,255,255,0.06)', padding: '0.25rem 0.75rem', borderRadius: '100px' }}>Live from Adzuna</span>
              </div>

              {jobs.map((job, i) => (
                <div key={i} style={{ ...cardStyle, marginBottom: '1rem' }}>
                  <div className="job-card-header" style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
                    <div style={{ flex: 1, marginRight: '1rem' }}>
                      <h3 style={{ fontWeight: 700, fontSize: '1rem', marginBottom: '0.25rem' }}>{job.title}</h3>
                      <p style={{ color: '#60a5fa', fontSize: '0.85rem', fontWeight: 500 }}>{job.company}</p>
                    </div>
                    <span style={{ background: 'rgba(5,150,105,0.2)', color: '#34d399', fontSize: '0.75rem', fontWeight: 600, padding: '0.25rem 0.75rem', borderRadius: '100px', whiteSpace: 'nowrap' }}>{job.salary}</span>
                  </div>

                  <p style={{ color: 'rgba(232,230,240,0.5)', fontSize: '0.85rem', marginBottom: '0.75rem', lineHeight: 1.6 }}>{job.description}</p>

                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', marginBottom: '1rem' }}>
                    <span style={{ background: 'rgba(255,255,255,0.06)', color: 'rgba(232,230,240,0.6)', fontSize: '0.75rem', padding: '0.25rem 0.75rem', borderRadius: '100px' }}>📍 {job.location}</span>
                    {job.category && <span style={{ background: 'rgba(124,58,237,0.15)', color: '#a78bfa', fontSize: '0.75rem', padding: '0.25rem 0.75rem', borderRadius: '100px' }}>{job.category}</span>}
                    {job.created && <span style={{ background: 'rgba(37,99,235,0.15)', color: '#60a5fa', fontSize: '0.75rem', padding: '0.25rem 0.75rem', borderRadius: '100px' }}>🕒 {new Date(job.created).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</span>}
                  </div>

                  <a href={job.link} target="_blank" rel="noopener noreferrer"
                    style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', background: 'linear-gradient(135deg,#7c3aed,#2563eb)', color: 'white', fontSize: '0.85rem', padding: '0.6rem 1.25rem', borderRadius: '10px', textDecoration: 'none', fontWeight: 600 }}>
                    Apply Now →
                  </a>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </>
  );
}
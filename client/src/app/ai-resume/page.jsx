'use client';
import { useState } from 'react';
import Link from 'next/link';

export default function AIResumePage() {
  const [file, setFile] = useState(null);
  const [jobDescription, setJobDescription] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');

  const handleSubmit = async () => {
    if (!file || !jobDescription.trim()) {
      setError('Please upload your resume and paste the job description.');
      return;
    }
    setError('');
    setLoading(true);
    setResult(null);

    try {
      const formData = new FormData();
      formData.append('resume', file);
      formData.append('jobDescription', jobDescription);

      const token = localStorage.getItem('token');
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/ai/tailor-resume`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
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

  const handleDownloadPDF = () => {
    const printWindow = window.open('', '_blank');
    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
      <head>
        <title>Tailored Resume</title>
        <style>
          * { box-sizing: border-box; margin: 0; padding: 0; }
          body { font-family: Arial, sans-serif; max-width: 780px; margin: 0 auto; padding: 32px 40px; color: #1a1a1a; font-size: 12px; line-height: 1.5; }
          .no-print { background:#fffbe6; border:1px solid #f0c040; padding:10px 14px; border-radius:6px; margin-bottom:20px; font-size:11px; color:#7a5c00; }
          .name { font-size: 22px; font-weight: bold; margin-bottom: 4px; }
          .contact { font-size: 11px; color: #444; margin-bottom: 16px; border-bottom: 1.5px solid #bbb; padding-bottom: 10px; }
          .section { margin-bottom: 14px; }
          .section-title { font-size: 12px; font-weight: bold; text-transform: uppercase; border-bottom: 1px solid #999; padding-bottom: 2px; margin-bottom: 7px; letter-spacing: 0.04em; color: #111; }
          .body-text { font-size: 11.5px; line-height: 1.6; }
          .job-header { display: flex; justify-content: space-between; align-items: baseline; margin-top: 7px; margin-bottom: 2px; }
          .job-title { font-weight: bold; font-size: 11.5px; }
          .job-date { font-size: 11px; color: #444; }
          .job-sub { font-size: 11px; color: #555; margin-bottom: 4px; }
          ul { padding-left: 18px; margin-top: 3px; }
          li { margin-bottom: 2px; font-size: 11.5px; }
          .project-title { font-weight: bold; font-size: 11.5px; margin-top: 7px; margin-bottom: 2px; }
          @media print { .no-print { display: none; } body { padding: 20px 30px; } }
        </style>
      </head>
      <body>
        <div class="no-print">
          💡 To save as PDF: Press <strong>Ctrl+P</strong> (Cmd+P on Mac) → Destination: <strong>Save as PDF</strong> → Save
        </div>

        <div class="name">Achyut Kulkarni</div>
        <div class="contact">+91-9620533824 &nbsp;|&nbsp; achyutk105@gmail.com &nbsp;|&nbsp; linkedin.com/in/achyut03</div>

        <div class="section">
          <div class="section-title">Profile Summary</div>
          <div class="body-text">${result.summary}</div>
        </div>

        <div class="section">
          <div class="section-title">Skills</div>
          <div class="body-text">${result.skills}</div>
        </div>

        <div class="section">
          <div class="section-title">Internship Experience</div>

          <div class="job-header">
            <div class="job-title">Backend Developer Intern – Amealio</div>
            <div class="job-date">Feb 2026 - March 2026</div>
          </div>
          <div class="job-sub">Backend Development</div>
          <ul>
            <li>Developed backend services and APIs using Node.js and Express.js for application functionality.</li>
            <li>Worked on database integration, data handling, and server-side logic using MongoDB.</li>
            <li>Improved API performance, debugging issues, and ensured efficient data processing.</li>
          </ul>

          <div class="job-header">
            <div class="job-title">Intern – KodNest Technologies</div>
            <div class="job-date">Apr 2025 – Oct 2025</div>
          </div>
          <div class="job-sub">Full Stack Development Internship, Bengaluru</div>
          <ul>
            <li>Completed full-stack curriculum covering Java, Spring Boot, React.js, Node.js, MongoDB, and SQL.</li>
            <li>Developed REST APIs, CRUD operations, authentication modules, and integrated front-end with backend services.</li>
            <li>Enhanced debugging skills, code optimization techniques, and industry-standard coding practices through real-time modules.</li>
          </ul>
        </div>

        <div class="section">
          <div class="section-title">Projects</div>

          <div class="project-title">SkillSwap – Skill Matching Web Platform | React.js, Node.js, MongoDB &nbsp;&nbsp; Aug 2025 – Present</div>
          <ul>
            <li>Developed a full-stack platform enabling users to connect, collaborate, and exchange skills.</li>
            <li>Implemented JWT-based authentication ensuring secure login, session management, and data protection.</li>
            <li>Integrated real-time chat functionality using WebSocket for instant communication.</li>
          </ul>

          <div class="project-title">Vehicle Movement Analysis using Edge AI – Intel &nbsp;&nbsp; May 2024 – Jul 2024</div>
          <ul>
            <li>Built an Edge AI pipeline to classify and analyze vehicle movement and traffic patterns.</li>
            <li>Performed local inference without cloud dependency, improving speed, privacy, and efficiency.</li>
            <li>Generated insights for traffic density analysis and anomaly detection.</li>
          </ul>

          <div class="project-title">Solar Powered Water Pump Smart Irrigation System | Python, IoT Sensors &nbsp;&nbsp; Mar 2025 – Jun 2025</div>
          <ul>
            <li>Designed an automated irrigation system powered by solar energy to optimize agricultural water usage.</li>
            <li>Integrated soil moisture sensors for real-time monitoring, pump control, and automated irrigation decisions.</li>
          </ul>
        </div>

        <div class="section">
          <div class="section-title">Awards & Certifications</div>
          <ul>
            <li>ISRO – Internship Completion Certificate (Participation).</li>
            <li>Intel – Project Internship Certificate (Edge AI).</li>
            <li>Internshala – Web Development Professional Certification.</li>
          </ul>
        </div>

        <div class="section">
          <div class="section-title">Education</div>
          <div class="job-header">
            <div class="job-title">B.Tech in Electronics and Communication Engineering</div>
            <div class="job-date">Dec 2021 – Jun 2025</div>
          </div>
          <div class="body-text">Sharnbasva University, Kalaburagi &nbsp;&nbsp; CGPA: 8.78 / 10</div>
        </div>

      </body>
      </html>
    `);
    printWindow.document.close();
    printWindow.focus();
    setTimeout(() => { printWindow.print(); }, 600);
  };

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Syne:wght@700;800&family=DM+Sans:wght@300;400;500&display=swap');
        .ar-page { font-family: 'DM Sans', sans-serif; background: #0a0a0f; color: #e8e6f0; min-height: 100vh; }
        .ar-input { width: 100%; background: rgba(255,255,255,0.06); border: 1px solid rgba(255,255,255,0.12); border-radius: 12px; padding: 0.75rem 1rem; color: #e8e6f0; font-size: 0.9rem; outline: none; font-family: 'DM Sans', sans-serif; }
        .ar-input::placeholder { color: rgba(232,230,240,0.3); }
        .ar-input:focus { border-color: rgba(124,58,237,0.6); box-shadow: 0 0 0 3px rgba(124,58,237,0.12); }
        .ar-card { background: rgba(255,255,255,0.04); border: 1px solid rgba(255,255,255,0.08); border-radius: 20px; padding: 1.5rem; margin-bottom: 1.5rem; }
        .ar-label { display: block; font-size: 0.8rem; font-weight: 500; color: rgba(232,230,240,0.6); margin-bottom: 0.4rem; }
        .ar-btn { background: linear-gradient(135deg,#7c3aed,#2563eb); color: white; border: none; border-radius: 12px; padding: 0.875rem 1.5rem; font-weight: 600; font-size: 0.95rem; cursor: pointer; font-family: 'DM Sans', sans-serif; width: 100%; }
        .ar-btn:disabled { opacity: 0.5; cursor: not-allowed; }
        .ar-upload-box { border: 2px dashed rgba(124,58,237,0.4); border-radius: 14px; padding: 2rem; text-align: center; cursor: pointer; transition: all 0.2s; background: rgba(124,58,237,0.05); }
        .ar-upload-box:hover { border-color: rgba(124,58,237,0.7); background: rgba(124,58,237,0.1); }
        .ar-section-box { background: rgba(255,255,255,0.03); border: 1px solid rgba(255,255,255,0.08); border-radius: 12px; padding: 1rem; margin-bottom: 1rem; }
        .ar-section-title { font-size: 0.75rem; font-weight: 600; color: #a78bfa; text-transform: uppercase; letter-spacing: 0.05em; margin-bottom: 0.5rem; }
        .ar-section-text { font-size: 0.88rem; line-height: 1.7; color: #e8e6f0; white-space: pre-wrap; }
        @keyframes spin { to { transform: rotate(360deg); } }
        @keyframes pulse { 0%,100% { opacity:1; } 50% { opacity:0.5; } }
        @media (max-width: 640px) { .ar-grid { grid-template-columns: 1fr !important; } }
      `}</style>

      <div className="ar-page">
        {/* Navbar */}
        <nav style={{ background: 'rgba(10,10,15,0.95)', borderBottom: '1px solid rgba(255,255,255,0.06)', padding: '0 1.5rem', position: 'sticky', top: 0, zIndex: 100 }}>
          <div style={{ maxWidth: '960px', margin: '0 auto', height: '60px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <Link href="/" style={{ fontFamily: 'Syne', fontWeight: 800, fontSize: '1.3rem', background: 'linear-gradient(135deg,#a78bfa,#60a5fa)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', textDecoration: 'none' }}>
              FreelanceFlow
            </Link>
            <Link href="/" style={{ fontSize: '0.85rem', color: 'rgba(232,230,240,0.5)', textDecoration: 'none' }}>← Back</Link>
          </div>
        </nav>

        <div style={{ maxWidth: '960px', margin: '0 auto', padding: '2rem 1.5rem' }}>

          {/* Header */}
          <div style={{ marginBottom: '2rem' }}>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', background: 'rgba(124,58,237,0.15)', border: '1px solid rgba(124,58,237,0.3)', borderRadius: '100px', padding: '0.35rem 1rem', fontSize: '0.8rem', color: '#a78bfa', marginBottom: '1rem' }}>
              ✦ AI Powered
            </div>
            <h1 style={{ fontFamily: 'Syne', fontSize: 'clamp(1.8rem, 4vw, 2.5rem)', fontWeight: 800, letterSpacing: '-1px', marginBottom: '0.5rem' }}>
              AI Resume Tailor
            </h1>
            <p style={{ color: 'rgba(232,230,240,0.5)', fontSize: '0.95rem' }}>
              Upload your resume → paste job description → AI rewrites only your <strong style={{ color: '#a78bfa' }}>Summary & Skills</strong> to match the job → download as PDF.
            </p>
          </div>

          <div className="ar-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>

            {/* Left — Inputs */}
            <div>
              <div className="ar-card">
                <h2 style={{ fontFamily: 'Syne', fontSize: '1rem', fontWeight: 700, marginBottom: '1.25rem' }}>📄 Your Resume</h2>
                <label className="ar-label">Upload Resume (PDF)</label>
                <div className="ar-upload-box" onClick={() => document.getElementById('resumeInput').click()}>
                  {file ? (
                    <div>
                      <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>✅</div>
                      <p style={{ fontSize: '0.9rem', color: '#a78bfa', fontWeight: 500 }}>{file.name}</p>
                      <p style={{ fontSize: '0.75rem', color: 'rgba(232,230,240,0.4)', marginTop: '0.25rem' }}>Click to change</p>
                    </div>
                  ) : (
                    <div>
                      <div style={{ fontSize: '2.5rem', marginBottom: '0.5rem' }}>📎</div>
                      <p style={{ fontSize: '0.9rem', color: 'rgba(232,230,240,0.6)' }}>Click to upload PDF</p>
                      <p style={{ fontSize: '0.75rem', color: 'rgba(232,230,240,0.3)', marginTop: '0.25rem' }}>PDF files only</p>
                    </div>
                  )}
                </div>
                <input id="resumeInput" type="file" accept=".pdf" style={{ display: 'none' }} onChange={(e) => setFile(e.target.files[0])} />
              </div>

              <div className="ar-card">
                <h2 style={{ fontFamily: 'Syne', fontSize: '1rem', fontWeight: 700, marginBottom: '1.25rem' }}>💼 Job Description</h2>
                <label className="ar-label">Paste the job description</label>
                <textarea className="ar-input" rows={8} placeholder="Paste the full job description here — requirements, responsibilities, skills needed..." value={jobDescription} onChange={(e) => setJobDescription(e.target.value)} style={{ resize: 'none' }} />
              </div>

              {error && (
                <div style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)', borderRadius: '10px', padding: '0.75rem 1rem', color: '#f87171', fontSize: '0.85rem', marginBottom: '1rem' }}>
                  {error}
                </div>
              )}

              <button className="ar-btn" onClick={handleSubmit} disabled={loading || !file || !jobDescription.trim()}>
                {loading ? (
                  <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}>
                    <span style={{ width: '16px', height: '16px', border: '2px solid rgba(255,255,255,0.3)', borderTopColor: 'white', borderRadius: '50%', display: 'inline-block', animation: 'spin 0.8s linear infinite' }}/>
                    Tailoring your resume...
                  </span>
                ) : '✨ Tailor My Resume'}
              </button>
            </div>

            {/* Right — Result */}
            <div>
              <div className="ar-card" style={{ minHeight: '400px' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem', flexWrap: 'wrap', gap: '0.5rem' }}>
                  <h2 style={{ fontFamily: 'Syne', fontSize: '1rem', fontWeight: 700 }}>🎯 Tailored Sections</h2>
                  {result && (
                    <button onClick={handleDownloadPDF} style={{ background: 'rgba(5,150,105,0.2)', border: '1px solid rgba(5,150,105,0.4)', color: '#34d399', borderRadius: '8px', padding: '0.4rem 0.9rem', fontSize: '0.8rem', fontWeight: 600, cursor: 'pointer', fontFamily: 'DM Sans' }}>
                      ⬇ Download PDF
                    </button>
                  )}
                </div>

                {!result && !loading && (
                  <div style={{ textAlign: 'center', padding: '4rem 1rem', color: 'rgba(232,230,240,0.25)' }}>
                    <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>📝</div>
                    <p style={{ fontSize: '0.9rem' }}>Tailored Summary & Skills will appear here</p>
                  </div>
                )}

                {loading && (
                  <div style={{ textAlign: 'center', padding: '4rem 1rem', color: 'rgba(232,230,240,0.4)' }}>
                    <div style={{ fontSize: '3rem', marginBottom: '1rem', animation: 'pulse 1.5s ease-in-out infinite' }}>🤖</div>
                    <p style={{ fontSize: '0.9rem' }}>AI is tailoring your resume...</p>
                    <p style={{ fontSize: '0.8rem', marginTop: '0.5rem', color: 'rgba(232,230,240,0.25)' }}>This may take 15-30 seconds</p>
                  </div>
                )}

                {result && (
                  <div>
                    <div style={{ background: 'rgba(124,58,237,0.08)', border: '1px solid rgba(124,58,237,0.2)', borderRadius: '10px', padding: '0.6rem 1rem', marginBottom: '1rem', fontSize: '0.8rem', color: '#a78bfa' }}>
                      ✅ Only Summary & Skills rewritten. Everything else stays the same.
                    </div>

                    <div className="ar-section-box">
                      <div className="ar-section-title">✍️ New Professional Summary</div>
                      <div className="ar-section-text">{result.summary}</div>
                    </div>

                    <div className="ar-section-box">
                      <div className="ar-section-title">⚡ New Skills Section</div>
                      <div className="ar-section-text">{result.skills}</div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* How it works */}
          <div className="ar-card" style={{ marginTop: '0.5rem' }}>
            <h2 style={{ fontFamily: 'Syne', fontSize: '1rem', fontWeight: 700, marginBottom: '1rem' }}>💡 How it works</h2>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '1rem' }}>
              {[
                { icon: '📎', title: 'Upload Resume', desc: 'Upload your existing resume as PDF' },
                { icon: '💼', title: 'Paste Job Description', desc: 'Copy the full job posting' },
                { icon: '🤖', title: 'AI Tailors It', desc: 'Only Summary & Skills are rewritten to match' },
                { icon: '📄', title: 'Download PDF', desc: 'Browser print dialog → Save as PDF' },
              ].map((step, i) => (
                <div key={i} style={{ background: 'rgba(255,255,255,0.03)', borderRadius: '12px', padding: '1rem' }}>
                  <div style={{ fontSize: '1.5rem', marginBottom: '0.5rem' }}>{step.icon}</div>
                  <p style={{ fontWeight: 600, fontSize: '0.9rem', marginBottom: '0.25rem' }}>{step.title}</p>
                  <p style={{ fontSize: '0.8rem', color: 'rgba(232,230,240,0.4)' }}>{step.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
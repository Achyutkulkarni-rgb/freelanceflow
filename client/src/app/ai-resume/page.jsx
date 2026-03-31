'use client';
import { useState } from 'react';
import Link from 'next/link';

export default function AIResumePage() {
  const [file, setFile] = useState(null);
  const [jobDescription, setJobDescription] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');
  const [template, setTemplate] = useState('classic');

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

  const parseResume = () => {
    const lines = result.originalText.split('\n').map(l => l.trim()).filter(l => l.length > 0);
    const sectionKeywords = ['summary', 'objective', 'profile', 'about'];
    const skillKeywords = ['skills', 'technical skills', 'core competencies', 'key skills'];
    const otherSections = ['experience', 'work experience', 'employment', 'internship', 'education', 'projects', 'certifications', 'awards', 'languages', 'interests', 'references'];

    const isSummarySection = (line) => sectionKeywords.some(k => line.toLowerCase().includes(k));
    const isSkillSection = (line) => skillKeywords.some(k => line.toLowerCase().includes(k));
    const isOtherSection = (line) => otherSections.some(k => line.toLowerCase().startsWith(k));
    const isSectionHeader = (line) => isSummarySection(line) || isSkillSection(line) || isOtherSection(line);

    let i = 0;
    let summaryDone = false;
    let skillsDone = false;
    const headerLines = [];
    const sections = [];

    while (i < lines.length && !isSectionHeader(lines[i]) && i < 6) {
      headerLines.push(lines[i]);
      i++;
    }

    while (i < lines.length) {
      const line = lines[i];

      if (isSummarySection(line) && !summaryDone) {
        sections.push({ title: line, content: result.summary, type: 'summary' });
        summaryDone = true;
        i++;
        while (i < lines.length && !isSectionHeader(lines[i])) i++;
        continue;
      }

      if (isSkillSection(line) && !skillsDone) {
        sections.push({ title: line, content: result.skills, type: 'skills' });
        skillsDone = true;
        i++;
        while (i < lines.length && !isSectionHeader(lines[i])) i++;
        continue;
      }

      if (isOtherSection(line)) {
        let content = '';
        i++;
        while (i < lines.length && !isSectionHeader(lines[i])) {
          content += lines[i] + '\n';
          i++;
        }
        sections.push({ title: line, content: content.trim(), type: 'other' });
        continue;
      }

      i++;
    }

    if (!summaryDone) sections.unshift({ title: 'PROFESSIONAL SUMMARY', content: result.summary, type: 'summary' });
    if (!skillsDone) {
      const summaryIdx = sections.findIndex(s => s.type === 'summary');
      sections.splice(summaryIdx + 1, 0, { title: 'SKILLS', content: result.skills, type: 'skills' });
    }

    return { headerLines, sections };
  };

  const handleDownloadPDF = (tmpl) => {
    const { headerLines, sections } = parseResume();
    const name = headerLines[0] || '';
    const contact = headerLines.slice(1).join(' | ');

    let bodyHTML = '';

    if (tmpl === 'classic') {
      bodyHTML = `
        <!DOCTYPE html><html><head><title>Tailored Resume</title>
        <style>
          *{box-sizing:border-box;margin:0;padding:0;}
          body{font-family:Arial,sans-serif;max-width:780px;margin:0 auto;padding:32px 40px;color:#1a1a1a;font-size:12px;line-height:1.5;}
          .no-print{background:#fffbe6;border:1px solid #f0c040;padding:10px 14px;border-radius:6px;margin-bottom:20px;font-size:11px;color:#7a5c00;}
          .name{font-size:22px;font-weight:bold;margin-bottom:4px;}
          .contact{font-size:11px;color:#444;margin-bottom:16px;border-bottom:1.5px solid #bbb;padding-bottom:10px;}
          .section{margin-bottom:14px;}
          .section-title{font-size:11px;font-weight:bold;text-transform:uppercase;border-bottom:1px solid #999;padding-bottom:2px;margin-bottom:7px;letter-spacing:0.04em;color:#111;}
          .body-text{font-size:11.5px;line-height:1.6;white-space:pre-wrap;}
          .highlight{background:#f5f5ff;border-left:3px solid #6040c0;padding:6px 10px;}
          @media print{@page{margin:0;size:A4;}.no-print{display:none;}body{padding:20px 30px;}}
        </style></head><body>
        <div class="no-print">💡 Press <strong>Ctrl+P</strong> → Save as PDF → uncheck "Headers and footers" → Save</div>
        <div class="name">${name}</div>
        <div class="contact">${contact}</div>
        ${sections.map(s => `
          <div class="section">
            <div class="section-title">${s.title}</div>
            <div class="body-text ${s.type === 'summary' || s.type === 'skills' ? 'highlight' : ''}">${s.content}</div>
          </div>
        `).join('')}
        </body></html>`;
    } else {
      // Modern 2-column
      const sidebarSections = sections.filter(s => s.type === 'skills' || s.title.toLowerCase().includes('certif') || s.title.toLowerCase().includes('language') || s.title.toLowerCase().includes('educat'));
      const mainSections = sections.filter(s => !sidebarSections.includes(s));

      bodyHTML = `
        <!DOCTYPE html><html><head><title>Tailored Resume</title>
        <style>
          *{box-sizing:border-box;margin:0;padding:0;}
          body{font-family:Arial,sans-serif;color:#1a1a1a;font-size:12px;line-height:1.5;display:flex;min-height:100vh;}
          .no-print{position:fixed;top:0;left:0;right:0;background:#fffbe6;border-bottom:1px solid #f0c040;padding:8px 16px;font-size:11px;color:#7a5c00;z-index:100;}
          .sidebar{width:200px;min-width:200px;background:#1e1b4b;color:#e8e6f0;padding:28px 16px;flex-shrink:0;}
          .main{flex:1;padding:28px 24px;}
          .s-name{font-size:16px;font-weight:bold;color:white;margin-bottom:4px;word-break:break-word;}
          .s-contact{font-size:10px;color:#c4b5fd;margin-bottom:20px;line-height:1.8;}
          .s-section-title{font-size:10px;font-weight:bold;text-transform:uppercase;letter-spacing:0.06em;color:#a78bfa;border-bottom:1px solid rgba(167,139,250,0.3);padding-bottom:3px;margin-bottom:7px;margin-top:14px;}
          .s-body{font-size:10.5px;color:#d1d5db;line-height:1.6;white-space:pre-wrap;}
          .m-section-title{font-size:11px;font-weight:bold;text-transform:uppercase;border-bottom:1.5px solid #1e1b4b;padding-bottom:2px;margin-bottom:7px;letter-spacing:0.04em;color:#1e1b4b;margin-top:14px;}
          .m-body{font-size:11.5px;line-height:1.6;white-space:pre-wrap;}
          .highlight{background:#f0f0ff;padding:6px 8px;border-radius:4px;}
          .top-name{font-size:22px;font-weight:bold;color:#1e1b4b;margin-bottom:2px;}
          .top-role{font-size:12px;color:#6040c0;margin-bottom:12px;font-weight:500;}
          @media print{@page{margin:0;size:A4;}.no-print{display:none;}body{font-size:11px;}}
        </style></head><body>
        <div class="no-print">💡 Press <strong>Ctrl+P</strong> → Save as PDF → uncheck "Headers and footers" → Save</div>
        <div class="sidebar">
          <div class="s-name">${name}</div>
          <div class="s-contact">${contact.split('|').join('\n')}</div>
          ${sidebarSections.map(s => `
            <div class="s-section-title">${s.title}</div>
            <div class="s-body ${s.type === 'skills' ? 'highlight' : ''}" style="${s.type === 'skills' ? 'background:rgba(167,139,250,0.15);padding:6px 8px;border-radius:4px;color:#e8e6f0;' : ''}">${s.content}</div>
          `).join('')}
        </div>
        <div class="main">
          ${mainSections.map((s, idx) => `
            ${idx === 0 ? `<div class="top-name" style="display:none">${name}</div>` : ''}
            <div class="m-section-title">${s.title}</div>
            <div class="m-body ${s.type === 'summary' ? 'highlight' : ''}">${s.content}</div>
          `).join('')}
        </div>
        </body></html>`;
    }

    const printWindow = window.open('', '_blank');
    printWindow.document.write(bodyHTML);
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
        .tmpl-btn { padding: 0.6rem 1rem; border-radius: 12px; border: 2px solid rgba(255,255,255,0.1); background: rgba(255,255,255,0.04); color: rgba(232,230,240,0.6); font-size: 0.85rem; cursor: pointer; transition: all 0.2s; font-family: 'DM Sans', sans-serif; font-weight: 500; flex: 1; }
        .tmpl-btn.active { border-color: rgba(124,58,237,0.6); background: rgba(124,58,237,0.15); color: #a78bfa; }
        @keyframes spin { to { transform: rotate(360deg); } }
        @keyframes pulse { 0%,100% { opacity:1; } 50% { opacity:0.5; } }
        @media (max-width: 640px) { .ar-grid { grid-template-columns: 1fr !important; } }
      `}</style>

      <div className="ar-page">
        <nav style={{ background: 'rgba(10,10,15,0.95)', borderBottom: '1px solid rgba(255,255,255,0.06)', padding: '0 1.5rem', position: 'sticky', top: 0, zIndex: 100 }}>
          <div style={{ maxWidth: '960px', margin: '0 auto', height: '60px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <Link href="/" style={{ fontFamily: 'Syne', fontWeight: 800, fontSize: '1.3rem', background: 'linear-gradient(135deg,#a78bfa,#60a5fa)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', textDecoration: 'none' }}>FreelanceFlow</Link>
            <Link href="/" style={{ fontSize: '0.85rem', color: 'rgba(232,230,240,0.5)', textDecoration: 'none' }}>← Back</Link>
          </div>
        </nav>

        <div style={{ maxWidth: '960px', margin: '0 auto', padding: '2rem 1.5rem' }}>
          <div style={{ marginBottom: '2rem' }}>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', background: 'rgba(124,58,237,0.15)', border: '1px solid rgba(124,58,237,0.3)', borderRadius: '100px', padding: '0.35rem 1rem', fontSize: '0.8rem', color: '#a78bfa', marginBottom: '1rem' }}>✦ AI Powered</div>
            <h1 style={{ fontFamily: 'Syne', fontSize: 'clamp(1.8rem, 4vw, 2.5rem)', fontWeight: 800, letterSpacing: '-1px', marginBottom: '0.5rem' }}>AI Resume Tailor</h1>
            <p style={{ color: 'rgba(232,230,240,0.5)', fontSize: '0.95rem' }}>
              Upload your resume → paste job description → AI rewrites only your <strong style={{ color: '#a78bfa' }}>Summary & Skills</strong> → choose template → download as PDF.
            </p>
          </div>

          <div className="ar-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
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
                <textarea className="ar-input" rows={8} placeholder="Paste the full job description here..." value={jobDescription} onChange={(e) => setJobDescription(e.target.value)} style={{ resize: 'none' }} />
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

            <div>
              <div className="ar-card" style={{ minHeight: '400px' }}>
                <h2 style={{ fontFamily: 'Syne', fontSize: '1rem', fontWeight: 700, marginBottom: '1.25rem' }}>🎯 Tailored Sections</h2>

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

                    {/* Template Selector */}
                    <div style={{ marginTop: '1.25rem' }}>
                      <p style={{ fontSize: '0.8rem', fontWeight: 600, color: 'rgba(232,230,240,0.6)', marginBottom: '0.6rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Choose Template</p>
                      <div style={{ display: 'flex', gap: '0.75rem', marginBottom: '1rem' }}>
                        <button className={`tmpl-btn ${template === 'classic' ? 'active' : ''}`} onClick={() => setTemplate('classic')}>
                          📄 Classic<br/>
                          <span style={{ fontSize: '0.72rem', opacity: 0.6 }}>Single column, ATS-friendly</span>
                        </button>
                        <button className={`tmpl-btn ${template === 'modern' ? 'active' : ''}`} onClick={() => setTemplate('modern')}>
                          🎨 Modern<br/>
                          <span style={{ fontSize: '0.72rem', opacity: 0.6 }}>Two column, visual</span>
                        </button>
                      </div>

                      <button onClick={() => handleDownloadPDF(template)}
                        style={{ width: '100%', background: 'linear-gradient(135deg,#059669,#0d9488)', color: 'white', border: 'none', borderRadius: '12px', padding: '0.75rem', fontWeight: 600, fontSize: '0.9rem', cursor: 'pointer', fontFamily: 'DM Sans' }}>
                        ⬇ Download {template === 'classic' ? 'Classic' : 'Modern'} PDF
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="ar-card" style={{ marginTop: '0.5rem' }}>
            <h2 style={{ fontFamily: 'Syne', fontSize: '1rem', fontWeight: 700, marginBottom: '1rem' }}>💡 How it works</h2>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '1rem' }}>
              {[
                { icon: '📎', title: 'Upload Resume', desc: 'Upload your existing resume as PDF' },
                { icon: '💼', title: 'Paste Job Description', desc: 'Copy the full job posting' },
                { icon: '🤖', title: 'AI Tailors It', desc: 'Only Summary & Skills are rewritten' },
                { icon: '🎨', title: 'Choose Template', desc: 'Classic single col or Modern two col' },
                { icon: '📄', title: 'Download PDF', desc: 'Browser print → Save as PDF' },
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
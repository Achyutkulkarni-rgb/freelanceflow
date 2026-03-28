const router = require('express').Router();
const Groq = require('groq-sdk').default;
const multer = require('multer');
const pdfParse = require('pdf-parse');
const upload = multer({ storage: multer.memoryStorage() });

// AI Proposal Generator
router.post('/proposal', async (req, res) => {
  try {
    const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });
    const { jobTitle, skills, experience } = req.body;

    const completion = await groq.chat.completions.create({
      model: 'llama-3.3-70b-versatile',
      messages: [{
        role: 'user',
        content: `Write a freelance proposal:
Job Title: ${jobTitle}
Skills: ${skills || 'React, Node.js'}
Experience: ${experience || '2 years'}
Keep it short and human.`
      }],
      temperature: 0.7,
    });

    res.json({ proposal: completion.choices[0]?.message?.content });
  } catch (err) {
    console.log('FULL ERROR:', err);
    res.status(500).json({ message: err.message });
  }
});

// AI Smart Job Matching
router.post('/match', async (req, res) => {
  try {
    const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });
    const { skills, experience, preference } = req.body;

    const completion = await groq.chat.completions.create({
      model: 'llama-3.3-70b-versatile',
      messages: [{
        role: 'user',
        content: `Based on these freelancer details, suggest 5 ideal job types and gig ideas:

Skills: ${skills || 'React, Node.js'}
Experience: ${experience || '2 years'}
Preference: ${preference || 'open to anything'}

For each suggestion provide:
1. Job/Gig title
2. Why it matches their skills
3. Expected budget range in INR

Format as a numbered list. Be specific and practical.`
      }],
      max_tokens: 1024,
      temperature: 0.7,
    });

    res.json({ suggestions: completion.choices[0]?.message?.content });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Real Jobs from Adzuna API
router.post('/find-jobs', async (req, res) => {
  try {
    const { skills, location, lookingFor } = req.body;

    const query = encodeURIComponent(
      (lookingFor || skills?.split(',')[0] || 'developer').trim()
    );
    const where = encodeURIComponent(
      (location || 'india').trim()
    );

    const appId = process.env.ADZUNA_APP_ID;
    const appKey = process.env.ADZUNA_APP_KEY;

    const url = `https://api.adzuna.com/v1/api/jobs/in/search/1?app_id=${appId}&app_key=${appKey}&results_per_page=8&what=${query}&where=${where}&content-type=application/json`;

    const response = await fetch(url);
    const data = await response.json();

    if (!data.results || data.results.length === 0) {
      return res.status(404).json({ message: 'No jobs found. Try different keywords.' });
    }

    const jobs = data.results.map(job => ({
      title: job.title,
      company: job.company?.display_name || 'Company',
      location: job.location?.display_name || location || 'India',
      salary: job.salary_min && job.salary_max
        ? `₹${Math.round(job.salary_min / 100000)}L - ₹${Math.round(job.salary_max / 100000)}L`
        : 'Competitive',
      description: job.description
        ? job.description.replace(/<[^>]*>/g, '').slice(0, 200) + '...'
        : 'No description available',
      link: job.redirect_url,
      platform: 'Adzuna',
      created: job.created,
      category: job.category?.label || '',
    }));

    res.json({ jobs });
  } catch (err) {
    console.log('Jobs error:', err.message);
    res.status(500).json({ message: err.message });
  }
});

// AI Resume Tailor — only rewrites Summary & Skills
router.post('/tailor-resume', upload.single('resume'), async (req, res) => {
  try {
    const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });
    const { jobDescription } = req.body;

    if (!req.file) return res.status(400).json({ message: 'Resume PDF is required' });
    if (!jobDescription) return res.status(400).json({ message: 'Job description is required' });

    const pdfData = await pdfParse(req.file.buffer);
    const resumeText = pdfData.text;

    const completion = await groq.chat.completions.create({
      model: 'llama-3.3-70b-versatile',
      messages: [{
        role: 'user',
        content: `You are an expert resume writer. Analyze the resume and job description below.

ORIGINAL RESUME:
${resumeText}

JOB DESCRIPTION:
${jobDescription}

Instructions:
1. Rewrite ONLY the Professional Summary section to match the job requirements (2-3 sentences max)
2. Rewrite ONLY the Skills section to highlight matching skills first, then other skills
3. Keep everything else EXACTLY the same — do not change work experience, education, or any other section

Return a JSON object with exactly these two fields:
{
  "summary": "rewritten summary here",
  "skills": "rewritten skills here as comma separated or bullet points matching original format"
}

Output ONLY valid JSON, no explanation.`
      }],
      max_tokens: 1024,
      temperature: 0.5,
    });

    const content = completion.choices[0]?.message?.content;
    const clean = content.replace(/```json|```/g, '').trim();
    const parsed = JSON.parse(clean);

    res.json({
      summary: parsed.summary,
      skills: parsed.skills,
      originalText: resumeText,
    });

  } catch (err) {
    console.log('Resume tailor error:', err.message);
    res.status(500).json({ message: err.message });
  }
});

// AI Gig Description Generator
router.post('/gig-description', async (req, res) => {
  try {
    const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });
    const { title, category, skills } = req.body;

    if (!title) return res.status(400).json({ message: 'Gig title is required' });

    const completion = await groq.chat.completions.create({
      model: 'llama-3.3-70b-versatile',
      messages: [{
        role: 'user',
        content: `You are a Fiverr/Upwork expert. Generate a professional gig listing.

Gig Title: ${title}
Category: ${category || 'General'}
Skills: ${skills || 'Not specified'}

Generate a JSON response with exactly these fields:
{
  "title": "optimized gig title (max 80 chars)",
  "description": "compelling 150-200 word gig description with clear value proposition",
  "skills": ["skill1", "skill2", "skill3", "skill4", "skill5"],
  "price": suggested price in INR as a number
}

Output ONLY valid JSON, no explanation.`
      }],
      max_tokens: 1024,
      temperature: 0.7,
    });

    const content = completion.choices[0]?.message?.content;
    const clean = content.replace(/```json|```/g, '').trim();
    const parsed = JSON.parse(clean);
    res.json(parsed);

  } catch (err) {
    console.log('Gig description error:', err.message);
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
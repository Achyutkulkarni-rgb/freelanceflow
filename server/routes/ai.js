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

// AI Interview Prep
router.post('/interview-prep', async (req, res) => {
  try {
    const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });
    const { jobDescription, skills, experience, jobTitle } = req.body;

    if (!jobDescription && !jobTitle) {
      return res.status(400).json({ message: 'Job description or title is required' });
    }

    const completion = await groq.chat.completions.create({
      model: 'llama-3.3-70b-versatile',
      messages: [{
        role: 'user',
        content: `You are an expert interview coach. Generate 30 interview questions with detailed answers for real company interviews.

Job Title: ${jobTitle || 'Software Developer'}
Skills: ${skills || 'Not specified'}
Experience: ${experience || 'Fresher'}
Job Description: ${jobDescription ? jobDescription.slice(0, 400) : 'Not specified'}

Rules:
- 12 Technical, 8 Behavioral, 6 HR, 4 Company/Role questions
- question: max 120 characters
- answer: detailed 3-5 sentences, practical and specific, minimum 200 characters
- tip: max 80 characters, actionable advice

Return ONLY a compact JSON array:
[{"id":1,"category":"Technical","difficulty":"Easy","question":"...","answer":"...","tip":"..."}]

Output ONLY valid JSON, nothing else.`
      }],
      max_tokens: 8192,
      temperature: 0.5,
    });

    const content = completion.choices[0]?.message?.content;
    const clean = content.replace(/```json|```/g, '').trim();

    let jsonStr = clean;
    if (!jsonStr.endsWith(']')) {
      const lastComplete = jsonStr.lastIndexOf('},');
      if (lastComplete !== -1) {
        jsonStr = jsonStr.slice(0, lastComplete + 1) + ']';
      } else {
        jsonStr = jsonStr + ']';
      }
    }

    const questions = JSON.parse(jsonStr);
    res.json({ questions });

  } catch (err) {
    console.log('Interview prep error:', err.message);
    res.status(500).json({ message: err.message });
  }
});

// AI LinkedIn Bio Generator
router.post('/linkedin-bio', async (req, res) => {
  try {
    const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });
    const { name, currentRole, skills, experience, achievements, education, targetRole } = req.body;

    if (!name && !currentRole && !skills) {
      return res.status(400).json({ message: 'Please provide at least your name, role or skills' });
    }

    const completion = await groq.chat.completions.create({
      model: 'llama-3.3-70b-versatile',
      messages: [{
        role: 'user',
        content: `You are a LinkedIn profile expert who has helped thousands of professionals land jobs at top companies.

Generate a complete LinkedIn profile kit for:
Name: ${name || 'Not specified'}
Current Role: ${currentRole || 'Not specified'}
Skills: ${skills || 'Not specified'}
Experience: ${experience || 'Not specified'}
Achievements: ${achievements || 'Not specified'}
Education: ${education || 'Not specified'}
Target Role: ${targetRole || 'Open to opportunities'}

Return a JSON object with exactly these fields:
{
  "headline": "compelling LinkedIn headline under 220 chars with keywords",
  "about": "professional LinkedIn About section, 3-4 paragraphs, 2000-2600 chars, first person, includes: who you are, what you do, key achievements, skills, call to action",
  "connectionMessage": "personalized connection request message under 300 chars",
  "skills": ["top 10 skills to add on LinkedIn as array"],
  "openToWork": "open to work section text under 200 chars"
}

Make the about section engaging, keyword-rich for recruiters, and authentic.
Output ONLY valid JSON, no explanation.`
      }],
      max_tokens: 2048,
      temperature: 0.7,
    });

    const content = completion.choices[0]?.message?.content;
    const clean = content.replace(/```json|```/g, '').trim();
    const parsed = JSON.parse(clean);
    res.json(parsed);

  } catch (err) {
    console.log('LinkedIn bio error:', err.message);
    res.status(500).json({ message: err.message });
  }
});

// AI Cold Email Generator
router.post('/cold-email', async (req, res) => {
  try {
    const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });
    const { senderName, senderRole, skills, targetCompany, targetRole, recruiterName } = req.body;

    if (!senderName || !targetCompany) {
      return res.status(400).json({ message: 'Your name and target company are required' });
    }

    const completion = await groq.chat.completions.create({
      model: 'llama-3.3-70b-versatile',
      messages: [{
        role: 'user',
        content: `You are an expert at writing cold emails that get responses from recruiters and hiring managers.

Sender: ${senderName}
Sender Role/Title: ${senderRole || 'Software Developer'}
Skills: ${skills || 'Not specified'}
Target Company: ${targetCompany}
Target Role: ${targetRole || 'Software Engineer'}
Recruiter Name: ${recruiterName || 'Hiring Manager'}

Generate 3 different cold email variations:
1. Short & punchy (under 100 words)
2. Value-focused (150-200 words)
3. Story-driven (200-250 words)

Return a JSON object:
{
  "emails": [
    {
      "type": "Short & Punchy",
      "subject": "email subject line",
      "body": "email body"
    },
    {
      "type": "Value-Focused",
      "subject": "email subject line",
      "body": "email body"
    },
    {
      "type": "Story-Driven",
      "subject": "email subject line",
      "body": "email body"
    }
  ]
}

Make emails professional, personalized and compelling. Output ONLY valid JSON.`
      }],
      max_tokens: 2048,
      temperature: 0.7,
    });

    const content = completion.choices[0]?.message?.content;
    const clean = content.replace(/```json|```/g, '').trim();
    const parsed = JSON.parse(clean);
    res.json(parsed);

  } catch (err) {
    console.log('Cold email error:', err.message);
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
const router = require('express').Router();
const Job = require('../models/Job');
const Notification = require('../models/Notification');
const auth = require('../middleware/auth');

// Post a job
router.post('/', auth, async (req, res) => {
  try {
    const job = await Job.create({ ...req.body, client: req.userId });
    res.status(201).json(job);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Get all open jobs
router.get('/', async (req, res) => {
  try {
    const { search, category } = req.query;
    const query = { status: 'open' };
    if (search) query.title = { $regex: search, $options: 'i' };
    if (category) query.category = category;
    const jobs = await Job.find(query)
      .populate('client', 'name avatar')
      .sort({ createdAt: -1 });
    res.json(jobs);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Get single job
router.get('/:id', async (req, res) => {
  try {
    const job = await Job.findById(req.params.id)
      .populate('client', 'name avatar bio')
      .populate('bids.freelancer', 'name avatar rating');
    if (!job) return res.status(404).json({ message: 'Job not found' });
    res.json(job);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Submit a bid
router.post('/:id/bid', auth, async (req, res) => {
  try {
    const { amount, proposal } = req.body;
    const job = await Job.findById(req.params.id);
    if (!job) return res.status(404).json({ message: 'Job not found' });

    const alreadyBid = job.bids.find(b => b.freelancer.toString() === req.userId);
    if (alreadyBid) return res.status(400).json({ message: 'Already submitted a bid' });

    job.bids.push({ freelancer: req.userId, amount, proposal });
    await job.save();

    // Notify client
    await Notification.create({
      user: job.client,
      message: 'Someone placed a bid on your job!',
      type: 'bid',
      link: `/jobs/${job._id}`,
    });

    res.json(job);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
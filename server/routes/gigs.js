const router = require('express').Router();
const Gig = require('../models/Gig');
const auth = require('../middleware/auth');

// Create gig (freelancer only)
router.post('/', auth, async (req, res) => {
  try {
    const gig = await Gig.create({ ...req.body, freelancer: req.userId });
    res.status(201).json(gig);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Get all gigs (with search + filter)
router.get('/', async (req, res) => {
  try {
    const { search, category, minPrice, maxPrice } = req.query;
    const query = {};

    if (search) query.title = { $regex: search, $options: 'i' };
    if (category) query.category = category;
    if (minPrice || maxPrice) {
      query.price = {};
      if (minPrice) query.price.$gte = Number(minPrice);
      if (maxPrice) query.price.$lte = Number(maxPrice);
    }

    const gigs = await Gig.find(query).populate('freelancer', 'name avatar rating');
    res.json(gigs);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Get single gig
router.get('/:id', async (req, res) => {
  try {
    const gig = await Gig.findById(req.params.id).populate('freelancer', 'name avatar bio rating');
    if (!gig) return res.status(404).json({ message: 'Gig not found' });
    res.json(gig);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Update gig
router.put('/:id', auth, async (req, res) => {
  try {
    const gig = await Gig.findById(req.params.id);
    if (!gig) return res.status(404).json({ message: 'Gig not found' });
    if (gig.freelancer.toString() !== req.userId)
      return res.status(403).json({ message: 'Not authorized' });

    const updated = await Gig.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json(updated);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Delete gig
router.delete('/:id', auth, async (req, res) => {
  try {
    const gig = await Gig.findById(req.params.id);
    if (!gig) return res.status(404).json({ message: 'Gig not found' });
    if (gig.freelancer.toString() !== req.userId)
      return res.status(403).json({ message: 'Not authorized' });

    await gig.deleteOne();
    res.json({ message: 'Gig deleted' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
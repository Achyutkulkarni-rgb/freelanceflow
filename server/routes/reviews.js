const router = require('express').Router();
const Review = require('../models/Review');
const Gig = require('../models/Gig');
const Order = require('../models/Order');
const auth = require('../middleware/auth');

// Create review
router.post('/', auth, async (req, res) => {
  try {
    const { gigId, orderId, rating, comment } = req.body;

    const order = await Order.findById(orderId);
    if (!order) return res.status(404).json({ message: 'Order not found' });
    if (order.status !== 'completed')
      return res.status(400).json({ message: 'Order must be completed first' });

    const existing = await Review.findOne({ order: orderId });
    if (existing) return res.status(400).json({ message: 'Already reviewed' });

    const review = await Review.create({
      gig: gigId,
      order: orderId,
      reviewer: req.userId,
      freelancer: order.freelancer,
      rating,
      comment,
    });

    // Update gig rating
    const reviews = await Review.find({ gig: gigId });
    const avgRating = reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length;
    await Gig.findByIdAndUpdate(gigId, { rating: avgRating });

    res.status(201).json(review);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Get reviews for a gig
router.get('/gig/:gigId', async (req, res) => {
  try {
    const reviews = await Review.find({ gig: req.params.gigId })
      .populate('reviewer', 'name avatar')
      .sort({ createdAt: -1 });
    res.json(reviews);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
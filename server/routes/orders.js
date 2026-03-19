const router = require('express').Router();
const Order = require('../models/Order');
const Gig = require('../models/Gig');
const auth = require('../middleware/auth');

// Place order
router.post('/', auth, async (req, res) => {
  try {
    const gig = await Gig.findById(req.body.gigId);
    if (!gig) return res.status(404).json({ message: 'Gig not found' });

    const deliveryDate = new Date();
    deliveryDate.setDate(deliveryDate.getDate() + gig.deliveryDays);

    const order = await Order.create({
      gig: gig._id,
      client: req.userId,
      freelancer: gig.freelancer,
      price: gig.price,
      requirements: req.body.requirements,
      deliveryDate,
    });

    res.status(201).json(order);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Get my orders (client or freelancer)
router.get('/my', auth, async (req, res) => {
  try {
    const orders = await Order.find({
      $or: [{ client: req.userId }, { freelancer: req.userId }]
    })
    .populate('gig', 'title images price')
    .populate('client', 'name avatar')
    .populate('freelancer', 'name avatar')
    .sort({ createdAt: -1 });

    res.json(orders);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Update order status
router.patch('/:id/status', auth, async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);
    if (!order) return res.status(404).json({ message: 'Order not found' });

    order.status = req.body.status;
    await order.save();
    res.json(order);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
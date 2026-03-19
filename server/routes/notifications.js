const router = require('express').Router();
const Notification = require('../models/Notification');
const auth = require('../middleware/auth');

// Get my notifications
router.get('/', auth, async (req, res) => {
  try {
    const notifications = await Notification.find({ user: req.userId })
      .sort({ createdAt: -1 })
      .limit(20);
    res.json(notifications);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Mark all as read
router.put('/read', auth, async (req, res) => {
  try {
    await Notification.updateMany({ user: req.userId }, { read: true });
    res.json({ message: 'All marked as read' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
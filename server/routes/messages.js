const router = require('express').Router();
const Message = require('../models/Message');
const auth = require('../middleware/auth');

router.get('/:userId', auth, async (req, res) => {
  try {
    const messages = await Message.find({
      $or: [
        { sender: req.userId, receiver: req.params.userId },
        { sender: req.params.userId, receiver: req.userId },
      ]
    }).sort({ createdAt: 1 });

    res.json(messages);
  } catch (err) {
    console.log('Message error:', err.message);
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
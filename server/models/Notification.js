const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  message: { type: String, required: true },
  type: { type: String, enum: ['order', 'message', 'review', 'bid'], default: 'order' },
  read: { type: Boolean, default: false },
  link: { type: String, default: '/dashboard' },
}, { timestamps: true });

module.exports = mongoose.model('Notification', notificationSchema);
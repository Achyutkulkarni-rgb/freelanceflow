const mongoose = require('mongoose');

const gigSchema = new mongoose.Schema({
  freelancer: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  title: { type: String, required: true },
  description: { type: String, required: true },
  category: { type: String, required: true },
  price: { type: Number, required: true },
  deliveryDays: { type: Number, required: true },
  images: [String],
  tags: [String],
  rating: { type: Number, default: 0 },
  totalOrders: { type: Number, default: 0 },
}, { timestamps: true });

module.exports = mongoose.model('Gig', gigSchema);
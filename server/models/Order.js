const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema({
  gig: { type: mongoose.Schema.Types.ObjectId, ref: 'Gig', required: true },
  client: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  freelancer: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  status: { type: String, enum: ['pending', 'active', 'delivered', 'completed', 'cancelled'], default: 'pending' },
  price: { type: Number, required: true },
  requirements: { type: String, default: '' },
  deliveryDate: { type: Date },
}, { timestamps: true });

module.exports = mongoose.model('Order', orderSchema);
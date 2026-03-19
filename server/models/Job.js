const mongoose = require('mongoose');

const jobSchema = new mongoose.Schema({
  client: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  title: { type: String, required: true },
  description: { type: String, required: true },
  category: { type: String, required: true },
  budget: { type: Number, required: true },
  deadline: { type: Date },
  skills: [String],
  status: { type: String, enum: ['open', 'closed'], default: 'open' },
  bids: [{
    freelancer: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    amount: Number,
    proposal: String,
    createdAt: { type: Date, default: Date.now }
  }],
}, { timestamps: true });

module.exports = mongoose.model('Job', jobSchema);
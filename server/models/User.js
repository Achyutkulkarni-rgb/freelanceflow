const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: { type: String, enum: ['client', 'freelancer'], default: 'client' },
  avatar: { type: String, default: '' },
  bio: { type: String, default: '' },
  skills: [String],
  experience: { type: String, default: '' },
  location: { type: String, default: '' },
  lookingFor: { type: String, default: '' },
  expectedSalary: { type: String, default: '' },
  availability: { type: String, enum: ['full-time', 'part-time', 'freelance', 'internship'], default: 'freelance' },
  rating: { type: Number, default: 0 },
  totalReviews: { type: Number, default: 0 },
}, { timestamps: true });

module.exports = mongoose.model('User', userSchema);
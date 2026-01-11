const mongoose = require('mongoose');

const RatingSchema = new mongoose.Schema({
  employeeId: String,
  employeeName: String,
  stars: Number,
  comment: String,
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Rating', RatingSchema);
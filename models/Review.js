const mongoose = require('mongoose');

const reviewSchema = new mongoose.Schema({
  projectId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Project',
    required: true,
  },
  mentorId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  pros: {
    type: String,
    required: true,
  },
  cons: {
    type: String,
    required: true,
  },
  feedback: {
    type: String,
    required: true,
  },
  isStartupReady: {
    type: Boolean,
    default: false, // The 'Green Signal'
  },
  isPracticeProject: {
    type: Boolean,
    default: false, // If true, triggers a strike for the student
  }
}, { timestamps: true });

const Review = mongoose.model('Review', reviewSchema);
module.exports = Review;

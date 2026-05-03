const mongoose = require('mongoose');

const projectSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
  },
  description: {
    type: String,
    required: true,
  },
  studentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  domain: {
    type: String,
    required: true, // e.g., 'agriculture', 'healthcare', 'fintech'
  },
  githubLink: {
    type: String,
  },
  liveDemoLink: {
    type: String,
  },
  pitchDeckUrl: {
    type: String, // Optional URL to a PDF presentation
  },
  status: {
    type: String,
    enum: ['pending', 'reviewed', 'green-signal', 'rejected'],
    default: 'pending',
  }
}, { timestamps: true });

const Project = mongoose.model('Project', projectSchema);
module.exports = Project;

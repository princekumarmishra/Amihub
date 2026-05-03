const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');

dotenv.config();

// Import routes - will be handled in the main handler
const authController = require('./controllers/authController');
const projectController = require('./controllers/projectController');
const reviewController = require('./controllers/reviewController');

// Create Express app for serverless
const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// API Routes
app.post('/api/auth/register', authController.registerUser);
app.post('/api/auth/login', authController.loginUser);
app.get('/api/auth/me', authController.getMe);

app.post('/api/projects', projectController.createProject);
app.get('/api/projects', projectController.getProjects);
app.get('/api/projects/my-projects', projectController.getStudentProjects);
app.delete('/api/projects/:id', projectController.deleteProject);

app.get('/api/reviews/mentor-projects', reviewController.getProjectsForMentor);
app.post('/api/reviews', reviewController.submitReview);
app.get('/api/reviews/mentor/:mentorId', reviewController.getMentorReviews);

// Basic Route - Serve frontend
app.get('/', (req, res) => {
  res.sendFile(__dirname + '/public/index.html');
});

// Handle all other routes - serve index.html for SPA routing
app.get('*', (req, res) => {
  res.sendFile(__dirname + '/public/index.html');
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Error:', err.stack);
  res.status(500).json({ 
    message: 'Something went wrong!',
    error: process.env.NODE_ENV === 'production' ? {} : err.stack 
  });
});

// 404 handler
app.use((req, res) => {
  console.log('404 - Route not found:', req.path);
  res.status(404).json({ message: 'Route not found' });
});

// Export for Vercel serverless
module.exports = app;

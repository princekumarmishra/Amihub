// Vercel serverless function
const express = require('express');
const cors = require('cors');

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Mock data for now (will be replaced with Firebase later)
const mockUsers = [];
const mockProjects = [];

// Auth routes
app.post('/api/auth/register', (req, res) => {
  try {
    const { firstName, lastName, email, password, studentId, branch, year, role } = req.body;
    
    // Mock user creation
    const user = {
      uid: 'mock-' + Date.now(),
      firstName,
      lastName,
      email,
      studentId,
      branch,
      year,
      role,
      submissionTracking: {
        currentMonth: new Date().getMonth(),
        currentYear: new Date().getFullYear(),
        submissionsThisMonth: 0,
        lastSubmissionDate: null,
        submissionDates: []
      }
    };
    
    mockUsers.push(user);
    
    res.status(201).json({
      user,
      token: 'mock-token-' + Date.now()
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

app.post('/api/auth/login', (req, res) => {
  try {
    const { email, password } = req.body;
    
    // Mock login - find user or create demo user
    let user = mockUsers.find(u => u.email === email);
    
    if (!user) {
      // Create demo user for testing
      user = {
        uid: 'demo-user',
        firstName: 'Demo',
        lastName: 'Student',
        email: email || 'demo@amihub.com',
        studentId: 'DEMO001',
        branch: 'Computer Science',
        year: '3',
        role: 'student',
        submissionTracking: {
          currentMonth: new Date().getMonth(),
          currentYear: new Date().getFullYear(),
          submissionsThisMonth: 0,
          lastSubmissionDate: null,
          submissionDates: []
        }
      };
      mockUsers.push(user);
    }
    
    res.json({
      user,
      token: 'mock-token-' + Date.now()
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

app.get('/api/auth/me', (req, res) => {
  try {
    // Mock current user (demo user)
    const user = {
      uid: 'demo-user',
      firstName: 'Demo',
      lastName: 'Student',
      email: 'demo@amihub.com',
      studentId: 'DEMO001',
      branch: 'Computer Science',
      year: '3',
      role: 'student',
      submissionTracking: {
        currentMonth: new Date().getMonth(),
        currentYear: new Date().getFullYear(),
        submissionsThisMonth: 0,
        lastSubmissionDate: null,
        submissionDates: []
      }
    };
    
    res.json(user);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Project routes
app.post('/api/projects', (req, res) => {
  try {
    const project = {
      _id: 'project-' + Date.now(),
      ...req.body,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    
    mockProjects.push(project);
    
    res.status(201).json({
      ...project,
      submissionInfo: {
        remainingSubmissions: 0,
        message: `Project submitted successfully! 0 submission slot remaining this month.`
      }
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

app.get('/api/projects', (req, res) => {
  try {
    // Mock projects data
    const projects = [
      {
        _id: '1',
        title: 'AI Study Assistant',
        description: 'An intelligent chatbot that helps students with their studies using NLP and machine learning.',
        domain: 'AI',
        status: 'ongoing',
        studentId: 'demo-user',
        studentName: 'Demo Student',
        createdAt: new Date().toISOString(),
        upvotes: 15,
        comments: 8
      },
      {
        _id: '2',
        title: 'EcoTracker',
        description: 'Mobile app for tracking carbon footprint and suggesting sustainable alternatives.',
        domain: 'Environmental',
        status: 'completed',
        studentId: 'demo-user',
        studentName: 'Demo Student',
        createdAt: new Date().toISOString(),
        upvotes: 23,
        comments: 12
      }
    ];
    
    res.json(projects);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

app.get('/api/projects/my-projects', (req, res) => {
  try {
    // Mock user projects
    const projects = [
      {
        _id: '1',
        title: 'AI Study Assistant',
        description: 'An intelligent chatbot that helps students with their studies using NLP and machine learning.',
        domain: 'AI',
        status: 'ongoing',
        studentId: 'demo-user',
        studentName: 'Demo Student',
        createdAt: new Date().toISOString(),
        upvotes: 15,
        comments: 8
      }
    ];
    
    res.json(projects);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

app.delete('/api/projects/:id', (req, res) => {
  try {
    res.json({ message: 'Project deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Review routes
app.get('/api/reviews/mentor-projects', (req, res) => {
  try {
    res.json([]);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

app.post('/api/reviews', (req, res) => {
  try {
    res.status(201).json({ message: 'Review submitted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

app.get('/api/reviews/mentor/:mentorId', (req, res) => {
  try {
    res.json([]);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Export for Vercel
module.exports = app;

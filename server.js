const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const { firebaseHelpers } = require('./firebase');

dotenv.config();

const app = express();

// Routes
const authRoutes = require('./routes/authRoutes');
const projectRoutes = require('./routes/projectRoutes');
const reviewRoutes = require('./routes/reviewRoutes');

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static('public'));

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/projects', projectRoutes);
app.use('/api/reviews', reviewRoutes);

// Basic Route - Serve frontend
app.get('/', (req, res) => {
  res.sendFile(__dirname + '/public/index.html');
});

// Firebase connection
const PORT = process.env.PORT || 5000;
const HOST = '0.0.0.0'; // Bind to all interfaces for external access

app.listen(PORT, HOST, () => {
  console.log(`Server running on all interfaces, port ${PORT}`);
  console.log('Firebase integration enabled');
  console.log(`Local access: http://localhost:${PORT}`);
  console.log(`Custom hostname: http://amihub:${PORT}`);
  console.log(`Shareable link: http://10.13.65.62:${PORT}`);
});

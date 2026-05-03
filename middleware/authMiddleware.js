const jwt = require('jsonwebtoken');
const { firebaseHelpers } = require('../firebase');

const protect = async (req, res, next) => {
  // Check for demo mode
  if (req.headers.authorization === 'Bearer demo-mode') {
    // Create demo user
    const demoUser = {
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
    
    req.user = demoUser;
    req.demoMode = true;
    return next();
  }

  let token;

  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    token = req.headers.authorization.split(' ')[1];
  }

  if (!token) {
    return res.status(401).json({ message: 'Not authorized, no token' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'supersecretamitykey123');
    const user = await firebaseHelpers.getUserById(decoded.uid);
    
    if (!user) {
      return res.status(401).json({ message: 'Not authorized, user not found' });
    }

    req.user = user;
    next();
  } catch (error) {
    console.error(error);
    return res.status(401).json({ message: 'Not authorized, token failed' });
  }
};

const authorize = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ 
        message: `User role '${req.user.role}' is not authorized to access this route` 
      });
    }
    next();
  };
};

module.exports = { protect, authorize };

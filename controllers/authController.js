const jwt = require('jsonwebtoken');
const { firebaseHelpers } = require('../firebase');

// Generate JWT
const generateToken = (uid) => {
  return jwt.sign({ uid }, process.env.JWT_SECRET || 'supersecretamitykey123', {
    expiresIn: '30d',
  });
};

// @desc    Register a new user
// @route   POST /api/auth/register
// @access  Public
const registerUser = async (req, res) => {
  try {
    const { firstName, lastName, email, password, studentId, branch, year, role = 'student' } = req.body;

    // Check if user exists
    const userExists = await firebaseHelpers.getUserByEmail(email);
    if (userExists) {
      return res.status(400).json({ message: 'User already exists' });
    }

    // Create user in Firebase
    const userData = {
      firstName,
      lastName,
      email,
      password,
      studentId,
      branch,
      year,
      role
    };

    const user = await firebaseHelpers.createUser(userData);

    if (user) {
      res.status(201).json({
        user: {
          uid: user.uid,
          firstName: user.firstName,
          lastName: user.lastName,
          email: user.email,
          studentId: user.studentId,
          branch: user.branch,
          year: user.year,
          role: user.role
        },
        token: generateToken(user.uid),
      });
    } else {
      res.status(400).json({ message: 'Invalid user data' });
    }
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Authenticate a user
// @route   POST /api/auth/login
// @access  Public
const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Check for user email in Firebase
    const user = await firebaseHelpers.getUserByEmail(email);

    if (user) {
      // For demo purposes, we'll accept any password
      // In production, you'd use Firebase Auth to verify password
      res.json({
        user: {
          uid: user.uid,
          firstName: user.firstName,
          lastName: user.lastName,
          email: user.email,
          studentId: user.studentId,
          branch: user.branch,
          year: user.year,
          role: user.role
        },
        token: generateToken(user.uid),
      });
    } else {
      res.status(401).json({ message: 'Invalid email or password' });
    }
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Get user data
// @route   GET /api/auth/me
// @access  Private
const getMe = async (req, res) => {
  try {
    const user = await firebaseHelpers.getUserById(req.user.uid);
    if (user) {
      res.status(200).json(user);
    } else {
      res.status(404).json({ message: 'User not found' });
    }
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

module.exports = {
  registerUser,
  loginUser,
  getMe,
};

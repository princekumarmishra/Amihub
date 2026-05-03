const express = require('express');
const router = express.Router();
const { getReviews, createReview, getProjectReviews } = require('../controllers/reviewController');
const { protect } = require('../middleware/authMiddleware');

// Public routes
router.route('/')
  .get(getReviews)
  .post(protect, createReview);

// Project-specific routes
router.route('/project/:projectId')
  .get(getProjectReviews);

module.exports = router;

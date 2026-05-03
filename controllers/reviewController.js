const { firebaseHelpers } = require('../firebase');

// @desc    Get all reviews
// @route   GET /api/reviews
// @access  Public
const getReviews = async (req, res) => {
  try {
    const reviews = await firebaseHelpers.getAllReviews();
    res.json(reviews);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Create a new review
// @route   POST /api/reviews
// @access  Private
const createReview = async (req, res) => {
  try {
    const user = req.user;
    const { projectId, rating, comment, title } = req.body;

    // Create review in Firebase
    const reviewData = {
      projectId,
      userId: user.uid,
      userName: `${user.firstName} ${user.lastName}`,
      rating: rating || 5,
      comment: comment || '',
      title: title || 'Review'
    };

    const review = await firebaseHelpers.createReview(reviewData);
    res.status(201).json(review);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Get reviews for a specific project
// @route   GET /api/reviews/project/:projectId
// @access  Public
const getProjectReviews = async (req, res) => {
  try {
    const reviews = await firebaseHelpers.getProjectReviews(req.params.projectId);
    res.json(reviews);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

module.exports = {
  getReviews,
  createReview,
  getProjectReviews
};

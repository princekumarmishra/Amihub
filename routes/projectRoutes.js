const express = require('express');
const router = express.Router();
const { 
  createProject, 
  getProjects, 
  getStudentProjects, 
  getProjectById, 
  updateProject, 
  deleteProject 
} = require('../controllers/projectController');
const { protect } = require('../middleware/authMiddleware');

// Public routes
router.route('/')
  .get(getProjects)
  .post(protect, createProject);

// User-specific routes
router.route('/my-projects')
  .get(protect, getStudentProjects);

// Individual project routes
router.route('/:id')
  .get(getProjectById)
  .put(protect, updateProject)
  .delete(protect, deleteProject);

module.exports = router;

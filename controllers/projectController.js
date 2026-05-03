const { firebaseHelpers } = require('../firebase-vercel');

// @desc    Create a new project
// @route   POST /api/projects
// @access  Private
const createProject = async (req, res) => {
  try {
    const user = req.user;
    const { title, domain, description, status, teamSize, skills, github } = req.body;

    // Check monthly submission limit (3 per month)
    const submissionCheck = await checkMonthlySubmissionLimit(user);
    if (!submissionCheck.allowed) {
      return res.status(429).json({ 
        message: submissionCheck.message,
        remainingSubmissions: 0,
        nextResetDate: submissionCheck.nextResetDate
      });
    }

    // Create project in Firebase
    const projectData = {
      title,
      domain: domain || 'Other',
      description,
      status: status || 'planning',
      teamSize: teamSize || 1,
      skills: skills || [],
      github: github || '',
      createdBy: user.uid,
      createdByName: `${user.firstName} ${user.lastName}`
    };

    const project = await firebaseHelpers.createProject(projectData);
    
    // Update user's submission tracking
    await updateSubmissionTracking(user.uid);

    res.status(201).json({
      ...project,
      submissionInfo: {
        remainingSubmissions: submissionCheck.remaining - 1,
        message: `Project submitted successfully! ${submissionCheck.remaining - 1} submission slot remaining this month.`
      }
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Get all projects
// @route   GET /api/projects
// @access  Public
const getProjects = async (req, res) => {
  try {
    const projects = await firebaseHelpers.getAllProjects();
    res.json(projects);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Get logged-in user's projects
// @route   GET /api/projects/my-projects
// @access  Private
const getStudentProjects = async (req, res) => {
  try {
    const projects = await firebaseHelpers.getUserProjects(req.user.uid);
    res.json(projects);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Get project by ID
// @route   GET /api/projects/:id
// @access  Public
const getProjectById = async (req, res) => {
  try {
    const project = await firebaseHelpers.getProjectById(req.params.id);
    if (project) {
      res.json(project);
    } else {
      res.status(404).json({ message: 'Project not found' });
    }
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Update project
// @route   PUT /api/projects/:id
// @access  Private
const updateProject = async (req, res) => {
  try {
    const project = await firebaseHelpers.updateProject(req.params.id, req.body);
    res.json(project);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Delete project
// @route   DELETE /api/projects/:id
// @access  Private
const deleteProject = async (req, res) => {
  try {
    await firebaseHelpers.deleteProject(req.params.id);
    res.json({ message: 'Project deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Check monthly submission limit
async function checkMonthlySubmissionLimit(user) {
  const MAX_SUBMISSIONS_PER_MONTH = 1;
  const currentDate = new Date();
  const currentMonth = currentDate.getMonth();
  const currentYear = currentDate.getFullYear();

  // If user has no submission tracking, initialize it
  if (!user.submissionTracking) {
    return {
      allowed: true,
      remaining: MAX_SUBMISSIONS_PER_MONTH,
      message: 'Submission allowed'
    };
  }

  const tracking = user.submissionTracking;

  // Check if we need to reset for new month
  if (tracking.currentMonth !== currentMonth || tracking.currentYear !== currentYear) {
    return {
      allowed: true,
      remaining: MAX_SUBMISSIONS_PER_MONTH,
      message: 'New month - submissions reset',
      nextResetDate: getNextMonthReset()
    };
  }

  const submissionsThisMonth = tracking.submissionsThisMonth || 0;
  const remaining = MAX_SUBMISSIONS_PER_MONTH - submissionsThisMonth;

  if (remaining <= 0) {
    return {
      allowed: false,
      remaining: 0,
      message: `Monthly project submission slot used. Please try again next month.`,
      nextResetDate: getNextMonthReset()
    };
  }

  return {
    allowed: true,
    remaining: remaining,
    message: `${remaining} project submission slot remaining this month`,
    nextResetDate: getNextMonthReset()
  };
}

// Update submission tracking after project creation
async function updateSubmissionTracking(userId) {
  try {
    const user = await firebaseHelpers.getUserById(userId);
    if (!user) return;

    const currentDate = new Date();
    const currentMonth = currentDate.getMonth();
    const currentYear = currentDate.getFullYear();

    let tracking = user.submissionTracking || {
      currentMonth: currentMonth,
      currentYear: currentYear,
      submissionsThisMonth: 0,
      lastSubmissionDate: null,
      submissionDates: []
    };

    // Reset if new month
    if (tracking.currentMonth !== currentMonth || tracking.currentYear !== currentYear) {
      tracking = {
        currentMonth: currentMonth,
        currentYear: currentYear,
        submissionsThisMonth: 1,
        lastSubmissionDate: currentDate.toISOString(),
        submissionDates: [currentDate.toISOString()]
      };
    } else {
      // Increment submissions
      tracking.submissionsThisMonth += 1;
      tracking.lastSubmissionDate = currentDate.toISOString();
      tracking.submissionDates.push(currentDate.toISOString());
    }

    // Update user in Firebase
    await firebaseHelpers.updateUser(userId, { submissionTracking: tracking });
  } catch (error) {
    console.error('Error updating submission tracking:', error);
  }
}

// Get next month reset date
function getNextMonthReset() {
  const now = new Date();
  const nextMonth = new Date(now.getFullYear(), now.getMonth() + 1, 1);
  return nextMonth.toISOString();
}

module.exports = {
  createProject,
  getProjects,
  getStudentProjects,
  getProjectById,
  updateProject,
  deleteProject,
  checkMonthlySubmissionLimit,
  updateSubmissionTracking
};

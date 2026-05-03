// Dashboard JavaScript for Amihub

const API_BASE_URL = 'http://localhost:5000/api';

// Theme management
function initTheme() {
    const savedTheme = localStorage.getItem('theme') || 'light';
    setTheme(savedTheme);
    setupThemeToggle();
}

function setTheme(theme) {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('theme', theme);
    updateThemeIcon(theme);
}

function toggleTheme() {
    const currentTheme = document.documentElement.getAttribute('data-theme') || 'light';
    const newTheme = currentTheme === 'light' ? 'dark' : 'light';
    setTheme(newTheme);
}

function updateThemeIcon(theme) {
    const themeIcon = document.getElementById('themeIcon');
    if (themeIcon) {
        themeIcon.className = theme === 'dark' ? 'fas fa-sun' : 'fas fa-moon';
    }
}

function setupThemeToggle() {
    const themeToggle = document.getElementById('themeToggle');
    if (themeToggle) {
        themeToggle.addEventListener('click', toggleTheme);
    }
}

// Initialize dashboard
document.addEventListener('DOMContentLoaded', function() {
    initTheme();
    checkAuthStatus();
    loadUserData();
    loadDashboardData();
    setupEventListeners();
});

// Check authentication status
function checkAuthStatus() {
    const token = localStorage.getItem('token');
    const user = localStorage.getItem('user');
    const isDemo = localStorage.getItem('demoMode') === 'true';
    
    if (!token || !user) {
        if (!isDemo) {
            window.location.href = 'login.html';
            return;
        }
    }
    
    currentUser = JSON.parse(user);
}

// Load user data
function loadUserData() {
    const user = JSON.parse(localStorage.getItem('user'));
    
    if (user) {
        // Update user name in header
        const userName = document.getElementById('userName');
        if (userName) {
            userName.textContent = user.firstName || 'Student';
        }
        
        // Update profile section
        updateProfileSection(user);
    }
}

// Update profile section
function updateProfileSection(user) {
    const profileName = document.getElementById('profileName');
    const profileEmail = document.getElementById('profileEmail');
    const profileBranch = document.getElementById('profileBranch');
    const profileYear = document.getElementById('profileYear');
    
    if (profileName) {
        profileName.textContent = `${user.firstName || 'Student'} ${user.lastName || ''}`;
    }
    
    if (profileEmail) {
        profileEmail.textContent = user.email || 'student@amity.edu';
    }
    
    if (profileBranch) {
        profileBranch.textContent = user.branch || 'CSE';
    }
    
    if (profileYear) {
        profileYear.textContent = user.year ? `${user.year} Year` : '3rd Year';
    }
}

// Load dashboard data
async function loadDashboardData() {
    await Promise.all([
        loadMyProjects(),
        loadStats(),
        loadRecentActivity(),
        loadSubmissionStatus()
    ]);
}

// Load user's projects
async function loadMyProjects() {
    try {
        const token = localStorage.getItem('token');
        const user = JSON.parse(localStorage.getItem('user'));
        
        const response = await apiCall('/projects/my-projects');
        
        if (response && response.ok) {
            const projects = await response.json();
            displayMyProjects(projects);
            updateStat('myProjectsCount', projects.length);
        } else {
            // Use mock data for demo
            const mockProjects = getMockMyProjects();
            displayMyProjects(mockProjects);
            updateStat('myProjectsCount', mockProjects.length);
        }
        
    } catch (error) {
        console.log('API not available, using mock data');
        const mockProjects = getMockMyProjects();
        displayMyProjects(mockProjects);
        updateStat('myProjectsCount', mockProjects.length);
    }
}

// Display user's projects
function displayMyProjects(projects) {
    const container = document.getElementById('myProjectsList');
    if (!container) return;
    
    if (projects.length === 0) {
        container.innerHTML = `
            <div class="text-center py-4">
                <i class="fas fa-folder-open fa-3x text-muted mb-3"></i>
                <p class="text-muted">You haven't created any projects yet</p>
                <button class="btn btn-primary" data-bs-toggle="modal" data-bs-target="#addProjectModal">
                    Create Your First Project
                </button>
            </div>
        `;
        return;
    }
    
    container.innerHTML = projects.map(project => `
        <div class="card mb-3 project-card">
            <div class="card-body">
                <div class="row align-items-center">
                    <div class="col-md-8">
                        <div class="d-flex justify-content-between align-items-start mb-2">
                            <h5 class="card-title mb-0">${project.title}</h5>
                            <span class="project-status status-${project.status}">${project.status}</span>
                        </div>
                        <p class="card-text text-muted">${project.description.substring(0, 100)}...</p>
                        <div class="d-flex gap-2">
                            <span class="badge bg-primary">${project.category}</span>
                            <small class="text-muted">
                                <i class="fas fa-users me-1"></i>${project.teamSize} members
                            </small>
                            <small class="text-muted">
                                <i class="fas fa-calendar me-1"></i>${formatDate(project.createdAt)}
                            </small>
                        </div>
                    </div>
                    <div class="col-md-4 text-md-end">
                        <div class="btn-group" role="group">
                            <button class="btn btn-sm btn-outline-primary" onclick="editProject('${project._id}')">
                                <i class="fas fa-edit"></i>
                            </button>
                            <button class="btn btn-sm btn-outline-info" onclick="viewProjectDetails('${project._id}')">
                                <i class="fas fa-eye"></i>
                            </button>
                            <button class="btn btn-sm btn-outline-danger" onclick="deleteProject('${project._id}')">
                                <i class="fas fa-trash"></i>
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    `).join('');
}

// Load statistics
async function loadStats() {
    try {
        // Mock stats for demo
        updateStat('teamMembersCount', 12);
        updateStat('reviewsCount', 8);
        updateStat('achievementsCount', 5);
        
    } catch (error) {
        console.error('Error loading stats:', error);
    }
}

// Load recent activity
async function loadRecentActivity() {
    try {
        const activities = getMockActivities();
        displayRecentActivity(activities);
        
    } catch (error) {
        console.error('Error loading activity:', error);
        const activities = getMockActivities();
        displayRecentActivity(activities);
    }
}

// Display recent activity
function displayRecentActivity(activities) {
    const container = document.getElementById('recentActivity');
    if (!container) return;
    
    container.innerHTML = activities.map(activity => `
        <div class="activity-item mb-3 pb-3 border-bottom">
            <div class="d-flex align-items-start">
                <div class="activity-icon me-3">
                    <i class="fas ${activity.icon} text-primary"></i>
                </div>
                <div class="activity-content flex-grow-1">
                    <p class="mb-1">${activity.description}</p>
                    <small class="text-muted">${formatDate(activity.date)}</small>
                </div>
            </div>
        </div>
    `).join('');
}

// Setup event listeners
function setupEventListeners() {
    // Logout
    const logoutLink = document.getElementById('logoutLink');
    if (logoutLink) {
        logoutLink.addEventListener('click', function(e) {
            e.preventDefault();
            logout();
        });
    }
    
    // Profile form
    const profileForm = document.getElementById('profileForm');
    if (profileForm) {
        profileForm.addEventListener('submit', handleProfileUpdate);
    }
    
    // Save profile button
    const saveProfileBtn = document.getElementById('saveProfileBtn');
    if (saveProfileBtn) {
        saveProfileBtn.addEventListener('click', handleProfileUpdate);
    }
    
    // Add project form
    const addProjectForm = document.getElementById('addProjectForm');
    if (addProjectForm) {
        addProjectForm.addEventListener('submit', handleAddProject);
    }
    
    // Save project button
    const saveProjectBtn = document.getElementById('saveProjectBtn');
    if (saveProjectBtn) {
        saveProjectBtn.addEventListener('click', handleAddProject);
    }
}

// Handle profile update
function handleProfileUpdate(e) {
    e.preventDefault();
    
    const firstName = document.getElementById('editFirstName').value;
    const lastName = document.getElementById('editLastName').value;
    const skills = document.getElementById('editSkills').value;
    const bio = document.getElementById('editBio').value;
    
    const updatedUser = {
        ...currentUser,
        firstName,
        lastName,
        skills: skills.split(',').map(s => s.trim()).filter(s => s),
        bio
    };
    
    // Update localStorage
    localStorage.setItem('user', JSON.stringify(updatedUser));
    currentUser = updatedUser;
    
    // Update UI
    loadUserData();
    
    // Close modal
    const modal = bootstrap.Modal.getInstance(document.getElementById('profileModal'));
    modal.hide();
    
    showMessage('Profile updated successfully!', 'success');
}

// Handle add project
async function handleAddProject(e) {
    e.preventDefault();
    
    const title = document.getElementById('projectTitle').value;
    const category = document.getElementById('projectCategory').value;
    const description = document.getElementById('projectDescription').value;
    const status = document.getElementById('projectStatus').value;
    const teamSize = document.getElementById('projectTeamSize').value;
    const skills = document.getElementById('projectSkills').value.split(',').map(s => s.trim()).filter(s => s);
    const github = document.getElementById('projectGithub').value;
    
    const projectData = {
        title,
        category,
        description,
        status,
        teamSize: parseInt(teamSize),
        skills,
        github
    };
    
    try {
        const response = await apiCall('/projects', {
            method: 'POST',
            body: JSON.stringify(projectData)
        });
        
        if (response && response.ok) {
            const newProject = await response.json();
            loadMyProjects();
            
            // Close modal and reset form
            const modal = bootstrap.Modal.getInstance(document.getElementById('addProjectModal'));
            modal.hide();
            document.getElementById('addProjectForm').reset();
            
            showMessage('Project added successfully!', 'success');
        } else {
            // For demo purposes, add mock project
            const mockProject = {
                _id: Date.now().toString(),
                ...projectData,
                createdBy: `${currentUser.firstName} ${currentUser.lastName}`,
                createdAt: new Date().toISOString()
            };
            
            // Add to mock projects
            const currentProjects = getMockMyProjects();
            currentProjects.unshift(mockProject);
            displayMyProjects(currentProjects);
            updateStat('myProjectsCount', currentProjects.length);
            
            const modal = bootstrap.Modal.getInstance(document.getElementById('addProjectModal'));
            modal.hide();
            document.getElementById('addProjectForm').reset();
            
            showMessage('Project added successfully! (Demo Mode)', 'success');
        }
        
    } catch (error) {
        console.error('Error adding project:', error);
        showMessage('Failed to add project. Please try again.', 'danger');
    }
}

// Edit project
function editProject(projectId) {
    // For demo, show message
    showMessage('Edit feature coming soon!', 'info');
}

// Delete project
function deleteProject(projectId) {
    if (confirm('Are you sure you want to delete this project?')) {
        // For demo, just reload projects
        loadMyProjects();
        showMessage('Project deleted successfully!', 'success');
    }
}

// View project details
function viewProjectDetails(projectId) {
    // For demo, show message
    showMessage('Project details view coming soon!', 'info');
}

// Logout function
function logout() {
    if (isDemoMode()) {
        showMessage('Exiting demo mode...', 'info');
    }
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    localStorage.removeItem('demoMode');
    window.location.href = 'index.html';
}

// Utility functions
function updateStat(elementId, value) {
    const element = document.getElementById(elementId);
    if (element) {
        animateValue(element, 0, value, 1000);
    }
}

function animateValue(element, start, end, duration) {
    const range = end - start;
    const increment = range / (duration / 16);
    let current = start;
    
    const timer = setInterval(() => {
        current += increment;
        if (current >= end) {
            current = end;
            clearInterval(timer);
        }
        element.textContent = Math.floor(current);
    }, 16);
}

function formatDate(dateString) {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now - date);
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) {
        return 'Today';
    } else if (diffDays === 1) {
        return 'Yesterday';
    } else if (diffDays < 7) {
        return `${diffDays} days ago`;
    } else {
        return date.toLocaleDateString('en-US', { 
            month: 'short', 
            day: 'numeric',
            year: date.getFullYear() !== now.getFullYear() ? 'numeric' : undefined
        });
    }
}

function showMessage(message, type = 'info') {
    const toast = document.createElement('div');
    toast.className = `alert alert-${type} position-fixed top-0 end-0 m-3`;
    toast.style.zIndex = '9999';
    toast.textContent = message;
    
    document.body.appendChild(toast);
    
    setTimeout(() => {
        toast.remove();
    }, 3000);
}

// Demo mode functions
function isDemoMode() {
    return localStorage.getItem('demoMode') === 'true';
}

// API helper functions
async function apiCall(endpoint, options = {}) {
    const token = localStorage.getItem('token');
    const defaultOptions = {
        headers: {
            'Content-Type': 'application/json',
            ...(token && { 'Authorization': `Bearer ${token}` })
        }
    };

    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
        ...defaultOptions,
        ...options,
        headers: {
            ...defaultOptions.headers,
            ...options.headers
        }
    });

    if (response.status === 401 && !isDemoMode()) {
        logout();
        return null;
    }

    return response;
}

// Load submission status
async function loadSubmissionStatus() {
    try {
        const user = JSON.parse(localStorage.getItem('user'));
        if (!user) return;
        
        // Calculate submission status using same logic as projects.js
        const submissionStatus = calculateSubmissionStatus(user);
        updateSubmissionDisplay(submissionStatus);
    } catch (error) {
        console.error('Error loading submission status:', error);
    }
}

// Calculate submission status
function calculateSubmissionStatus(user) {
    const MAX_SUBMISSIONS_PER_MONTH = 1;
    const currentDate = new Date();
    const currentMonth = currentDate.getMonth();
    const currentYear = currentDate.getFullYear();
    
    if (!user.submissionTracking) {
        return {
            remaining: MAX_SUBMISSIONS_PER_MONTH,
            message: `You have ${MAX_SUBMISSIONS_PER_MONTH} project submission slot available this month.`,
            nextReset: getNextMonthDisplay(),
            percentage: 0
        };
    }
    
    const tracking = user.submissionTracking;
    
    // Check if we need to reset for new month
    if (tracking.currentMonth !== currentMonth || tracking.currentYear !== currentYear) {
        return {
            remaining: MAX_SUBMISSIONS_PER_MONTH,
            message: `New month! You have ${MAX_SUBMISSIONS_PER_MONTH} project submission slot available.`,
            nextReset: getNextMonthDisplay(),
            percentage: 0
        };
    }
    
    const submissionsThisMonth = tracking.submissionsThisMonth || 0;
    const remaining = MAX_SUBMISSIONS_PER_MONTH - submissionsThisMonth;
    const percentage = (submissionsThisMonth / MAX_SUBMISSIONS_PER_MONTH) * 100;
    
    if (remaining <= 0) {
        return {
            remaining: 0,
            message: `You've used your monthly project submission slot.`,
            nextReset: getNextMonthDisplay(),
            percentage: 100
        };
    }
    
    return {
        remaining: remaining,
        message: `You have ${remaining} project submission slot remaining this month.`,
        nextReset: getNextMonthDisplay(),
        percentage: percentage
    };
}

// Update submission display
function updateSubmissionDisplay(status) {
    const remainingSlots = document.getElementById('remainingSlots');
    const slotStatusText = document.getElementById('slotStatusText');
    const slotDetailsText = document.getElementById('slotDetailsText');
    const slotProgressBar = document.getElementById('slotProgressBar');
    const slotResetText = document.getElementById('slotResetText');
    const slotIndicator = document.getElementById('slotIndicator');
    
    if (remainingSlots) {
        remainingSlots.textContent = status.remaining;
    }
    
    if (slotStatusText) {
        slotStatusText.textContent = status.message;
    }
    
    if (slotDetailsText) {
        slotDetailsText.textContent = `Current month: ${new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}`;
    }
    
    if (slotProgressBar) {
        slotProgressBar.style.width = `${status.percentage}%`;
        slotProgressBar.className = `progress-bar ${status.percentage === 100 ? 'bg-danger' : status.percentage > 0 ? 'bg-warning' : 'bg-success'}`;
    }
    
    if (slotResetText) {
        slotResetText.textContent = `Next reset: ${status.nextReset}`;
    }
    
    if (slotIndicator) {
        const icon = slotIndicator.querySelector('i');
        if (icon) {
            icon.className = `fas fa-circle ${status.remaining === 0 ? 'text-danger' : status.remaining === 1 ? 'text-warning' : 'text-success'}`;
        }
    }
}

// Get next month display
function getNextMonthDisplay() {
    const now = new Date();
    const nextMonth = new Date(now.getFullYear(), now.getMonth() + 1, 1);
    const monthNames = ['January', 'February', 'March', 'April', 'May', 'June', 
                       'July', 'August', 'September', 'October', 'November', 'December'];
    return `${monthNames[nextMonth.getMonth()]} ${nextMonth.getFullYear()}`;
}

// Mock data functions
function getMockMyProjects() {
    const user = JSON.parse(localStorage.getItem('user'));
    return [
        {
            _id: '1',
            title: 'AI Study Assistant',
            description: 'An intelligent chatbot that helps students with their studies using NLP and machine learning.',
            category: 'AI',
            status: 'ongoing',
            teamSize: 4,
            createdBy: `${user.firstName} ${user.lastName}`,
            createdAt: '2024-01-15'
        },
        {
            _id: '2',
            title: 'Campus Event Manager',
            description: 'Mobile app for managing and discovering campus events with RSVP functionality.',
            category: 'Mobile',
            status: 'completed',
            teamSize: 3,
            createdBy: `${user.firstName} ${user.lastName}`,
            createdAt: '2024-02-20'
        }
    ];
}

function getMockActivities() {
    return [
        {
            icon: 'fa-plus',
            description: 'Created new project "AI Study Assistant"',
            date: '2024-03-15'
        },
        {
            icon: 'fa-star',
            description: 'Received 5-star review on "Campus Event Manager"',
            date: '2024-03-14'
        },
        {
            icon: 'fa-user-plus',
            description: 'Joined team for "Smart Attendance System"',
            date: '2024-03-13'
        },
        {
            icon: 'fa-comment',
            description: 'Commented on "IoT Smart Campus" project',
            date: '2024-03-12'
        },
        {
            icon: 'fa-trophy',
            description: 'Achieved "Active Contributor" badge',
            date: '2024-03-10'
        }
    ];
}

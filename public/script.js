// Main JavaScript for Amihub

const API_BASE_URL = 'http://localhost:5000/api';

// Global state
let currentUser = null;
let projects = [];
let currentPage = 1;
const projectsPerPage = 9;

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

// Initialize app
document.addEventListener('DOMContentLoaded', function() {
    initTheme();
    checkAuthStatus();
    loadFeaturedProjects();
    loadStats();
    setupNavigation();
});

// Check authentication status
function checkAuthStatus() {
    const token = localStorage.getItem('token');
    const user = localStorage.getItem('user');
    
    if (token && user) {
        currentUser = JSON.parse(user);
        updateNavigation(true);
    } else {
        if (loginLink) loginLink.classList.remove('d-none');
        if (loginNavItem) loginNavItem.classList.remove('d-none');
        if (logoutNavItem) logoutNavItem.classList.add('d-none');
        if (demoBtn) demoBtn.style.display = 'block';
        updateNavigation(false);
    }
}

// Update navigation based on auth status
function updateNavigation(isLoggedIn) {
    const signInDropdown = document.getElementById('signInDropdown');
    const userDropdown = document.getElementById('userDropdown');
    const dashboardNavItem = document.getElementById('dashboardNavItem');
    const userNameDisplay = document.getElementById('userNameDisplay');
    const demoBtn = document.getElementById('demoBtn');
    
    if (isLoggedIn) {
        if (signInDropdown) signInDropdown.classList.add('d-none');
        if (userDropdown) userDropdown.classList.remove('d-none');
        if (dashboardNavItem) dashboardNavItem.classList.remove('d-none');
        if (demoBtn) demoBtn.style.display = 'none';
        
        const user = JSON.parse(localStorage.getItem('user'));
        if (userNameDisplay && user) {
            userNameDisplay.textContent = `${user.firstName} ${user.lastName}`;
        }
        
        // Add demo indicator if in demo mode
        if (isDemoMode()) {
            addDemoIndicator();
        }
    } else {
        if (signInDropdown) signInDropdown.classList.remove('d-none');
        if (userDropdown) userDropdown.classList.add('d-none');
        if (dashboardNavItem) dashboardNavItem.classList.add('d-none');
        if (demoBtn) demoBtn.style.display = 'block';
        
        // Remove demo indicator if exists
        const demoIndicator = document.getElementById('demoIndicator');
        if (demoIndicator) {
            demoIndicator.remove();
        }
    }
}

// Add role-specific navigation items
function addRoleSpecificNavigation(role) {
    const userDropdown = document.getElementById('userDropdown');
    if (!userDropdown) return;
    
    const dropdownMenu = userDropdown.querySelector('.dropdown-menu');
    if (!dropdownMenu) return;
    
    // Remove existing role-specific items
    const existingRoleItems = dropdownMenu.querySelectorAll('.role-specific');
    existingRoleItems.forEach(item => item.remove());
    
    // Add role-specific menu items
    if (role === 'mentor') {
        const mentorItems = [
            '<li class="role-specific"><a class="dropdown-item" href="mentor-dashboard.html"><i class="fas fa-chalkboard-teacher me-2"></i>Mentor Dashboard</a></li>',
            '<li class="role-specific"><a class="dropdown-item" href="review-projects.html"><i class="fas fa-star me-2"></i>Review Projects</a></li>',
            '<li class="role-specific"><hr class="dropdown-divider"></li>'
        ];
        
        // Insert before the logout divider
        const logoutDivider = dropdownMenu.querySelector('hr.dropdown-divider');
        if (logoutDivider) {
            mentorItems.reverse().forEach(item => {
                logoutDivider.insertAdjacentHTML('beforebegin', item);
            });
        }
    } else if (role === 'student') {
        const studentItems = [
            '<li class="role-specific"><a class="dropdown-item" href="my-projects.html"><i class="fas fa-project-diagram me-2"></i>My Projects</a></li>',
            '<li class="role-specific"><a class="dropdown-item" href="find-mentors.html"><i class="fas fa-search me-2"></i>Find Mentors</a></li>',
            '<li class="role-specific"><hr class="dropdown-divider"></li>'
        ];
        
        // Insert before the logout divider
        const logoutDivider = dropdownMenu.querySelector('hr.dropdown-divider');
        if (logoutDivider) {
            studentItems.reverse().forEach(item => {
                logoutDivider.insertAdjacentHTML('beforebegin', item);
            });
        }
    }
}

// Setup navigation
function setupNavigation() {
    const logoutLink = document.getElementById('logoutLink');
    if (logoutLink) {
        logoutLink.addEventListener('click', function(e) {
            e.preventDefault();
            logout();
        });
    }
}

// Logout function
function logout() {
    if (isDemoMode()) {
        showMessage('Exiting demo mode...', 'info');
    }
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    localStorage.removeItem('demoMode');
    updateNavigation(false);
    showMessage('Logged out successfully', 'info');
    window.location.href = 'index.html';
}

// Load featured projects for homepage
async function loadFeaturedProjects() {
    try {
        const response = await fetch(`${API_BASE_URL}/projects`);
        if (response.ok) {
            projects = await response.json();
            displayFeaturedProjects(projects.slice(0, 3));
        } else {
            // Use mock data if API is not available
            displayFeaturedProjects(getMockProjects().slice(0, 3));
        }
    } catch (error) {
        console.log('API not available, using mock data');
        displayFeaturedProjects(getMockProjects().slice(0, 3));
    }
}

// Display featured projects
function displayFeaturedProjects(projectsData) {
    const container = document.getElementById('featuredProjects');
    if (!container) return;
    
    container.innerHTML = projectsData.map(project => `
        <div class="col-md-4">
            <div class="card h-100 project-card">
                <div class="card-body">
                    <div class="d-flex justify-content-between align-items-start mb-2">
                        <h5 class="card-title">${project.title}</h5>
                        <span class="project-status status-${project.status}">${project.status}</span>
                    </div>
                    <p class="card-text">${project.description.substring(0, 100)}...</p>
                    <div class="mb-2">
                        <small class="text-muted">
                            <i class="fas fa-user me-1"></i>${project.createdByName || project.createdBy}
                        </small>
                    </div>
                    <div class="mb-2">
                        <small class="text-muted">
                            <i class="fas fa-users me-1"></i>Team: ${project.teamSize}
                        </small>
                    </div>
                    <div class="d-flex justify-content-between align-items-center">
                        <span class="badge bg-primary">${getDomainDisplayName(project.domain)}</span>
                        <a href="projects.html" class="btn btn-sm btn-outline-primary">View Details</a>
                    </div>
                </div>
            </div>
        </div>
    `).join('');
}

// Load statistics
async function loadStats() {
    try {
        // Try to get real data from API
        const [projectsRes, usersRes, reviewsRes] = await Promise.all([
            fetch(`${API_BASE_URL}/projects`),
            fetch(`${API_BASE_URL}/auth/users`),
            fetch(`${API_BASE_URL}/reviews`)
        ]);
        
        if (projectsRes.ok) {
            const projects = await projectsRes.json();
            updateStat('totalProjects', projects.length);
        }
        
        if (usersRes.ok) {
            const users = await usersRes.json();
            updateStat('totalUsers', users.length);
        }
        
        if (reviewsRes.ok) {
            const reviews = await reviewsRes.json();
            updateStat('totalReviews', reviews.length);
        }
        
        // Mock mentors count
        updateStat('totalMentors', 15);
        
    } catch (error) {
        console.log('API not available, using mock stats');
        // Use mock data
        updateStat('totalProjects', 42);
        updateStat('totalUsers', 156);
        updateStat('totalMentors', 15);
        updateStat('totalReviews', 89);
    }
}

// Update stat element with animation
function updateStat(elementId, value) {
    const element = document.getElementById(elementId);
    if (element) {
        animateValue(element, 0, value, 1000);
    }
}

// Animate number counting
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

// Mock data for demonstration
function getMockProjects() {
    return [
        {
            _id: '1',
            title: 'AI-Powered Study Assistant',
            description: 'An intelligent chatbot that helps students with their studies using natural language processing and machine learning algorithms.',
            category: 'AI',
            status: 'ongoing',
            teamSize: 4,
            createdBy: 'John Doe',
            skills: ['Python', 'TensorFlow', 'NLP', 'React'],
            github: 'https://github.com/example/study-assistant'
        },
        {
            _id: '2',
            title: 'Campus Navigation App',
            description: 'A mobile application that helps new students navigate the campus with AR-based directions and building information.',
            category: 'Mobile',
            status: 'completed',
            teamSize: 3,
            createdBy: 'Jane Smith',
            skills: ['React Native', 'Firebase', 'AR Core'],
            github: 'https://github.com/example/campus-nav'
        },
        {
            _id: '3',
            title: 'Smart Attendance System',
            description: 'A biometric attendance system using facial recognition to automate student attendance tracking.',
            category: 'AI',
            status: 'planning',
            teamSize: 5,
            createdBy: 'Mike Johnson',
            skills: ['Python', 'OpenCV', 'Flask', 'MongoDB'],
            github: 'https://github.com/example/attendance'
        },
        {
            _id: '4',
            title: 'E-Learning Platform',
            description: 'A comprehensive online learning platform with video lectures, quizzes, and progress tracking.',
            category: 'Web',
            status: 'ongoing',
            teamSize: 6,
            createdBy: 'Sarah Wilson',
            skills: ['MERN Stack', 'WebRTC', 'AWS'],
            github: 'https://github.com/example/elearning'
        },
        {
            _id: '5',
            title: 'IoT Smart Campus',
            description: 'IoT-based system for monitoring and controlling campus infrastructure like lighting, temperature, and security.',
            category: 'IoT',
            status: 'ongoing',
            teamSize: 4,
            createdBy: 'David Brown',
            skills: ['Arduino', 'Raspberry Pi', 'MQTT', 'Node.js'],
            github: 'https://github.com/example/iot-campus'
        },
        {
            _id: '6',
            title: 'Blockchain Certificate System',
            description: 'A decentralized system for issuing and verifying academic certificates using blockchain technology.',
            category: 'Blockchain',
            status: 'planning',
            teamSize: 3,
            createdBy: 'Emily Davis',
            skills: ['Solidity', 'Web3.js', 'Ethereum', 'IPFS'],
            github: 'https://github.com/example/blockchain-cert'
        }
    ];
}

// Utility functions
function formatDate(dateString) {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
        year: 'numeric', 
        month: 'short', 
        day: 'numeric' 
    });
}

function showMessage(message, type = 'info') {
    // Create toast notification
    const toast = document.createElement('div');
    toast.className = `alert alert-${type} position-fixed top-0 end-0 m-3`;
    toast.style.zIndex = '9999';
    toast.textContent = message;
    
    document.body.appendChild(toast);
    
    setTimeout(() => {
        toast.remove();
    }, 3000);
}

// Get display name for domain
function getDomainDisplayName(domain) {
    const domainNames = {
        'AI': 'AI & Machine Learning',
        'Web': 'Web Development',
        'Mobile': 'Mobile Apps',
        'IoT': 'IoT & Hardware',
        'Blockchain': 'Blockchain',
        'Cloud': 'Cloud Computing',
        'Cybersecurity': 'Cybersecurity',
        'Data Science': 'Data Science',
        'Mechanical': 'Mechanical Engineering',
        'Electrical': 'Electrical Engineering',
        'Civil': 'Civil Engineering',
        'Chemical': 'Chemical Engineering',
        'Biotechnology': 'Biotechnology',
        'Environmental': 'Environmental Engineering',
        'Fintech': 'Financial Technology',
        'Ecommerce': 'E-commerce',
        'Healthcare': 'Healthcare',
        'EdTech': 'Educational Technology',
        'AgriTech': 'Agricultural Technology',
        'SocialImpact': 'Social Impact',
        'Other': 'Other'
    };
    return domainNames[domain] || domain;
}

// Demo mode functions
function startDemo() {
    // Set demo mode in localStorage
    localStorage.setItem('demoMode', 'true');
    localStorage.setItem('token', 'demo-mode');
    
    // Set demo user data
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
    
    localStorage.setItem('user', JSON.stringify(demoUser));
    
    // Update UI
    updateNavigation(true);
    showMessage('Demo mode activated! You can explore all features without logging in.', 'success');
    
    // Hide demo button
    const demoBtn = document.getElementById('demoBtn');
    if (demoBtn) {
        demoBtn.style.display = 'none';
    }
    
    // Reload page to update UI
    setTimeout(() => {
        window.location.reload();
    }, 1000);
}

function isDemoMode() {
    return localStorage.getItem('demoMode') === 'true';
}

function exitDemoMode() {
    localStorage.removeItem('demoMode');
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    logout();
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

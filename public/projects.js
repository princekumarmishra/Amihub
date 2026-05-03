// Projects JavaScript for Amihub

const API_BASE_URL = process.env.NODE_ENV === 'production' 
    ? '/api' 
    : 'http://localhost:5000/api';

// Global state
let allProjects = [];
let filteredProjects = [];
let currentPage = 1;
const projectsPerPage = 9;

// Theme management
function initTheme() {
    // Wait for DOM to be ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => {
            initializeTheme();
        });
    } else {
        initializeTheme();
    }
}

function initializeTheme() {
    const savedTheme = localStorage.getItem('theme') || 'light';
    setTheme(savedTheme);
    setupThemeToggle();
}

function setTheme(theme) {
    // Force theme application
    document.documentElement.setAttribute('data-theme', theme);
    
    // Also add class for additional specificity
    document.body.className = document.body.className.replace(/theme-\w+/g, '') + ` theme-${theme}`;
    
    // Store preference
    localStorage.setItem('theme', theme);
    
    // Update icon
    updateThemeIcon(theme);
    
    // Force repaint to ensure theme applies
    document.body.style.display = 'none';
    document.body.offsetHeight; // Force reflow
    document.body.style.display = '';
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
        // Remove existing listeners to prevent duplicates
        themeToggle.replaceWith(themeToggle.cloneNode(true));
        const newToggle = document.getElementById('themeToggle');
        newToggle.addEventListener('click', (e) => {
            e.preventDefault();
            toggleTheme();
        });
    }
}

// Initialize projects page
document.addEventListener('DOMContentLoaded', function() {
    initTheme();
    checkAuthStatus();
    loadProjects();
    setupEventListeners();
    loadSubmissionStatus();
});

// Check authentication status
function checkAuthStatus() {
    const token = localStorage.getItem('token');
    const user = localStorage.getItem('user');
    const addProjectBtn = document.getElementById('addProjectBtn');
    
    if (!token || !user) {
        if (addProjectBtn) {
            addProjectBtn.style.display = 'none';
        }
    } else {
        if (addProjectBtn) {
            addProjectBtn.style.display = 'block';
        }
    }
}

// Setup event listeners
function setupEventListeners() {
    // Search input
    const searchInput = document.getElementById('searchInput');
    if (searchInput) {
        searchInput.addEventListener('input', debounce(handleSearch, 300));
    }
    
    // Filters
    const domainFilter = document.getElementById('domainFilter');
    const statusFilter = document.getElementById('statusFilter');
    
    if (domainFilter) {
        domainFilter.addEventListener('change', applyFilters);
    }
    
    if (statusFilter) {
        statusFilter.addEventListener('change', applyFilters);
    }
    
    // Clear filters
    const clearFilters = document.getElementById('clearFilters');
    if (clearFilters) {
        clearFilters.addEventListener('click', clearAllFilters);
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

// Load projects
async function loadProjects() {
    showLoadingSpinner();
    
    try {
        const response = await apiCall('/projects');
        
        if (response && response.ok) {
            allProjects = await response.json();
            filteredProjects = [...allProjects];
        } else {
            // Use mock data if API is not available
            allProjects = getMockProjects();
            filteredProjects = [...allProjects];
        }
        
        displayProjects();
        hideLoadingSpinner();
        
    } catch (error) {
        console.log('API not available, using mock data');
        allProjects = getMockProjects();
        filteredProjects = [...allProjects];
        displayProjects();
        hideLoadingSpinner();
    }
}

// Display projects
function displayProjects() {
    const container = document.getElementById('projectsGrid');
    if (!container) return;
    
    const startIndex = (currentPage - 1) * projectsPerPage;
    const endIndex = startIndex + projectsPerPage;
    const projectsToShow = filteredProjects.slice(startIndex, endIndex);
    
    if (projectsToShow.length === 0) {
        container.innerHTML = `
            <div class="col-12 text-center py-5">
                <i class="fas fa-folder-open fa-4x text-muted mb-3"></i>
                <h4>No projects found</h4>
                <p class="text-muted">Try adjusting your filters or create a new project</p>
            </div>
        `;
        return;
    }
    
    container.innerHTML = projectsToShow.map(project => `
        <div class="col-md-6 col-lg-4">
            <div class="card h-100 project-card fade-in">
                <div class="card-body">
                    <div class="d-flex justify-content-between align-items-start mb-2">
                        <h5 class="card-title">${project.title}</h5>
                        <span class="project-status status-${project.status}">${project.status}</span>
                    </div>
                    <p class="card-text">${project.description.substring(0, 120)}...</p>
                    
                    <div class="mb-2">
                        <small class="text-muted">
                            <i class="fas fa-user me-1"></i>${project.createdByName || project.createdBy}
                        </small>
                    </div>
                    
                    <div class="mb-2">
                        <small class="text-muted">
                            <i class="fas fa-users me-1"></i>Team: ${project.teamSize} members
                        </small>
                    </div>
                    
                    <div class="mb-3">
                        ${project.skills.map(skill => 
                            `<span class="badge bg-light text-dark me-1">${skill}</span>`
                        ).join('')}
                    </div>
                    
                    <div class="d-flex justify-content-between align-items-center">
                        <span class="badge bg-primary">${getDomainDisplayName(project.domain)}</span>
                        <div>
                            <button class="btn btn-sm btn-outline-primary" onclick="viewProjectDetails('${project._id}')">
                                <i class="fas fa-eye"></i>
                            </button>
                            ${project.github ? `
                                <a href="${project.github}" target="_blank" class="btn btn-sm btn-outline-dark">
                                    <i class="fab fa-github"></i>
                                </a>
                            ` : ''}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    `).join('');
    
    updatePagination();
}

// Update pagination
function updatePagination() {
    const totalPages = Math.ceil(filteredProjects.length / projectsPerPage);
    const pagination = document.getElementById('pagination');
    
    if (!pagination || totalPages <= 1) {
        if (pagination) pagination.innerHTML = '';
        return;
    }
    
    let paginationHTML = '';
    
    // Previous button
    paginationHTML += `
        <li class="page-item ${currentPage === 1 ? 'disabled' : ''}">
            <a class="page-link" href="#" onclick="changePage(${currentPage - 1}); return false;">Previous</a>
        </li>
    `;
    
    // Page numbers
    for (let i = 1; i <= totalPages; i++) {
        if (i === 1 || i === totalPages || (i >= currentPage - 1 && i <= currentPage + 1)) {
            paginationHTML += `
                <li class="page-item ${i === currentPage ? 'active' : ''}">
                    <a class="page-link" href="#" onclick="changePage(${i}); return false;">${i}</a>
                </li>
            `;
        } else if (i === currentPage - 2 || i === currentPage + 2) {
            paginationHTML += `
                <li class="page-item disabled">
                    <a class="page-link" href="#">...</a>
                </li>
            `;
        }
    }
    
    // Next button
    paginationHTML += `
        <li class="page-item ${currentPage === totalPages ? 'disabled' : ''}">
            <a class="page-link" href="#" onclick="changePage(${currentPage + 1}); return false;">Next</a>
        </li>
    `;
    
    pagination.innerHTML = paginationHTML;
}

// Change page
function changePage(page) {
    const totalPages = Math.ceil(filteredProjects.length / projectsPerPage);
    if (page >= 1 && page <= totalPages) {
        currentPage = page;
        displayProjects();
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }
}

// Handle search
function handleSearch(e) {
    const searchTerm = e.target.value.toLowerCase();
    filteredProjects = allProjects.filter(project => 
        project.title.toLowerCase().includes(searchTerm) ||
        project.description.toLowerCase().includes(searchTerm) ||
        project.createdBy.toLowerCase().includes(searchTerm) ||
        project.skills.some(skill => skill.toLowerCase().includes(searchTerm))
    );
    currentPage = 1;
    displayProjects();
}

// Apply filters
function applyFilters() {
    const domainFilter = document.getElementById('domainFilter').value;
    const statusFilter = document.getElementById('statusFilter').value;
    const searchInput = document.getElementById('searchInput').value.toLowerCase();
    
    filteredProjects = allProjects.filter(project => {
        const matchesDomain = !domainFilter || project.domain === domainFilter;
        const matchesStatus = !statusFilter || project.status === statusFilter;
        const matchesSearch = !searchInput || 
            project.title.toLowerCase().includes(searchInput) ||
            project.description.toLowerCase().includes(searchInput) ||
            project.createdBy.toLowerCase().includes(searchInput) ||
            project.skills.some(skill => skill.toLowerCase().includes(searchInput));
        
        return matchesDomain && matchesStatus && matchesSearch;
    });
    
    currentPage = 1;
    displayProjects();
}

// Clear all filters
function clearAllFilters() {
    document.getElementById('domainFilter').value = '';
    document.getElementById('statusFilter').value = '';
    document.getElementById('searchInput').value = '';
    
    filteredProjects = [...allProjects];
    currentPage = 1;
    displayProjects();
}

// Handle add project
async function handleAddProject(e) {
    e.preventDefault();
    
    const token = localStorage.getItem('token');
    if (!token) {
        showMessage('Please login to add a project', 'warning');
        return;
    }
    
    const title = document.getElementById('projectTitle').value;
    const domain = document.getElementById('projectDomain').value;
    const description = document.getElementById('projectDescription').value;
    const status = document.getElementById('projectStatus').value;
    const teamSize = document.getElementById('projectTeamSize').value;
    const skills = document.getElementById('projectSkills').value.split(',').map(s => s.trim()).filter(s => s);
    const github = document.getElementById('projectGithub').value;
    
    const projectData = {
        title,
        domain,
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
            const result = await response.json();
            
            // Show submission info if available
            if (result.submissionInfo) {
                showMessage(result.submissionInfo.message, 'success');
            } else {
                showMessage('Project added successfully!', 'success');
            }
            
            // Close modal and reset form
            const modal = bootstrap.Modal.getInstance(document.getElementById('addProjectModal'));
            if (modal) modal.hide();
            document.getElementById('addProjectForm').reset();
            
            // Reload projects
            await loadProjects();
        } else if (response && response.status === 429) {
            // Handle submission limit exceeded
            const errorData = await response.json();
            showMessage(errorData.message, 'warning');
            
            // Update submission display if available
            updateSubmissionDisplay(errorData.remainingSubmissions || 0);
        } else {
            // For demo purposes, add mock project
            const user = JSON.parse(localStorage.getItem('user'));
            const mockProject = {
                _id: Date.now().toString(),
                ...projectData,
                createdBy: `${user.firstName} ${user.lastName}`,
                createdAt: new Date().toISOString()
            };
            
            allProjects.unshift(mockProject);
            filteredProjects = [...allProjects];
            displayProjects();
            
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

// View project details
function viewProjectDetails(projectId) {
    const project = allProjects.find(p => p._id === projectId);
    if (!project) return;
    
    const modalTitle = document.getElementById('modalProjectTitle');
    const modalContent = document.getElementById('projectDetailsContent');
    
    modalTitle.textContent = project.title;
    modalContent.innerHTML = `
        <div class="row">
            <div class="col-md-8">
                <h6>Description</h6>
                <p>${project.description}</p>
                
                <h6>Category</h6>
                <span class="badge bg-primary">${project.category}</span>
                
                <h6 class="mt-3">Status</h6>
                <span class="project-status status-${project.status}">${project.status}</span>
                
                <h6 class="mt-3">Team Size</h6>
                <p>${project.teamSize} members</p>
                
                <h6>Required Skills</h6>
                <div>
                    ${project.skills.map(skill => 
                        `<span class="badge bg-light text-dark me-1">${skill}</span>`
                    ).join('')}
                </div>
                
                ${project.github ? `
                    <h6 class="mt-3">GitHub Repository</h6>
                    <a href="${project.github}" target="_blank" class="btn btn-outline-dark btn-sm">
                        <i class="fab fa-github me-2"></i>View on GitHub
                    </a>
                ` : ''}
            </div>
            <div class="col-md-4">
                <div class="card">
                    <div class="card-body">
                        <h6>Project Owner</h6>
                        <p class="mb-1"><strong>${project.createdBy}</strong></p>
                        <small class="text-muted">Created ${formatDate(project.createdAt || new Date())}</small>
                        
                        <hr>
                        
                        <button class="btn btn-primary w-100" onclick="joinProject('${project._id}')">
                            <i class="fas fa-user-plus me-2"></i>Join Project
                        </button>
                    </div>
                </div>
            </div>
        </div>
    `;
    
    const modal = new bootstrap.Modal(document.getElementById('projectDetailsModal'));
    modal.show();
}

// Join project
function joinProject(projectId) {
    const token = localStorage.getItem('token');
    if (!token) {
        showMessage('Please login to join a project', 'warning');
        return;
    }
    
    showMessage('Request sent to project owner!', 'success');
    
    // Close modal
    const modal = bootstrap.Modal.getInstance(document.getElementById('projectDetailsModal'));
    modal.hide();
}

// Show/hide loading spinner
function showLoadingSpinner() {
    const spinner = document.getElementById('loadingSpinner');
    if (spinner) spinner.style.display = 'block';
}

function hideLoadingSpinner() {
    const spinner = document.getElementById('loadingSpinner');
    if (spinner) spinner.style.display = 'none';
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

// Load submission status
async function loadSubmissionStatus() {
    const token = localStorage.getItem('token');
    const user = JSON.parse(localStorage.getItem('user'));
    
    if (!token || !user) {
        return;
    }
    
    try {
        // Calculate remaining submissions based on user data
        const submissionStatus = calculateSubmissionStatus(user);
        updateSubmissionDisplay(submissionStatus.remaining, submissionStatus.message);
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
            message: `You have ${MAX_SUBMISSIONS_PER_MONTH} project submission slot available this month.`
        };
    }
    
    const tracking = user.submissionTracking;
    
    // Check if we need to reset for new month
    if (tracking.currentMonth !== currentMonth || tracking.currentYear !== currentYear) {
        return {
            remaining: MAX_SUBMISSIONS_PER_MONTH,
            message: `New month! You have ${MAX_SUBMISSIONS_PER_MONTH} project submission slot available.`
        };
    }
    
    const submissionsThisMonth = tracking.submissionsThisMonth || 0;
    const remaining = MAX_SUBMISSIONS_PER_MONTH - submissionsThisMonth;
    
    if (remaining <= 0) {
        return {
            remaining: 0,
            message: `You've used your monthly project submission slot. Next reset: ${getNextMonthDisplay()}`
        };
    }
    
    return {
        remaining: remaining,
        message: `You have ${remaining} project submission slot remaining this month.`
    };
}

// Update submission display
function updateSubmissionDisplay(remaining, message) {
    const submissionStatus = document.getElementById('submissionStatus');
    const submissionMessage = document.getElementById('submissionMessage');
    const addProjectBtn = document.getElementById('addProjectBtn');
    
    if (submissionStatus && submissionMessage) {
        submissionStatus.classList.remove('d-none');
        submissionMessage.textContent = message;
        
        // Update alert type based on remaining submissions
        submissionStatus.classList.remove('alert-info', 'alert-warning', 'alert-danger');
        
        if (remaining === 0) {
            submissionStatus.classList.add('alert-danger');
            if (addProjectBtn) addProjectBtn.disabled = true;
        } else if (remaining === 1) {
            submissionStatus.classList.add('alert-warning');
            if (addProjectBtn) addProjectBtn.disabled = false;
        } else {
            submissionStatus.classList.add('alert-info');
            if (addProjectBtn) addProjectBtn.disabled = false;
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

// Utility functions
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

function formatDate(dateString) {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
        year: 'numeric', 
        month: 'short', 
        day: 'numeric' 
    });
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

// API helper function
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
    
    return response;
}

// Mock data
function getMockProjects() {
    return [
        {
            _id: '1',
            title: 'AI-Powered Study Assistant',
            description: 'An intelligent chatbot that helps students with their studies using natural language processing and machine learning algorithms. The system provides personalized learning recommendations and answers student queries in real-time.',
            category: 'AI',
            status: 'ongoing',
            teamSize: 4,
            createdBy: 'John Doe',
            skills: ['Python', 'TensorFlow', 'NLP', 'React'],
            github: 'https://github.com/example/study-assistant',
            createdAt: '2024-01-15'
        },
        {
            _id: '2',
            title: 'Campus Navigation App',
            description: 'A mobile application that helps new students navigate the campus with AR-based directions and building information. Features include indoor navigation, event schedules, and campus services directory.',
            category: 'Mobile',
            status: 'completed',
            teamSize: 3,
            createdBy: 'Jane Smith',
            skills: ['React Native', 'Firebase', 'AR Core', 'Node.js'],
            github: 'https://github.com/example/campus-nav',
            createdAt: '2024-02-20'
        },
        {
            _id: '3',
            title: 'Smart Attendance System',
            description: 'A biometric attendance system using facial recognition to automate student attendance tracking. Integrates with existing university systems and provides real-time attendance reports.',
            category: 'AI',
            status: 'planning',
            teamSize: 5,
            createdBy: 'Mike Johnson',
            skills: ['Python', 'OpenCV', 'Flask', 'MongoDB', 'Docker'],
            github: 'https://github.com/example/attendance',
            createdAt: '2024-03-10'
        },
        {
            _id: '4',
            title: 'E-Learning Platform',
            description: 'A comprehensive online learning platform with video lectures, quizzes, and progress tracking. Features include live classes, discussion forums, and AI-powered recommendations.',
            category: 'Web',
            status: 'ongoing',
            teamSize: 6,
            createdBy: 'Sarah Wilson',
            skills: ['MERN Stack', 'WebRTC', 'AWS', 'Redis'],
            github: 'https://github.com/example/elearning',
            createdAt: '2024-01-25'
        },
        {
            _id: '5',
            title: 'IoT Smart Campus',
            description: 'IoT-based system for monitoring and controlling campus infrastructure like lighting, temperature, and security. Includes mobile app for real-time monitoring and alerts.',
            category: 'IoT',
            status: 'ongoing',
            teamSize: 4,
            createdBy: 'David Brown',
            skills: ['Arduino', 'Raspberry Pi', 'MQTT', 'Node.js', 'React'],
            github: 'https://github.com/example/iot-campus',
            createdAt: '2024-02-15'
        },
        {
            _id: '6',
            title: 'Blockchain Certificate System',
            description: 'A decentralized system for issuing and verifying academic certificates using blockchain technology. Ensures tamper-proof verification of academic credentials.',
            category: 'Blockchain',
            status: 'planning',
            teamSize: 3,
            createdBy: 'Emily Davis',
            skills: ['Solidity', 'Web3.js', 'Ethereum', 'IPFS', 'React'],
            github: 'https://github.com/example/blockchain-cert',
            createdAt: '2024-03-05'
        },
        {
            _id: '7',
            title: 'Mental Health Support Bot',
            description: 'AI-powered chatbot for student mental health support with mood tracking, meditation guides, and connection to counseling services. Maintains privacy and provides 24/7 support.',
            category: 'AI',
            status: 'ongoing',
            teamSize: 4,
            createdBy: 'Alex Chen',
            skills: ['Python', 'NLP', 'TensorFlow', 'Flask', 'MongoDB'],
            github: 'https://github.com/example/mental-health-bot',
            createdAt: '2024-02-28'
        },
        {
            _id: '8',
            title: 'Campus Food Delivery',
            description: 'Mobile app for ordering food from campus cafeterias and nearby restaurants with real-time tracking and student discounts. Features meal planning and nutritional information.',
            category: 'Mobile',
            status: 'completed',
            teamSize: 5,
            createdBy: 'Lisa Anderson',
            skills: ['Flutter', 'Firebase', 'Google Maps API', 'Node.js'],
            github: 'https://github.com/example/food-delivery',
            createdAt: '2024-01-10'
        },
        {
            _id: '9',
            title: 'Virtual Lab Simulator',
            description: 'Web-based virtual laboratory for conducting science experiments remotely. Includes realistic simulations, data collection, and analysis tools for various science disciplines.',
            category: 'Web',
            status: 'ongoing',
            teamSize: 7,
            createdBy: 'Robert Taylor',
            skills: ['Three.js', 'WebGL', 'React', 'Python', 'Django'],
            github: 'https://github.com/example/virtual-lab',
            createdAt: '2024-03-01'
        }
    ];
}

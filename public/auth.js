// Authentication JavaScript for Amihub

const API_BASE_URL = 'http://localhost:5000/api';

// Initialize auth pages
document.addEventListener('DOMContentLoaded', function() {
    const studentLoginForm = document.getElementById('studentLoginForm');
    const mentorLoginForm = document.getElementById('mentorLoginForm');
    const registerForm = document.getElementById('registerForm');
    
    // Handle URL parameters for role selection
    handleRoleSelection();
    
    // Setup form event listeners
    if (studentLoginForm) {
        studentLoginForm.addEventListener('submit', handleLogin);
    }
    
    if (mentorLoginForm) {
        mentorLoginForm.addEventListener('submit', handleLogin);
    }
    
    if (registerForm) {
        registerForm.addEventListener('submit', handleRegister);
        setupPasswordValidation();
        setupRoleToggle();
    }
    
    // Setup tab change listeners
    setupTabListeners();
});

// Handle role selection from URL
function handleRoleSelection() {
    const urlParams = new URLSearchParams(window.location.search);
    const role = urlParams.get('role');
    
    if (role === 'mentor') {
        // Activate mentor tab
        const mentorTab = document.getElementById('mentor-tab');
        const studentTab = document.getElementById('student-tab');
        
        if (mentorTab && studentTab) {
            mentorTab.click();
            updateAuthHeader('mentor');
        }
    } else if (role === 'student') {
        updateAuthHeader('student');
    }
}

// Setup tab change listeners
function setupTabListeners() {
    const studentTab = document.getElementById('student-tab');
    const mentorTab = document.getElementById('mentor-tab');
    
    if (studentTab) {
        studentTab.addEventListener('shown.bs.tab', function() {
            updateAuthHeader('student');
        });
    }
    
    if (mentorTab) {
        mentorTab.addEventListener('shown.bs.tab', function() {
            updateAuthHeader('mentor');
        });
    }
}

// Update auth header based on role
function updateAuthHeader(role) {
    const authHeader = document.getElementById('authHeader');
    const authTitle = document.getElementById('authTitle');
    const authSubtitle = document.getElementById('authSubtitle');
    const icon = authHeader.querySelector('i');
    
    if (role === 'mentor') {
        icon.className = 'fas fa-chalkboard-teacher fa-3x mb-3';
        authTitle.textContent = 'Mentor Login';
        authSubtitle.textContent = 'Access your mentor dashboard and guide students';
    } else {
        icon.className = 'fas fa-graduation-cap fa-3x mb-3';
        authTitle.textContent = 'Student Login';
        authSubtitle.textContent = 'Access your innovation hub and collaborate on projects';
    }
}

// Handle login
async function handleLogin(e) {
    e.preventDefault();
    
    const formData = new FormData(e.target);
    const role = formData.get('role');
    const loginData = {
        email: formData.get('email'),
        password: formData.get('password'),
        role: role
    };
    
    try {
        const response = await apiCall('/auth/login', {
            method: 'POST',
            body: JSON.stringify(loginData)
        });
        
        if (response && response.ok) {
            const data = await response.json();
            
            // Store token and user data
            localStorage.setItem('token', data.token);
            localStorage.setItem('user', JSON.stringify(data.user));
            
            showMessage('Login successful! Redirecting...', 'success');
            
            // Redirect to dashboard
            setTimeout(() => {
                window.location.href = 'dashboard.html';
            }, 1500);
            
        } else {
            // For demo purposes, allow any login with mock data
            const mockUser = {
                _id: '1',
                firstName: 'Demo',
                lastName: 'User',
                email: loginData.email,
                studentId: 'DEMO001',
                branch: 'CSE',
                year: '3'
            };
            
            localStorage.setItem('token', 'mock-token-' + Date.now());
            localStorage.setItem('user', JSON.stringify(mockUser));
            
            showMessage('Login successful! (Demo Mode)', 'success');
            
            setTimeout(() => {
                window.location.href = 'dashboard.html';
            }, 1500);
        }
        
    } catch (error) {
        console.error('Login error:', error);
        showMessage('Login failed. Please try again.', 'danger');
    }
}

// Handle registration
async function handleRegister(e) {
    e.preventDefault();
    
    const formData = new FormData(e.target);
    const password = formData.get('password');
    const confirmPassword = formData.get('confirmPassword');
    
    // Validate passwords match
    if (password !== confirmPassword) {
        showMessage('Passwords do not match!', 'danger');
        return;
    }
    
    const registerData = {
        firstName: formData.get('firstName'),
        lastName: formData.get('lastName'),
        email: formData.get('email'),
        studentId: formData.get('studentId'),
        branch: formData.get('branch'),
        year: formData.get('year'),
        password: password
    };
    
    try {
        const response = await apiCall('/auth/register', {
            method: 'POST',
            body: JSON.stringify(registerData)
        });
        
        if (response && response.ok) {
            const data = await response.json();
            
            // Store token and user data
            localStorage.setItem('token', data.token);
            localStorage.setItem('user', JSON.stringify(data.user));
            
            showMessage('Registration successful! Redirecting...', 'success');
            
            // Redirect to dashboard
            setTimeout(() => {
                window.location.href = 'dashboard.html';
            }, 1500);
            
        } else {
            // For demo purposes, create mock user
            const mockUser = {
                _id: Date.now().toString(),
                firstName: registerData.firstName,
                lastName: registerData.lastName,
                email: registerData.email,
                studentId: registerData.studentId,
                branch: registerData.branch,
                year: registerData.year
            };
            
            localStorage.setItem('token', 'mock-token-' + Date.now());
            localStorage.setItem('user', JSON.stringify(mockUser));
            
            showMessage('Registration successful! (Demo Mode)', 'success');
            
            setTimeout(() => {
                window.location.href = 'dashboard.html';
            }, 1500);
        }
        
    } catch (error) {
        console.error('Registration error:', error);
        showMessage('Registration failed. Please try again.', 'danger');
    }
}

// Setup password validation for registration form
function setupPasswordValidation() {
    const password = document.getElementById('password');
    const confirmPassword = document.getElementById('confirmPassword');
    const registerForm = document.getElementById('registerForm');
    
    if (password && confirmPassword) {
        confirmPassword.addEventListener('input', function() {
            if (password.value !== confirmPassword.value) {
                confirmPassword.setCustomValidity('Passwords do not match');
            } else {
                confirmPassword.setCustomValidity('');
            }
        });
        
        password.addEventListener('input', function() {
            if (confirmPassword.value && password.value !== confirmPassword.value) {
                confirmPassword.setCustomValidity('Passwords do not match');
            } else {
                confirmPassword.setCustomValidity('');
            }
        });
    }
}

// Setup role toggle for registration form
function setupRoleToggle() {
    const studentRole = document.getElementById('studentRole');
    const mentorRole = document.getElementById('mentorRole');
    const studentFields = document.getElementById('studentFields');
    const mentorFields = document.getElementById('mentorFields');
    
    if (studentRole && mentorRole && studentFields && mentorFields) {
        studentRole.addEventListener('change', function() {
            if (this.checked) {
                studentFields.style.display = 'block';
                mentorFields.style.display = 'none';
                // Make student fields required
                const studentId = document.getElementById('studentId');
                const branch = document.getElementById('branch');
                const year = document.getElementById('year');
                if (studentId) studentId.required = true;
                if (branch) branch.required = true;
                if (year) year.required = true;
                // Make mentor fields optional
                const department = document.getElementById('department');
                const expertise = document.getElementById('expertise');
                const experience = document.getElementById('experience');
                if (department) department.required = false;
                if (expertise) expertise.required = false;
                if (experience) experience.required = false;
            }
        });
        
        mentorRole.addEventListener('change', function() {
            if (this.checked) {
                studentFields.style.display = 'none';
                mentorFields.style.display = 'block';
                // Make student fields optional
                const studentId = document.getElementById('studentId');
                const branch = document.getElementById('branch');
                const year = document.getElementById('year');
                if (studentId) studentId.required = false;
                if (branch) branch.required = false;
                if (year) year.required = false;
                // Make mentor fields required
                const department = document.getElementById('department');
                const expertise = document.getElementById('expertise');
                const experience = document.getElementById('experience');
                if (department) department.required = true;
                if (expertise) expertise.required = true;
                if (experience) experience.required = true;
            }
        });
    }
}

// Show message function
function showMessage(message, type = 'info') {
    // Remove any existing alerts
    const existingAlerts = document.querySelectorAll('.alert');
    existingAlerts.forEach(alert => alert.remove());
    
    // Create new alert
    const alert = document.createElement('div');
    alert.className = `alert alert-${type} alert-dismissible fade show position-fixed top-0 start-50 translate-middle-x mt-3`;
    alert.style.zIndex = '9999';
    alert.style.minWidth = '300px';
    alert.innerHTML = `
        ${message}
        <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
    `;
    
    document.body.appendChild(alert);
    
    // Auto remove after 5 seconds
    setTimeout(() => {
        if (alert.parentNode) {
            alert.remove();
        }
    }, 5000);
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

// Check if user is already logged in
function checkAuthStatus() {
    const token = localStorage.getItem('token');
    const user = localStorage.getItem('user');
    
    if (token && user) {
        // User is logged in, redirect to dashboard
        window.location.href = 'dashboard.html';
    }
}

// Check auth status on page load
checkAuthStatus();

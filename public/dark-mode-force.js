// AGGRESSIVE DARK MODE FIX - Force text visibility
function forceDarkMode() {
    // Apply dark mode styles aggressively
    const isDark = document.documentElement.getAttribute('data-theme') === 'dark';
    
    if (isDark) {
        // Force background and text colors
        document.body.style.backgroundColor = '#1a1a1a';
        document.body.style.color = '#ffffff';
        
        // Apply to ALL elements
        const allElements = document.querySelectorAll('*');
        allElements.forEach(element => {
            // Force white text on dark background
            element.style.color = '#ffffff';
            
            // Special handling for specific elements
            if (element.classList.contains('navbar')) {
                element.style.backgroundColor = '#1a1a1a';
                element.style.color = '#ffffff';
            }
            
            if (element.classList.contains('card')) {
                element.style.backgroundColor = '#2d2d2d';
                element.style.color = '#ffffff';
            }
            
            if (element.classList.contains('form-control')) {
                element.style.backgroundColor = '#2d2d2d';
                element.style.color = '#ffffff';
                element.style.borderColor = '#404040';
            }
            
            if (element.tagName === 'A' && !element.classList.contains('navbar-brand')) {
                element.style.color = '#007bff';
            }
            
            if (element.classList.contains('text-muted') || element.classList.contains('text-secondary')) {
                element.style.color = '#b3b3b3';
            }
        });
        
        // Force navbar specifically
        const navbar = document.querySelector('.navbar');
        if (navbar) {
            navbar.style.backgroundColor = '#1a1a1a';
            navbar.style.color = '#ffffff';
        }
        
        // Force all cards
        const cards = document.querySelectorAll('.card');
        cards.forEach(card => {
            card.style.backgroundColor = '#2d2d2d';
            card.style.color = '#ffffff';
        });
        
        // Force all forms
        const forms = document.querySelectorAll('.form-control');
        forms.forEach(form => {
            form.style.backgroundColor = '#2d2d2d';
            form.style.color = '#ffffff';
            form.style.borderColor = '#404040';
        });
    } else {
        // Reset to light mode
        document.body.style.backgroundColor = '';
        document.body.style.color = '';
        
        const allElements = document.querySelectorAll('*');
        allElements.forEach(element => {
            element.style.color = '';
            element.style.backgroundColor = '';
            element.style.borderColor = '';
        });
    }
}

// Override the theme toggle function
function toggleTheme() {
    const currentTheme = document.documentElement.getAttribute('data-theme') || 'light';
    const newTheme = currentTheme === 'light' ? 'dark' : 'light';
    
    // Set theme attribute
    document.documentElement.setAttribute('data-theme', newTheme);
    
    // Store preference
    localStorage.setItem('theme', newTheme);
    
    // Update icon
    const themeIcon = document.getElementById('themeIcon');
    if (themeIcon) {
        themeIcon.className = newTheme === 'dark' ? 'fas fa-sun' : 'fas fa-moon';
    }
    
    // Force apply dark mode
    setTimeout(() => {
        forceDarkMode();
    }, 100);
}

// Apply force dark mode on page load
document.addEventListener('DOMContentLoaded', function() {
    const savedTheme = localStorage.getItem('theme') || 'light';
    document.documentElement.setAttribute('data-theme', savedTheme);
    
    // Update icon
    const themeIcon = document.getElementById('themeIcon');
    if (themeIcon) {
        themeIcon.className = savedTheme === 'dark' ? 'fas fa-sun' : 'fas fa-moon';
    }
    
    // Force apply theme
    setTimeout(() => {
        forceDarkMode();
    }, 100);
    
    // Setup theme toggle
    const themeToggle = document.getElementById('themeToggle');
    if (themeToggle) {
        themeToggle.addEventListener('click', toggleTheme);
    }
});

// Also apply force dark mode periodically to override any changes
setInterval(forceDarkMode, 1000);

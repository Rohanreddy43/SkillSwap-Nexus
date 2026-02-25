// Habit data structure
const habits = [
    "Daily Exercise",
    "Bed Before 11:00 PM",
    "Protein Intake: 1× bodyweight (grams)",
    "Eat Vegetables/Fruits",
    "Call Grand Parents/ Parents/ Friend",
    "No Junk / Mindless Snacking",
    "Work on Personal Goal",
    "Water Plants",
    "Read 5 Pages (Any Book)",
    "Morning Sunlight (5–10 min)"
];

const totalDays = 31;

// Current logged in user
let currentUser = null;

// Store habit data
let habitData = {};

// Initialize the tracker
function init() {
    checkAuth();
    
    // Add event listener for start date
    document.getElementById('startDate').addEventListener('change', function(e) {
        saveToStorage();
    });

    // Handle Enter key on login form
    document.getElementById('password').addEventListener('keypress', function(e) {
        if (e.key === 'Enter') login();
    });
    
    document.getElementById('confirmPassword').addEventListener('keypress', function(e) {
        if (e.key === 'Enter') register();
    });
}

// Check authentication status
function checkAuth() {
    // Use localStorage to persist login across browser sessions
    const storedUser = localStorage.getItem('currentUser');
    if (storedUser) {
        currentUser = JSON.parse(storedUser);
        loadFromStorage();
        showMainContent();
        renderHabits();
        calculateAllStats();
    } else {
        showLogin();
    }
}

// Show login/register form
function showLogin() {
    document.getElementById('loginOverlay').style.display = 'flex';
    document.getElementById('mainContent').style.display = 'none';
}

// Show main content after login
function showMainContent() {
    document.getElementById('loginOverlay').style.display = 'none';
    document.getElementById('mainContent').style.display = 'block';
}

// Toggle between login and register forms
function toggleAuth() {
    const loginForm = document.getElementById('loginForm');
    const registerForm = document.getElementById('registerForm');
    const toggleText = document.getElementById('toggleText');
    const loginError = document.getElementById('loginError');
    const registerError = document.getElementById('registerError');

    // Clear errors
    loginError.textContent = '';
    registerError.textContent = '';
    
    // Clear form fields
    document.getElementById('username').value = '';
    document.getElementById('password').value = '';
    document.getElementById('newUsername').value = '';
    document.getElementById('newPassword').value = '';
    document.getElementById('confirmPassword').value = '';

    if (loginForm.style.display === 'none') {
        loginForm.style.display = 'block';
        registerForm.style.display = 'none';
        toggleText.innerHTML = 'Don\'t have an account? <a href="#" onclick="toggleAuth()">Register</a>';
    } else {
        loginForm.style.display = 'none';
        registerForm.style.display = 'block';
        toggleText.innerHTML = 'Already have an account? <a href="#" onclick="toggleAuth()">Login</a>';
    }
}

// Register new user
function register() {
    const username = document.getElementById('newUsername').value.trim();
    const password = document.getElementById('newPassword').value;
    const confirmPassword = document.getElementById('confirmPassword').value;
    const errorEl = document.getElementById('registerError');

    errorEl.textContent = '';

    // Validation
    if (!username || !password) {
        errorEl.textContent = 'Please fill in all fields';
        return;
    }

    if (username.length < 3) {
        errorEl.textContent = 'Username must be at least 3 characters';
        return;
    }

    if (password.length < 4) {
        errorEl.textContent = 'Password must be at least 4 characters';
        return;
    }

    if (password !== confirmPassword) {
        errorEl.textContent = 'Passwords do not match';
        return;
    }

    // Get existing users
    const users = JSON.parse(localStorage.getItem('habitTrackerUsers') || '{}');

    // Check if username exists
    if (users[username]) {
        errorEl.textContent = 'Username already exists';
        return;
    }

    // Create new user with hashed password (simple hash for demo)
    users[username] = {
        password: btoa(password), // Simple encoding (not secure for production)
        createdAt: new Date().toISOString()
    };

    localStorage.setItem('habitTrackerUsers', JSON.stringify(users));

    // Auto login after registration - persist with localStorage
    currentUser = { username: username };
    localStorage.setItem('currentUser', JSON.stringify(currentUser));

    // Initialize empty habit data for new user
    initializeHabitData();

    showMainContent();
    renderHabits();
    calculateAllStats();
}

// Login existing user
function login() {
    const username = document.getElementById('username').value.trim();
    const password = document.getElementById('password').value;
    const errorEl = document.getElementById('loginError');

    errorEl.textContent = '';

    if (!username || !password) {
        errorEl.textContent = 'Please enter username and password';
        return;
    }

    // Get users
    const users = JSON.parse(localStorage.getItem('habitTrackerUsers') || '{}');
    const user = users[username];

    // Check credentials
    if (!user || atob(user.password) !== password) {
        errorEl.textContent = 'Invalid username or password';
        return;
    }

    // Login successful - persist with localStorage
    currentUser = { username: username };
    localStorage.setItem('currentUser', JSON.stringify(currentUser));

    loadFromStorage();
    showMainContent();
    renderHabits();
    calculateAllStats();
}

// Logout - remove from localStorage to require re-login
function logout() {
    localStorage.removeItem('currentUser');
    currentUser = null;
    habitData = {};
    
    // Clear form fields
    document.getElementById('username').value = '';
    document.getElementById('password').value = '';
    
    showLogin();
}

// Load data from localStorage for current user
function loadFromStorage() {
    if (!currentUser) return;
    
    const stored = localStorage.getItem(`habitTrackerData_${currentUser.username}`);
    if (stored) {
        habitData = JSON.parse(stored);
    } else {
        initializeHabitData();
    }
}

// Initialize empty habit data
function initializeHabitData() {
    habitData = {};
    habits.forEach(habit => {
        habitData[habit] = {};
        for (let i = 1; i <= totalDays; i++) {
            habitData[habit][i] = false;
        }
    });
}

// Save data to localStorage
function saveToStorage() {
    if (!currentUser) return;
    localStorage.setItem(`habitTrackerData_${currentUser.username}`, JSON.stringify(habitData));
}

// Render habit rows in the table
function renderHabits() {
    const tbody = document.getElementById('habitBody');
    tbody.innerHTML = '';

    habits.forEach((habit, index) => {
        const row = document.createElement('tr');
        row.className = 'habit-row';
        row.setAttribute('data-habit', habit);

        // Habit name cell
        const nameCell = document.createElement('td');
        nameCell.textContent = habit;
        row.appendChild(nameCell);

        // Day checkboxes (1-31)
        for (let day = 1; day <= totalDays; day++) {
            const cell = document.createElement('td');
            cell.className = 'checkbox-cell';
            
            const checkbox = document.createElement('input');
            checkbox.type = 'checkbox';
            checkbox.checked = habitData[habit] && habitData[habit][day] === true;
            
            checkbox.addEventListener('change', function() {
                habitData[habit][day] = this.checked;
                saveToStorage();
                calculateAllStats();
            });

            cell.appendChild(checkbox);
            row.appendChild(cell);
        }

        // Finished days count
        const finishedCell = document.createElement('td');
        finishedCell.className = 'finished-days';
        finishedCell.setAttribute('data-finished', habit);
        row.appendChild(finishedCell);

        // Consistency score
        const scoreCell = document.createElement('td');
        scoreCell.className = 'consistency-score';
        scoreCell.setAttribute('data-score', habit);
        row.appendChild(scoreCell);

        tbody.appendChild(row);
    });

    // Calculate and display finished days and consistency scores
    updateHabitStats();
}

// Update stats for each habit
function updateHabitStats() {
    habits.forEach(habit => {
        const finished = Object.values(habitData[habit] || {}).filter(v => v === true).length;
        const consistency = totalDays > 0 ? Math.round((finished / totalDays) * 100) : 0;
        
        const finishedCell = document.querySelector(`[data-finished="${habit}"]`);
        const scoreCell = document.querySelector(`[data-score="${habit}"]`);
        
        if (finishedCell) finishedCell.textContent = finished;
        if (scoreCell) scoreCell.textContent = '|'.repeat(Math.floor(consistency / 4)) + ' ' + consistency + '%';
    });
}

// Calculate all statistics
function calculateAllStats() {
    updateHabitStats();

    let fullyAchieved = 0;      // Habits with 100% completion
    let halfAchieved = 0;       // Habits with >50% completion
    let lazyDays = 0;           // Days with 0% completion

    const habitCompletion = {};

    // Calculate completion for each habit
    habits.forEach(habit => {
        const finished = Object.values(habitData[habit] || {}).filter(v => v === true).length;
        const percentage = totalDays > 0 ? (finished / totalDays) * 100 : 0;
        
        habitCompletion[habit] = percentage;

        if (percentage === 100) fullyAchieved++;
        if (percentage > 50) halfAchieved++;
    });

    // Calculate lazy days (days where NO habits were completed)
    for (let day = 1; day <= totalDays; day++) {
        let completedCount = 0;
        habits.forEach(habit => {
            if (habitData[habit] && habitData[habit][day] === true) {
                completedCount++;
            }
        });
        if (completedCount === 0) {
            lazyDays++;
        }
    }

    // Find best and worst habits
    let bestHabit = '-';
    let worstHabit = '-';
    let maxPercentage = -1;
    let minPercentage = 101;

    habits.forEach(habit => {
        const percentage = habitCompletion[habit];
        if (percentage > maxPercentage) {
            maxPercentage = percentage;
            bestHabit = habit;
        }
        if (percentage < minPercentage) {
            minPercentage = percentage;
            worstHabit = habit;
        }
    });

    // Update UI
    document.getElementById('fullyAchieved').textContent = fullyAchieved;
    document.getElementById('halfAchieved').textContent = halfAchieved;
    document.getElementById('lazyDays').textContent = lazyDays;
    document.getElementById('bestHabit').textContent = bestHabit;
    document.getElementById('worstHabit').textContent = worstHabit;

    // Update tasks completed and percentage per day
    updateDailyStats();
}

// Update daily statistics (tasks completed and % completed)
function updateDailyStats() {
    const tasksCompletedEl = document.getElementById('tasksCompleted');
    const percentCompletedEl = document.getElementById('percentCompleted');
    
    const totalHabits = habits.length;
    let tasksCompletedHTML = '';
    let percentCompletedHTML = '';

    for (let day = 1; day <= totalDays; day++) {
        let completedCount = 0;
        habits.forEach(habit => {
            if (habitData[habit] && habitData[habit][day] === true) {
                completedCount++;
            }
        });

        const percentage = totalHabits > 0 ? Math.round((completedCount / totalHabits) * 100) : 0;
        
        tasksCompletedHTML += `<span>${completedCount}</span>`;
        percentCompletedHTML += `<span>${percentage}%</span>`;
    }

    tasksCompletedEl.innerHTML = tasksCompletedHTML;
    percentCompletedEl.innerHTML = percentCompletedHTML;
}

// Clear all data for current user
function clearAllData() {
    if (confirm('Are you sure you want to clear all habit data? This cannot be undone.')) {
        initializeHabitData();
        saveToStorage();
        renderHabits();
        calculateAllStats();
    }
}

// Export data to JSON
function exportData() {
    if (!currentUser) return;
    
    const dataStr = JSON.stringify(habitData, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `habit-tracker-${currentUser.username}-${new Date().toISOString().split('T')[0]}.json`;
    link.click();
    URL.revokeObjectURL(url);
}

// Import data from JSON
function importData(file) {
    if (!currentUser) return;
    
    const reader = new FileReader();
    reader.onload = function(e) {
        try {
            const importedData = JSON.parse(e.target.result);
            habitData = importedData;
            saveToStorage();
            renderHabits();
            calculateAllStats();
            alert('Data imported successfully!');
        } catch (error) {
            alert('Error importing data. Please check the file format.');
        }
    };
    reader.readAsText(file);
}

// Initialize on page load
document.addEventListener('DOMContentLoaded', init);

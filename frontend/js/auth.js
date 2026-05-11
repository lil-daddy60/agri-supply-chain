// ===== AUTHENTICATION STATE =====
const API_URL = 'https://agri-supply-api.onrender.com/api';

var currentUser = null;
let authToken = localStorage.getItem('token');

// Initialize auth on page load
function initAuth() {
  if (authToken) {
    // Set default header for all requests
    // This will be used by api.js
  }
}

// Check if user is authenticated
function isAuthenticated() {
  return !!authToken;
}

// Get current user
function getCurrentUser() {
  return currentUser;
}

// Get auth token
function getToken() {
  return authToken;
}

// Login user
async function login(email, password) {
  const response = await fetch(`${API_URL}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password })
  });

  const data = await response.json();
  
  if (!data.success) {
    throw new Error(data.message || 'Login failed');
  }

  authToken = data.data.token;
  currentUser = data.data.user;
  localStorage.setItem('token', authToken);
  
  return data.data;
}

// Register user
async function register(userData) {
  const response = await fetch(`${API_URL}/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(userData)
  });

  const data = await response.json();
  
  if (!data.success) {
    throw new Error(data.message || 'Registration failed');
  }

  authToken = data.data.token;
  currentUser = data.data.user;
  localStorage.setItem('token', authToken);
  
  return data.data;
}

// Fetch current user profile
async function fetchCurrentUser() {
  if (!authToken) return null;
  
  try {
    const response = await fetch(`${API_URL}/auth/me`, {
      headers: { 'Authorization': `Bearer ${authToken}` }
    });
    
    const data = await response.json();
    
    if (data.success) {
      currentUser = data.data;
      return currentUser;
    } else {
      logout();
      return null;
    }
  } catch (error) {
    logout();
    return null;
  }
}

// Logout user
function logout() {
  authToken = null;
  currentUser = null;
  localStorage.removeItem('token');
  window.location.href = 'index.html';
}

// Redirect if not authenticated
function requireAuth() {
  if (!authToken) {
    window.location.href = 'index.html';
    return false;
  }
  return true;
}

// Redirect if already authenticated
function redirectIfAuth() {
  if (authToken) {
    window.location.href = 'dashboard.html';
    return true;
  }
  return false;
}

// Format user initials
function getUserInitials(user) {
  if (!user) return '??';
  return `${user.firstName?.[0] || ''}${user.lastName?.[0] || ''}`.toUpperCase();
}

// Format role display
function formatRole(role) {
  if (!role) return '';
  return role.replace(/_/g, ' ').toLowerCase().replace(/\b\w/g, l => l.toUpperCase());
}

// Export for use in other scripts
window.Auth = {
  login,
  register,
  logout,
  fetchCurrentUser,
  getCurrentUser,
  getToken,
  isAuthenticated,
  requireAuth,
  redirectIfAuth,
  getUserInitials,
  formatRole,
  API_URL
};

// Initialize
initAuth();
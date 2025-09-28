// Firebase Authentication Module
// Centralized authentication handling for all pages

import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.0/firebase-app.js";
import { getAnalytics } from "https://www.gstatic.com/firebasejs/10.7.0/firebase-analytics.js";
import { getAuth, signOut, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.7.0/firebase-auth.js";

// Firebase configuration
const firebaseConfig = {
    apiKey: "AIzaSyCHZcDv3pXIU9J3CASXi3sM-V7mZsMuqBM",
    authDomain: "triple-s-bd006.firebaseapp.com",
    projectId: "triple-s-bd006",
    storageBucket: "triple-s-bd006.firebasestorage.app",
    messagingSenderId: "933483210420",
    appId: "1:933483210420:web:66fde1b5571ef1741299e1",
    measurementId: "G-TPHZ0H6L5J"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
const auth = getAuth(app);

// Export services for use in other modules
export { app, auth, analytics };

// Handle authentication state changes
export function handleAuthStateChange(callback) {
    return onAuthStateChanged(auth, callback);
}

// Create user menu HTML
export function createUserMenuHTML(user, options = {}) {
    const displayName = user.displayName || (user.email ? user.email.split('@')[0] : 'User');
    const userInitial = displayName.charAt(0).toUpperCase();
    const showEmail = options.showEmail !== false; // Default to true
    const showDashboard = options.showDashboard !== false; // Default to true

    return `
        <div class="user-menu-container">
            <div class="user-avatar-nav" title="${displayName}">
                ${userInitial}
            </div>
            <div class="user-dropdown">
                <div class="user-dropdown-header">
                    <div class="user-dropdown-name">${displayName}</div>
                    ${showEmail && user.email ? `<div class="user-dropdown-email">${user.email}</div>` : ''}
                </div>
                <div class="user-dropdown-divider"></div>
                <a href="profile.html" class="user-dropdown-item">
                    <i class="fas fa-user"></i> Profile
                </a>
                ${showDashboard ? `
                <a href="dashboard.html" class="user-dropdown-item">
                    <i class="fas fa-tachometer-alt"></i> Dashboard
                </a>` : ''}
                <a href="#" class="logout-btn user-dropdown-item">
                    <i class="fas fa-sign-out-alt"></i> Logout
                </a>
            </div>
        </div>
    `;
}

// Initialize user menu
export function initializeUserMenu() {
    const authLink = document.getElementById('auth-link');
    const mobileAuthLink = document.getElementById('mobile-auth-link');

    if (!authLink && !mobileAuthLink) {
        console.warn('Auth link elements not found in DOM');
        return;
    }

    handleAuthStateChange((user) => {
        if (user) {
            // User is signed in
            const userMenuHTML = createUserMenuHTML(user);

            if (authLink) authLink.innerHTML = userMenuHTML;
            if (mobileAuthLink) mobileAuthLink.innerHTML = userMenuHTML;

            // Add event listeners after DOM update
            setTimeout(() => {
                setupUserMenuEvents();
            }, 100);
        } else {
            // User is not signed in
            const loginLink = '<a href="login.html">Login</a>';

            if (authLink) authLink.innerHTML = loginLink;
            if (mobileAuthLink) mobileAuthLink.innerHTML = loginLink;
        }
    });
}

// Setup user menu events
function setupUserMenuEvents() {
    // Add click event for user avatar to toggle dropdown
    const userAvatars = document.querySelectorAll('.user-avatar-nav');
    const userDropdowns = document.querySelectorAll('.user-dropdown');

    userAvatars.forEach((avatar, index) => {
        avatar.addEventListener('click', (e) => {
            e.stopPropagation();
            userDropdowns[index].classList.toggle('show');
        });
    });

    // Close dropdown when clicking outside
    document.addEventListener('click', (e) => {
        userDropdowns.forEach((dropdown, index) => {
            if (!dropdown.contains(e.target) && !userAvatars[index].contains(e.target)) {
                dropdown.classList.remove('show');
            }
        });
    });

    // Add logout functionality
    document.querySelectorAll('.logout-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.preventDefault();
            signOut(auth).then(() => {
                // Sign-out successful
                console.log("User signed out");
                window.location.reload();
            }).catch((error) => {
                // An error happened
                console.error("Sign out error:", error);
                alert("Failed to sign out. Please try again.");
            });
        });
    });
}

// Redirect to login if user is not authenticated
export function requireAuth(redirectUrl = 'login.html') {
    handleAuthStateChange((user) => {
        if (!user) {
            window.location.href = redirectUrl;
        }
    });
}

export default auth;
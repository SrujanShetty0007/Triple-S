// Firebase Login Module
// Handles authentication for login page

import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword, setPersistence, browserLocalPersistence, updateProfile, GoogleAuthProvider, signInWithPopup } from "https://www.gstatic.com/firebasejs/10.7.0/firebase-auth.js";
import { auth } from './auth.js';

// Set persistence to LOCAL (persists even when browser is closed)
setPersistence(auth, browserLocalPersistence)
    .then(() => {
        console.log("Persistence set to LOCAL");
    })
    .catch((error) => {
        console.error("Error setting persistence:", error);
    });

// Helper function to show/hide loaders and error messages
function showLoader(formId) {
    document.getElementById(`${formId}-error`).style.display = 'none';
    document.getElementById(`${formId}-error`).textContent = '';
    // Show page loader instead
    document.getElementById('page-loader').style.display = 'flex';
}

function hideLoader(formId) {
    // Hide page loader
    document.getElementById('page-loader').style.display = 'none';
}

function showError(formId, message) {
    document.getElementById(`${formId}-error`).style.display = 'block';
    document.getElementById(`${formId}-error`).textContent = message;
    hideLoader(formId);
}

// Initialize login form event listeners
export function initLoginForm() {
    // Handle sign in form submission
    document.getElementById('signInForm').addEventListener('submit', function (e) {
        e.preventDefault();
        const email = document.getElementById('signin-email').value;
        const password = document.getElementById('signin-password').value;

        showLoader('signin');

        signInWithEmailAndPassword(auth, email, password)
            .then((userCredential) => {
                // Signed in successfully
                const user = userCredential.user;
                console.log("User signed in:", user);
                // Redirect to main page
                window.location.href = "index.html";
            })
            .catch((error) => {
                const errorCode = error.code;
                const errorMessage = error.message;
                console.error("Sign in error:", errorCode, errorMessage);

                // Show user-friendly error message
                let friendlyMessage = "Sign in failed. Please try again.";
                if (errorCode === 'auth/wrong-password') {
                    friendlyMessage = "Incorrect password. Please try again.";
                } else if (errorCode === 'auth/user-not-found') {
                    friendlyMessage = "No account found with this email.";
                } else if (errorCode === 'auth/invalid-credential') {
                    friendlyMessage = "Invalid login credentials.";
                }

                showError('signin', friendlyMessage);
            });
    });

    // Handle sign up form submission
    document.getElementById('signUpForm').addEventListener('submit', function (e) {
        e.preventDefault();
        const name = document.getElementById('signup-name').value;
        const email = document.getElementById('signup-email').value;
        const password = document.getElementById('signup-password').value;

        showLoader('signup');

        createUserWithEmailAndPassword(auth, email, password)
            .then((userCredential) => {
                // Signed up successfully
                const user = userCredential.user;

                // Update user profile with name
                return updateProfile(user, {
                    displayName: name
                }).then(() => {
                    console.log("User profile updated with name:", name);
                    return user;
                });
            })
            .then((user) => {
                console.log("User signed up:", user);
                // Redirect to main page
                window.location.href = "index.html";
            })
            .catch((error) => {
                const errorCode = error.code;
                const errorMessage = error.message;
                console.error("Sign up error:", errorCode, errorMessage);

                // Show user-friendly error message
                let friendlyMessage = "Sign up failed. Please try again.";
                if (errorCode === 'auth/email-already-in-use') {
                    friendlyMessage = "This email is already registered.";
                } else if (errorCode === 'auth/weak-password') {
                    friendlyMessage = "Password is too weak. Use at least 6 characters.";
                } else if (errorCode === 'auth/invalid-email') {
                    friendlyMessage = "Invalid email address.";
                }

                showError('signup', friendlyMessage);
            });
    });

    // Google Sign In
    document.getElementById('googleLogin').addEventListener('click', async () => {
        try {
            showLoader('signin');

            // Create a new provider instance each time
            const googleProvider = new GoogleAuthProvider();
            googleProvider.addScope('email');

            const result = await signInWithPopup(auth, googleProvider);
            console.log("Google sign in successful:", result.user);
            window.location.href = "index.html";
        } catch (error) {
            console.error("Google sign in error:", error.code, error.message);
            showError('signin', "Google sign in failed. Please try again.");
            hideLoader('signin');
        }
    });

    // Google Sign Up
    document.getElementById('googleSignup').addEventListener('click', async () => {
        try {
            showLoader('signup');

            // Create a new provider instance each time
            const googleProvider = new GoogleAuthProvider();
            googleProvider.addScope('email');

            const result = await signInWithPopup(auth, googleProvider);
            console.log("Google sign up successful:", result.user);
            window.location.href = "index.html";
        } catch (error) {
            console.error("Google sign up error:", error.code, error.message);
            showError('signup', "Google sign up failed. Please try again.");
            hideLoader('signup');
        }
    });

    // Check if user is already signed in
    auth.onAuthStateChanged((user) => {
        if (user) {
            // User is signed in
            console.log("User is already signed in:", user);
            // Auto-redirect if already signed in
            window.location.href = "index.html";
        } else {
            // User is signed out
            console.log("No user is signed in.");
        }
    });
}

// Form switching function
export function showForm(form) {
    const signInTab = document.getElementById('signInTab');
    const signUpTab = document.getElementById('signUpTab');
    const signInForm = document.getElementById('signInForm');
    const signUpForm = document.getElementById('signUpForm');
    if (form === 'signIn') {
        signInTab.classList.add('active');
        signUpTab.classList.remove('active');
        signInForm.classList.add('active');
        signUpForm.classList.remove('active');
    } else {
        signUpTab.classList.add('active');
        signInTab.classList.remove('active');
        signUpForm.classList.add('active');
        signInForm.classList.remove('active');
    }

    // Clear error messages when switching forms
    document.getElementById('signin-error').style.display = 'none';
    document.getElementById('signup-error').style.display = 'none';
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    initLoginForm();
});
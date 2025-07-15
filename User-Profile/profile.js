// Import Firebase modules
import { onAuthStateChanged, updateProfile, signOut } from "https://www.gstatic.com/firebasejs/10.7.0/firebase-auth.js";
import { doc, getDoc, setDoc } from "https://www.gstatic.com/firebasejs/10.7.0/firebase-firestore.js";
import { ref, uploadBytes, getDownloadURL } from "https://www.gstatic.com/firebasejs/10.7.0/firebase-storage.js";

// DOM Elements
const profileImage = document.getElementById('profile-image');
const profilePictureInput = document.getElementById('profile-picture-input');
const changePictureBtn = document.getElementById('change-picture-btn');
const displayNameInput = document.getElementById('display-name');
const emailInput = document.getElementById('email');
const dobInput = document.getElementById('dob');
const saveProfileBtn = document.getElementById('save-profile-btn');
const logoutBtn = document.getElementById('logout-btn');
const notification = document.getElementById('notification');
const notificationIcon = document.getElementById('notification-icon');
const notificationMessage = document.getElementById('notification-message');
const profilePictureOverlay = document.querySelector('.profile-picture-overlay');
const loader = document.getElementById('page-loader');

// Variables
let currentUser = null;
let profilePictureFile = null;
let auth, db, storage;

// Initialize application when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    // Hide loader
    if (loader) {
        setTimeout(() => {
            loader.style.display = 'none';
        }, 500);
    }

    // Initialize Firebase services
    initializeApp();
});

// Initialize Firebase services from window object
function initializeApp() {
    // Check if Firebase is initialized
    if (!window.firebaseAuth || !window.firebaseDb || !window.firebaseStorage) {
        console.error('Firebase not initialized properly');
        showNotification('Error initializing application', 'error');
        return;
    }

    auth = window.firebaseAuth;
    db = window.firebaseDb;
    storage = window.firebaseStorage;

    // Initialize auth state listener
    onAuthStateChanged(auth, handleAuthStateChanged);

    // Set up event listeners
    setupProfilePictureListeners();
    saveProfileBtn.addEventListener('click', saveProfile);
    logoutBtn.addEventListener('click', handleLogout);
}

// Handle authentication state changes
async function handleAuthStateChanged(user) {
    if (user) {
        currentUser = user;
        emailInput.value = user.email || '';
        displayNameInput.value = user.displayName || '';

        try {
            // Load user data from Firestore
            const userDoc = await getDoc(doc(db, "users", user.uid));

            if (userDoc.exists()) {
                const userData = userDoc.data();

                // Set date of birth if available
                if (userData.dateOfBirth) {
                    dobInput.value = userData.dateOfBirth;
                }

                // Set profile picture if available
                if (userData.profilePictureURL) {
                    profileImage.src = userData.profilePictureURL;
                } else if (user.photoURL) {
                    profileImage.src = user.photoURL;
                }
            }
        } catch (error) {
            console.error('Error loading profile:', error);
            showNotification('Error loading profile data', 'error');
        }
    } else {
        // Redirect to login page if not logged in
        window.location.href = '../login.html';
    }
}

// Event listeners for profile picture
function setupProfilePictureListeners() {
    const triggerFileInput = () => profilePictureInput.click();
    profilePictureOverlay.addEventListener('click', triggerFileInput);
    changePictureBtn.addEventListener('click', triggerFileInput);

    profilePictureInput.addEventListener('change', (e) => {
        const file = e.target.files[0];
        if (file) {
            // Validate file type
            if (!file.type.match('image.*')) {
                showNotification('Please select an image file', 'error');
                return;
            }

            // Validate file size (max 2MB)
            if (file.size > 2 * 1024 * 1024) {
                showNotification('Image size should be less than 2MB', 'error');
                return;
            }

            profilePictureFile = file;
            const reader = new FileReader();
            reader.onload = (e) => {
                profileImage.src = e.target.result;
            };
            reader.readAsDataURL(file);
        }
    });
}

// Save profile changes
async function saveProfile() {
    if (!currentUser) return;

    // Basic validation
    if (!displayNameInput.value.trim()) {
        showNotification('Please enter a display name', 'error');
        return;
    }

    // Show saving state
    saveProfileBtn.disabled = true;
    saveProfileBtn.textContent = 'Saving...';

    try {
        // Create user document if it doesn't exist
        const userRef = doc(db, "users", currentUser.uid);

        // Upload profile picture if changed
        let profileUpdateData = {
            displayName: displayNameInput.value
        };

        let firestoreData = {
            displayName: displayNameInput.value,
            dateOfBirth: dobInput.value || '',
            email: currentUser.email
        };

        if (profilePictureFile) {
            try {
                const fileExtension = profilePictureFile.name.split('.').pop();
                const storageRef = ref(storage, `profilePictures/${currentUser.uid}.${fileExtension}`);

                await uploadBytes(storageRef, profilePictureFile);
                const downloadURL = await getDownloadURL(storageRef);

                profileUpdateData.photoURL = downloadURL;
                firestoreData.profilePictureURL = downloadURL;
            } catch (uploadError) {
                console.error('Error uploading image:', uploadError);
                showNotification('Failed to upload profile picture', 'error');
                // Continue with other updates even if image upload fails
            }
        }

        // Update Firebase Auth profile
        await updateProfile(currentUser, profileUpdateData);

        // Update Firestore document
        await setDoc(userRef, firestoreData, { merge: true });

        showNotification('Profile updated successfully!', 'success');

        // Reset the file input
        profilePictureFile = null;
        profilePictureInput.value = '';
    } catch (error) {
        console.error('Error updating profile:', error);
        showNotification('Error updating profile', 'error');
    } finally {
        saveProfileBtn.disabled = false;
        saveProfileBtn.textContent = 'Save Changes';
    }
}

// Logout function
async function handleLogout() {
    try {
        await signOut(auth);
        window.location.href = '../login.html';
    } catch (error) {
        console.error('Error signing out:', error);
        showNotification('Error signing out', 'error');
    }
}

// Show notification
function showNotification(message, type = 'success') {
    notificationMessage.textContent = message;

    if (type === 'success') {
        notificationIcon.className = 'fas fa-check-circle';
    } else {
        notificationIcon.className = 'fas fa-exclamation-circle';
    }

    notification.classList.add('show');

    // Hide notification after 3 seconds
    setTimeout(() => {
        notification.classList.remove('show');
    }, 3000);
}

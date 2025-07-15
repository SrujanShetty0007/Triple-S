// Import Firebase modules
import { onAuthStateChanged, updateProfile, signOut } from "https://www.gstatic.com/firebasejs/10.7.0/firebase-auth.js";
import { doc, getDoc, setDoc } from "https://www.gstatic.com/firebasejs/10.7.0/firebase-firestore.js";
import { ref, uploadBytes, getDownloadURL } from "https://www.gstatic.com/firebasejs/10.7.0/firebase-storage.js";

// DOM Elements
const profileImageView = document.getElementById('profile-image-view');
const profileImage = document.getElementById('profile-image');
const profilePictureInput = document.getElementById('profile-picture-input');
const changePictureBtn = document.getElementById('change-picture-btn');
const displayNameView = document.getElementById('display-name-view');
const emailView = document.getElementById('email-view');
const displayNameInput = document.getElementById('display-name');
const emailInput = document.getElementById('email');
const dobInput = document.getElementById('dob');
const editProfileBtn = document.getElementById('edit-profile-btn');
const saveProfileBtn = document.getElementById('save-profile-btn');
const cancelEditBtn = document.getElementById('cancel-edit-btn');
const logoutBtn = document.getElementById('logout-btn');
const notification = document.getElementById('notification');
const notificationIcon = document.getElementById('notification-icon');
const notificationMessage = document.getElementById('notification-message');
const profilePictureOverlay = document.querySelector('.profile-picture-overlay');
const viewProfileSection = document.getElementById('view-profile-section');
const editProfileSection = document.getElementById('edit-profile-section');
const loader = document.getElementById('page-loader');

// Variables
let currentUser = null;
let profilePictureFile = null;
let auth, db, storage;
let userData = {};

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
    setupEventListeners();
}

// Handle authentication state changes
async function handleAuthStateChanged(user) {
    if (user) {
        currentUser = user;

        try {
            // Load user data from Firestore
            const userDoc = await getDoc(doc(db, "users", user.uid));

            if (userDoc.exists()) {
                userData = userDoc.data();

                // Update view mode
                displayNameView.textContent = userData.displayName || user.displayName || 'User';
                emailView.textContent = userData.email || user.email || '';

                if (userData.profilePictureURL) {
                    profileImageView.src = userData.profilePictureURL;
                    profileImage.src = userData.profilePictureURL;
                } else if (user.photoURL) {
                    profileImageView.src = user.photoURL;
                    profileImage.src = user.photoURL;
                }

                // Update edit mode fields
                displayNameInput.value = userData.displayName || user.displayName || '';
                emailInput.value = userData.email || user.email || '';
                dobInput.value = userData.dateOfBirth || '';
            } else {
                // User document doesn't exist yet
                displayNameView.textContent = user.displayName || 'User';
                emailView.textContent = user.email || '';
                displayNameInput.value = user.displayName || '';
                emailInput.value = user.email || '';

                if (user.photoURL) {
                    profileImageView.src = user.photoURL;
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

// Set up all event listeners
function setupEventListeners() {
    // Toggle between view and edit modes
    editProfileBtn.addEventListener('click', showEditMode);
    cancelEditBtn.addEventListener('click', showViewMode);

    // Profile picture change
    setupProfilePictureListeners();

    // Save profile changes
    saveProfileBtn.addEventListener('click', saveProfile);

    // Logout
    logoutBtn.addEventListener('click', handleLogout);
}

// Toggle to edit mode
function showEditMode() {
    viewProfileSection.style.display = 'none';
    editProfileSection.style.display = 'block';
}

// Toggle to view mode
function showViewMode() {
    // Reset any unsaved changes
    if (userData.profilePictureURL) {
        profileImage.src = userData.profilePictureURL;
    } else if (currentUser.photoURL) {
        profileImage.src = currentUser.photoURL;
    } else {
        profileImage.src = '../assets/images/user.png';
    }

    displayNameInput.value = userData.displayName || currentUser.displayName || '';
    dobInput.value = userData.dateOfBirth || '';

    // Clear file input
    profilePictureFile = null;
    if (profilePictureInput) profilePictureInput.value = '';

    viewProfileSection.style.display = 'block';
    editProfileSection.style.display = 'none';
}

// Event listeners for profile picture
function setupProfilePictureListeners() {
    const triggerFileInput = () => profilePictureInput.click();

    if (profilePictureOverlay) {
        profilePictureOverlay.addEventListener('click', triggerFileInput);
    }

    if (changePictureBtn) {
        changePictureBtn.addEventListener('click', triggerFileInput);
    }

    if (profilePictureInput) {
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
}

// Save profile changes
async function saveProfile() {
    if (!currentUser) {
        showNotification('You need to be logged in to save changes', 'error');
        return;
    }

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

        // Prepare data for updates
        let profileUpdateData = {
            displayName: displayNameInput.value.trim()
        };

        let firestoreData = {
            displayName: displayNameInput.value.trim(),
            dateOfBirth: dobInput.value || '',
            email: currentUser.email,
            lastUpdated: new Date().toISOString()
        };

        // Upload profile picture if changed
        if (profilePictureFile) {
            try {
                const fileExtension = profilePictureFile.name.split('.').pop();
                const storageRef = ref(storage, `profilePictures/${currentUser.uid}.${fileExtension}`);

                await uploadBytes(storageRef, profilePictureFile);
                const downloadURL = await getDownloadURL(storageRef);

                profileUpdateData.photoURL = downloadURL;
                firestoreData.profilePictureURL = downloadURL;

                // Update view mode image
                profileImageView.src = downloadURL;
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

        // Update local data
        userData = { ...userData, ...firestoreData };

        // Update view mode
        displayNameView.textContent = firestoreData.displayName;

        // Show success message
        showNotification('Profile updated successfully!', 'success');

        // Switch back to view mode
        showViewMode();

        // Reset the file input
        profilePictureFile = null;
        if (profilePictureInput) profilePictureInput.value = '';
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


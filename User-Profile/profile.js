// Import Firebase modules
import { onAuthStateChanged, updateProfile, signOut } from "https://www.gstatic.com/firebasejs/10.7.0/firebase-auth.js";
import { doc, getDoc, setDoc } from "https://www.gstatic.com/firebasejs/10.7.0/firebase-firestore.js";
import { ref, uploadBytes, getDownloadURL } from "https://www.gstatic.com/firebasejs/10.7.0/firebase-storage.js";
import { auth as firebaseAuth } from "../assets/js/firebase/auth.js";

// DOM Elements
const elements = {
    profileImageView: document.getElementById('profile-image-view'),
    profileImage: document.getElementById('profile-image'),
    profilePictureInput: document.getElementById('profile-picture-input'),
    changePictureBtn: document.getElementById('change-picture-btn'),
    displayNameView: document.getElementById('display-name-view'),
    emailView: document.getElementById('email-view'),
    displayNameInput: document.getElementById('display-name'),
    emailInput: document.getElementById('email'),
    dobInput: document.getElementById('dob'),
    editProfileBtn: document.getElementById('edit-profile-btn'),
    saveProfileBtn: document.getElementById('save-profile-btn'),
    cancelEditBtn: document.getElementById('cancel-edit-btn'),
    logoutBtn: document.getElementById('logout-btn'),
    notification: document.getElementById('notification'),
    notificationIcon: document.getElementById('notification-icon'),
    notificationMessage: document.getElementById('notification-message'),
    profilePictureOverlay: document.querySelector('.profile-picture-overlay'),
    viewProfileSection: document.getElementById('view-profile-section'),
    editProfileSection: document.getElementById('edit-profile-section'),
    loader: document.getElementById('page-loader')
};

// Variables
let currentUser = null;
let profilePictureFile = null;
let auth, db, storage;
let userData = {};

// Initialize application
document.addEventListener('DOMContentLoaded', () => {
    if (elements.loader) {
        setTimeout(() => elements.loader.style.display = 'none', 500);
    }
    initializeApp();
});

// Initialize Firebase services
function initializeApp() {
    // Use the auth from our new module
    auth = firebaseAuth;

    // Get other services from the global window object (set in profile.html)
    if (!window.firebaseDb || !window.firebaseStorage) {
        console.error('Firebase not initialized properly');
        showNotification('Error initializing application', 'error');
        elements.displayNameView.textContent = 'Error loading profile';
        elements.emailView.textContent = 'Please refresh the page';
        return;
    }

    db = window.firebaseDb;
    storage = window.firebaseStorage;

    onAuthStateChanged(auth, handleAuthStateChanged);
    setupEventListeners();
}

// Handle authentication state changes
async function handleAuthStateChanged(user) {
    if (!user) {
        window.location.href = '../login.html';
        return;
    }

    currentUser = user;
    try {
        const userDoc = await getDoc(doc(db, "users", user.uid));
        userData = userDoc.exists() ? userDoc.data() : {};
        updateProfileDisplay(user, userData);
    } catch (error) {
        console.error('Error loading profile:', error);
        showNotification('Error loading profile data', 'error');
        updateProfileDisplay(user, {});
    }
}

// Update profile display with user data
function updateProfileDisplay(user, userData) {
    const displayName = userData.displayName || user.displayName || 'User';
    const email = user.email || userData.email || 'No email available';
    const profilePictureURL = userData.profilePictureURL || user.photoURL;

    // Update view mode
    elements.displayNameView.textContent = displayName;
    elements.emailView.textContent = email;

    // Update profile picture
    if (profilePictureURL) {
        elements.profileImageView.src = profilePictureURL;
        elements.profileImage.src = profilePictureURL;
    }

    // Update edit mode fields
    elements.displayNameInput.value = displayName;
    elements.emailInput.value = email;
    elements.dobInput.value = userData.dateOfBirth || '';
}

// Set up event listeners
function setupEventListeners() {
    elements.editProfileBtn.addEventListener('click', () => toggleMode('edit'));
    elements.cancelEditBtn.addEventListener('click', () => toggleMode('view'));
    elements.saveProfileBtn.addEventListener('click', saveProfile);
    elements.logoutBtn.addEventListener('click', handleLogout);
    setupProfilePictureListeners();
}

// Toggle between view and edit modes
function toggleMode(mode) {
    const isEdit = mode === 'edit';
    elements.viewProfileSection.style.display = isEdit ? 'none' : 'block';
    elements.editProfileSection.style.display = isEdit ? 'block' : 'none';

    if (!isEdit) {
        // Reset to original values when canceling
        const profilePictureURL = userData.profilePictureURL || currentUser.photoURL;
        elements.profileImage.src = profilePictureURL || '../assets/images/user.png';
        elements.displayNameInput.value = userData.displayName || currentUser.displayName || '';
        elements.dobInput.value = userData.dateOfBirth || '';
        profilePictureFile = null;
        if (elements.profilePictureInput) elements.profilePictureInput.value = '';
    }
}

// Event listeners for profile picture
function setupProfilePictureListeners() {
    const triggerFileInput = () => elements.profilePictureInput.click();

    if (elements.profilePictureOverlay) {
        elements.profilePictureOverlay.addEventListener('click', triggerFileInput);
    }

    if (elements.changePictureBtn) {
        elements.changePictureBtn.addEventListener('click', triggerFileInput);
    }

    if (elements.profilePictureInput) {
        elements.profilePictureInput.addEventListener('change', handleProfilePictureChange);
    }
}

// Handle profile picture file selection
function handleProfilePictureChange(e) {
    const file = e.target.files[0];
    if (!file) return;

    if (!file.type.match('image.*')) {
        showNotification('Please select an image file', 'error');
        return;
    }

    if (file.size > 2 * 1024 * 1024) {
        showNotification('Image size should be less than 2MB', 'error');
        return;
    }

    profilePictureFile = file;
    const reader = new FileReader();
    reader.onload = (e) => {
        elements.profileImage.src = e.target.result;
    };
    reader.readAsDataURL(file);
}

// Save profile changes
async function saveProfile() {
    if (!currentUser) {
        showNotification('You need to be logged in to save changes', 'error');
        return;
    }

    if (!elements.displayNameInput.value.trim()) {
        showNotification('Please enter a display name', 'error');
        return;
    }

    elements.saveProfileBtn.disabled = true;
    elements.saveProfileBtn.textContent = 'Saving...';

    try {
        const userRef = doc(db, "users", currentUser.uid);
        const displayName = elements.displayNameInput.value.trim();
        const dateOfBirth = elements.dobInput.value || '';

        let profileUpdateData = { displayName };
        let firestoreData = {
            displayName,
            dateOfBirth,
            email: currentUser.email,
            lastUpdated: new Date().toISOString()
        };

        // Upload profile picture if selected
        if (profilePictureFile) {
            try {
                const fileExtension = profilePictureFile.name.split('.').pop();
                const storageRef = ref(storage, `profilePictures/${currentUser.uid}.${fileExtension}`);

                await uploadBytes(storageRef, profilePictureFile);
                const downloadURL = await getDownloadURL(storageRef);

                profileUpdateData.photoURL = downloadURL;
                firestoreData.profilePictureURL = downloadURL;
                elements.profileImageView.src = downloadURL;
            } catch (uploadError) {
                console.error('Error uploading image:', uploadError);
                showNotification('Failed to upload profile picture', 'error');
            }
        }

        await updateProfile(currentUser, profileUpdateData);
        await setDoc(userRef, firestoreData, { merge: true });

        userData = { ...userData, ...firestoreData };
        elements.displayNameView.textContent = firestoreData.displayName;
        elements.emailView.textContent = currentUser.email || firestoreData.email || 'No email available';

        showNotification('Profile updated successfully!', 'success');
        toggleMode('view');

        profilePictureFile = null;
        if (elements.profilePictureInput) elements.profilePictureInput.value = '';
    } catch (error) {
        console.error('Error updating profile:', error);
        showNotification('Error updating profile', 'error');
    } finally {
        elements.saveProfileBtn.disabled = false;
        elements.saveProfileBtn.textContent = 'Save Changes';
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
    elements.notificationMessage.textContent = message;
    elements.notificationIcon.className = type === 'success' ? 'fas fa-check-circle' : 'fas fa-exclamation-circle';
    elements.notification.classList.add('show');

    setTimeout(() => {
        elements.notification.classList.remove('show');
    }, 3000);
}
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
    if (loader) {
        setTimeout(() => {
            loader.style.display = 'none';
        }, 500);
    }
    initializeApp();
});

// Initialize Firebase services
function initializeApp() {
    if (!window.firebaseAuth || !window.firebaseDb || !window.firebaseStorage) {
        console.error('Firebase not initialized properly');
        showNotification('Error initializing application', 'error');
        displayNameView.textContent = 'Error loading profile';
        emailView.textContent = 'Please refresh the page';
        return;
    }

    auth = window.firebaseAuth;
    db = window.firebaseDb;
    storage = window.firebaseStorage;

    onAuthStateChanged(auth, handleAuthStateChanged);
    setupEventListeners();
}

// Handle authentication state changes
async function handleAuthStateChanged(user) {
    if (user) {
        currentUser = user;

        try {
            const userDoc = await getDoc(doc(db, "users", user.uid));

            if (userDoc.exists()) {
                userData = userDoc.data();
                updateProfileDisplay(user, userData);
            } else {
                updateProfileDisplay(user, {});
            }
        } catch (error) {
            console.error('Error loading profile:', error);
            showNotification('Error loading profile data', 'error');
            updateProfileDisplay(user, {});
        }
    } else {
        window.location.href = '../login.html';
    }
}

// Update profile display with user data
function updateProfileDisplay(user, userData) {
    // Update view mode
    displayNameView.textContent = userData.displayName || user.displayName || 'User';
    emailView.textContent = user.email || userData.email || 'No email available';

    // Update profile picture
    if (userData.profilePictureURL) {
        profileImageView.src = userData.profilePictureURL;
        profileImage.src = userData.profilePictureURL;
    } else if (user.photoURL) {
        profileImageView.src = user.photoURL;
        profileImage.src = user.photoURL;
    }

    // Update edit mode fields
    displayNameInput.value = userData.displayName || user.displayName || '';
    emailInput.value = user.email || userData.email || '';
    dobInput.value = userData.dateOfBirth || '';
}

// Set up event listeners
function setupEventListeners() {
    editProfileBtn.addEventListener('click', showEditMode);
    cancelEditBtn.addEventListener('click', showViewMode);
    setupProfilePictureListeners();
    saveProfileBtn.addEventListener('click', saveProfile);
    logoutBtn.addEventListener('click', handleLogout);
}

// Toggle to edit mode
function showEditMode() {
    viewProfileSection.style.display = 'none';
    editProfileSection.style.display = 'block';
}

// Toggle to view mode
function showViewMode() {
    if (userData.profilePictureURL) {
        profileImage.src = userData.profilePictureURL;
    } else if (currentUser.photoURL) {
        profileImage.src = currentUser.photoURL;
    } else {
        profileImage.src = '../assets/images/user.png';
    }

    displayNameInput.value = userData.displayName || currentUser.displayName || '';
    dobInput.value = userData.dateOfBirth || '';

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

    if (!displayNameInput.value.trim()) {
        showNotification('Please enter a display name', 'error');
        return;
    }

    saveProfileBtn.disabled = true;
    saveProfileBtn.textContent = 'Saving...';

    try {
        const userRef = doc(db, "users", currentUser.uid);

        let profileUpdateData = {
            displayName: displayNameInput.value.trim()
        };

        let firestoreData = {
            displayName: displayNameInput.value.trim(),
            dateOfBirth: dobInput.value || '',
            email: currentUser.email,
            lastUpdated: new Date().toISOString()
        };

        if (profilePictureFile) {
            try {
                const fileExtension = profilePictureFile.name.split('.').pop();
                const storageRef = ref(storage, `profilePictures/${currentUser.uid}.${fileExtension}`);

                await uploadBytes(storageRef, profilePictureFile);
                const downloadURL = await getDownloadURL(storageRef);

                profileUpdateData.photoURL = downloadURL;
                firestoreData.profilePictureURL = downloadURL;
                profileImageView.src = downloadURL;
            } catch (uploadError) {
                console.error('Error uploading image:', uploadError);
                showNotification('Failed to upload profile picture', 'error');
            }
        }

        await updateProfile(currentUser, profileUpdateData);
        await setDoc(userRef, firestoreData, { merge: true });

        userData = { ...userData, ...firestoreData };
        displayNameView.textContent = firestoreData.displayName;
        emailView.textContent = currentUser.email || firestoreData.email || 'No email available';

        showNotification('Profile updated successfully!', 'success');
        showViewMode();

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
    notificationIcon.className = type === 'success' ? 'fas fa-check-circle' : 'fas fa-exclamation-circle';
    notification.classList.add('show');

    setTimeout(() => {
        notification.classList.remove('show');
    }, 3000);
}


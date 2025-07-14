// Import the functions you need from the SDKs you need
import { initializeApp } from "https://www.gstatic.com/firebasejs/11.10.0/firebase-app.js";
import { getAnalytics } from "https://www.gstatic.com/firebasejs/11.10.0/firebase-analytics.js";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
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
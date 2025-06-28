// Simple Firebase configuration
import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getDatabase } from "firebase/database";
import { getAnalytics } from "firebase/analytics";

// Firebase configuration
const firebaseConfig = {
    apiKey: "AIzaSyBfU99fHdfCGsmO0uXTnQKLVX-2f5IrRd0",
    authDomain: "firestream-e8465.firebaseapp.com",
    databaseURL: "https://firestream-e8465-default-rtdb.firebaseio.com",
    projectId: "firestream-e8465",
    storageBucket: "firestream-e8465.firebasestorage.app",
    messagingSenderId: "869857658241",
    appId: "1:869857658241:web:6bbffa799a37f54e9e9480",
    measurementId: "G-6RXNYL8D6H"
};

// Initialize Firebase
console.log("🔥 Initializing Firebase...");
const app = initializeApp(firebaseConfig);

// Initialize services
const auth = getAuth(app);
const db = getFirestore(app);
const realtimeDb = getDatabase(app);

// Initialize Google Auth Provider
const googleProvider = new GoogleAuthProvider();
googleProvider.addScope('email');
googleProvider.addScope('profile');
googleProvider.setCustomParameters({
    prompt: 'select_account'
});

// Initialize Analytics (only in production)
let analytics = null;
if (typeof window !== 'undefined' && !window.location.hostname.includes('localhost')) {
    analytics = getAnalytics(app);
}

console.log("✅ Firebase initialized successfully");

export { 
    app, 
    auth, 
    db, 
    realtimeDb, 
    googleProvider,
    analytics
};

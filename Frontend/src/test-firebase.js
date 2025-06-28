// Firebase Configuration Test Script
import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider, signInWithPopup } from "firebase/auth";

// Test Firebase configuration
const testFirebaseConfig = async () => {
    console.log("🧪 Starting Firebase Configuration Test");
    
    // Log environment variables
    console.log("Environment Variables:");
    console.log("VITE_FIREBASE_API_KEY:", import.meta.env.VITE_FIREBASE_API_KEY);
    console.log("VITE_FIREBASE_AUTH_DOMAIN:", import.meta.env.VITE_FIREBASE_AUTH_DOMAIN);
    console.log("VITE_FIREBASE_PROJECT_ID:", import.meta.env.VITE_FIREBASE_PROJECT_ID);
    
    const firebaseConfig = {
        apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
        authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
        databaseURL: import.meta.env.VITE_FIREBASE_DATABASE_URL,
        projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
        storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
        messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
        appId: import.meta.env.VITE_FIREBASE_APP_ID,
        measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID
    };
    
    console.log("🔧 Firebase Config:", {
        ...firebaseConfig,
        apiKey: firebaseConfig.apiKey ? `${firebaseConfig.apiKey.substring(0, 8)}...` : "❌ Missing"
    });
    
    try {
        // Test Firebase App initialization
        console.log("📱 Testing Firebase App initialization...");
        const app = initializeApp(firebaseConfig);
        console.log("✅ Firebase App initialized successfully");
        
        // Test Auth initialization
        console.log("🔐 Testing Firebase Auth...");
        const auth = getAuth(app);
        console.log("✅ Firebase Auth initialized");
        
        // Test Google Provider
        console.log("🌐 Testing Google Auth Provider...");
        const provider = new GoogleAuthProvider();
        provider.addScope('email');
        provider.addScope('profile');
        console.log("✅ Google Auth Provider configured");
        
        // Test a simple auth operation (checking current user)
        console.log("👤 Checking current user...");
        console.log("Current user:", auth.currentUser);
        
        return { success: true, app, auth, provider };
        
    } catch (error) {
        console.error("❌ Firebase test failed:", error);
        
        // Detailed error analysis
        if (error.code === 'auth/api-key-not-valid' || error.code === 'auth/invalid-api-key') {
            console.error("🔑 API Key Issues Detected:");
            console.error("1. API Key format:", firebaseConfig.apiKey ? "Valid format" : "Invalid/Missing");
            console.error("2. API Key length:", firebaseConfig.apiKey?.length || "N/A");
            console.error("3. API Key starts with 'AIza':", firebaseConfig.apiKey?.startsWith('AIza') || false);
            
            console.error("\n🛠️ Troubleshooting Steps:");
            console.error("1. Go to Firebase Console → Project Settings → General");
            console.error("2. Check Web API Key value");
            console.error("3. Go to Google Cloud Console → APIs & Services → Credentials");
            console.error("4. Check if API key has restrictions");
            console.error("5. Verify Firebase Authentication API is enabled");
        }
        
        return { success: false, error };
    }
};

// Run test if this is the main module
if (typeof window !== 'undefined') {
    window.testFirebaseConfig = testFirebaseConfig;
    console.log("🧪 Firebase test function available as window.testFirebaseConfig()");
}

export { testFirebaseConfig };

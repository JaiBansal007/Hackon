// Firebase Authentication Troubleshooting and Solutions
// =======================================================

// 🔧 SOLUTION 1: Test with Direct API Key
export const testFirebaseConnection = () => {
    const testConfig = {
        apiKey: "AIzaSyAb0XOxDqJQFbKZwGgUDbgf4Sf4rBq7brc",
        authDomain: "hackerthon-f3eb0.firebaseapp.com",
        projectId: "hackerthon-f3eb0",
        storageBucket: "hackerthon-f3eb0.appspot.com",
        messagingSenderId: "1076738726399",
        appId: "1:1076738726399:web:8adbeaa6c9e62a3d4b0d06"
    };
    
    console.log("🧪 Testing Firebase connection with provided config...");
    console.log("Config:", testConfig);
    
    try {
        // This will help identify if the API key itself is the issue
        import('firebase/app').then(({ initializeApp }) => {
            const testApp = initializeApp(testConfig, 'test-app');
            console.log("✅ Firebase test app initialized successfully!");
            
            import('firebase/auth').then(({ getAuth, GoogleAuthProvider }) => {
                const testAuth = getAuth(testApp);
                const testProvider = new GoogleAuthProvider();
                console.log("✅ Firebase Auth test successful!");
                console.log("🔑 API Key is valid");
            });
        });
    } catch (error) {
        console.error("❌ Firebase test failed:", error);
        if (error.code === 'auth/invalid-api-key') {
            console.error("🔑 The API key is invalid or restricted");
        }
    }
};

// 🔧 SOLUTION 2: Firebase Console Checklist
export const firebaseSetupChecklist = () => {
    console.log(`
🔥 FIREBASE SETUP CHECKLIST
============================

1. 🌐 Firebase Console (https://console.firebase.google.com)
   ✓ Go to Project Settings → General
   ✓ Copy the current Web API Key
   ✓ Check if it matches: AIzaSyAb0XOxDqJQFbKZwGgUDbgf4Sf4rBq7brc

2. 🔐 Authentication Settings
   ✓ Go to Authentication → Sign-in method
   ✓ Enable Google sign-in provider
   ✓ Add authorized domains:
     - localhost
     - localhost:5173
     - localhost:5174

3. ☁️ Google Cloud Console (https://console.cloud.google.com)
   ✓ Go to APIs & Services → Credentials
   ✓ Find your API key
   ✓ Check Application restrictions:
     - Set to "None" or "HTTP referrers"
   ✓ If HTTP referrers, add:
     - http://localhost:5173/*
     - http://localhost:5174/*

4. 🔑 API Restrictions
   ✓ Enable these APIs:
     - Firebase Authentication API
     - Identity and Access Management (IAM) API
     - Google Analytics API (optional)

5. 🌍 Domain Authorization
   ✓ In Firebase Console → Authentication → Settings
   ✓ Add authorized domains:
     - localhost
     - your-future-domain.com
    `);
};

// 🔧 SOLUTION 3: Environment Variable Debug
export const debugEnvironmentVariables = () => {
    console.log("🔍 ENVIRONMENT VARIABLES DEBUG");
    console.log("================================");
    
    const envVars = {
        'VITE_FIREBASE_API_KEY': import.meta.env.VITE_FIREBASE_API_KEY,
        'VITE_FIREBASE_AUTH_DOMAIN': import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
        'VITE_FIREBASE_PROJECT_ID': import.meta.env.VITE_FIREBASE_PROJECT_ID,
        'VITE_FIREBASE_STORAGE_BUCKET': import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
        'VITE_FIREBASE_MESSAGING_SENDER_ID': import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
        'VITE_FIREBASE_APP_ID': import.meta.env.VITE_FIREBASE_APP_ID,
        'VITE_FIREBASE_MEASUREMENT_ID': import.meta.env.VITE_FIREBASE_MEASUREMENT_ID
    };
    
    Object.entries(envVars).forEach(([key, value]) => {
        const status = value ? '✅' : '❌';
        const displayValue = value ? 
            (key === 'VITE_FIREBASE_API_KEY' ? `${value.substring(0, 8)}...` : value) : 
            'MISSING';
        console.log(`${status} ${key}: ${displayValue}`);
    });
    
    // Check if .env file is being loaded
    const allEnvVars = Object.keys(import.meta.env).filter(key => key.startsWith('VITE_'));
    console.log(`\n📋 Total VITE_ variables found: ${allEnvVars.length}`);
    console.log("Variables:", allEnvVars);
};

// 🔧 SOLUTION 4: Manual Firebase Config
export const createManualFirebaseConfig = () => {
    // Use this if environment variables aren't working
    return {
        apiKey: "AIzaSyAb0XOxDqJQFbKZwGgUDbgf4Sf4rBq7brc",
        authDomain: "hackerthon-f3eb0.firebaseapp.com",
        databaseURL: "https://hackerthon-f3eb0-default-rtdb.firebaseio.com",
        projectId: "hackerthon-f3eb0",
        storageBucket: "hackerthon-f3eb0.appspot.com",
        messagingSenderId: "1076738726399",
        appId: "1:1076738726399:web:8adbeaa6c9e62a3d4b0d06",
        measurementId: "G-QG47WPQXDY"
    };
};

// Auto-run diagnostics
console.log("🔥 FIREBASE DIAGNOSTICS LOADED");
console.log("Run these functions in console:");
console.log("- testFirebaseConnection()");
console.log("- firebaseSetupChecklist()");
console.log("- debugEnvironmentVariables()");

// Auto-run environment debug
debugEnvironmentVariables();

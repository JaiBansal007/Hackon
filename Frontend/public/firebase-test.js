// Firebase Authentication Test
// Open browser console and run: testFirebaseAuth()

window.testFirebaseAuth = function() {
    console.log("🔥 Testing Firebase Authentication...");
    
    // Test 1: Check if Firebase config is loaded
    console.log("📋 Environment Variables:");
    console.log("- API Key:", import.meta.env.VITE_FIREBASE_API_KEY ? "✅ Present" : "❌ Missing");
    console.log("- Auth Domain:", import.meta.env.VITE_FIREBASE_AUTH_DOMAIN ? "✅ Present" : "❌ Missing");
    console.log("- Project ID:", import.meta.env.VITE_FIREBASE_PROJECT_ID ? "✅ Present" : "❌ Missing");
    
    // Test 2: Check if Firebase services are initialized
    try {
        import('./firebase/config.js').then(({ auth, googleProvider }) => {
            console.log("🔧 Firebase Services:");
            console.log("- Auth:", auth ? "✅ Initialized" : "❌ Not initialized");
            console.log("- Google Provider:", googleProvider ? "✅ Initialized" : "❌ Not initialized");
        });
        
        import('./firebase/auth.js').then((authService) => {
            console.log("🔐 Auth Service:", authService.default ? "✅ Available" : "❌ Not available");
        });
        
    } catch (error) {
        console.error("❌ Firebase test failed:", error);
    }
    
    console.log("✨ Test complete! Check the logs above.");
}

console.log("🔥 Firebase test function loaded. Run testFirebaseAuth() to test.");

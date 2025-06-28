import { 
    signInWithPopup, 
    signOut, 
    onAuthStateChanged,
    GoogleAuthProvider
} from "firebase/auth";
import { auth, googleProvider } from "./config";

class AuthService {
    constructor() {
        this.currentUser = null;
        this.authCallbacks = [];
        this.authReady = false; // Track if auth is ready
        
        // Listen for auth state changes
        if (auth) {
            onAuthStateChanged(auth, (user) => {
                this.currentUser = user;
                this.authReady = true; // Mark auth as ready
                this.notifyAuthCallbacks(user);
                
                if (user) {
                    console.log("👤 User signed in:", user.displayName || user.email);
                    // Store user data in localStorage for persistence
                    localStorage.setItem("user", JSON.stringify({
                        uid: user.uid,
                        name: user.displayName || user.email,
                        email: user.email,
                        photoURL: user.photoURL
                    }));
                } else {
                    console.log("👤 User signed out");
                    localStorage.removeItem("user");
                }
            });
        }
    }

    // Get current user (from Firebase or localStorage)
    getCurrentUser() {
        // First check if Firebase has a current user
        if (this.currentUser) {
            return this.currentUser;
        }
        
        // Fallback to localStorage if Firebase is still loading
        try {
            const storedUser = localStorage.getItem("user");
            if (storedUser) {
                return JSON.parse(storedUser);
            }
        } catch (error) {
            console.warn("Failed to parse stored user data:", error);
            localStorage.removeItem("user");
        }
        
        return null;
    }

    // Check if auth state is ready
    isAuthReady() {
        return this.authReady;
    }

    // Sign in with Google
    async signInWithGoogle() {
        try {
            if (!auth || !googleProvider) {
                throw new Error("Firebase auth not initialized");
            }

            console.log("🔄 Attempting Google sign-in...");

            const result = await signInWithPopup(auth, googleProvider);
            const user = result.user;
            
            console.log("✅ Google sign-in successful:", user.displayName);
            
            return {
                success: true,
                user: {
                    uid: user.uid,
                    name: user.displayName,
                    email: user.email,
                    photoURL: user.photoURL
                }
            };
        } catch (error) {
            console.error("❌ Google sign-in failed:", error);
            
            // Provide more specific error messages
            let errorMessage = error.message;
            if (error.code === 'auth/popup-closed-by-user') {
                errorMessage = "Sign-in was cancelled. Please try again.";
            } else if (error.code === 'auth/popup-blocked') {
                errorMessage = "Popup was blocked. Please allow popups and try again.";
            } else if (error.code === 'auth/network-request-failed') {
                errorMessage = "Network error. Please check your connection and try again.";
            } else if (error.code === 'auth/internal-error') {
                errorMessage = "Internal error. Please try again later.";
            }
            
            return {
                success: false,
                error: errorMessage
            };
        }
    }

    // Sign out
    async signOut() {
        try {
            if (!auth) {
                throw new Error("Firebase auth not initialized");
            }

            await signOut(auth);
            
            console.log("✅ User signed out successfully");
            return { success: true };
        } catch (error) {
            console.error("❌ Sign out failed:", error);
            return { success: false, error: error.message };
        }
    }

    // Legacy method name for backward compatibility
    async signOutUser() {
        return this.signOut();
    }

    // Get current user
    getCurrentUser() {
        return this.currentUser;
    }

    // Check if user is authenticated
    isAuthenticated() {
        return !!this.currentUser;
    }

    // Subscribe to auth state changes
    onAuthStateChange(callback) {
        this.authCallbacks.push(callback);
        
        // Call immediately with current state
        callback(this.currentUser);
        
        // Return unsubscribe function
        return () => {
            this.authCallbacks = this.authCallbacks.filter(cb => cb !== callback);
        };
    }

    // Notify all auth callbacks
    notifyAuthCallbacks(user) {
        this.authCallbacks.forEach(callback => {
            try {
                callback(user);
            } catch (error) {
                console.error("Auth callback error:", error);
            }
        });
    }

    // Get user from localStorage (for persistence)
    getUserFromStorage() {
        try {
            const userData = localStorage.getItem("user");
            return userData ? JSON.parse(userData) : null;
        } catch (error) {
            console.error("Error getting user from storage:", error);
            return null;
        }
    }
}

// Create singleton instance
const authService = new AuthService();

export default authService;

import { 
    signInWithPopup, 
    signOut, 
    onAuthStateChanged,
    GoogleAuthProvider,
    signInWithEmailAndPassword,
    createUserWithEmailAndPassword,
    RecaptchaVerifier,
    updateProfile
} from "firebase/auth";
import { auth, googleProvider, db } from "./config";
import { doc, setDoc, getDoc, serverTimestamp } from "firebase/firestore";

class AuthService {
    constructor() {
        this.currentUser = null;
        this.authCallbacks = [];
        this.authReady = false; // Track if auth is ready
        this.recaptchaVerifier = null; // For email auth protection
        
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
                const userData = JSON.parse(storedUser);
                // Return a user-like object with essential properties
                return {
                    uid: userData.uid,
                    displayName: userData.name,
                    email: userData.email,
                    photoURL: userData.photoURL
                };
            }
        } catch (error) {
            console.warn("Failed to parse stored user data:", error);
            localStorage.removeItem("user");
        }
        
        return null;
    }

    // Fast user check without waiting for Firebase
    getCachedUser() {
        try {
            const storedUser = localStorage.getItem("user");
            if (storedUser) {
                return JSON.parse(storedUser);
            }
        } catch (error) {
            console.warn("Failed to parse cached user data:", error);
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

    // Check if user is authenticated
    isAuthenticated() {
        return !!this.currentUser;
    }

    // Wait for auth to be ready
    async waitForAuth() {
        if (this.authReady) {
            return this.currentUser;
        }
        
        return new Promise((resolve) => {
            const checkAuth = () => {
                if (this.authReady) {
                    resolve(this.currentUser);
                } else {
                    setTimeout(checkAuth, 100);
                }
            };
            checkAuth();
        });
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

    // Initialize reCAPTCHA verifier for email auth protection
    setupRecaptcha(containerId) {
        try {
            if (!auth) {
                throw new Error("Firebase auth not initialized");
            }

            // Clear existing verifier first
            this.clearRecaptcha();

            this.recaptchaVerifier = new RecaptchaVerifier(auth, containerId, {
                size: 'normal',
                callback: (response) => {
                    console.log("✅ reCAPTCHA completed successfully");
                },
                'expired-callback': () => {
                    console.warn("⚠️ reCAPTCHA expired, please refresh");
                },
                'error-callback': (error) => {
                    console.error("❌ reCAPTCHA error:", error);
                }
            });

            // Render the reCAPTCHA
            this.recaptchaVerifier.render().then((widgetId) => {
                console.log("🛡️ reCAPTCHA widget rendered with ID:", widgetId);
            }).catch((error) => {
                console.error("❌ reCAPTCHA render error:", error);
            });

            return this.recaptchaVerifier;
        } catch (error) {
            console.error("❌ Failed to setup reCAPTCHA:", error);
            throw error;
        }
    }

    // Sign in with email and password (with reCAPTCHA protection)
    async signInWithEmail(email, password, recaptchaVerifier = null) {
        try {
            if (!auth) {
                throw new Error("Firebase auth not initialized");
            }

            console.log("📧 Attempting email sign-in");

            // Only verify reCAPTCHA if provided (optional for sign-in)
            if (recaptchaVerifier || this.recaptchaVerifier) {
                try {
                    await (recaptchaVerifier || this.recaptchaVerifier).verify();
                    console.log("✅ reCAPTCHA verified for sign-in");
                } catch (error) {
                    console.warn("⚠️ reCAPTCHA verification failed, proceeding without it for sign-in");
                }
            }

            const userCredential = await signInWithEmailAndPassword(auth, email, password);
            const user = userCredential.user;
            
            // Update last login time
            await this.storeUserData(user, { lastLoginAt: serverTimestamp() });
            
            console.log("✅ Email sign-in successful:", user.email);
            
            return {
                success: true,
                user: {
                    uid: user.uid,
                    name: user.displayName || user.email,
                    email: user.email,
                    photoURL: user.photoURL,
                    emailVerified: user.emailVerified
                }
            };
        } catch (error) {
            console.error("❌ Email sign-in failed:", error);
            
            let errorMessage = error.message;
            if (error.code === 'auth/user-not-found') {
                errorMessage = "No account found with this email address.";
            } else if (error.code === 'auth/wrong-password') {
                errorMessage = "Incorrect password. Please try again.";
            } else if (error.code === 'auth/invalid-email') {
                errorMessage = "Invalid email address format.";
            } else if (error.code === 'auth/too-many-requests') {
                errorMessage = "Too many failed attempts. Please try again later.";
            } else if (error.message.includes('reCAPTCHA')) {
                errorMessage = "Please complete the reCAPTCHA verification.";
            }
            
            return {
                success: false,
                error: errorMessage
            };
        }
    }

    // Create account with email and password (with reCAPTCHA protection)
    async createAccountWithEmail(email, password, displayName) {
        try {
            if (!auth) {
                throw new Error("Firebase auth not initialized");
            }

            console.log("📧 Creating new account with email/password");

            // Validate password strength
            const passwordValidation = this.validatePassword(password);
            if (!passwordValidation.isValid) {
                throw new Error(passwordValidation.errors.join('. '));
            }

            // Create user account - Firebase will automatically use the reCAPTCHA if it's rendered
            const userCredential = await createUserWithEmailAndPassword(auth, email, password);
            const user = userCredential.user;

            console.log("✅ User account created successfully");

            // Update profile with display name if provided
            if (displayName) {
                await updateProfile(user, { displayName });
                console.log("✅ Profile updated with display name");
            }
            
            // Store user data in Firestore
            await this.storeUserData(user, { 
                displayName: displayName || null,
                accountType: 'email',
                preferences: {
                    theme: 'dark',
                    language: 'en',
                    notifications: true
                }
            });
            
            console.log("✅ Account created and data stored successfully:", user.email);
            
            return {
                success: true,
                user: {
                    uid: user.uid,
                    name: displayName || user.email,
                    email: user.email,
                    photoURL: user.photoURL,
                    emailVerified: user.emailVerified
                }
            };
        } catch (error) {
            console.error("❌ Account creation failed:", error);
            
            let errorMessage = error.message;
            if (error.code === 'auth/operation-not-allowed') {
                errorMessage = "Email/password authentication is not enabled. Please enable it in Firebase Console → Authentication → Sign-in method → Email/Password.";
            } else if (error.code === 'auth/email-already-in-use') {
                errorMessage = "An account with this email already exists.";
            } else if (error.code === 'auth/weak-password') {
                errorMessage = "Password is too weak. Please use a stronger password.";
            } else if (error.code === 'auth/invalid-email') {
                errorMessage = "Invalid email address format.";
            } else if (error.message.includes('reCAPTCHA')) {
                errorMessage = "Please complete the reCAPTCHA verification.";
            }
            
            return {
                success: false,
                error: errorMessage
            };
        }
    }

    // Enhanced password validation
    validatePassword(password) {
        const minLength = 8;
        const hasUpperCase = /[A-Z]/.test(password);
        const hasLowerCase = /[a-z]/.test(password);
        const hasNumbers = /\d/.test(password);
        const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(password);

        const errors = [];
        const requirements = [
            { met: password.length >= minLength, text: `At least ${minLength} characters` },
            { met: hasUpperCase, text: "One uppercase letter" },
            { met: hasLowerCase, text: "One lowercase letter" },
            { met: hasNumbers, text: "One number" },
            { met: hasSpecialChar, text: "One special character" }
        ];
        
        if (password.length < minLength) {
            errors.push(`Password must be at least ${minLength} characters long`);
        }
        if (!hasUpperCase) {
            errors.push("Password must contain at least one uppercase letter");
        }
        if (!hasLowerCase) {
            errors.push("Password must contain at least one lowercase letter");
        }
        if (!hasNumbers) {
            errors.push("Password must contain at least one number");
        }
        if (!hasSpecialChar) {
            errors.push("Password must contain at least one special character (!@#$%^&*(),.?\":{}|<>)");
        }

        return {
            isValid: errors.length === 0,
            errors: errors,
            requirements: requirements,
            strength: this.calculatePasswordStrength(password)
        };
    }

    // Calculate password strength
    calculatePasswordStrength(password) {
        let score = 0;
        
        if (password.length >= 8) score += 20;
        if (password.length >= 12) score += 10;
        if (/[a-z]/.test(password)) score += 20;
        if (/[A-Z]/.test(password)) score += 20;
        if (/[0-9]/.test(password)) score += 20;
        if (/[^A-Za-z0-9]/.test(password)) score += 20;

        if (score <= 40) return 'weak';
        if (score <= 70) return 'medium';
        return 'strong';
    }

    // Store user data in Firestore
    async storeUserData(user, additionalData = {}) {
        try {
            if (!db) {
                console.warn("Firestore not initialized, storing locally only");
                return { success: true };
            }

            const userData = {
                uid: user.uid,
                email: user.email,
                displayName: user.displayName || additionalData.displayName || null,
                photoURL: user.photoURL || null,
                phoneNumber: user.phoneNumber || null,
                createdAt: serverTimestamp(),
                lastLoginAt: serverTimestamp(),
                emailVerified: user.emailVerified,
                ...additionalData
            };

            await setDoc(doc(db, "users", user.uid), userData, { merge: true });
            
            console.log("✅ User data stored successfully");
            return { success: true, userData };
        } catch (error) {
            console.error("❌ Failed to store user data:", error);
            return { success: false, error: error.message };
        }
    }

    // Get user data from Firestore
    async getUserData(uid) {
        try {
            if (!db) {
                console.warn("Firestore not initialized");
                return { success: false, error: "Database not available" };
            }

            const docRef = doc(db, "users", uid);
            const docSnap = await getDoc(docRef);

            if (docSnap.exists()) {
                return { success: true, userData: docSnap.data() };
            } else {
                return { success: false, error: "User data not found" };
            }
        } catch (error) {
            console.error("❌ Failed to get user data:", error);
            return { success: false, error: error.message };
        }
    }

    // Clean up reCAPTCHA verifier
    clearRecaptcha() {
        if (this.recaptchaVerifier) {
            this.recaptchaVerifier.clear();
            this.recaptchaVerifier = null;
            console.log("🧹 reCAPTCHA verifier cleared");
        }
    }
}

// Create singleton instance
const authService = new AuthService();

export default authService;

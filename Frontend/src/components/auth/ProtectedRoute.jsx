"use client"

import { useState, useEffect } from "react"
import { Navigate } from "react-router-dom"
import authService from "../../firebase/auth"
import { BeautifulLoader } from "../ui/beautiful-loader"

const ProtectedRoute = ({ children }) => {
  const [user, setUser] = useState(null)
  const [authLoading, setAuthLoading] = useState(true)

  useEffect(() => {
    const initAuth = async () => {
      // First, check for cached user immediately
      const storedUser = authService.getCurrentUser();
      if (storedUser) {
        setUser(storedUser);
        setAuthLoading(false);
        return;
      }

      // Set a timeout for Firebase auth to prevent indefinite waiting
      const authTimeout = setTimeout(() => {
        console.log("⏰ Auth timeout reached, proceeding with stored user check");
        setAuthLoading(false);
      }, 2000); // 2 second timeout

      try {
        // Wait for Firebase auth to be ready
        await authService.waitForAuth();
        clearTimeout(authTimeout);
        
        const firebaseUser = authService.getCurrentUser();
        if (firebaseUser) {
          const userData = {
            uid: firebaseUser.uid,
            name: firebaseUser.displayName,
            email: firebaseUser.email,
            photoURL: firebaseUser.photoURL
          }
          setUser(userData);
        }
      } catch (error) {
        console.error("Auth initialization error:", error);
        clearTimeout(authTimeout);
      } finally {
        setAuthLoading(false);
      }
    };

    initAuth();

    // Also listen for auth state changes
    const unsubscribe = authService.onAuthStateChange((firebaseUser) => {
      if (firebaseUser) {
        const userData = {
          uid: firebaseUser.uid,
          name: firebaseUser.displayName,
          email: firebaseUser.email,
          photoURL: firebaseUser.photoURL
        }
        setUser(userData)
      } else {
        setUser(null)
      }
      setAuthLoading(false)
    })

    return unsubscribe
  }, [])

  // Show loading while determining auth state
  if (authLoading) {
    return (
      <BeautifulLoader 
        title="FireStream"
        subtitle="Checking authentication..."
        showFeatures={false}
        size="medium"
      />
    )
  }

  // Redirect to signin if not authenticated
  if (!user) {
    return <Navigate to="/signin" replace />
  }

  // User is authenticated, render the protected content
  return children
}

export default ProtectedRoute

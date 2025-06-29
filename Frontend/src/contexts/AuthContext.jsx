"use client"

import { createContext, useContext, useState, useEffect } from "react"
import authService from "../firebase/auth"

const AuthContext = createContext()

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    // Initialize with cached user immediately to prevent redirects
    const cachedUser = authService.getCurrentUser()
    return cachedUser
  })
  const [authLoading, setAuthLoading] = useState(() => {
    // If we have a cached user, don't show loading
    const cachedUser = authService.getCurrentUser()
    return !cachedUser
  })
  const [authReady, setAuthReady] = useState(false)

  useEffect(() => {
    let mounted = true

    const initAuth = async () => {
      // Check if we already have a user from cache
      const cachedUser = authService.getCurrentUser()
      if (cachedUser && mounted) {
        setUser(cachedUser)
        setAuthLoading(false)
        setAuthReady(true)
        return
      }

      // Set up auth state listener
      const unsubscribe = authService.onAuthStateChange((firebaseUser) => {
        if (!mounted) return

        if (firebaseUser) {
          const userData = {
            uid: firebaseUser.uid,
            name: firebaseUser.displayName || firebaseUser.email,
            email: firebaseUser.email,
            photoURL: firebaseUser.photoURL
          }
          setUser(userData)
        } else {
          setUser(null)
        }
        
        setAuthLoading(false)
        setAuthReady(true)
      })

      // Set a timeout to prevent indefinite loading
      const authTimeout = setTimeout(() => {
        if (mounted) {
          console.log("⏰ Auth initialization timeout")
          setAuthLoading(false)
          setAuthReady(true)
        }
      }, 1500) // Reduced timeout

      return () => {
        clearTimeout(authTimeout)
        if (unsubscribe) unsubscribe()
      }
    }

    const cleanup = initAuth()
    
    return () => {
      mounted = false
      if (cleanup && typeof cleanup.then === 'function') {
        cleanup.then(cleanupFn => cleanupFn && cleanupFn())
      } else if (cleanup && typeof cleanup === 'function') {
        cleanup()
      }
    }
  }, [])

  const signOut = async () => {
    try {
      await authService.signOut()
      setUser(null)
    } catch (error) {
      console.error("Sign out error:", error)
    }
  }

  const isAuthenticated = () => {
    return user !== null
  }

  const value = {
    user,
    authLoading,
    authReady,
    isAuthenticated,
    signOut
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}

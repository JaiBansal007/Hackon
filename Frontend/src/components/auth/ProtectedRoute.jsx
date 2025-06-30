"use client"

import { Navigate } from "react-router-dom"
import { useAuth } from "../../contexts/AuthContext"
import { BeautifulLoader } from "../ui/beautiful-loader"

const ProtectedRoute = ({ children }) => {
  const { user, authLoading, authReady } = useAuth()

  // Show minimal loading only if auth is not ready and we don't have a cached user
  if (authLoading && !authReady) {
    return (
      <BeautifulLoader 
        title="FireStream"
        subtitle="Loading..."
        showFeatures={false}
        size="small"
      />
    )
  }

  // Redirect to signin if not authenticated and auth is ready
  if (authReady && !user) {
    return <Navigate to="/signin" replace />
  }

  // If we have a user (from cache or auth), render the protected content immediately
  if (user) {
    return children
  }

  // Fallback loading state
  return (
    <BeautifulLoader 
      title="FireStream"
      subtitle="Authenticating..."
      showFeatures={false}
      size="small"
    />
  )
}

export default ProtectedRoute

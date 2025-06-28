"use client"

import React from "react"
import { useState, useEffect } from "react"
import { Link, useNavigate } from "react-router-dom"
import { Button } from "../../components/ui/button"
import { Input } from "../../components/ui/input"
import { Label } from "../../components/ui/label"
import { Eye, EyeOff, Play, CheckCircle, XCircle, Info } from "lucide-react"
import authService from "../../firebase/auth"

export default function NetflixStyleAuth() {
  const [showPassword, setShowPassword] = useState(false)
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [displayName, setDisplayName] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")
  const [isSignUp, setIsSignUp] = useState(false)
  const [passwordStrength, setPasswordStrength] = useState(null)
  const [passwordValidation, setPasswordValidation] = useState(null)
  const navigate = useNavigate()

  // Check if user is already authenticated
  useEffect(() => {
    const unsubscribe = authService.onAuthStateChange((user) => {
      if (user) {
        navigate("/home")
      }
    })

    return unsubscribe
  }, [navigate])

  // Cleanup reCAPTCHA on unmount
  useEffect(() => {
    return () => {
      authService.clearRecaptcha()
    }
  }, [])

  // Validate password in real-time
  useEffect(() => {
    if (password && isSignUp) {
      const validation = authService.validatePassword(password)
      setPasswordValidation(validation)
      setPasswordStrength(validation.strength)
    } else {
      setPasswordValidation(null)
      setPasswordStrength(null)
    }
  }, [password, isSignUp])

  const handleEmailAuth = async (e) => {
    e.preventDefault()
    setIsLoading(true)
    setError("")
    setSuccess("")

    // Basic validation
    if (!email || !password) {
      setError("Please fill in all fields")
      setIsLoading(false)
      return
    }

    if (isSignUp && !displayName.trim()) {
      setError("Please enter your full name")
      setIsLoading(false)
      return
    }

    if (isSignUp && passwordValidation && !passwordValidation.isValid) {
      setError(passwordValidation.errors[0])
      setIsLoading(false)
      return
    }

    try {
      // Setup reCAPTCHA verifier
      const recaptchaVerifier = authService.setupRecaptcha('email-recaptcha-container')
      
      // Sign in or create account based on mode
      const result = isSignUp 
        ? await authService.createAccountWithEmail(email, password, displayName.trim(), recaptchaVerifier)
        : await authService.signInWithEmail(email, password, recaptchaVerifier)
      
      if (result.success) {
        console.log(`✅ Email ${isSignUp ? 'sign-up' : 'sign-in'} successful`)
        setSuccess(`${isSignUp ? 'Welcome to FireStream!' : 'Welcome back!'} Redirecting...`)
        authService.clearRecaptcha()
        setTimeout(() => navigate("/home"), 1500)
      } else {
        setError(result.error || `Failed to ${isSignUp ? 'create account' : 'sign in'}`)
        authService.clearRecaptcha()
      }
    } catch (error) {
      console.error(`❌ Email ${isSignUp ? 'sign-up' : 'sign-in'} error:`, error)
      setError(`Failed to ${isSignUp ? 'create account' : 'sign in'}`)
      authService.clearRecaptcha()
    } finally {
      setIsLoading(false)
    }
  }

  const handleGoogleAuth = async () => {
    setIsLoading(true)
    setError("")
    setSuccess("")
    
    try {
      const result = await authService.signInWithGoogle()
      
      if (result.success) {
        console.log("✅ Google authentication successful")
        setSuccess("Welcome! Redirecting...")
        setTimeout(() => navigate("/home"), 1000)
      } else {
        setError(result.error || "Failed to sign in with Google")
      }
    } catch (error) {
      console.error("❌ Google authentication error:", error)
      setError("An unexpected error occurred")
    } finally {
      setIsLoading(false)
    }
  }

  const toggleMode = () => {
    setIsSignUp(!isSignUp)
    setError("")
    setSuccess("")
    setDisplayName("")
    setPasswordValidation(null)
    setPasswordStrength(null)
    authService.clearRecaptcha()
  }

  return (
    <div className="min-h-screen w-full relative overflow-hidden bg-black">
      {/* Background Video/Image Overlay */}
      <div className="absolute inset-0">
        <div className="absolute inset-0 bg-gradient-to-r from-black via-black/80 to-transparent z-10" />
        <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-black/60 z-10" />
        <div 
          className="w-full h-full bg-cover bg-center bg-no-repeat"
          style={{
            backgroundImage: "url('https://assets.nflxext.com/ffe/siteui/vlv3/a56dc29b-a0ec-4f6f-85fb-50df0680f80f/2f8ae902-8afa-4096-aa78-2dcaa90a30f0/US-en-20240617-popsignuptwoweeks-perspective_alpha_website_large.jpg')"
          }}
        />
      </div>

      {/* Header */}
      <div className="relative z-20 flex items-center justify-between p-6 md:p-8">
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 bg-red-600 rounded flex items-center justify-center">
            <Play className="w-4 h-4 text-white fill-white" />
          </div>
          <span className="text-2xl md:text-3xl font-bold text-red-600">
            FireStream
          </span>
        </div>
      </div>

      {/* Main Content */}
      <div className="relative z-20 flex items-center justify-center min-h-screen px-4 py-8">
        <div className="w-full max-w-md">
          {/* Auth Card */}
          <div className="bg-black/80 backdrop-blur-md rounded-lg p-8 md:p-12 shadow-2xl border border-gray-800">
            <div className="text-center mb-8">
              <h1 className="text-3xl md:text-4xl font-bold text-white mb-2">
                {isSignUp ? 'Join FireStream' : 'Sign In'}
              </h1>
              <p className="text-gray-400 text-sm md:text-base">
                {isSignUp 
                  ? 'Create your account to start streaming' 
                  : 'Welcome back to your cinematic experience'
                }
              </p>
            </div>

            {/* Error/Success Messages */}
            {error && (
              <div className="mb-6 p-4 bg-red-900/50 border border-red-700 rounded-lg flex items-center space-x-3">
                <XCircle className="w-5 h-5 text-red-400 flex-shrink-0" />
                <span className="text-red-300 text-sm">{error}</span>
              </div>
            )}

            {success && (
              <div className="mb-6 p-4 bg-green-900/50 border border-green-700 rounded-lg flex items-center space-x-3">
                <CheckCircle className="w-5 h-5 text-green-400 flex-shrink-0" />
                <span className="text-green-300 text-sm">{success}</span>
              </div>
            )}

            {/* Google Sign In */}
            <Button
              onClick={handleGoogleAuth}
              disabled={isLoading}
              className="w-full h-12 bg-white hover:bg-gray-100 text-black font-semibold rounded-lg transition-all duration-200 mb-6 flex items-center justify-center space-x-3"
            >
              {isLoading ? (
                <div className="w-5 h-5 border-2 border-gray-600 border-t-black rounded-full animate-spin" />
              ) : (
                <>
                  <svg className="w-5 h-5" viewBox="0 0 24 24">
                    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                  </svg>
                  <span>Continue with Google</span>
                </>
              )}
            </Button>

            {/* Divider */}
            <div className="relative mb-6">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-700" />
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="bg-black px-4 text-gray-400">or</span>
              </div>
            </div>

            {/* Email Form */}
            <form onSubmit={handleEmailAuth} className="space-y-6">
              {/* Full Name (Sign Up Only) */}
              {isSignUp && (
                <div className="space-y-2">
                  <Label htmlFor="displayName" className="text-sm font-medium text-gray-300">
                    Full Name
                  </Label>
                  <Input
                    id="displayName"
                    type="text"
                    value={displayName}
                    onChange={(e) => setDisplayName(e.target.value)}
                    placeholder="Enter your full name"
                    className="h-12 bg-gray-900/50 border-gray-700 focus:border-red-500 focus:ring-red-500/20 text-white placeholder-gray-500 rounded-lg transition-all duration-200"
                    required={isSignUp}
                  />
                </div>
              )}

              {/* Email */}
              <div className="space-y-2">
                <Label htmlFor="email" className="text-sm font-medium text-gray-300">
                  Email Address
                </Label>
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter your email"
                  className="h-12 bg-gray-900/50 border-gray-700 focus:border-red-500 focus:ring-red-500/20 text-white placeholder-gray-500 rounded-lg transition-all duration-200"
                  required
                />
              </div>

              {/* Password */}
              <div className="space-y-2">
                <Label htmlFor="password" className="text-sm font-medium text-gray-300">
                  Password
                </Label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder={isSignUp ? "Create a strong password" : "Enter your password"}
                    className="h-12 bg-gray-900/50 border-gray-700 focus:border-red-500 focus:ring-red-500/20 text-white placeholder-gray-500 rounded-lg pr-12 transition-all duration-200"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 pr-4 flex items-center text-gray-400 hover:text-gray-300 transition-colors duration-200"
                  >
                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>

                {/* Password Strength Indicator (Sign Up Only) */}
                {isSignUp && passwordStrength && (
                  <div className="mt-2">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs text-gray-400">Password Strength</span>
                      <span 
                        className="text-xs font-medium"
                        style={{ color: passwordStrength.color }}
                      >
                        {passwordStrength.text}
                      </span>
                    </div>
                    <div className="w-full bg-gray-700 rounded-full h-2">
                      <div 
                        className="h-2 rounded-full transition-all duration-300"
                        style={{ 
                          backgroundColor: passwordStrength.color,
                          width: passwordStrength.level === 'weak' ? '33%' : 
                                 passwordStrength.level === 'medium' ? '66%' : '100%'
                        }}
                      />
                    </div>
                  </div>
                )}

                {/* Password Requirements (Sign Up Only) */}
                {isSignUp && passwordValidation && password && (
                  <div className="mt-3 p-3 bg-gray-900/50 rounded-lg border border-gray-700">
                    <div className="flex items-center space-x-2 mb-2">
                      <Info className="w-4 h-4 text-gray-400" />
                      <span className="text-xs text-gray-400">Password Requirements:</span>
                    </div>
                    <div className="space-y-1">
                      {passwordValidation.errors.map((error, index) => (
                        <div key={index} className="flex items-center space-x-2">
                          <XCircle className="w-3 h-3 text-red-400" />
                          <span className="text-xs text-red-300">{error}</span>
                        </div>
                      ))}
                      {passwordValidation.isValid && (
                        <div className="flex items-center space-x-2">
                          <CheckCircle className="w-3 h-3 text-green-400" />
                          <span className="text-xs text-green-300">Password meets all requirements</span>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>

              {/* reCAPTCHA Container */}
              <div className="flex justify-center">
                <div id="email-recaptcha-container" className="min-h-[78px] flex items-center justify-center"></div>
              </div>

              {/* Submit Button */}
              <Button
                type="submit"
                disabled={isLoading || !email || !password || (isSignUp && !displayName.trim())}
                className="w-full h-12 bg-red-600 hover:bg-red-700 text-white font-semibold rounded-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? (
                  <div className="flex items-center space-x-2">
                    <div className="w-5 h-5 border-2 border-gray-300 border-t-white rounded-full animate-spin"></div>
                    <span>{isSignUp ? 'Creating Account...' : 'Signing In...'}</span>
                  </div>
                ) : (
                  `${isSignUp ? 'Create Account' : 'Sign In'}`
                )}
              </Button>
            </form>

            {/* Toggle Mode */}
            <div className="mt-8 text-center">
              <p className="text-gray-400 text-sm">
                {isSignUp ? 'Already have an account?' : "Don't have an account?"}{" "}
                <button
                  type="button"
                  onClick={toggleMode}
                  className="text-red-500 hover:text-red-400 font-medium transition-colors duration-200"
                >
                  {isSignUp ? 'Sign In' : 'Sign Up'}
                </button>
              </p>
            </div>

            {/* Footer Links */}
            <div className="mt-8 text-center text-xs text-gray-500">
              <p>
                By continuing, you agree to FireStream's{" "}
                <Link to="#" className="text-red-500 hover:text-red-400 transition-colors duration-200">
                  Terms of Service
                </Link>{" "}
                and{" "}
                <Link to="#" className="text-red-500 hover:text-red-400 transition-colors duration-200">
                  Privacy Policy
                </Link>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

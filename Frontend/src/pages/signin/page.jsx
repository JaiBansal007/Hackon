"use client"

import React from "react"
import { useState, useEffect } from "react"
import { Link, useNavigate } from "react-router-dom"
import { Button } from "../../components/ui/button"
import { Input } from "../../components/ui/input"
import { Label } from "../../components/ui/label"
import { Eye, EyeOff, Play, CheckCircle, XCircle, Info, ArrowLeft, Sparkles, Users, FileText, Trophy, MessageCircle, BarChart3 } from "lucide-react"
import authService from "../../firebase/auth"
import { BeautifulLoader } from "../../components/ui/beautiful-loader"

export default function SignInPage() {
  const [showPassword, setShowPassword] = useState(false)
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [displayName, setDisplayName] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [authLoading, setAuthLoading] = useState(true) // Add initial auth check loading
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")
  const [isSignUp, setIsSignUp] = useState(false)
  const [passwordStrength, setPasswordStrength] = useState(null)
  const [passwordValidation, setPasswordValidation] = useState(null)
  const [authMethod, setAuthMethod] = useState("google")
  const navigate = useNavigate()

  // Check if user is already authenticated
  useEffect(() => {
    // Check for stored user data first to prevent redirect
    const storedUser = authService.getCurrentUser();
    if (storedUser) {
      // Show loading and navigate after a brief moment
      setIsLoading(true);
      setSuccess("Welcome back! Loading your experience...");
      setTimeout(() => navigate("/home"), 1500);
      return;
    }

    const unsubscribe = authService.onAuthStateChange((user) => {
      if (user) {
        // Show loading and navigate after a brief moment
        setIsLoading(true);
        setSuccess("Welcome! Loading your experience...");
        setTimeout(() => navigate("/home"), 1500);
      } else {
        setAuthLoading(false)
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

  // Setup reCAPTCHA when switching to sign up mode
  useEffect(() => {
    if (isSignUp && authMethod === "email") {
      // Small delay to ensure DOM is ready
      setTimeout(() => {
        try {
          authService.setupRecaptcha('email-recaptcha-container');
        } catch (error) {
          console.error("Failed to setup reCAPTCHA:", error);
        }
      }, 100);
    } else {
      authService.clearRecaptcha();
    }
  }, [isSignUp, authMethod]);

  // Validate password in real-time
  useEffect(() => {
    if (password && isSignUp) {
      const validation = authService.validatePassword(password)
      console.log("Password validation result:", validation)
      setPasswordValidation(validation)
      setPasswordStrength(validation?.strength || null)
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
      const result = isSignUp 
        ? await authService.createAccountWithEmail(email, password, displayName.trim())
        : await authService.signInWithEmail(email, password)
      
      if (result.success) {
        console.log(`✅ Email ${isSignUp ? 'sign-up' : 'sign-in'} successful`)
        setSuccess(`${isSignUp ? 'Welcome to FireStream!' : 'Welcome back!'} Loading your experience...`)
        // Keep loading state active and let the auth state change handle navigation
      } else {
        setError(result.error || `Failed to ${isSignUp ? 'create account' : 'sign in'}`)
        setIsLoading(false)
      }
    } catch (error) {
      console.error(`❌ Email ${isSignUp ? 'sign-up' : 'sign-in'} error:`, error)
      setError(error.message || `Failed to ${isSignUp ? 'create account' : 'sign in'}`)
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
        setSuccess("Welcome! Loading your experience...")
        // Keep loading state active and let the auth state change handle navigation
      } else {
        setError(result.error || "Failed to sign in with Google")
        setIsLoading(false)
      }
    } catch (error) {
      console.error("❌ Google authentication error:", error)
      setError("An unexpected error occurred")
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
    <>
      {/* Beautiful themed loading screen */}
      {(authLoading || (isLoading && success)) && (
        <BeautifulLoader 
          title="FireStream"
          subtitle={authLoading ? "Checking authentication..." : success}
          showFeatures={true}
          size="large"
        />
      )}

      {/* Main sign-in page */}
      {!authLoading && (
        <div className="min-h-screen w-full relative overflow-hidden bg-black">
          {/* Netflix-style Background with Multiple Video Previews */}
          <div className="absolute inset-0">
        {/* Netflix-style video grid pattern */}
        {/* Row 1 */}
        <div className="absolute top-8 left-8 w-64 h-36 rounded-xl shadow-2xl opacity-80 overflow-hidden">
          <video autoPlay muted loop className="w-full h-full object-cover rounded-xl" style={{filter: 'brightness(0.85) contrast(1.15)'}}>
            <source src="http://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4" type="video/mp4" />
          </video>
          <div className="absolute inset-0 bg-black/10 rounded-xl flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity duration-300">
            <Play className="w-12 h-12 text-white" />
          </div>
        </div>
        <div className="absolute top-8 left-80 w-56 h-32 rounded-xl shadow-2xl opacity-75 overflow-hidden">
          <video autoPlay muted loop className="w-full h-full object-cover rounded-xl" style={{filter: 'brightness(0.8) contrast(1.2)'}}>
            <source src="https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4" type="video/mp4" />
          </video>
          <div className="absolute inset-0 bg-black/10 rounded-xl flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity duration-300">
            <Play className="w-10 h-10 text-white" />
          </div>
        </div>
        <div className="absolute top-8 right-8 w-64 h-36 rounded-xl shadow-2xl opacity-80 overflow-hidden">
          <video autoPlay muted loop className="w-full h-full object-cover rounded-xl" style={{filter: 'brightness(0.85) contrast(1.15)'}}>
            <source src="https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/Sintel.mp4" type="video/mp4" />
          </video>
          <div className="absolute inset-0 bg-black/10 rounded-xl flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity duration-300">
            <Play className="w-12 h-12 text-white" />
          </div>
        </div>
        {/* Row 2 */}
        <div className="absolute top-48 left-16 w-72 h-40 rounded-xl shadow-2xl opacity-70 overflow-hidden">
          <video autoPlay muted loop className="w-full h-full object-cover rounded-xl" style={{filter: 'brightness(0.75) contrast(1.25)'}}>
            <source src="https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4" type="video/mp4" />
          </video>
          <div className="absolute inset-0 bg-black/10 rounded-xl flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity duration-300">
            <Play className="w-12 h-12 text-white" />
          </div>
        </div>
        <div className="absolute top-44 left-96 w-60 h-36 rounded-xl shadow-2xl opacity-65 overflow-hidden">
          <video autoPlay muted loop className="w-full h-full object-cover rounded-xl" style={{filter: 'brightness(0.7) contrast(1.3)'}}>
            <source src="https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerEscapes.mp4" type="video/mp4" />
          </video>
          <div className="absolute inset-0 bg-black/10 rounded-xl flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity duration-300">
            <Play className="w-10 h-10 text-white" />
          </div>
        </div>
        <div className="absolute top-48 right-16 w-72 h-40 rounded-xl shadow-2xl opacity-70 overflow-hidden">
          <video autoPlay muted loop className="w-full h-full object-cover rounded-xl" style={{filter: 'brightness(0.75) contrast(1.25)'}}>
            <source src="https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerFun.mp4" type="video/mp4" />
          </video>
          <div className="absolute inset-0 bg-black/10 rounded-xl flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity duration-300">
            <Play className="w-11 h-11 text-white" />
          </div>
        </div>
        {/* Row 3 */}
        <div className="absolute bottom-36 left-24 w-60 h-32 rounded-xl shadow-2xl opacity-65 overflow-hidden">
          <video autoPlay muted loop className="w-full h-full object-cover rounded-xl" style={{filter: 'brightness(0.7) contrast(1.3)'}}>
            <source src="https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerJoyrides.mp4" type="video/mp4" />
          </video>
          <div className="absolute inset-0 bg-black/10 rounded-xl flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity duration-300">
            <Play className="w-9 h-9 text-white" />
          </div>
        </div>
        <div className="absolute bottom-32 left-1/2 w-56 h-28 rounded-xl shadow-2xl opacity-60 overflow-hidden -translate-x-1/2">
          <video autoPlay muted loop className="w-full h-full object-cover rounded-xl" style={{filter: 'brightness(0.7) contrast(1.3)'}}>
            <source src="https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerMeltdowns.mp4" type="video/mp4" />
          </video>
          <div className="absolute inset-0 bg-black/10 rounded-xl flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity duration-300">
            <Play className="w-8 h-8 text-white" />
          </div>
        </div>
        {/* Small floating cards for features */}
        <div className="absolute top-1/4 left-1/4 w-44 h-24 rounded-lg shadow-xl opacity-60 overflow-hidden">
          <video 
            autoPlay 
            muted 
            loop 
            className="w-full h-full object-cover rounded-lg"
            style={{filter: 'brightness(0.7) contrast(1.3)'}}
          >
            <source src="https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerMeltdowns.mp4" type="video/mp4" />
          </video>
          <div className="absolute inset-0 bg-black/10 rounded-lg flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity duration-300">
            <Play className="w-8 h-8 text-white" />
          </div>
          {/* Feature hint overlay */}
          <div className="absolute bottom-2 left-2 right-2">
            <div className="bg-black/80 backdrop-blur-sm rounded-md px-2 py-1 flex items-center space-x-1">
              <Users className="w-3 h-3 text-blue-400" />
              <span className="text-xs text-white font-medium">Watch Together</span>
            </div>
          </div>
        </div>
        <div className="absolute top-3/4 right-1/4 w-44 h-24 rounded-lg shadow-xl opacity-60 overflow-hidden">
          <video 
            autoPlay 
            muted 
            loop 
            className="w-full h-full object-cover rounded-lg"
            style={{filter: 'brightness(0.65) contrast(1.35)'}}
          >
            <source src="https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/Sintel.mp4" type="video/mp4" />
          </video>
          <div className="absolute inset-0 bg-black/10 rounded-lg flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity duration-300">
            <Play className="w-8 h-8 text-white" />
          </div>
          {/* Feature hint overlay */}
          <div className="absolute bottom-2 left-2 right-2">
            <div className="bg-black/80 backdrop-blur-sm rounded-md px-2 py-1 flex items-center space-x-1">
              <MessageCircle className="w-3 h-3 text-green-400" />
              <span className="text-xs text-white font-medium">Live Chat</span>
            </div>
          </div>
        </div>
        {/* Additional floating video cards */}
        <div className="absolute top-16 left-1/2 w-48 h-28 rounded-lg shadow-xl opacity-65 overflow-hidden -translate-x-1/2">
          <video 
            autoPlay 
            muted 
            loop 
            className="w-full h-full object-cover rounded-lg"
            style={{filter: 'brightness(0.75) contrast(1.2)'}}
          >
            <source src="https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/TearsOfSteel.mp4" type="video/mp4" />
          </video>
          <div className="absolute inset-0 bg-black/10 rounded-lg flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity duration-300">
            <Play className="w-8 h-8 text-white" />
          </div>
          {/* Feature hint overlay */}
          <div className="absolute bottom-1 left-1 right-1">
            <div className="bg-black/80 backdrop-blur-sm rounded-md px-2 py-1 flex items-center space-x-1">
              <Trophy className="w-3 h-3 text-yellow-400" />
              <span className="text-xs text-white font-medium">Achievements</span>
            </div>
          </div>
        </div>

        <div className="absolute bottom-16 right-24 w-40 h-22 rounded-lg shadow-xl opacity-65 overflow-hidden">
          <video 
            autoPlay 
            muted 
            loop 
            className="w-full h-full object-cover rounded-lg"
            style={{filter: 'brightness(0.8) contrast(1.1)'}}
          >
            <source src="https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/VolkswagenGTIReview.mp4" type="video/mp4" />
          </video>
          <div className="absolute inset-0 bg-black/10 rounded-lg flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity duration-300">
            <Play className="w-7 h-7 text-white" />
          </div>
          {/* Feature hint overlay */}
          <div className="absolute bottom-1 left-1 right-1">
            <div className="bg-black/80 backdrop-blur-sm rounded-md px-2 py-1 flex items-center space-x-1">
              <FileText className="w-3 h-3 text-orange-400" />
              <span className="text-xs text-white font-medium">Reviews</span>
            </div>
          </div>
        </div>

        <div className="absolute top-1/2 left-12 w-36 h-20 rounded-lg shadow-xl opacity-60 overflow-hidden">
          <video 
            autoPlay 
            muted 
            loop 
            className="w-full h-full object-cover rounded-lg"
            style={{filter: 'brightness(0.7) contrast(1.25)'}}
          >
            <source src="https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/WeAreGoingOnBullrun.mp4" type="video/mp4" />
          </video>
          <div className="absolute inset-0 bg-black/10 rounded-lg flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity duration-300">
            <Play className="w-6 h-6 text-white" />
          </div>
          {/* Feature hint overlay */}
          <div className="absolute bottom-1 left-1 right-1">
            <div className="bg-black/80 backdrop-blur-sm rounded-md px-1 py-0.5 flex items-center space-x-1">
              <Sparkles className="w-2.5 h-2.5 text-pink-400" />
              <span className="text-xs text-white font-medium">HD Quality</span>
            </div>
          </div>
        </div>

        <div className="absolute top-2/3 right-12 w-42 h-24 rounded-lg shadow-xl opacity-65 overflow-hidden">
          <video 
            autoPlay 
            muted 
            loop 
            className="w-full h-full object-cover rounded-lg"
            style={{filter: 'brightness(0.75) contrast(1.15)'}}
          >
            <source src="https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/WhatCarCanYouGetForAGrand.mp4" type="video/mp4" />
          </video>
          <div className="absolute inset-0 bg-black/10 rounded-lg flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity duration-300">
            <Play className="w-7 h-7 text-white" />
          </div>
          {/* Feature hint overlay */}
          <div className="absolute bottom-1 left-1 right-1">
            <div className="bg-black/80 backdrop-blur-sm rounded-md px-2 py-1 flex items-center space-x-1">
              <BarChart3 className="w-3 h-3 text-blue-400" />
              <span className="text-xs text-white font-medium">Analytics</span>
            </div>
          </div>
        </div>

        <div className="absolute bottom-1/3 left-16 w-38 h-22 rounded-lg shadow-xl opacity-55 overflow-hidden">
          <video 
            autoPlay 
            muted 
            loop 
            className="w-full h-full object-cover rounded-lg"
            style={{filter: 'brightness(0.68) contrast(1.3)'}}
          >
            <source src="https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/SubaruOutbackOnStreetAndDirt.mp4" type="video/mp4" />
          </video>
          <div className="absolute inset-0 bg-black/10 rounded-lg flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity duration-300">
            <Play className="w-6 h-6 text-white" />
          </div>
          {/* Feature hint overlay */}
          <div className="absolute bottom-1 left-1 right-1">
            <div className="bg-black/80 backdrop-blur-sm rounded-md px-1 py-0.5 flex items-center space-x-1">
              <Users className="w-2.5 h-2.5 text-cyan-400" />
              <span className="text-xs text-white font-medium">4K Streaming</span>
            </div>
          </div>
        </div>

        <div className="absolute top-80 right-1/3 w-36 h-20 rounded-lg shadow-xl opacity-60 overflow-hidden">
          <video 
            autoPlay 
            muted 
            loop 
            className="w-full h-full object-cover rounded-lg"
            style={{filter: 'brightness(0.72) contrast(1.28)'}}
          >
            <source src="http://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4" type="video/mp4" />
          </video>
          <div className="absolute inset-0 bg-black/10 rounded-lg flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity duration-300">
            <Play className="w-6 h-6 text-white" />
          </div>
          {/* Feature hint overlay */}
          <div className="absolute bottom-1 left-1 right-1">
            <div className="bg-black/80 backdrop-blur-sm rounded-md px-1 py-0.5 flex items-center space-x-1">
              <MessageCircle className="w-2.5 h-2.5 text-green-400" />
              <span className="text-xs text-white font-medium">Comments</span>
            </div>
          </div>
        </div>

        {/* Interactive polls preview */}
        <div className="absolute bottom-1/4 left-1/3 w-44 h-24 rounded-lg shadow-xl opacity-55 overflow-hidden bg-gradient-to-br from-purple-900/60 to-blue-900/60 backdrop-blur-sm border border-purple-500/30">
          <div className="p-3 h-full flex flex-col justify-center">
            <div className="flex items-center space-x-2 mb-2">
              <BarChart3 className="w-4 h-4 text-purple-400" />
              <span className="text-xs text-white font-bold">Live Poll</span>
            </div>
            <p className="text-xs text-white/80 mb-2">What's your favorite genre?</p>
            <div className="space-y-1">
              <div className="bg-white/20 rounded-full h-1">
                <div className="bg-purple-400 h-1 rounded-full w-3/4"></div>
              </div>
              <div className="bg-white/20 rounded-full h-1">
                <div className="bg-blue-400 h-1 rounded-full w-1/2"></div>
              </div>
            </div>
          </div>
        </div>

        {/* AI assistant preview */}
        <div className="absolute top-1/3 right-1/3 w-40 h-20 rounded-lg shadow-xl opacity-60 overflow-hidden bg-gradient-to-br from-emerald-900/60 to-teal-900/60 backdrop-blur-sm border border-emerald-500/30">
          <div className="p-2 h-full flex flex-col justify-center">
            <div className="flex items-center space-x-2 mb-1">
              <Sparkles className="w-3 h-3 text-emerald-400" />
              <span className="text-xs text-white font-bold">AI Assistant</span>
            </div>
            <p className="text-xs text-white/80">"Looking for action movies?"</p>
            <div className="flex space-x-1 mt-1">
              <div className="w-1 h-1 bg-emerald-400 rounded-full animate-pulse"></div>
              <div className="w-1 h-1 bg-emerald-400 rounded-full animate-pulse" style={{animationDelay: '0.2s'}}></div>
              <div className="w-1 h-1 bg-emerald-400 rounded-full animate-pulse" style={{animationDelay: '0.4s'}}></div>
            </div>
          </div>
        </div>

        {/* Extra small floating video elements */}
        <div className="absolute top-1/4 right-20 w-32 h-18 rounded-md shadow-lg opacity-50 overflow-hidden">
          <video 
            autoPlay 
            muted 
            loop 
            className="w-full h-full object-cover rounded-md"
            style={{filter: 'brightness(0.65) contrast(1.35)'}}
          >
            <source src="https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4" type="video/mp4" />
          </video>
          <div className="absolute inset-0 bg-black/15 rounded-md flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity duration-200">
            <Play className="w-5 h-5 text-white" />
          </div>
        </div>

        <div className="absolute bottom-1/2 left-1/4 w-28 h-16 rounded-md shadow-lg opacity-45 overflow-hidden">
          <video 
            autoPlay 
            muted 
            loop 
            className="w-full h-full object-cover rounded-md"
            style={{filter: 'brightness(0.6) contrast(1.4)'}}
          >
            <source src="https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/Sintel.mp4" type="video/mp4" />
          </video>
          <div className="absolute inset-0 bg-black/15 rounded-md flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity duration-200">
            <Play className="w-4 h-4 text-white" />
          </div>
        </div>

        <div className="absolute top-3/5 left-1/2 w-30 h-17 rounded-md shadow-lg opacity-50 overflow-hidden">
          <video 
            autoPlay 
            muted 
            loop 
            className="w-full h-full object-cover rounded-md"
            style={{filter: 'brightness(0.63) contrast(1.37)'}}
          >
            <source src="https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerJoyrides.mp4" type="video/mp4" />
          </video>
          <div className="absolute inset-0 bg-black/15 rounded-md flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity duration-200">
            <Play className="w-4 h-4 text-white" />
          </div>
        </div>

        <div className="absolute bottom-20 right-1/4 w-34 h-19 rounded-md shadow-lg opacity-55 overflow-hidden">
          <video 
            autoPlay 
            muted 
            loop 
            className="w-full h-full object-cover rounded-md"
            style={{filter: 'brightness(0.67) contrast(1.33)'}}
          >
            <source src="https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerMeltdowns.mp4" type="video/mp4" />
          </video>
          <div className="absolute inset-0 bg-black/15 rounded-md flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity duration-200">
            <Play className="w-5 h-5 text-white" />
          </div>
        </div>

        <div className="absolute top-1/5 left-1/3 w-26 h-15 rounded-md shadow-lg opacity-45 overflow-hidden">
          <video 
            autoPlay 
            muted 
            loop 
            className="w-full h-full object-cover rounded-md"
            style={{filter: 'brightness(0.62) contrast(1.38)'}}
          >
            <source src="https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerEscapes.mp4" type="video/mp4" />
          </video>
          <div className="absolute inset-0 bg-black/15 rounded-md flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity duration-200">
            <Play className="w-4 h-4 text-white" />
          </div>
        </div>

        <div className="absolute bottom-1/3 right-1/5 w-24 h-14 rounded-md shadow-lg opacity-40 overflow-hidden">
          <video 
            autoPlay 
            muted 
            loop 
            className="w-full h-full object-cover rounded-md"
            style={{filter: 'brightness(0.58) contrast(1.42)'}}
          >
            <source src="http://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4" type="video/mp4" />
          </video>
          <div className="absolute inset-0 bg-black/15 rounded-md flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity duration-200">
            <Play className="w-3 h-3 text-white" />
          </div>
        </div>
          </div>

          {/* Dark overlay to make content readable */}
          <div className="absolute inset-0 bg-black/40" />
          
          {/* Netflix-style gradient vignette */}
          <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-transparent to-black/60" />
          <div className="absolute inset-0 bg-gradient-to-r from-black/20 via-transparent to-black/20" />

          {/* Top Navigation */}
    <div className="absolute top-6 left-6 z-30">
      <Link
        to="/"
        className="group flex items-center space-x-3 text-white/80 hover:text-white transition-all duration-300"
      >
        <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform duration-300" />
        <span className="font-medium">Back to Home</span>
      </Link>
    </div>

    {/* Brand Logo */}
    <div className="absolute top-6 right-6 z-30">
      <div className="flex items-center space-x-3">
        <div className="w-10 h-10 bg-gradient-to-br from-red-500 to-orange-600 rounded-xl flex items-center justify-center shadow-xl">
          <Play className="w-5 h-5 text-white fill-white" />
        </div>
        <span className="text-2xl font-black text-white">
          Fire<span className="text-transparent bg-gradient-to-r from-red-400 to-orange-500 bg-clip-text">Stream</span>
        </span>
      </div>
    </div>

    {/* Centered Form Container */}
    <div className="relative z-20 min-h-screen flex items-center justify-center p-8">
      {/* Netflix-Style Centered Form Card */}
      <div className="w-full max-w-lg">
        {/* Main Form Card */}
        <div className="bg-black/80 backdrop-blur-2xl p-12 rounded-3xl border border-white/10 shadow-2xl">
          {/* Header */}
          <div className="text-center mb-10">
            <h1 className="text-5xl font-black text-white mb-4 tracking-tight">
              {isSignUp ? "Join FireStream" : "Sign In"}
            </h1>
            <p className="text-white/70 text-lg font-light mb-6">
              {isSignUp ? "Your cinematic journey begins now" : "Welcome back to the experience"}
            </p>
            
            {/* Feature Preview Pills */}
            {isSignUp && (
              <div className="flex flex-wrap justify-center gap-3 mb-6">
                <div className="flex items-center space-x-2 bg-white/10 backdrop-blur-xl px-4 py-2 rounded-full border border-white/20">
                  <Users className="w-4 h-4 text-blue-400" />
                  <span className="text-sm text-white/90 font-medium">Watch Together</span>
                </div>
                <div className="flex items-center space-x-2 bg-white/10 backdrop-blur-xl px-4 py-2 rounded-full border border-white/20">
                  <MessageCircle className="w-4 h-4 text-green-400" />
                  <span className="text-sm text-white/90 font-medium">Live Chat</span>
                </div>
                <div className="flex items-center space-x-2 bg-white/10 backdrop-blur-xl px-4 py-2 rounded-full border border-white/20">
                  <BarChart3 className="w-4 h-4 text-purple-400" />
                  <span className="text-sm text-white/90 font-medium">Interactive Polls</span>
                </div>
                <div className="flex items-center space-x-2 bg-white/10 backdrop-blur-xl px-4 py-2 rounded-full border border-white/20">
                  <Sparkles className="w-4 h-4 text-emerald-400" />
                  <span className="text-sm text-white/90 font-medium">AI Assistant</span>
                </div>
              </div>
            )}
          </div>

          {/* Status Messages */}
          {error && (
            <div className="mb-8 p-5 bg-red-500/15 border border-red-500/30 rounded-2xl backdrop-blur-xl">
              <p className="text-red-300 font-medium text-center">{error}</p>
            </div>
          )}
          
          {success && (
            <div className="mb-8 p-5 bg-green-500/15 border border-green-500/30 rounded-2xl backdrop-blur-xl">
              <p className="text-green-300 font-medium text-center">{success}</p>
            </div>
          )}

          <div className="space-y-8">
            {/* Authentication Method Selector */}
            <div className="flex space-x-2 bg-white/5 p-1.5 rounded-xl backdrop-blur-xl border border-white/10">
              <button
                type="button"
                onClick={() => {
                  setAuthMethod("google")
                  setError("")
                  setSuccess("")
                  authService.clearRecaptcha()
                }}
                className={`flex-1 py-2.5 px-4 rounded-lg font-semibold text-sm transition-all duration-500 ${
                  authMethod === "google"
                    ? "bg-white/15 text-white shadow-lg border border-white/20"
                    : "text-white/60 hover:text-white/80 hover:bg-white/5"
                }`}
              >
                Google
              </button>
              <button
                type="button"
                onClick={() => {
                  setAuthMethod("email")
                  setError("")
                  setSuccess("")
                  authService.clearRecaptcha()
                }}
                className={`flex-1 py-2.5 px-4 rounded-lg font-semibold text-sm transition-all duration-500 ${
                  authMethod === "email"
                    ? "bg-white/15 text-white shadow-lg border border-white/20"
                    : "text-white/60 hover:text-white/80 hover:bg-white/5"
                }`}
              >
                Email
              </button>
            </div>

            {/* Google Authentication */}
            {authMethod === "google" && (
              <div>
                <Button
                  onClick={handleGoogleAuth}
                  disabled={isLoading}
                  className="w-full h-12 bg-white text-gray-700 border-2 border-gray-200 hover:bg-gray-50 hover:border-gray-300 font-semibold text-base rounded-xl shadow-xl hover:shadow-2xl transition-all duration-500 disabled:opacity-50 disabled:cursor-not-allowed transform hover:scale-[1.02]"
                >
                  {isLoading ? (
                    <div className="flex items-center space-x-2">
                      <div className="w-5 h-5 border-2 border-gray-600 border-t-black rounded-full animate-spin"></div>
                      <span>Connecting...</span>
                    </div>
                  ) : (
                    <div className="flex items-center space-x-3">
                      <svg className="w-5 h-5" viewBox="0 0 24 24">
                        <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                        <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                        <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                        <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                      </svg>
                      <span>Continue with Google</span>
                    </div>
                  )}
                </Button>
              </div>
            )}

            {/* Email Authentication */}
            {authMethod === "email" && (
              <div className="space-y-6">
                {/* Sign In / Sign Up Toggle */}
                <div className="flex space-x-1.5 bg-white/5 p-1.5 rounded-lg backdrop-blur-xl border border-white/10">
                  <button
                    type="button"
                    onClick={() => {
                      setIsSignUp(false)
                      setError("")
                      setSuccess("")
                      authService.clearRecaptcha()
                    }}
                    className={`flex-1 py-2 px-3 rounded-md font-semibold text-sm transition-all duration-500 ${
                      !isSignUp
                        ? "bg-white/15 text-white shadow-md border border-white/20"
                        : "text-white/60 hover:text-white/80 hover:bg-white/5"
                    }`}
                  >
                    Sign In
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setIsSignUp(true)
                      setError("")
                      setSuccess("")
                      authService.clearRecaptcha()
                    }}
                    className={`flex-1 py-2 px-3 rounded-md font-semibold text-sm transition-all duration-500 ${
                      isSignUp
                        ? "bg-white/15 text-white shadow-md border border-white/20"
                        : "text-white/60 hover:text-white/80 hover:bg-white/5"
                    }`}
                  >
                    Sign Up
                  </button>
                </div>

                <form onSubmit={handleEmailAuth} className="space-y-6">
                  {/* Display Name for Sign Up */}
                  {isSignUp && (
                    <div className="space-y-2">
                      <Label htmlFor="displayName" className="text-white/90 font-semibold">
                        Full Name
                      </Label>
                      <Input
                        id="displayName"
                        type="text"
                        value={displayName}
                        onChange={(e) => setDisplayName(e.target.value)}
                        placeholder="Your full name"
                        className="h-12 border-white/20 bg-white/5 text-white placeholder-white/40 focus:border-red-400 focus:ring-red-400/30 focus:ring-2 rounded-xl backdrop-blur-xl font-medium transition-all duration-500"
                      />
                    </div>
                  )}

                  <div className="space-y-2">
                    <Label htmlFor="email" className="text-white/90 font-semibold">
                      Email Address
                    </Label>
                    <Input
                      id="email"
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="your@email.com"
                      className="h-12 border-white/20 bg-white/5 text-white placeholder-white/40 focus:border-red-400 focus:ring-red-400/30 focus:ring-2 rounded-xl backdrop-blur-xl font-medium transition-all duration-500"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="password" className="text-white/90 font-semibold">
                      Password
                    </Label>
                    <div className="relative">
                      <Input
                        id="password"
                        type={showPassword ? "text" : "password"}
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder={isSignUp ? "Create a strong password" : "Your password"}
                        className="h-12 border-white/20 bg-white/5 text-white placeholder-white/40 focus:border-red-400 focus:ring-red-400/30 focus:ring-2 rounded-xl backdrop-blur-xl pr-12 font-medium transition-all duration-500"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute inset-y-0 right-0 pr-4 flex items-center text-white/50 hover:text-white/80 transition-colors duration-300"
                      >
                        {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                      </button>
                    </div>

                    {/* Password Strength Indicator */}
                    {isSignUp && password && passwordValidation && passwordValidation.requirements && (
                      <div className="space-y-3">
                        <div className="flex items-center space-x-3">
                          <div className="flex-1 bg-white/10 rounded-full h-2">
                            <div
                              className={`h-2 rounded-full transition-all duration-700 ${
                                passwordStrength === 'weak' ? 'w-1/3 bg-gradient-to-r from-red-500 to-red-600' :
                                passwordStrength === 'medium' ? 'w-2/3 bg-gradient-to-r from-yellow-500 to-orange-500' :
                                passwordStrength === 'strong' ? 'w-full bg-gradient-to-r from-green-500 to-emerald-500' : 'w-0'
                              }`}
                            />
                          </div>
                          <span className={`text-xs font-bold uppercase tracking-wider ${
                            passwordStrength === 'weak' ? 'text-red-400' :
                            passwordStrength === 'medium' ? 'text-yellow-400' :
                            passwordStrength === 'strong' ? 'text-green-400' : 'text-white/40'
                          }`}>
                            {passwordStrength && typeof passwordStrength === 'string' ? 
                              passwordStrength : 'Too Weak'}
                          </span>
                        </div>
                        
                        {/* Requirements Grid */}
                        <div className="grid grid-cols-1 gap-2">
                          {passwordValidation.requirements.map((req, index) => (
                            <div key={index} className="flex items-center space-x-2">
                              {req.met ? (
                                <CheckCircle className="w-4 h-4 text-green-400 flex-shrink-0" />
                              ) : (
                                <XCircle className="w-4 h-4 text-red-400 flex-shrink-0" />
                              )}
                              <span className={`text-xs font-medium ${req.met ? "text-green-300" : "text-red-300"}`}>
                                {req.text}
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>

                  {!isSignUp && (
                    <div className="flex items-center justify-between">
                      <label className="flex items-center group cursor-pointer">
                        <input
                          type="checkbox"
                          className="rounded border-white/30 bg-white/5 text-red-500 focus:ring-red-500/30 focus:ring-2 transition-all duration-300 w-4 h-4"
                        />
                        <span className="ml-3 text-sm text-white/70 group-hover:text-white/90 transition-colors duration-300 font-medium">
                          Remember me
                        </span>
                      </label>
                      <Link
                        to="#"
                        className="text-sm text-red-400 hover:text-red-300 font-semibold transition-colors duration-300"
                      >
                        Forgot password?
                      </Link>
                    </div>
                  )}

                  {/* reCAPTCHA container */}
                  {isSignUp && (
                    <div className="space-y-3">
                      <p className="text-sm text-white/60 text-center font-medium">Security verification required</p>
                      <div className="flex justify-center p-4 bg-white/5 rounded-xl border border-white/10 backdrop-blur-xl">
                        <div id="email-recaptcha-container" className="min-h-[78px] flex items-center justify-center"></div>
                      </div>
                    </div>
                  )}

                  <Button
                    type="submit"
                    disabled={isLoading || !email || !password || (isSignUp && (!displayName.trim() || (passwordValidation && !passwordValidation.isValid)))}
                    className="w-full h-12 bg-gradient-to-r from-red-600 via-red-500 to-orange-500 text-white hover:from-red-700 hover:via-red-600 hover:to-orange-600 font-bold rounded-xl shadow-xl hover:shadow-2xl transform hover:scale-[1.02] transition-all duration-500 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
                  >
                    {isLoading ? (
                      <div className="flex items-center space-x-2">
                        <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                        <span>{isSignUp ? 'Creating Your Account...' : 'Signing You In...'}</span>
                      </div>
                    ) : (
                      <span>{isSignUp ? 'Create Account' : 'Sign In'}</span>
                    )}
                  </Button>
                </form>
              </div>
            )}

            {/* Terms
            <div className="text-center text-white/40 leading-relaxed">
              <p className="text-sm">
                By continuing, you agree to our{" "}
                <Link to="#" className="text-red-400 hover:text-red-300 transition-colors duration-300 font-semibold">
                  Terms of Service
                </Link>{" "}
                and{" "}
                <Link to="#" className="text-red-400 hover:text-red-300 transition-colors duration-300 font-semibold">
                  Privacy Policy
                </Link>
              </p>
            </div> */}
            </div>
          </div>
        </div>
      </div>
        </div>
      )}
    </>
  )
}
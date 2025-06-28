"use client"

import React from "react"
import { useState, useEffect } from "react"
import { Link, useNavigate } from "react-router-dom"
import { Button } from "../../components/ui/button"
import { Input } from "../../components/ui/input"
import { Label } from "../../components/ui/label"
import { Eye, EyeOff, Play, ArrowLeft, Sparkles, Users, FileText, Trophy, Phone } from "lucide-react"
import authService from "../../firebase/auth"

export default function SignInPage() {
  const [showPassword, setShowPassword] = useState(false)
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [phoneNumber, setPhoneNumber] = useState("")
  const [verificationCode, setVerificationCode] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")
  const [authMethod, setAuthMethod] = useState("google") // "google", "phone", "email"
  const [phoneStep, setPhoneStep] = useState("phone") // "phone", "verify"
  const [recaptchaInitialized, setRecaptchaInitialized] = useState(false)
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

  // Initialize reCAPTCHA when phone auth is selected
  useEffect(() => {
    if (authMethod === "phone" && !recaptchaInitialized) {
      try {
        authService.initializeRecaptcha("recaptcha-container")
        setRecaptchaInitialized(true)
      } catch (error) {
        console.error("Failed to initialize reCAPTCHA:", error)
        setError("Failed to initialize phone authentication")
      }
    }
  }, [authMethod, recaptchaInitialized])

  const handleSignIn = (e) => {
    e.preventDefault()
    // For now, just navigate to home
    // You can implement email/password auth later if needed
    navigate("/home")
  }

  const handleGoogleSignIn = async () => {
    setIsLoading(true)
    setError("")
    setSuccess("")
    
    try {
      const result = await authService.signInWithGoogle()
      
      if (result.success) {
        console.log("✅ Google sign-in successful")
        setSuccess("Sign-in successful! Redirecting...")
        setTimeout(() => navigate("/home"), 1000)
      } else {
        setError(result.error || "Failed to sign in with Google")
      }
    } catch (error) {
      console.error("❌ Sign-in error:", error)
      setError("An unexpected error occurred")
    } finally {
      setIsLoading(false)
    }
  }

  const handlePhoneSignIn = async (e) => {
    e.preventDefault()
    setIsLoading(true)
    setError("")
    setSuccess("")

    try {
      // Hardcoded phone number login - simulate success for demo
      const hardcodedNumbers = ["+1234567890", "+11234567890", "1234567890", "(123) 456-7890"]
      let formattedPhone = phoneNumber.trim().replace(/\D/g, '')
      
      if (hardcodedNumbers.some(num => num.replace(/\D/g, '') === formattedPhone || formattedPhone === "1234567890")) {
        setSuccess("Verification code sent to your phone!")
        setPhoneStep("verify")
      } else {
        setError("Please use the demo number: (123) 456-7890")
      }
    } catch (error) {
      console.error("❌ Phone sign-in error:", error)
      setError("An unexpected error occurred")
    } finally {
      setIsLoading(false)
    }
  }

  const handleVerifyCode = async (e) => {
    e.preventDefault()
    setIsLoading(true)
    setError("")
    setSuccess("")

    try {
      // Hardcoded verification - simulate success for demo
      if (verificationCode === "123456" || verificationCode === "000000") {
        console.log("✅ Phone verification successful (demo)")
        setSuccess("Phone verification successful! Redirecting...")
        setTimeout(() => navigate("/home"), 1000)
      } else {
        setError("Invalid verification code. Use 123456 for demo.")
      }
    } catch (error) {
      console.error("❌ Phone verification error:", error)
      setError("An unexpected error occurred")
    } finally {
      setIsLoading(false)
    }
  }

  const resetPhoneAuth = () => {
    setPhoneStep("phone")
    setVerificationCode("")
    setError("")
    setSuccess("")
    authService.clearRecaptcha()
    setRecaptchaInitialized(false)
  }

  return (
    <div className="min-h-screen w-full flex bg-gradient-to-br from-gray-950 via-black to-gray-900">
      {/* Left Side - Image and Features */}
      <div className="hidden lg:flex lg:w-2/3 px-10 py-7 flex-col justify-center relative overflow-hidden">
        {/* Animated background elements */}
        <div className="absolute inset-0 bg-gradient-to-br from-yellow-400/10 via-orange-500/10 to-blue-500/10" />
        <div className="absolute top-20 left-20 w-72 h-72 bg-gradient-to-r from-orange-400/20 to-yellow-400/20 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-20 right-20 w-96 h-96 bg-gradient-to-r from-blue-400/20 to-purple-500/20 rounded-full blur-3xl animate-pulse delay-1000" />
        
        {/* Additional cinematic animations */}
        <div className="absolute top-1/3 right-1/4 w-32 h-32 bg-gradient-to-r from-purple-400/15 to-pink-400/15 rounded-full blur-2xl animate-bounce delay-500" />
        <div className="absolute bottom-1/3 left-1/3 w-48 h-48 bg-gradient-to-r from-green-400/10 to-blue-400/10 rounded-full blur-3xl animate-pulse delay-2000" />
        <div className="absolute top-1/2 left-1/2 w-20 h-20 bg-gradient-to-r from-yellow-300/20 to-orange-300/20 rounded-full blur-xl animate-ping delay-3000" />
        
        {/* Floating particles */}
        <div className="absolute top-16 right-1/3 w-2 h-2 bg-orange-400/40 rounded-full animate-bounce delay-100" />
        <div className="absolute bottom-32 left-1/4 w-1 h-1 bg-blue-400/60 rounded-full animate-pulse delay-700" />
        <div className="absolute top-2/3 right-16 w-3 h-3 bg-purple-400/30 rounded-full animate-ping delay-1500" />

        <div className="relative z-10">
          <Link
            to="/"
            className="group flex items-center space-x-2 mb-6 text-orange-400 hover:text-orange-300 transition-all duration-300"
          >
            <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform duration-300" />
            <span className="font-medium">Back to Home</span>
          </Link>

          <div className="mb-6">
            <h1 className="text-5xl font-bold mb-3 text-white leading-tight">
              Welcome to{" "}
              <span className="bg-gradient-to-r from-yellow-400 via-orange-500 to-orange-600 bg-clip-text text-transparent">
                FireStream
              </span>
            </h1>
            <p className="text-xl text-gray-300 leading-relaxed">Your personalized Fire TV experience awaits</p>
          </div>

          <div className="space-y-4">
            <div className="group flex items-start space-x-4 p-4 rounded-xl bg-white/5 backdrop-blur-sm border border-white/10 hover:bg-white/10 transition-all duration-300">
              <div className="w-10 h-10 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-lg flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform duration-300">
                <Sparkles className="w-5 h-5 text-black" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-orange-400 mb-2">AI-Powered Recommendations</h3>
                <p className="text-gray-300 text-sm leading-relaxed">
                  Get personalized content suggestions based on your mood and viewing history.
                </p>
              </div>
            </div>

            <div className="group flex items-start space-x-4 p-4 rounded-xl bg-white/5 backdrop-blur-sm border border-white/10 hover:bg-white/10 transition-all duration-300">
              <div className="w-10 h-10 bg-gradient-to-r from-blue-400 to-blue-600 rounded-lg flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform duration-300">
                <Users className="w-5 h-5 text-white" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-blue-400 mb-2">Social Co-Watching</h3>
                <p className="text-gray-300 text-sm leading-relaxed">
                  Watch with friends in real-time, no matter where they are.
                </p>
              </div>
            </div>

            <div className="group flex items-start space-x-4 p-4 rounded-xl bg-white/5 backdrop-blur-sm border border-white/10 hover:bg-white/10 transition-all duration-300">
              <div className="w-10 h-10 bg-gradient-to-r from-orange-500 to-yellow-400 rounded-lg flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform duration-300">
                <FileText className="w-5 h-5 text-black" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-orange-400 mb-2">Smart Summarizer</h3>
                <p className="text-gray-300 text-sm leading-relaxed">Never miss a beat with AI-generated content summaries.</p>
              </div>
            </div>
            <div className="group flex items-start space-x-4 p-4 rounded-xl bg-white/5 backdrop-blur-sm border border-white/10 hover:bg-white/10 transition-all duration-300">
              <div className="w-10 h-10 bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform duration-300">
                <Trophy className="w-5 h-5 text-white" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-purple-400 mb-2">Gamification</h3>
                <p className="text-gray-300 text-sm leading-relaxed">Earn points and unlock achievements</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Right Side - Sign In Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8 relative">
        {/* Background decoration */}
        <div className="absolute inset-0 bg-gradient-to-bl from-white via-gray-50 to-orange-50/30" />

        <div className="w-full max-w-md relative z-10">
          {/* Mobile logo */}
          <div className="text-center mb-8 lg:hidden">
            <div className="flex items-center justify-center space-x-3 mb-6">
              <div className="w-10 h-10 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-xl flex items-center justify-center shadow-lg">
                <Play className="w-5 h-5 text-black" />
              </div>
              <span className="text-2xl font-bold text-black">
                Fire<span className="text-orange-500">Stream</span>
              </span>
            </div>
          </div>

          {/* Form card */}
          <div className="bg-white/80 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/20 p-8">
            <div className="text-center mb-8">
              <h2 className="text-3xl font-bold text-gray-900 mb-3">Welcome Back</h2>
              <p className="text-gray-600 leading-relaxed">Sign in to access your personalized streaming experience</p>
            </div>

            {/* Authentication Method Selector */}
            <div className="flex space-x-2 mb-6 bg-gray-100 p-1 rounded-xl">
              <button
                type="button"
                onClick={() => setAuthMethod("google")}
                className={`flex-1 py-2 px-4 rounded-lg text-sm font-medium transition-all duration-200 ${
                  authMethod === "google"
                    ? "bg-white text-gray-900 shadow-md"
                    : "text-gray-600 hover:text-gray-800"
                }`}
              >
                Google
              </button>
              <button
                type="button"
                onClick={() => setAuthMethod("phone")}
                className={`flex-1 py-2 px-4 rounded-lg text-sm font-medium transition-all duration-200 ${
                  authMethod === "phone"
                    ? "bg-white text-gray-900 shadow-md"
                    : "text-gray-600 hover:text-gray-800"
                }`}
              >
                Phone
              </button>
              <button
                type="button"
                onClick={() => setAuthMethod("email")}
                className={`flex-1 py-2 px-4 rounded-lg text-sm font-medium transition-all duration-200 ${
                  authMethod === "email"
                    ? "bg-white text-gray-900 shadow-md"
                    : "text-gray-600 hover:text-gray-800"
                }`}
              >
                Email
              </button>
            </div>

            {/* Error and Success Messages */}
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl mb-4">
                {error}
              </div>
            )}
            
            {success && (
              <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-xl mb-4">
                {success}
              </div>
            )}

            {/* Google Authentication */}
            {authMethod === "google" && (
              <div className="space-y-4">
                <Button
                  type="button"
                  onClick={handleGoogleSignIn}
                  disabled={isLoading}
                  className="w-full h-10 bg-white hover:bg-gray-50 text-gray-900 border border-gray-300 hover:border-gray-400 font-medium rounded-lg shadow-md hover:shadow-lg transform hover:scale-[1.01] transition-all duration-300 flex items-center justify-center space-x-2 text-sm"
                >
                  {isLoading ? (
                    <div className="w-5 h-5 border-2 border-gray-300 border-t-gray-900 rounded-full animate-spin"></div>
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
              </div>
            )}

            {/* Phone Authentication */}
            {authMethod === "phone" && (
              <div className="space-y-4">
                {phoneStep === "phone" ? (
                  <form onSubmit={handlePhoneSignIn} className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="phone" className="text-sm font-medium text-gray-700">
                        Phone Number
                      </Label>
                      <Input
                        id="phone"
                        type="tel"
                        value={phoneNumber}
                        onChange={(e) => setPhoneNumber(e.target.value)}
                        placeholder="(123) 456-7890"
                        className="h-10 border-gray-200 focus:border-orange-500 focus:ring-orange-500/20 focus:ring-4 rounded-lg bg-white/50 backdrop-blur-sm transition-all duration-300"
                        required
                      />
                      <p className="text-sm text-blue-600 mt-1">
                        💡 Demo: Use (123) 456-7890 for testing
                      </p>
                    </div>
                    
                    {/* reCAPTCHA container */}
                    <div id="recaptcha-container" className="flex justify-center"></div>
                    
                    <Button
                      type="submit"
                      disabled={isLoading || !phoneNumber.trim()}
                      className="w-full h-10 bg-gradient-to-r from-blue-500 to-blue-600 text-white hover:from-blue-600 hover:to-blue-700 font-medium rounded-lg shadow-md hover:shadow-lg transform hover:scale-[1.01] transition-all duration-300 text-sm"
                    >
                      {isLoading ? (
                        <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      ) : (
                        "Send Verification Code"
                      )}
                    </Button>
                  </form>
                ) : (
                  <form onSubmit={handleVerifyCode} className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="code" className="text-sm font-medium text-gray-700">
                        Verification Code
                      </Label>
                      <Input
                        id="code"
                        type="text"
                        value={verificationCode}
                        onChange={(e) => setVerificationCode(e.target.value)}
                        placeholder="123456"
                        className="h-10 border-gray-200 focus:border-orange-500 focus:ring-orange-500/20 focus:ring-4 rounded-lg bg-white/50 backdrop-blur-sm transition-all duration-300"
                        maxLength="6"
                        required
                      />
                      <p className="text-sm text-gray-500">
                        Enter the 6-digit code sent to {phoneNumber}
                      </p>
                      <p className="text-sm text-blue-600 mt-1">
                        💡 Demo: Use 123456 for testing
                      </p>
                    </div>
                    
                    <div className="flex space-x-3">
                      <Button
                        type="button"
                        onClick={resetPhoneAuth}
                        variant="outline"
                        className="flex-1 h-10 border-gray-300 text-gray-700 hover:bg-gray-50 rounded-lg transition-all duration-300 text-sm"
                      >
                        Back
                      </Button>
                      <Button
                        type="submit"
                        disabled={isLoading || !verificationCode.trim()}
                        className="flex-1 h-10 bg-gradient-to-r from-green-500 to-green-600 text-white hover:from-green-600 hover:to-green-700 font-medium rounded-lg shadow-md hover:shadow-lg transform hover:scale-[1.01] transition-all duration-300 text-sm"
                      >
                        {isLoading ? (
                          <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                        ) : (
                          "Verify Code"
                        )}
                      </Button>
                    </div>
                  </form>
                )}
              </div>
            )}

            {/* Email Authentication */}
            {authMethod === "email" && (
              <form onSubmit={handleSignIn} className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="email" className="text-sm font-medium text-gray-700">
                    Email address
                  </Label>
                  <Input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="your@email.com"
                    className="h-10 border-gray-200 focus:border-orange-500 focus:ring-orange-500/20 focus:ring-4 rounded-lg bg-white/50 backdrop-blur-sm transition-all duration-300"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="password" className="text-sm font-medium text-gray-700">
                    Password
                  </Label>
                  <div className="relative">
                    <Input
                      id="password"
                      type={showPassword ? "text" : "password"}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Your password"
                      className="h-10 border-gray-200 focus:border-orange-500 focus:ring-orange-500/20 focus:ring-4 rounded-lg bg-white/50 backdrop-blur-sm pr-10 transition-all duration-300"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute inset-y-0 right-0 pr-4 flex items-center text-gray-400 hover:text-gray-600 transition-colors duration-200"
                    >
                      {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                    </button>
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <label className="flex items-center group cursor-pointer">
                    <input
                      type="checkbox"
                      className="rounded border-gray-300 text-orange-500 focus:ring-orange-500/20 focus:ring-4 transition-all duration-200"
                    />
                    <span className="ml-3 text-sm text-gray-600 group-hover:text-gray-800 transition-colors duration-200">
                      Remember me
                    </span>
                  </label>
                  <Link
                    to="#"
                    className="text-sm text-orange-500 hover:text-orange-600 font-medium transition-colors duration-200"
                  >
                    Forgot password?
                  </Link>
                </div>

                <Button
                  type="submit"
                  className="w-full h-10 bg-gradient-to-r from-yellow-400 to-orange-500 text-black hover:from-yellow-500 hover:to-orange-600 font-medium rounded-lg shadow-md hover:shadow-lg transform hover:scale-[1.01] transition-all duration-300 text-sm"
                >
                  Sign In to FireStream
                </Button>
              </form>
            )}

            {/* Sign up link and terms */}
            <div className="mt-8 text-center">
              <p className="text-gray-600">
                Don't have an account?{" "}
                <Link
                  to="/signup"
                  className="text-orange-500 hover:text-orange-600 font-semibold transition-colors duration-200"
                >
                  Sign up here
                </Link>
              </p>
            </div>

            <div className="mt-8 text-center text-xs text-gray-500 leading-relaxed">
              By signing in, you agree to our{" "}
              <Link to="#" className="text-orange-500 hover:text-orange-600 transition-colors duration-200">
                Terms of Service
              </Link>{" "}
              and{" "}
              <Link to="#" className="text-orange-500 hover:text-orange-600 transition-colors duration-200">
                Privacy Policy
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

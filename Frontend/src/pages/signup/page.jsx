"use client"

import React from "react"
import { useState } from "react"
import { Link, useNavigate } from "react-router-dom"
import { Button } from "../../components/ui/button"
import { Input } from "../../components/ui/input"
import { Label } from "../../components/ui/label"
import { Eye, EyeOff, Play, ArrowLeft, CheckCircle, Zap, User, Phone } from "lucide-react"

export default function SignUpPage() {
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    password: "",
    confirmPassword: "",
  })
  const [authMethod, setAuthMethod] = useState("email") // "email", "phone"
  const navigate = useNavigate()

  const handleSignUp = (e) => {
    e.preventDefault()
    if (authMethod === "email" && formData.password !== formData.confirmPassword) {
      alert("Passwords do not match")
      return
    }
    if (authMethod === "phone") {
      // For phone signup, we'll just use name and phone
      localStorage.setItem("user", JSON.stringify({ 
        phone: formData.phone, 
        name: formData.name,
        authMethod: "phone"
      }))
    } else {
      // Store user session (simplified)
      localStorage.setItem("user", JSON.stringify({ 
        email: formData.email, 
        name: formData.name,
        authMethod: "email"
      }))
    }
    navigate("/home")
  }

  const handleInputChange = (e) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }))
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
        <div className="absolute top-1/4 right-1/3 w-40 h-40 bg-gradient-to-r from-pink-400/15 to-purple-400/15 rounded-full blur-2xl animate-bounce delay-700" />
        <div className="absolute bottom-1/4 left-1/4 w-56 h-56 bg-gradient-to-r from-cyan-400/10 to-teal-400/10 rounded-full blur-3xl animate-pulse delay-1500" />
        <div className="absolute top-3/5 left-1/2 w-24 h-24 bg-gradient-to-r from-indigo-300/20 to-blue-300/20 rounded-full blur-xl animate-ping delay-2500" />
        
        {/* More floating particles */}
        <div className="absolute top-20 right-1/4 w-2 h-2 bg-yellow-400/50 rounded-full animate-bounce delay-200" />
        <div className="absolute bottom-40 left-1/3 w-1 h-1 bg-pink-400/70 rounded-full animate-pulse delay-900" />
        <div className="absolute top-1/2 right-20 w-3 h-3 bg-cyan-400/40 rounded-full animate-ping delay-1200" />
        <div className="absolute bottom-1/5 left-1/5 w-2 h-2 bg-purple-400/50 rounded-full animate-bounce delay-1800" />

        <div className="relative z-10">
          <Link
            to="/"
            className="group flex items-center space-x-2 mb-6 text-orange-400 hover:text-orange-300 transition-all duration-300"
          >
            <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform duration-300" />
            <span className="font-medium">Back to Home</span>
          </Link>

          <div className="mb-6">
            <h1 className="text-5xl font-bold mb-6 text-white leading-tight">
              Join{" "}
              <span className="bg-gradient-to-r from-yellow-400 via-orange-500 to-orange-600 bg-clip-text text-transparent">
                FireStream
              </span>
            </h1>
            <p className="text-xl text-gray-300 leading-relaxed">Start your personalized streaming journey today</p>
          </div>

          <div className="space-y-4">
            <div className="group flex items-start space-x-4 p-4 rounded-xl bg-white/5 backdrop-blur-sm border border-white/10 hover:bg-white/10 transition-all duration-300">
              <div className="w-10 h-10 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-lg flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform duration-300">
                <CheckCircle className="w-5 h-5 text-black" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-orange-400 mb-2">Free to Start</h3>
                <p className="text-gray-300 text-sm leading-relaxed">
                  Begin with our free tier and upgrade anytime for premium features.
                </p>
              </div>
            </div>

            <div className="group flex items-start space-x-4 p-4 rounded-xl bg-white/5 backdrop-blur-sm border border-white/10 hover:bg-white/10 transition-all duration-300">
              <div className="w-10 h-10 bg-gradient-to-r from-blue-400 to-blue-600 rounded-lg flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform duration-300">
                <Zap className="w-5 h-5 text-white" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-blue-400 mb-2">Instant Access</h3>
                <p className="text-gray-300 text-sm leading-relaxed">
                  Start watching immediately after signing up - no waiting required.
                </p>
              </div>
            </div>

            <div className="group flex items-start space-x-4 p-4 rounded-xl bg-white/5 backdrop-blur-sm border border-white/10 hover:bg-white/10 transition-all duration-300">
              <div className="w-10 h-10 bg-gradient-to-r from-orange-500 to-yellow-400 rounded-lg flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform duration-300">
                <User className="w-5 h-5 text-black" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-orange-400 mb-2">Personalized Experience</h3>
                <p className="text-gray-300 text-sm leading-relaxed">
                  Your preferences shape your unique viewing recommendations.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Right Side - Sign Up Form */}
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
            <div className="text-center mb-6">
              <h2 className="text-3xl font-bold text-gray-900 mb-3">Create Account</h2>
            </div>

            {/* Authentication Method Selector */}
            <div className="flex space-x-2 mb-6 bg-gray-100 p-1 rounded-lg">
              <button
                type="button"
                onClick={() => setAuthMethod("email")}
                className={`flex-1 py-2 px-3 rounded-md text-sm font-medium transition-all duration-200 ${
                  authMethod === "email"
                    ? "bg-white text-gray-900 shadow-sm"
                    : "text-gray-600 hover:text-gray-800"
                }`}
              >
                Email
              </button>
              <button
                type="button"
                onClick={() => setAuthMethod("phone")}
                className={`flex-1 py-2 px-3 rounded-md text-sm font-medium transition-all duration-200 ${
                  authMethod === "phone"
                    ? "bg-white text-gray-900 shadow-sm"
                    : "text-gray-600 hover:text-gray-800"
                }`}
              >
                Phone
              </button>
            </div>

            <form onSubmit={handleSignUp} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="name" className="text-gray-700 font-medium">
                  Full Name
                </Label>
                <Input
                  id="name"
                  name="name"
                  type="text"
                  value={formData.name}
                  onChange={handleInputChange}
                  placeholder="Your full name"
                  className="h-10 border-gray-200 focus:border-orange-500 focus:ring-orange-500/20 focus:ring-4 rounded-lg bg-white/50 backdrop-blur-sm transition-all duration-300"
                  required
                />
              </div>

              {/* Email Field - Only show for email signup */}
              {authMethod === "email" && (
                <div className="space-y-2">
                  <Label htmlFor="email" className="text-gray-700 font-medium">
                    Email Address
                  </Label>
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    placeholder="you@example.com"
                    className="h-10 border-gray-200 focus:border-orange-500 focus:ring-orange-500/20 focus:ring-4 rounded-lg bg-white/50 backdrop-blur-sm transition-all duration-300"
                    required={authMethod === "email"}
                  />
                </div>
              )}

              {/* Phone Number Field - Only show for phone signup */}
              {authMethod === "phone" && (
                <div className="space-y-2">
                  <Label htmlFor="phone" className="text-gray-700 font-medium">
                    Phone Number
                  </Label>
                  <Input
                    id="phone"
                    name="phone"
                    type="tel"
                    value={formData.phone}
                    onChange={handleInputChange}
                    placeholder="(123) 456-7890"
                    className="h-10 border-gray-200 focus:border-orange-500 focus:ring-orange-500/20 focus:ring-4 rounded-lg bg-white/50 backdrop-blur-sm transition-all duration-300"
                    required={authMethod === "phone"}
                  />
                  <p className="text-sm text-blue-600">
                    💡 Demo: Use (123) 456-7890 for testing
                  </p>
                </div>
              )}

              {/* Password Fields - Only show for email signup */}
              {authMethod === "email" && (
                <>
                  <div className="space-y-2">
                    <Label htmlFor="password" className="text-gray-700 font-medium">
                      Password
                    </Label>
                    <div className="relative">
                      <Input
                        id="password"
                        name="password"
                        type={showPassword ? "text" : "password"}
                        value={formData.password}
                        onChange={handleInputChange}
                        placeholder="Create a strong password"
                        className="h-10 border-gray-200 focus:border-orange-500 focus:ring-orange-500/20 focus:ring-4 rounded-lg bg-white/50 backdrop-blur-sm pr-10 transition-all duration-300"
                        required={authMethod === "email"}
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

                  <div className="space-y-2">
                    <Label htmlFor="confirmPassword" className="text-gray-700 font-medium">
                      Confirm Password
                    </Label>
                    <div className="relative">
                      <Input
                        id="confirmPassword"
                        name="confirmPassword"
                        type={showConfirmPassword ? "text" : "password"}
                        value={formData.confirmPassword}
                        onChange={handleInputChange}
                        placeholder="Confirm your password"
                        className="h-10 border-gray-200 focus:border-orange-500 focus:ring-orange-500/20 focus:ring-4 rounded-lg bg-white/50 backdrop-blur-sm pr-10 transition-all duration-300"
                        required={authMethod === "email"}
                      />
                      <button
                        type="button"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        className="absolute inset-y-0 right-0 pr-4 flex items-center text-gray-400 hover:text-gray-600 transition-colors duration-200"
                      >
                        {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                      </button>
                    </div>
                  </div>
                </>
              )}

              <div className="flex items-start space-x-3">
                <input
                  type="checkbox"
                  className="mt-1 rounded border-gray-300 text-orange-500 focus:ring-orange-500/20 focus:ring-4 transition-all duration-200"
                  required
                />
                <span className="text-sm text-gray-600 leading-relaxed">
                  I agree to the{" "}
                  <Link to="#" className="text-orange-500 hover:text-orange-600 transition-colors duration-200">
                    Terms of Service
                  </Link>{" "}
                  and{" "}
                  <Link to="#" className="text-orange-500 hover:text-orange-600 transition-colors duration-200">
                    Privacy Policy
                  </Link>
                </span>
              </div>

              <Button
                type="submit"
                className="w-full h-10 bg-gradient-to-r from-yellow-400 to-orange-500 text-black hover:from-yellow-500 hover:to-orange-600 font-medium rounded-lg shadow-md hover:shadow-lg transform hover:scale-[1.01] transition-all duration-300 text-sm"
              >
                {authMethod === "phone" ? "Create Account with Phone" : "Create FireStream Account"}
              </Button>
            </form>

            <div className="mt-8 text-center">
              <p className="text-gray-600">
                Already have an account?{" "}
                <Link
                  to="/signin"
                  className="text-orange-500 hover:text-orange-600 font-semibold transition-colors duration-200"
                >
                  Sign in here
                </Link>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

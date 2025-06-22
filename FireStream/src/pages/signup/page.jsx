"use client"

import React from "react"

import { useState } from "react"
import { Link } from "react-router-dom"
import { useNavigate } from "react-router-dom"
import { Button } from "../../components/ui/button"
import { Input } from "../../components/ui/input"
import { Label } from "../../components/ui/label"
import { Eye, EyeOff, Play, ArrowLeft } from "lucide-react"

export default function SignUpPage() {
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
  })
  const navigate = useNavigate()

  const handleSignUp = (e) => {
    e.preventDefault()
    if (formData.password !== formData.confirmPassword) {
      alert("Passwords do not match")
      return
    }
    // Store user session (simplified)
    localStorage.setItem("user", JSON.stringify({ email: formData.email, name: formData.name }))
    navigate("/home")
  }

  const handleInputChange = (e) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }))
  }

  return (
    <div className="min-h-screen flex bg-black">
      {/* Left Side - Image and Features */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-gray-900 via-black to-gray-800 p-12 flex-col justify-center relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-yellow-400/5 via-orange-500/5 to-blue-500/5" />
        <div className="relative z-10">
          <Link to="/" className="flex items-center space-x-2 mb-12">
            <ArrowLeft className="w-5 h-5 text-orange-400" />
            <span className="text-orange-400 hover:text-orange-300">Back to Home</span>
          </Link>

          <h1 className="text-4xl font-bold mb-6 text-white">
            Join <span className="text-orange-400">FireStream</span>
          </h1>
          <p className="text-xl text-gray-300 mb-12">Start your personalized streaming journey today</p>

          <div className="space-y-8">
            <div className="flex items-start space-x-4">
              <div className="w-12 h-12 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-lg flex items-center justify-center flex-shrink-0">
                <svg className="w-6 h-6 text-black" fill="currentColor" viewBox="0 0 20 20">
                  <path
                    fillRule="evenodd"
                    d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                    clipRule="evenodd"
                  />
                </svg>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-orange-400 mb-2">Free to Start</h3>
                <p className="text-gray-400">Begin with our free tier and upgrade anytime for premium features.</p>
              </div>
            </div>

            <div className="flex items-start space-x-4">
              <div className="w-12 h-12 bg-gradient-to-r from-blue-400 to-blue-600 rounded-lg flex items-center justify-center flex-shrink-0">
                <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-blue-400 mb-2">Instant Access</h3>
                <p className="text-gray-400">Start watching immediately after signing up - no waiting required.</p>
              </div>
            </div>

            <div className="flex items-start space-x-4">
              <div className="w-12 h-12 bg-gradient-to-r from-orange-500 to-yellow-400 rounded-lg flex items-center justify-center flex-shrink-0">
                <svg className="w-6 h-6 text-black" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M3 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z" />
                </svg>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-orange-400 mb-2">Personalized Experience</h3>
                <p className="text-gray-400">Your preferences shape your unique viewing recommendations.</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Right Side - Sign Up Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8 bg-white">
        <div className="w-full max-w-md">
          <div className="text-center mb-8">
            <div className="flex items-center justify-center space-x-2 mb-4 lg:hidden">
              <div className="w-8 h-8 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-lg flex items-center justify-center">
                <Play className="w-4 h-4 text-black" />
              </div>
              <span className="text-xl font-bold text-black">
                Fire<span className="text-orange-500">Stream</span>
              </span>
            </div>
            <h2 className="text-3xl font-bold text-gray-900 mb-2">Create Account</h2>
            <p className="text-gray-600">Join thousands of users enjoying personalized streaming</p>
          </div>

          <form onSubmit={handleSignUp} className="space-y-6">
            <div>
              <Label htmlFor="name" className="text-gray-700">
                Full Name
              </Label>
              <Input
                id="name"
                name="name"
                type="text"
                value={formData.name}
                onChange={handleInputChange}
                placeholder="Your full name"
                className="mt-1 border-gray-300 focus:border-orange-500 focus:ring-orange-500"
                required
              />
            </div>

            <div>
              <Label htmlFor="email" className="text-gray-700">
                Email Address
              </Label>
              <Input
                id="email"
                name="email"
                type="email"
                value={formData.email}
                onChange={handleInputChange}
                placeholder="you@example.com"
                className="mt-1 border-gray-300 focus:border-orange-500 focus:ring-orange-500"
                required
              />
            </div>

            <div>
              <Label htmlFor="password" className="text-gray-700">
                Password
              </Label>
              <div className="relative mt-1">
                <Input
                  id="password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  value={formData.password}
                  onChange={handleInputChange}
                  placeholder="Create a strong password"
                  className="border-gray-300 focus:border-orange-500 focus:ring-orange-500 pr-10"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            <div>
              <Label htmlFor="confirmPassword" className="text-gray-700">
                Confirm Password
              </Label>
              <div className="relative mt-1">
                <Input
                  id="confirmPassword"
                  name="confirmPassword"
                  type={showConfirmPassword ? "text" : "password"}
                  value={formData.confirmPassword}
                  onChange={handleInputChange}
                  placeholder="Confirm your password"
                  className="border-gray-300 focus:border-orange-500 focus:ring-orange-500 pr-10"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600"
                >
                  {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            <div className="flex items-center">
              <input
                type="checkbox"
                className="rounded border-gray-300 text-orange-500 focus:ring-orange-500"
                required
              />
              <span className="ml-2 text-sm text-gray-600">
                I agree to the{" "}
                <Link to="#" className="text-orange-500 hover:text-orange-600">
                  Terms of Service
                </Link>{" "}
                and{" "}
                <Link to="#" className="text-orange-500 hover:text-orange-600">
                  Privacy Policy
                </Link>
              </span>
            </div>

            <Button
              type="submit"
              className="w-full bg-gradient-to-r from-yellow-400 to-orange-500 text-black hover:from-yellow-500 hover:to-orange-600 py-3"
            >
              Create FireStream Account
            </Button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-gray-600">
              Already have an account?{" "}
              <Link to="/signin" className="text-orange-500 hover:text-orange-600 font-medium">
                Sign in here
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

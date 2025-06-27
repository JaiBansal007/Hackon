"use client"

import React from "react"
import { useState } from "react"
import { Link, useNavigate } from "react-router-dom"
import { Button } from "../../components/ui/button"
import { Input } from "../../components/ui/input"
import { Label } from "../../components/ui/label"
import { Eye, EyeOff, Play, ArrowLeft, Sparkles, Users, FileText, Trophy } from "lucide-react"

export default function SignInPage() {
  const [showPassword, setShowPassword] = useState(false)
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const navigate = useNavigate()

  const handleSignIn = (e) => {
    e.preventDefault()
    navigate("/home")
  }

  return (
    <div className="min-h-screen w-full flex bg-gradient-to-br from-gray-950 via-black to-gray-900">
      {/* Left Side - Image and Features */}
      <div className="hidden lg:flex lg:w-2/3 px-10 py-7 flex-col justify-center relative overflow-hidden">
        {/* Animated background elements */}
        <div className="absolute inset-0 bg-gradient-to-br from-yellow-400/10 via-orange-500/10 to-blue-500/10" />
        <div className="absolute top-20 left-20 w-72 h-72 bg-gradient-to-r from-orange-400/20 to-yellow-400/20 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-20 right-20 w-96 h-96 bg-gradient-to-r from-blue-400/20 to-purple-500/20 rounded-full blur-3xl animate-pulse delay-1000" />

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

            <form onSubmit={handleSignIn} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="email" className="text-gray-700 font-medium">
                  Email Address
                </Label>
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  className="h-12 border-gray-200 focus:border-orange-500 focus:ring-orange-500/20 focus:ring-4 rounded-xl bg-white/50 backdrop-blur-sm transition-all duration-300"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="password" className="text-gray-700 font-medium">
                  Password
                </Label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Your password"
                    className="h-12 border-gray-200 focus:border-orange-500 focus:ring-orange-500/20 focus:ring-4 rounded-xl bg-white/50 backdrop-blur-sm pr-12 transition-all duration-300"
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
                className="w-full h-12 bg-gradient-to-r from-yellow-400 to-orange-500 text-black hover:from-yellow-500 hover:to-orange-600 font-semibold rounded-xl shadow-lg hover:shadow-xl transform hover:scale-[1.02] transition-all duration-300"
              >
                Sign In to FireStream
              </Button>
            </form>

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

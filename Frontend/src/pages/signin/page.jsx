"use client"

import { useState } from "react"
import { Link, useNavigate } from "react-router-dom"
import { Button } from "../../components/ui/button"
import { Input } from "../../components/ui/input"
import { Label } from "../../components/ui/label"
import { Eye, EyeOff, Play, ArrowLeft } from "lucide-react"

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
    <div className="min-h-screen w-screen flex bg-black">
      {/* Left Side - Image and Features */}
      <div className="hidden lg:flex lg:w-2/3 bg-gradient-to-br from-gray-900 via-black to-gray-800 p-12 flex-col justify-center relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-yellow-400/5 via-orange-500/5 to-blue-500/5" />
        <div className="relative z-10">
          <Link to="/" className="flex items-center space-x-2 mb-12">
            <ArrowLeft className="w-5 h-5 text-orange-400" />
            <span className="text-orange-400 hover:text-orange-300">Back to Home</span>
          </Link>

          <h1 className="text-4xl font-bold mb-6 text-white">
            Welcome to <span className="text-orange-400">FireStream</span>
          </h1>
          <p className="text-xl text-gray-300 mb-12">Your personalized Fire TV experience awaits</p>

          <div className="space-y-8">
            <div className="flex items-start space-x-4">
              <div className="w-12 h-12 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-lg flex items-center justify-center flex-shrink-0">
                <Play className="w-6 h-6 text-black" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-orange-400 mb-2">AI-Powered Recommendations</h3>
                <p className="text-gray-400">
                  Get personalized content suggestions based on your mood and viewing history.
                </p>
              </div>
            </div>

            <div className="flex items-start space-x-4">
              <div className="w-12 h-12 bg-gradient-to-r from-blue-400 to-blue-600 rounded-lg flex items-center justify-center flex-shrink-0">
                <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M13 6a3 3 0 11-6 0 3 3 0 016 0zM18 8a2 2 0 11-4 0 2 2 0 014 0zM14 15a4 4 0 00-8 0v3h8v-3z" />
                </svg>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-blue-400 mb-2">Social Co-Watching</h3>
                <p className="text-gray-400">Watch with friends in real-time, no matter where they are.</p>
              </div>
            </div>

            <div className="flex items-start space-x-4">
              <div className="w-12 h-12 bg-gradient-to-r from-orange-500 to-yellow-400 rounded-lg flex items-center justify-center flex-shrink-0">
                <svg className="w-6 h-6 text-black" fill="currentColor" viewBox="0 0 20 20">
                  <path
                    fillRule="evenodd"
                    d="M3 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z"
                    clipRule="evenodd"
                  />
                </svg>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-orange-400 mb-2">Smart Summarizer</h3>
                <p className="text-gray-400">Never miss a beat with AI-generated content summaries.</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Right Side - Sign In Form */}
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
            <h2 className="text-3xl font-bold text-gray-900 mb-2">Welcome Back</h2>
            <p className="text-gray-600">Sign in to access your personalized streaming experience</p>
          </div>

          <form onSubmit={handleSignIn} className="space-y-6">
            <div>
              <Label htmlFor="email" className="text-gray-700">
                Email Address
              </Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                className="mt-1 border-gray-300 focus:border-orange-500 focus:ring-orange-500"
              />
            </div>

            <div>
              <Label htmlFor="password" className="text-gray-700">
                Password
              </Label>
              <div className="relative mt-1">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Your password"
                  className="border-gray-300 focus:border-orange-500 focus:ring-orange-500 pr-10"
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

            <div className="flex items-center justify-between">
              <label className="flex items-center">
                <input type="checkbox" className="rounded border-gray-300 text-orange-500 focus:ring-orange-500" />
                <span className="ml-2 text-sm text-gray-600">Remember me</span>
              </label>
              <Link to="#" className="text-sm text-orange-500 hover:text-orange-600">
                Forgot password?
              </Link>
            </div>

            <Button
              type="submit"
              className="w-full bg-gradient-to-r from-yellow-400 to-orange-500 text-black hover:from-yellow-500 hover:to-orange-600 py-3"
            >
              Sign In to FireStream
            </Button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-gray-600">
              Don't have an account?{" "}
              <Link to="/signup" className="text-orange-500 hover:text-orange-600 font-medium">
                Sign up here
              </Link>
            </p>
          </div>

          <div className="mt-8 text-center text-xs text-gray-500">
            By signing in, you agree to our{" "}
            <Link to="#" className="text-orange-500 hover:text-orange-600">
              Terms of Service
            </Link>{" "}
            and{" "}
            <Link to="#" className="text-orange-500 hover:text-orange-600">
              Privacy Policy
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
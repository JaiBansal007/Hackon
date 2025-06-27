"use client"

import { useState, useRef } from "react"
import { useNavigate } from "react-router-dom"
import { motion, AnimatePresence } from "framer-motion"
import { Button } from "../../ui/button"
import { Input } from "../../ui/input"
import { Avatar, AvatarFallback } from "../../ui/avatar"
import { Search, Users, LogOut, Settings, User, Gift, Menu, Crown, Zap, Star } from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "../../ui/dropdown-menu"
import { StreakIcon } from "../../gamification/streak-icon"
import { PointsDisplay } from "../../gamification/points-display"
import { movieCategories } from "../content/movie-data"

function UserInitialAvatar({ name }) {
  const initial = name?.charAt(0).toUpperCase() || "U"
  return (
    <AvatarFallback className="bg-gradient-to-br from-amber-400 via-orange-500 to-amber-600 text-black font-bold text-lg shadow-inner">
      {initial}
    </AvatarFallback>
  )
}

export function Navbar({ user, roomStatus, roomId, isFullscreen, onCreateRoom, onJoinRoom, onLeaveRoom, onLogout }) {
  const [search, setSearch] = useState("")
  const [showDropdown, setShowDropdown] = useState(false)
  const inputRef = useRef(null)
  const navigate = useNavigate()

  // Flatten all movies from categories
  const allMovies = movieCategories.flatMap((cat) => cat.movies)
  const filteredMovies = search
    ? allMovies.filter((m) => m.title.toLowerCase().includes(search.toLowerCase())).slice(0, 6)
    : []

  const handleMovieSelect = (movieId) => {
    setSearch("")
    setShowDropdown(false)
    navigate(`/movie/${movieId}`)
  }

  if (isFullscreen) return null

  return (
    <>
      {/* Enhanced Background with Blur */}
      <motion.nav
        initial={{ y: -50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        className="fixed top-0 left-16 right-0 z-50 h-20"
      >
        {/* Glassmorphism Background */}
        <div className="absolute inset-0 bg-gradient-to-r from-black/95 via-black/90 to-black/95 backdrop-blur-xl" />
        <div className="absolute inset-0 bg-gradient-to-b from-amber-500/5 via-transparent to-transparent" />
        <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-amber-500/30 to-transparent" />

        {/* Content Container */}
        <div className="relative h-full px-6 flex justify-between items-center">
          {/* Left: Room Controls or Status */}
          <div className="flex items-center gap-4">
            {roomStatus === "none" ? (
              <div className="flex items-center gap-3">
                <motion.div
                  whileHover={{ scale: 1.05, y: -2 }}
                  whileTap={{ scale: 0.95 }}
                  transition={{ type: "spring", stiffness: 400, damping: 17 }}
                >
                  <Button
                    onClick={onCreateRoom}
                    className="relative overflow-hidden bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-black font-bold px-6 py-3 rounded-xl shadow-lg hover:shadow-amber-500/25 transition-all duration-300 border border-amber-400/20"
                  >
                    <div className="absolute inset-0 bg-gradient-to-r from-white/20 to-transparent opacity-0 hover:opacity-100 transition-opacity duration-300" />
                    <Crown className="w-5 h-5 mr-2" />
                    <span>Create Room</span>
                  </Button>
                </motion.div>

                <motion.div
                  whileHover={{ scale: 1.05, y: -2 }}
                  whileTap={{ scale: 0.95 }}
                  transition={{ type: "spring", stiffness: 400, damping: 17 }}
                >
                  <Button
                    onClick={onJoinRoom}
                    className="relative overflow-hidden bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-400 hover:to-purple-500 text-white font-bold px-6 py-3 rounded-xl shadow-lg hover:shadow-blue-500/25 transition-all duration-300 border border-blue-400/20"
                  >
                    <div className="absolute inset-0 bg-gradient-to-r from-white/20 to-transparent opacity-0 hover:opacity-100 transition-opacity duration-300" />
                    <Users className="w-5 h-5 mr-2" />
                    <span>Join Room</span>
                  </Button>
                </motion.div>
              </div>
            ) : (
              <div className="flex items-center gap-4">
                <motion.div
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ type: "spring", stiffness: 200, damping: 20 }}
                  className="relative overflow-hidden bg-gradient-to-r from-amber-500/20 to-orange-500/20 backdrop-blur-sm border border-amber-500/30 px-6 py-3 rounded-xl"
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-amber-500/10 to-orange-500/10" />
                  <div className="relative flex items-center gap-3">
                    {roomStatus === "host" ? (
                      <Crown className="w-6 h-6 text-amber-400" />
                    ) : (
                      <Users className="w-6 h-6 text-amber-400" />
                    )}
                    <div>
                      <div className="text-white font-bold text-sm">Room {roomId}</div>
                      <div className="text-amber-300 text-xs">{roomStatus === "host" ? "Host" : "Member"}</div>
                    </div>
                    <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse ml-2" />
                  </div>
                </motion.div>

                <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                  <Button
                    onClick={onLeaveRoom}
                    className="bg-gradient-to-r from-red-500 to-red-600 hover:from-red-400 hover:to-red-500 text-white font-semibold px-6 py-3 rounded-xl shadow-lg hover:shadow-red-500/25 transition-all duration-300"
                  >
                    Leave Room
                  </Button>
                </motion.div>
              </div>
            )}
          </div>

          {/* Center: Enhanced Search */}
          <div className="hidden md:flex items-center relative w-96">
            <div className="relative w-full group">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-amber-400 w-5 h-5 transition-all duration-300 group-focus-within:text-amber-300" />
              <Input
                ref={inputRef}
                placeholder="Search movies, shows, or vibes..."
                className="pl-12 pr-6 h-12 bg-gray-900/50 backdrop-blur-sm border-2 border-gray-700/50 focus:border-amber-500/50 text-white placeholder-gray-400 rounded-xl transition-all duration-300 focus:bg-gray-900/70 focus:shadow-lg focus:shadow-amber-500/10"
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value)
                  setShowDropdown(!!e.target.value)
                }}
                onFocus={() => setShowDropdown(!!search)}
                onBlur={() => setTimeout(() => setShowDropdown(false), 120)}
              />
              <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-amber-500/10 to-orange-500/10 opacity-0 group-focus-within:opacity-100 transition-opacity duration-300 pointer-events-none" />
            </div>

            <AnimatePresence>
              {showDropdown && filteredMovies.length > 0 && (
                <motion.div
                  initial={{ opacity: 0, y: -10, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -10, scale: 0.95 }}
                  transition={{ duration: 0.2, ease: "easeOut" }}
                  className="absolute top-14 left-0 w-full bg-gray-900/95 backdrop-blur-xl border border-amber-500/20 rounded-2xl shadow-2xl z-50 max-h-80 overflow-y-auto"
                >
                  <div className="p-2">
                    {filteredMovies.map((movie, index) => (
                      <motion.div
                        key={movie.movieId}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.05 }}
                        className="flex items-center gap-4 px-4 py-3 cursor-pointer hover:bg-amber-500/10 rounded-xl transition-all duration-200 group"
                        onMouseDown={() => handleMovieSelect(movie.movieId)}
                      >
                        <div className="relative overflow-hidden rounded-lg">
                          <img
                            src={movie.image || "/placeholder.svg"}
                            alt={movie.title}
                            className="w-12 h-16 object-cover transition-transform duration-300 group-hover:scale-110"
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                        </div>
                        <div className="flex-1">
                          <div className="text-white font-semibold group-hover:text-amber-300 transition-colors duration-200">
                            {movie.title}
                          </div>
                          <div className="flex items-center gap-2 mt-1">
                            <Star className="w-3 h-3 text-amber-400 fill-current" />
                            <span className="text-amber-400 text-sm font-medium">{movie.rating}</span>
                            <span className="text-gray-500 text-sm">• {movie.year}</span>
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Right: Enhanced User Section */}
          <div className="flex items-center gap-4">
            {/* Gamification Section */}
            <div className="hidden lg:flex items-center gap-4 px-4 py-2 bg-gradient-to-r from-gray-800/50 to-gray-900/50 backdrop-blur-sm rounded-xl border border-gray-700/50">
              <motion.div
                whileHover={{ scale: 1.1, rotate: 5 }}
                transition={{ type: "spring", stiffness: 400, damping: 17 }}
              >
                <StreakIcon />
              </motion.div>
              <div className="w-px h-6 bg-gray-600" />
              <motion.div whileHover={{ scale: 1.05 }}>
                <PointsDisplay />
              </motion.div>
            </div>

            {/* Redeem Button */}
            <motion.div
              whileHover={{ scale: 1.05, y: -2 }}
              whileTap={{ scale: 0.95 }}
              transition={{ type: "spring", stiffness: 400, damping: 17 }}
            >
              <Button
                onClick={() => (window.location.href = "/redeem")}
                className="relative overflow-hidden bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-400 hover:to-pink-400 text-white font-bold px-6 py-3 rounded-xl shadow-lg hover:shadow-purple-500/25 transition-all duration-300"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-white/20 to-transparent opacity-0 hover:opacity-100 transition-opacity duration-300" />
                <Gift className="w-5 h-5 mr-2" />
                <span>Redeem</span>
                <Zap className="w-4 h-4 ml-2 text-yellow-300" />
              </Button>
            </motion.div>

            {/* Enhanced User Dropdown */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <motion.div
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  transition={{ type: "spring", stiffness: 400, damping: 17 }}
                >
                  <Button variant="ghost" className="p-0 h-14 w-14 rounded-full relative group">
                    <Avatar className="h-12 w-12 ring-2 ring-amber-400/50 group-hover:ring-amber-400 transition-all duration-300">
                      <UserInitialAvatar name={user.name} />
                    </Avatar>
                    <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-400 rounded-full border-2 border-black animate-pulse" />
                  </Button>
                </motion.div>
              </DropdownMenuTrigger>
              <DropdownMenuContent
                className="w-60 bg-gray-900/95 backdrop-blur-xl border border-amber-500/20 shadow-2xl rounded-2xl"
                align="end"
                asChild // <-- Add this prop to allow custom wrapper
              >
                <motion.div
                  initial={{ opacity: 0, y: -10, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -10, scale: 0.95 }}
                  transition={{ duration: 0.2, ease: "easeOut" }} // <-- Increase duration here
                >
                  {/* User Info Header */}
                  <div className="flex items-center gap-4 p-6 bg-gradient-to-r from-amber-500/10 to-orange-500/10 rounded-t-2xl">
                    <Avatar className="h-12 w-12 ring-2 ring-amber-400/50">
                      <UserInitialAvatar name={user.name} />
                    </Avatar>
                    <div className="flex-1">
                      <p className="text-white font-bold text-lg">{user.name}</p>
                      <p className="text-amber-300 text-sm truncate">{user.email}</p>
                      <div className="flex items-center gap-2 mt-1">
                        <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
                        <span className="text-green-400 text-xs font-medium">Online</span>
                      </div>
                    </div>
                  </div>

                  <div className="p-2">
                    <DropdownMenuSeparator className="bg-amber-400/20 my-2" />

                    <DropdownMenuItem
                      onClick={() => (window.location.href = "/profile")}
                      className="text-white hover:bg-amber-500/10 rounded-xl px-4 py-3 cursor-pointer transition-all duration-200 group"
                    >
                      <User className="mr-3 h-5 w-5 text-amber-400 group-hover:scale-110 transition-transform duration-200" />
                      <span className="font-medium">Profile</span>
                    </DropdownMenuItem>

                    <DropdownMenuItem className="text-white hover:bg-amber-500/10 rounded-xl px-4 py-3 cursor-pointer transition-all duration-200 group">
                      <Settings className="mr-3 h-5 w-5 text-amber-400 group-hover:scale-110 transition-transform duration-200" />
                      <span className="font-medium">Settings</span>
                    </DropdownMenuItem>

                    <DropdownMenuSeparator className="bg-amber-400/20 my-2" />

                    <DropdownMenuItem
                      onClick={onLogout}
                      className="text-red-400 hover:bg-red-500/10 rounded-xl px-4 py-3 cursor-pointer transition-all duration-200 group"
                    >
                      <LogOut className="mr-3 h-5 w-5 group-hover:scale-110 transition-transform duration-200" />
                      <span className="font-medium">Log Out</span>
                    </DropdownMenuItem>
                  </div>
                </motion.div>
              </DropdownMenuContent>
            </DropdownMenu>

            {/* Mobile Menu Button */}
            <div className="md:hidden">
              <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}>
                <Button size="icon" variant="ghost" className="text-amber-400 hover:bg-amber-500/10 rounded-xl">
                  <Menu className="w-6 h-6" />
                </Button>
              </motion.div>
            </div>
          </div>
        </div>
      </motion.nav>
    </>
  )
}

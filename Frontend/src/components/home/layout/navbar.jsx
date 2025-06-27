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
      {/* Enhanced Background with Multiple Layers */}
      <motion.nav
        initial={{ y: -80, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.8, ease: [0.25, 0.46, 0.45, 0.94] }}
        className="fixed top-0 left-20 right-0 z-50 h-24"
      >
        {/* Multi-layer Glassmorphism Background */}
        <div className="absolute inset-0 bg-gradient-to-r from-black/98 via-gray-950/95 to-black/98 backdrop-blur-2xl" />
        <div className="absolute inset-0 bg-gradient-to-b from-amber-500/8 via-orange-500/4 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/2 to-transparent" />

        {/* Animated border gradients */}
        <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-amber-400/40 to-transparent" />
        <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-amber-400/20 to-transparent" />

        {/* Floating accent elements */}
        <div className="absolute top-2 left-1/4 w-32 h-1 bg-gradient-to-r from-transparent via-amber-400/30 to-transparent rounded-full blur-sm" />
        <div className="absolute bottom-2 right-1/4 w-24 h-1 bg-gradient-to-r from-transparent via-orange-400/20 to-transparent rounded-full blur-sm" />

        {/* Content Container */}
        <div className="relative h-full px-8 flex justify-between items-center">
          {/* Left: Enhanced Room Controls */}
          <div className="flex items-center gap-5">
            {roomStatus === "none" ? (
              <div className="flex items-center gap-4">
                <motion.div
                  whileHover={{
                    scale: 1.08,
                    y: -3,
                    boxShadow: "0 10px 40px rgba(251,146,60,0.3)",
                  }}
                  whileTap={{ scale: 0.95 }}
                  transition={{ type: "spring", stiffness: 400, damping: 17 }}
                >
                  <Button
                    onClick={onCreateRoom}
                    className="relative overflow-hidden bg-gradient-to-r from-amber-500 via-orange-500 to-amber-600 hover:from-amber-400 hover:via-orange-400 hover:to-amber-500 text-black font-bold px-5 py-3 rounded-2xl shadow-xl hover:shadow-amber-500/30 transition-all duration-400 border border-amber-300/30 group"
                  >
                    <div className="absolute inset-0 bg-gradient-to-r from-white/30 via-white/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-400" />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/10 to-transparent" />
                    <Crown className="w-5 h-5 mr-3 drop-shadow-sm group-hover:rotate-12 transition-transform duration-300" />
                    <span className="relative z-10 tracking-wide">Create Room</span>
                    <div className="absolute -top-1 -right-1 w-3 h-3 bg-yellow-300 rounded-full animate-ping opacity-75" />
                  </Button>
                </motion.div>

                <motion.div
                  whileHover={{
                    scale: 1.08,
                    y: -3,
                    boxShadow: "0 10px 40px rgba(59,130,246,0.3)",
                  }}
                  whileTap={{ scale: 0.95 }}
                  transition={{ type: "spring", stiffness: 400, damping: 17 }}
                >
                  <Button
                    onClick={onJoinRoom}
                    className="relative overflow-hidden bg-gradient-to-r from-teal-400 via-blue-500 to-violet-600 hover:from-teal-300 hover:via-blue-400 hover:to-violet-500 focus:ring-4 focus:ring-blue-300 text-white font-bold px-5 py-3 rounded-2xl shadow-xl hover:shadow-blue-500/30 transition-all duration-400 border border-blue-400/30 group"
                  >
                    <div className="absolute inset-0 bg-gradient-to-r from-white/20 via-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-400" />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/10 to-transparent" />
                    <Users className="w-5 h-5 mr-3 drop-shadow-sm group-hover:scale-110 transition-transform duration-300" />
                    <span className="relative z-10 tracking-wide">Join Room</span>
                  </Button>
                </motion.div>
              </div>
            ) : (
              <div className="flex items-center gap-3">
                <motion.div
                  initial={{ scale: 0.9, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ type: "spring", stiffness: 300, damping: 25 }}
                  className="flex items-center gap-3 px-4 py-2 bg-gradient-to-r from-amber-500/20 to-orange-500/15 backdrop-blur-sm border border-amber-400/30 rounded-xl shadow-lg"
                >
                  <div className="flex items-center gap-2">
                    {roomStatus === "host" ? (
                      <Crown className="w-4 h-4 text-amber-400" />
                    ) : (
                      <Users className="w-4 h-4 text-amber-400" />
                    )}
                    <div>
                      <div className="text-white font-semibold text-sm">Room {roomId}</div>
                      <div className="text-amber-300 text-xs">{roomStatus === "host" ? "Host" : "Member"}</div>
                    </div>
                  </div>

                  <div className="flex items-center gap-1">
                    <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
                    <span className="text-green-400 text-xs font-medium">Live</span>
                  </div>
                </motion.div>

                <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                  <Button
                    onClick={onLeaveRoom}
                    size="sm"
                    className="bg-gradient-to-r from-red-500 to-red-600 hover:from-red-400 hover:to-red-500 text-white font-medium px-4 py-2 rounded-xl shadow-md hover:shadow-red-500/20 transition-all duration-300"
                  >
                    Leave
                  </Button>
                </motion.div>
              </div>
            )}
          </div>

          {/* Center: Ultra-Enhanced Search */}
          <div className="hidden md:flex items-center relative w-[420px]">
            <div className="relative w-full group">
              <motion.div
                className="absolute left-5 top-1/2 transform -translate-y-1/2 z-10"
                whileHover={{ scale: 1.1, rotate: 5 }}
                transition={{ duration: 0.2 }}
              >
                <Search className="text-amber-400 w-6 h-6 transition-all duration-300 group-focus-within:text-amber-300 drop-shadow-sm" />
              </motion.div>

              <Input
                ref={inputRef}
                placeholder="Search movies, shows, or vibes..."
                className="pl-16 pr-8 h-12 bg-gradient-to-r from-gray-900/60 via-gray-800/50 to-gray-900/60 backdrop-blur-xl border-2 border-gray-600/40 focus:border-amber-400/60 text-white placeholder-gray-400 rounded-2xl transition-all duration-400 focus:bg-gradient-to-r focus:from-gray-900/80 focus:via-gray-800/70 focus:to-gray-900/80 focus:shadow-2xl focus:shadow-amber-500/20 text-base font-medium"
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value)
                  setShowDropdown(!!e.target.value)
                }}
                onFocus={() => setShowDropdown(!!search)}
                onBlur={() => setTimeout(() => setShowDropdown(false), 120)}
              />

              <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-amber-500/15 via-orange-500/10 to-amber-500/15 opacity-0 group-focus-within:opacity-100 transition-all duration-400 pointer-events-none" />
              <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-amber-400/50 to-transparent opacity-0 group-focus-within:opacity-100 transition-opacity duration-400" />
            </div>

            <AnimatePresence>
              {showDropdown && filteredMovies.length > 0 && (
                <motion.div
                  initial={{ opacity: 0, y: -15, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -15, scale: 0.95 }}
                  transition={{ duration: 0.3, ease: [0.25, 0.46, 0.45, 0.94] }}
                  className="absolute top-16 left-0 w-full bg-gradient-to-b from-gray-900/98 via-gray-800/95 to-gray-900/98 backdrop-blur-2xl border-2 border-amber-400/30 rounded-3xl shadow-2xl shadow-black/50 z-50 max-h-96 overflow-y-auto"
                >
                  <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-amber-400/50 to-transparent" />

                  <div className="p-3">
                    {filteredMovies.map((movie, index) => (
                      <motion.div
                        key={movie.movieId}
                        initial={{ opacity: 0, x: -30 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.08, duration: 0.4 }}
                        className="flex items-center gap-5 px-5 py-4 cursor-pointer hover:bg-gradient-to-r hover:from-amber-500/15 hover:via-orange-500/10 hover:to-amber-500/15 rounded-2xl transition-all duration-300 group border border-transparent hover:border-amber-500/20"
                        onMouseDown={() => handleMovieSelect(movie.movieId)}
                      >
                        <div className="relative overflow-hidden rounded-xl shadow-lg">
                          <img
                            src={movie.image || "/placeholder.svg"}
                            alt={movie.title}
                            className="w-14 h-20 object-cover transition-all duration-400 group-hover:scale-110"
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-400" />
                          <div className="absolute bottom-1 right-1 w-2 h-2 bg-amber-400 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-400" />
                        </div>

                        <div className="flex-1">
                          <div className="text-white font-bold text-lg group-hover:text-amber-300 transition-colors duration-300 tracking-wide">
                            {movie.title}
                          </div>
                          <div className="flex items-center gap-3 mt-2">
                            <div className="flex items-center gap-1">
                              <Star className="w-4 h-4 text-amber-400 fill-current drop-shadow-sm" />
                              <span className="text-amber-400 text-sm font-bold">{movie.rating}</span>
                            </div>
                            <div className="w-1 h-1 bg-gray-500 rounded-full" />
                            <span className="text-gray-400 text-sm font-medium">{movie.year}</span>
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
          <div className="flex items-center gap-6">
            {/* Enhanced Gamification Section */}
            <div className="hidden lg:flex items-center gap-5 px-6 py-3 bg-gradient-to-r from-gray-800/60 via-gray-700/40 to-gray-800/60 backdrop-blur-xl rounded-2xl border border-gray-600/40 shadow-xl">
              <motion.div
                whileHover={{ scale: 1.15, rotate: 10 }}
                transition={{ type: "spring", stiffness: 400, damping: 17 }}
              >
                <StreakIcon />
              </motion.div>

              <div className="w-px h-8 bg-gradient-to-b from-transparent via-gray-500 to-transparent" />

              <motion.div whileHover={{ scale: 1.08 }}>
                <PointsDisplay />
              </motion.div>
            </div>

            {/* Enhanced Redeem Button */}
            {/* <motion.div
              whileHover={{
                scale: 1.08,
                y: -3,
                boxShadow: "0 15px 50px rgba(168,85,247,0.4)",
              }}
              whileTap={{ scale: 0.95 }}
              transition={{ type: "spring", stiffness: 400, damping: 17 }}
            >
              <Button
                onClick={() => (window.location.href = "/redeem")}
                className="relative overflow-hidden bg-gradient-to-r from-purple-500 via-pink-500 to-purple-600 hover:from-purple-400 hover:via-pink-400 hover:to-purple-500 text-white font-bold px-8 py-4 rounded-2xl shadow-xl hover:shadow-purple-500/30 transition-all duration-400 border border-purple-400/30 group"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-white/25 via-white/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-400" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/10 to-transparent" />
                <Gift className="w-5 h-5 mr-3 drop-shadow-sm group-hover:rotate-12 transition-transform duration-300" />
                <span className="relative z-10 tracking-wide">Redeem</span>
                <motion.div
                  className="ml-2"
                  animate={{ rotate: [0, 10, -10, 0] }}
                  transition={{ duration: 1.5, repeat: Number.POSITIVE_INFINITY }}
                >
                  <Zap className="w-4 h-4 text-yellow-300 drop-shadow-sm" />
                </motion.div>
              </Button>
            </motion.div> */}

            {/* Ultra-Enhanced User Dropdown */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <motion.div
                  whileHover={{ scale: 1.08, y: -2 }}
                  whileTap={{ scale: 0.95 }}
                  transition={{ type: "spring", stiffness: 400, damping: 17 }}
                >
                  <Button variant="ghost" className="p-0 h-8 w-8 rounded-full relative group">
                    <Avatar className="h-10 w-10 ring-amber-400/60 group-hover:ring-amber-400 group-hover:ring-4 transition-all duration-400 shadow-xl shadow-amber-500/20">
                      <UserInitialAvatar name={user.name} />
                    </Avatar>
                    <motion.div
                      className="absolute -bottom-1 -right-1 w-3 h-3 bg-green-400 rounded-full border-3 border-black shadow-lg shadow-green-400/50"
                      animate={{ scale: [1, 1.1, 1] }}
                      transition={{ duration: 2, repeat: Number.POSITIVE_INFINITY }}
                    />
                  </Button>
                </motion.div>
              </DropdownMenuTrigger>

              <DropdownMenuContent
                className="w-72 bg-gradient-to-b from-gray-900/98 via-gray-800/95 to-gray-900/98 backdrop-blur-2xl border-2 border-amber-400/30 shadow-2xl shadow-black/50 rounded-3xl"
                align="end"
                asChild
              >
                <motion.div
                  initial={{ opacity: 0, y: -15, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -15, scale: 0.95 }}
                  transition={{ duration: 0.3, ease: [0.25, 0.46, 0.45, 0.94] }}
                >
                  {/* Enhanced User Info Header */}
                  <div className="flex items-center gap-5 p-8 bg-gradient-to-r from-amber-500/15 via-orange-500/10 to-amber-500/15 rounded-t-3xl border-b border-amber-400/20">
                    <Avatar className="h-14 w-14 ring-3 ring-amber-400/60 shadow-xl">
                      <UserInitialAvatar name={user.name} />
                    </Avatar>
                    <div className="flex-1">
                      <p className="text-white font-bold text-xl tracking-wide">{user.name}</p>
                      <p className="text-amber-300 text-sm truncate font-medium">{user.email}</p>
                      <div className="flex items-center gap-2 mt-2">
                        <motion.div
                          className="w-2 h-2 bg-green-400 rounded-full shadow-sm shadow-green-400/50"
                          animate={{ scale: [1, 1.2, 1] }}
                          transition={{ duration: 2, repeat: Number.POSITIVE_INFINITY }}
                        />
                        <span className="text-green-400 text-xs font-bold tracking-wide">ONLINE</span>
                      </div>
                    </div>
                  </div>

                  <div className="p-3">
                    <DropdownMenuSeparator className="bg-gradient-to-r from-transparent via-amber-400/30 to-transparent my-3" />

                    <DropdownMenuItem
                      onClick={() => (window.location.href = "/profile")}
                      className="text-white hover:bg-gradient-to-r hover:from-amber-500/15 hover:to-orange-500/10 rounded-2xl px-6 py-4 cursor-pointer transition-all duration-300 group border border-transparent hover:border-amber-500/20"
                    >
                      <User className="mr-4 h-6 w-6 text-amber-400 group-hover:scale-110 group-hover:rotate-3 transition-all duration-300 drop-shadow-sm" />
                      <span className="font-bold text-base tracking-wide">Profile</span>
                    </DropdownMenuItem>

                    <DropdownMenuItem className="text-white hover:bg-gradient-to-r hover:from-amber-500/15 hover:to-orange-500/10 rounded-2xl px-6 py-4 cursor-pointer transition-all duration-300 group border border-transparent hover:border-amber-500/20">
                      <Settings className="mr-4 h-6 w-6 text-amber-400 group-hover:scale-110 group-hover:rotate-12 transition-all duration-300 drop-shadow-sm" />
                      <span className="font-bold text-base tracking-wide">Settings</span>
                    </DropdownMenuItem>

                    {/* Redeem Dropdown Item */}
                    <DropdownMenuItem
                      onClick={() => (window.location.href = "/redeem")}
                      className="text-white hover:bg-gradient-to-r hover:from-purple-500/15 hover:to-pink-500/10 rounded-2xl px-6 py-4 cursor-pointer transition-all duration-300 group border border-transparent hover:border-purple-500/20"
                    >
                      <Gift className="mr-4 h-6 w-6 text-purple-400 group-hover:scale-110 group-hover:rotate-12 transition-all duration-300 drop-shadow-sm" />
                      <span className="font-bold text-base tracking-wide">Redeem</span>
                      <span className="ml-2">
                        <Zap className="inline w-4 h-4 text-yellow-300 drop-shadow-sm" />
                      </span>
                    </DropdownMenuItem>

                    <DropdownMenuSeparator className="bg-gradient-to-r from-transparent via-amber-400/30 to-transparent my-3" />

                    <DropdownMenuItem
                      onClick={onLogout}
                      className="text-red-400 hover:bg-gradient-to-r hover:from-red-500/15 hover:to-red-600/10 rounded-2xl px-6 py-4 cursor-pointer transition-all duration-300 group border border-transparent hover:border-red-500/20"
                    >
                      <LogOut className="mr-4 h-6 w-6 group-hover:scale-110 group-hover:-rotate-12 transition-all duration-300 drop-shadow-sm" />
                      <span className="font-bold text-base tracking-wide">Log Out</span>
                    </DropdownMenuItem>
                  </div>
                </motion.div>
              </DropdownMenuContent>
            </DropdownMenu>

            {/* Enhanced Mobile Menu Button */}
            <div className="md:hidden">
              <motion.div
                whileHover={{ scale: 1.15, rotate: 5 }}
                whileTap={{ scale: 0.9 }}
                transition={{ type: "spring", stiffness: 400, damping: 17 }}
              >
                <Button
                  size="icon"
                  variant="ghost"
                  className="text-amber-400 hover:bg-gradient-to-r hover:from-amber-500/20 hover:to-orange-500/15 rounded-2xl w-12 h-12 border border-transparent hover:border-amber-500/30 transition-all duration-300"
                >
                  <Menu className="w-7 h-7 drop-shadow-sm" />
                </Button>
              </motion.div>
            </div>
          </div>
        </div>
      </motion.nav>
    </>
  )
}

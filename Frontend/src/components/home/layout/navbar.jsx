"use client"

import { useState, useRef } from "react"
import { useNavigate } from "react-router-dom"
import { motion, AnimatePresence } from "framer-motion"
import { Button } from "../../ui/button"
import { Input } from "../../ui/input"
import { Avatar, AvatarFallback } from "../../ui/avatar"
import { Search, Users, LogOut, User, Gift, Crown, PartyPopper } from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "../../ui/dropdown-menu"
import { movieCategories } from "../content/movie-data"

function UserInitialAvatar({ name }) {
  const initial = name?.charAt(0).toUpperCase() || "U"
  return (
    <AvatarFallback className="bg-gradient-to-br from-blue-500 to-purple-600 text-white font-bold text-sm">
      {initial}
    </AvatarFallback>
  )
}

export function Navbar({ user, roomStatus, roomId, roomMembers, isFullscreen, onCreateRoom, onJoinRoom, onLeaveRoom, onLogout }) {
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
    <motion.nav
      initial={{ y: -60, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.4, ease: "easeOut" }}
      className="fixed top-0 left-0 right-0 z-40 bg-black/95 backdrop-blur-sm border-b border-gray-800"
    >
      <div className="flex items-center justify-between px-4 py-3 ml-16">
        {/* Search */}
        <div className="relative flex-1 max-w-md">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <Input
              ref={inputRef}
              value={search}
              onChange={(e) => {
                setSearch(e.target.value)
                setShowDropdown(e.target.value.length > 0)
              }}
              placeholder="Search movies, shows..."
              className="pl-10 bg-gray-800/50 border-gray-700 text-white placeholder-gray-400 rounded-full h-9 text-sm focus:bg-gray-800"
            />
          </div>
          
          {/* Search Results */}
          <AnimatePresence>
            {showDropdown && filteredMovies.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="absolute top-11 left-0 right-0 bg-gray-900 border border-gray-700 rounded-lg shadow-lg z-50"
              >
                {filteredMovies.map((movie) => (
                  <button
                    key={movie.id}
                    onClick={() => handleMovieSelect(movie.movieId)}
                    className="w-full flex items-center space-x-3 p-3 hover:bg-gray-800 text-left"
                  >
                    <img
                      src={movie.image}
                      alt={movie.title}
                      className="w-8 h-12 object-cover rounded"
                    />
                    <div>
                      <p className="text-white font-medium text-sm">{movie.title}</p>
                      <p className="text-gray-400 text-xs">Rating: {movie.rating}</p>
                    </div>
                  </button>
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Right side */}
        <div className="flex items-center space-x-3">
          {/* Room Actions */}
          {roomStatus === "none" ? (
            <div className="flex items-center space-x-2">
              <Button
                onClick={onCreateRoom}
                size="sm"
                className="bg-blue-600 hover:bg-blue-700 text-white rounded-full px-3 py-1 text-xs h-8"
              >
                <Crown className="w-3 h-3 mr-1" />
                Create Room
              </Button>
              <Button
                onClick={onJoinRoom}
                size="sm"
                variant="outline"
                className="border-gray-600 text-gray-300 hover:bg-gray-700 hover:text-white rounded-full px-3 py-1 text-xs h-8"
              >
                <Users className="w-3 h-3 mr-1" />
                Join Room
              </Button>
            </div>
          ) : (
            <div className="flex items-center space-x-3">
              <div className="flex items-center space-x-2 text-xs bg-gray-800/50 backdrop-blur-sm border border-gray-600/30 rounded-full px-3 py-2">
                <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
                <span className="text-blue-400 font-mono text-sm font-bold">{roomId}</span>
                <span className="text-gray-400">•</span>
                <span className="text-gray-300">
                  {roomStatus === "host" ? (
                    <span className="flex items-center space-x-1">
                      <Crown className="w-3 h-3 text-yellow-400" />
                      <span>Host ({roomMembers?.length || 1})</span>
                    </span>
                  ) : (
                    <span className="flex items-center space-x-1">
                      <Users className="w-3 h-3 text-blue-400" />
                      <span>Guest ({roomMembers?.length || 1})</span>
                    </span>
                  )}
                </span>
              </div>
              <Button
                onClick={onLeaveRoom}
                size="sm"
                variant="outline"
                className="border-red-500/50 text-red-400 hover:bg-red-500/10 hover:text-red-300 hover:border-red-400 rounded-full px-3 py-1 text-xs h-8 transition-all duration-200"
              >
                Leave Room
              </Button>
            </div>
          )}

          {/* User Menu */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="relative h-8 w-8 rounded-full  p-0">
                <Avatar className="h-8 w-8">
                  <UserInitialAvatar name={user?.name} />
                </Avatar>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-48 bg-gray-900 border-gray-700" align="end">
              <div className="flex items-center justify-start gap-2 p-2">
                <div className="flex flex-col space-y-1 leading-none">
                  <p className="font-medium text-white text-sm">{user?.name}</p>
                  <p className="w-[150px] truncate text-xs text-gray-400">{user?.email}</p>
                </div>
              </div>
              <DropdownMenuSeparator className="bg-gray-700" />
              <DropdownMenuItem 
                onClick={() => navigate("/profile")}
                className="text-gray-300 hover:bg-gray-800 hover:text-white text-sm"
              >
                <User className="mr-2 h-3 w-3" />
                Profile
              </DropdownMenuItem>
              <DropdownMenuItem 
                onClick={() => navigate("/redeem")}
                className="text-gray-300 hover:bg-gray-800 hover:text-white text-sm"
              >
                <Gift className="mr-2 h-3 w-3" />
                Redeem
              </DropdownMenuItem>
              <DropdownMenuItem 
                onClick={() => navigate("/party")}
                className="text-gray-300 hover:bg-gray-800 hover:text-white text-sm"
              >
                <PartyPopper className="mr-2 h-3 w-3" />
                Watch Parties
              </DropdownMenuItem>
              <DropdownMenuSeparator className="bg-gray-700" />
              <DropdownMenuItem 
                onClick={onLogout}
                className="text-red-400 hover:bg-red-600/10 hover:text-red-300 text-sm"
              >
                <LogOut className="mr-2 h-3 w-3" />
                Log out
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </motion.nav>
  )
}

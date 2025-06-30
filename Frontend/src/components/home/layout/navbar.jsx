"use client"

import { useState, useRef, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import { motion, AnimatePresence } from "framer-motion"
import { Button } from "../../ui/button"
import { Input } from "../../ui/input"
import { Avatar, AvatarFallback } from "../../ui/avatar"
import { Search, Users, LogOut, User, Gift, Crown, Play, PartyPopper, Clock, MapPin, UserPlus, X } from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "../../ui/dropdown-menu"
import { movieCategories } from "../content/movie-data"
import { movieNames } from "../content/movie-name"
import partiesService from "../../../firebase/parties"
import { useToast } from "../../ui/toast"
import { ViewingHistoryManager } from "../../../lib/viewing-history"

function UserInitialAvatar({ name }) {
  const initial = name?.charAt(0).toUpperCase() || "U"
  return (
    <AvatarFallback className="bg-gradient-to-br from-red-500 to-orange-600 text-white font-bold text-sm">
      {initial}
    </AvatarFallback>
  )
}

export function Navbar({ 
  user, 
  roomStatus, 
  roomId, 
  roomMembers, 
  isFullscreen, 
  onCreateRoom, 
  onJoinRoom, 
  onLeaveRoom, 
  onLogout,
  hostMovieState,
  onJoinHostMovie,
  isHost,
  currentWatchingMovie
}) {
  const [search, setSearch] = useState("")
  const [showDropdown, setShowDropdown] = useState(false)
  const [showJoinPartyModal, setShowJoinPartyModal] = useState(false)
  const [showEnterRoomModal, setShowEnterRoomModal] = useState(false)
  const [joinPartyCode, setJoinPartyCode] = useState("")
  const [enterRoomId, setEnterRoomId] = useState("")
  const [isJoining, setIsJoining] = useState(false)
  const [moodRecommendations, setMoodRecommendations] = useState([])
  const [isLoadingRecommendations, setIsLoadingRecommendations] = useState(false)
  const [showMoodResults, setShowMoodResults] = useState(false)
  const [recommendationType, setRecommendationType] = useState('mood') // 'mood', 'history', or 'fallback'
  const inputRef = useRef(null)
  const navigate = useNavigate()
  const { showToast } = useToast()

  // Flatten all movies from categories
  const allMovies = movieCategories.flatMap((cat) => cat.movies)

  const handleMovieSelect = (movieId) => {
    setSearch("")
    setShowDropdown(false)
    setShowMoodResults(false)
    navigate(`/movie/${movieId}`)
  }

  // Get mood-based recommendations
  const getMoodRecommendations = async (moodText) => {
    if (!moodText.trim() || moodText.length < 3) {
      setMoodRecommendations([])
      setShowMoodResults(false)
      return
    }

    setIsLoadingRecommendations(true)
    try {
      // Get viewing history
      const viewingHistoryManager = ViewingHistoryManager.getInstance()
      const viewingHistory = viewingHistoryManager.getViewingHistory()

      const response = await fetch('http://localhost:8000/api/recommendations/mood', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          mood: moodText,
          viewingHistory: viewingHistory 
        }),
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const data = await response.json()
      console.log('Mood recommendation response:', data) // Debug log
      
      if (data.success) {
        // Check if input was invalid but we have fallback recommendations
        if (data.isInvalidInput) {
          showToast(data.message || 'Showing recommendations based on your viewing history and current time.', 'info')
          setRecommendationType('history')
        }
        // Check if no matches found
        else if (data.noMatches) {
          showToast(data.message || 'No matches found for your mood, showing personalized recommendations.', 'info')
          setRecommendationType('fallback')
        }
        // Check if it's a fallback response
        else if (data.isFallback) {
          showToast(data.message || 'Showing recommendations based on viewing history and time of day.', 'info')
          setRecommendationType('fallback')
        }
        else {
          setRecommendationType('mood')
        }

        // Always show recommendations if we have them
        const recommendedMovies = (data.recommendations || []).map(movieName => {
          // Find the movie in all categories
          const foundMovie = allMovies.find(movie => movie.title === movieName)
          return foundMovie || {
            title: movieName,
            movieId: movieName.toLowerCase().replace(/[^\w\s]/gi, '').replace(/\s+/g, '-'),
            image: '/api/placeholder/300/450', // Fallback image
            rating: 'N/A',
            mood: true // Flag to identify mood recommendations
          }
        })
        
        console.log('Processed recommended movies:', recommendedMovies)
        setMoodRecommendations(recommendedMovies)
        setShowMoodResults(true)
        setShowDropdown(false)
      } else if (data.success === false) {
        // Handle explicit failure response
        console.error('Failed to get recommendations:', data.error)
        if (data.isInvalidInput) {
          showToast(data.error || 'Please provide a mood or movie preference for recommendations.', 'info')
        } else {
          showToast(data.error || 'Failed to get mood recommendations', 'error')
        }
        setMoodRecommendations([])
        setShowMoodResults(false)
        setRecommendationType('mood')
      } else {
        // Handle unexpected response format
        console.error('Unexpected response format:', data)
        showToast('Unexpected response from server', 'error')
        setMoodRecommendations([])
        setShowMoodResults(false)
        setRecommendationType('mood')
      }
    } catch (error) {
      console.error('Error getting mood recommendations:', error)
      showToast('Error getting recommendations. Please try again.', 'error')
      setMoodRecommendations([])
      setShowMoodResults(false)
      setRecommendationType('mood')
    } finally {
      setIsLoadingRecommendations(false)
    }
  }

  // Debounced function to call mood recommendations
  const debouncedMoodSearch = useRef(null)
  
  const handleSearchChange = (e) => {
    const value = e.target.value
    setSearch(value)
    
    // Clear existing timeout
    if (debouncedMoodSearch.current) {
      clearTimeout(debouncedMoodSearch.current)
    }
    
    if (value.length === 0) {
      setShowDropdown(false)
      setShowMoodResults(false)
      setMoodRecommendations([])
      setIsLoadingRecommendations(false)
      setRecommendationType('mood')
      return
    }
    
    // Show loading immediately when user types enough characters
    if (value.length >= 3) {
      setIsLoadingRecommendations(true)
      setShowMoodResults(true)
    }
    
    // Always do mood-based search, never show normal search dropdown
    setShowDropdown(false)
    debouncedMoodSearch.current = setTimeout(() => {
      getMoodRecommendations(value)
    }, 1000) // Wait 1 second after user stops typing
  }

  // Simple join party by group ID
  const handleJoinParty = () => {
    setShowJoinPartyModal(true)
  }

  // Handle joining party by group ID and entering room directly
  const handleJoinPartyByGroupId = async () => {
    if (!joinPartyCode.trim() || !user) return

    setIsJoining(true)
    try {
      console.log("🎉 Joining party by group ID:", joinPartyCode.trim())
      
      // Find party by code
      const findResult = await partiesService.findPartyByCode(joinPartyCode.trim())
      console.log("🔍 Find result:", findResult)
      
      if (!findResult.success) {
        console.log("❌ Party not found")
        showToast(findResult.error || "Party not found with this code.", "error")
        return
      }
      
      // Join the party
      console.log("🚀 Attempting to join party:", findResult.partyId)
      const joinResult = await partiesService.joinParty(findResult.partyId, user.uid, user.name)
      console.log("🚀 Join result:", joinResult)
      
      if (joinResult.success) {
        setShowJoinPartyModal(false)
        setJoinPartyCode("")
        showToast(joinResult.message || "Successfully joined the party!", "success")
        
        // If party is active and has a room, directly join the room
        if (findResult.party.status === 'active' && findResult.party.roomId) {
          console.log("🎬 Directly entering room:", findResult.party.roomId)
          // Use the onJoinRoom prop to join the room directly
          await onJoinRoom(findResult.party.roomId)
        } else {
          console.log("📝 Party not active, navigating to party page")
          navigate("/party")
        }
      } else {
        console.log("❌ Failed to join party:", joinResult.error)
        showToast(joinResult.error || "Failed to join party.", "error")
      }
    } catch (error) {
      console.error("❌ Error joining party:", error)
      showToast("Failed to join party. Please try again.", "error")
    } finally {
      setIsJoining(false)
    }
  }

  // Handle entering room by room ID
  const handleEnterRoom = async () => {
    if (!enterRoomId.trim() || !user) return

    setIsJoining(true)
    try {
      console.log("🚪 Attempting to enter room:", enterRoomId.trim())
      
      // Call the join room function with the room ID
      const success = await onJoinRoom(enterRoomId.trim())
      
      if (success) {
        setShowEnterRoomModal(false)
        setEnterRoomId("")
        showToast(`Successfully entered room ${enterRoomId.trim()}!`, "success")
      } else {
        showToast("Failed to enter room. Please check the room ID and try again.", "error")
      }
    } catch (error) {
      console.error("❌ Error entering room:", error)
      showToast("Failed to enter room. Please try again.", "error")
    } finally {
      setIsJoining(false)
    }
  }

  if (isFullscreen) return null

  return (
    <motion.nav
      initial={{ y: -60, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.4, ease: "easeOut" }}
      className="fixed top-0 left-0 right-0 z-40 bg-black/95 backdrop-blur-sm border-b border-gray-800"
    >
      <div className="flex items-center justify-between px-4 py-3 ml-2">
        {/* FireStream Logo */}
        <div className="flex items-center space-x-3 mr-6">
          <div className="w-10 h-10 bg-gradient-to-br from-red-500 to-orange-600 rounded-xl flex items-center justify-center shadow-xl">
            <Play className="w-5 h-5 text-white fill-white" />
          </div>
          <span className="text-2xl font-black text-white">
            Fire
            <span className="text-transparent bg-gradient-to-r from-red-400 to-orange-500 bg-clip-text">Stream</span>
          </span>
        </div>
        {/* Search */}
        <div className="relative flex-1 max-w-md">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <Input
              ref={inputRef}
              value={search}
              onChange={handleSearchChange}
              placeholder="Search movies or describe your mood..."
              className="pl-10 bg-gray-800/50 border-gray-700 text-white placeholder-gray-400 rounded-full h-9 text-sm focus:bg-gray-800"
            />
          </div>
          
          {/* Mood-based Recommendations */}
          <AnimatePresence>
            {(showMoodResults || isLoadingRecommendations) && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="absolute top-11 left-0 right-0 bg-gray-800/95 border border-gray-700 rounded-lg shadow-lg z-50 backdrop-blur-sm"
              >
                <div className="p-3 border-b border-gray-700">
                  <div className="flex items-center space-x-2">
                    <div className={`w-2 h-2 ${recommendationType === 'mood' ? 'bg-orange-400' : 'bg-blue-400'} rounded-full ${isLoadingRecommendations ? 'animate-pulse' : ''}`}></div>
                    <p className="text-white text-xs font-medium">
                      {recommendationType === 'mood' && '🎭 Mood-based recommendations'}
                      {recommendationType === 'history' && '📚 Based on your viewing history'}
                      {recommendationType === 'fallback' && '⏰ Personalized recommendations'}
                      {isLoadingRecommendations && (
                        <span className="ml-2 text-gray-300 animate-pulse">Finding perfect matches...</span>
                      )}
                    </p>
                  </div>
                </div>
                
                {isLoadingRecommendations ? (
                  <div className="p-6 text-center">
                    <div className="relative">
                      <div className="animate-spin rounded-full h-8 w-8 border-3 border-orange-400 border-t-transparent mx-auto"></div>
                      <div className="absolute inset-0 rounded-full h-8 w-8 border-3 border-gray-700 mx-auto"></div>
                    </div>
                    <p className="text-white text-sm mt-3 animate-pulse">🧠 Analyzing your mood...</p>
                    <p className="text-gray-400 text-xs mt-1">Considering your viewing history & time of day</p>
                  </div>
                ) : (
                  <>
                    {moodRecommendations.length > 0 ? (
                      moodRecommendations.map((movie, index) => (
                        <button
                          key={`mood-${movie.movieId || index}`}
                          onClick={() => handleMovieSelect(movie.movieId)}
                          className="w-full flex items-center space-x-3 p-3 hover:bg-purple-800/50 text-left transition-colors"
                        >
                          <img
                            src={movie.image || '/api/placeholder/300/450'}
                            alt={movie.title}
                            className="w-8 h-12 object-cover rounded border border-purple-400/30"
                          />
                          <div className="flex-1">
                            <p className="text-white font-medium text-sm">{movie.title}</p>
                            <p className="text-purple-300 text-xs">
                              {movie.rating !== 'N/A' ? `Rating: ${movie.rating}` : 'Mood match'}
                              <span className="ml-2">✨</span>
                            </p>
                          </div>
                        </button>
                      ))
                    ) : (
                      <div className="p-4 text-center">
                        <p className="text-white text-sm">No mood matches found</p>
                        <p className="text-gray-400 text-xs mt-1">Try describing your feeling differently</p>
                      </div>
                    )}
                  </>
                )}
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
                // Updated to FireStream logo color scheme
                className="bg-gradient-to-r from-red-500 via-red-500 to-orange-500 hover:from-red-600 hover:to-orange-600 text-white rounded-full px-3 py-1 text-xs h-8 font-bold shadow-md transition-all duration-300"
              >
                <Crown className="w-3 h-3 mr-1" />
                Create Room
              </Button>
              
              <Button
                onClick={handleJoinParty}
                size="sm"
                variant="outline"
                className="border-gray-600 text-gray-600 hover:bg-gray-300 hover:text-white rounded-full px-3 py-1 text-xs h-8"
              >
                <Users className="w-3 h-3 mr-1" />
                Join Party
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
              
              {/* Join Host's Movie Button - Persistent in Navbar */}
              {!isHost && hostMovieState?.videoUrl && 
               (!currentWatchingMovie?.videoUrl || hostMovieState.videoUrl !== currentWatchingMovie.videoUrl) && (
                <motion.button
                  onClick={onJoinHostMovie}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="px-3 py-1 bg-gradient-to-r from-blue-500/20 to-purple-500/20 hover:from-blue-500/30 hover:to-purple-500/30 text-blue-400 border border-blue-500/30 rounded-full text-xs font-medium transition-all flex items-center gap-2 shadow-lg"
                  title={`Join ${hostMovieState?.hostName}'s movie`}
                >
                  <span>📺</span>
                  <span>Join {hostMovieState?.hostName}</span>
                </motion.button>
              )}
              
              {/* Enter Room button - Only show for guests who are already in a room */}
              {roomStatus === "member" && !isHost && (
                <Button
                  onClick={() => setShowEnterRoomModal(true)}
                  size="sm"
                  variant="outline"
                  className="border-blue-600 text-blue-600 hover:bg-blue-600 hover:text-white rounded-full px-3 py-1 text-xs h-8"
                >
                  <MapPin className="w-3 h-3 mr-1" />
                  Enter Room
                </Button>
              )}
              
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

      {/* Simple Join Party Modal */}
      <AnimatePresence>
        {showJoinPartyModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4"
            style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}
          >
            <motion.div
              initial={{ scale: 0.96, opacity: 0, y: 30 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.96, opacity: 0, y: 30 }}
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
              className="relative bg-[#181818] border border-neutral-700 rounded-2xl max-w-sm w-full shadow-lg p-0 mx-auto"
              style={{ margin: 'auto' }}
            >
              <div className="px-7 py-8">
                <div className="flex items-center space-x-3 mb-6">
                  <div className="p-2 rounded-full bg-gradient-to-br from-purple-500/20 to-blue-500/20">
                    <Users className="w-6 h-6 text-purple-400" />
                  </div>
                  <h3 className="text-xl font-bold text-white">Join Party</h3>
                </div>
                <p className="text-neutral-300 mb-6 text-sm">
                  Enter the Group ID to join the party and enter the room directly.
                </p>
                <Input
                  value={joinPartyCode}
                  onChange={(e) => setJoinPartyCode(e.target.value.toUpperCase())}
                  placeholder="Enter Group ID"
                  className="h-11 bg-neutral-800 border border-neutral-700 text-white text-center text-base font-mono tracking-wider rounded-lg mb-6"
                />
                <div className="flex space-x-3">
                  <Button
                    onClick={handleJoinPartyByGroupId}
                    disabled={!joinPartyCode.trim() || isJoining}
                    className="flex-1 h-11 bg-gradient-to-r from-purple-500 to-blue-600 hover:from-purple-600 hover:to-blue-700 text-white font-semibold rounded-lg transition-all duration-200"
                  >
                    {isJoining ? (
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    ) : (
                      <>
                        <Users className="w-5 h-5 mr-2" />
                        Join & Enter
                      </>
                    )}
                  </Button>
                  <Button
                    onClick={() => {
                      setShowJoinPartyModal(false)
                      setJoinPartyCode("")
                    }}
                    variant="outline"
                    className="flex-1 h-11 border border-neutral-700 text-black rounded-lg hover:bg-neutral-800 transition-all duration-200"
                  >
                    Cancel
                  </Button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Enter Room Modal */}
      <AnimatePresence>
        {showEnterRoomModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4"
            style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}
            onClick={(e) => e.target === e.currentTarget && setShowEnterRoomModal(false)}
          >
            <motion.div
              initial={{ scale: 0.8, opacity: 0, y: 50 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.8, opacity: 0, y: 50 }}
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
              className="relative overflow-hidden bg-gradient-to-br from-gray-900 via-black to-gray-900 border border-blue-500/30 rounded-3xl max-w-md w-full shadow-2xl mx-auto"
              style={{ margin: 'auto' }}
            >
              {/* Close button */}
              <button
                onClick={() => setShowEnterRoomModal(false)}
                className="absolute top-4 right-4 text-gray-400 hover:text-white transition-colors"
              >
                <X className="w-5 h-5" />
              </button>

              {/* Animated background */}
              <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 via-cyan-500/5 to-blue-500/5" />
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-400 via-cyan-500 to-blue-400" />

              <div className="relative p-8">
                <div className="flex items-center space-x-3 mb-6">
                  <div className="p-3 rounded-full bg-gradient-to-r from-blue-500/20 to-cyan-500/20">
                    <MapPin className="w-6 h-6 text-blue-400" />
                  </div>
                  <h3 className="text-2xl font-bold text-white">Enter Room</h3>
                </div>

                <div className="mb-6">
                  <h4 className="text-lg font-semibold text-white mb-2">Room ID</h4>
                  <p className="text-gray-400 text-sm mb-4">Enter the room ID to join a specific room</p>
                  <div className="flex space-x-3">
                    <Input
                      value={enterRoomId}
                      onChange={(e) => setEnterRoomId(e.target.value)}
                      placeholder="Enter room ID..."
                      className="flex-1 bg-gray-800/50 border-2 border-gray-600 focus:border-blue-500 text-white text-center text-lg font-mono tracking-wider rounded-xl h-12"
                    />
                    <Button
                      onClick={handleEnterRoom}
                      disabled={!enterRoomId.trim() || isJoining}
                      className="bg-gradient-to-r from-blue-500 to-cyan-600 hover:from-blue-400 hover:to-cyan-500 text-white font-semibold rounded-xl px-6 h-12"
                    >
                      {isJoining ? (
                        <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      ) : (
                        <>
                          <MapPin className="w-4 h-4 mr-2" />
                          Enter
                        </>
                      )}
                    </Button>
                  </div>
                </div>

                {/* Info Section */}
                <div className="bg-blue-500/10 border border-blue-500/20 rounded-xl p-4">
                  <div className="flex items-start space-x-3">
                    <div className="p-2 rounded-full bg-blue-500/20">
                      <Users className="w-4 h-4 text-blue-400" />
                    </div>
                    <div>
                      <h5 className="font-semibold text-white mb-1">Room vs Party</h5>
                      <p className="text-gray-300 text-sm">
                        Rooms are for direct video watching sessions. Use this if someone shared a specific room ID with you.
                      </p>
                    </div>
                  </div>
                </div>

                {/* Alternative Actions */}
                <div className="mt-6 pt-4 border-t border-gray-700">
                  <div className="flex space-x-3">
                    <Button
                      onClick={() => {
                        setShowEnterRoomModal(false)
                        setShowJoinPartyModal(true)
                      }}
                      variant="outline"
                      className="flex-1 border-gray-600 text-gray-300 hover:bg-gray-700 hover:text-white rounded-xl"
                    >
                      <PartyPopper className="w-4 h-4 mr-2" />
                      Join Party Instead
                    </Button>
                    <Button
                      onClick={() => {
                        setShowEnterRoomModal(false)
                        onCreateRoom()
                      }}
                      variant="outline"
                      className="flex-1 border-red-500/50 text-red-300 hover:bg-red-500/10 hover:text-red-200 rounded-xl"
                    >
                      <Crown className="w-4 h-4 mr-2" />
                      Create Room
                    </Button>
                  </div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.nav>
  )
}

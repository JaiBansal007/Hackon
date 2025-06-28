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
import partiesService from "../../../firebase/parties"
import { useToast } from "../../ui/toast"

function UserInitialAvatar({ name }) {
  const initial = name?.charAt(0).toUpperCase() || "U"
  return (
    <AvatarFallback className="bg-gradient-to-br from-red-500 to-orange-600 text-white font-bold text-sm">
      {initial}
    </AvatarFallback>
  )
}

export function Navbar({ user, roomStatus, roomId, roomMembers, isFullscreen, onCreateRoom, onJoinRoom, onLeaveRoom, onLogout }) {
  const [search, setSearch] = useState("")
  const [showDropdown, setShowDropdown] = useState(false)
  const [showJoinPartyModal, setShowJoinPartyModal] = useState(false)
  const [activeParties, setActiveParties] = useState([])
  const [joinPartyCode, setJoinPartyCode] = useState("")
  const [isJoining, setIsJoining] = useState(false)
  const inputRef = useRef(null)
  const navigate = useNavigate()
  const { showToast } = useToast()

  // Load active parties for quick join
  useEffect(() => {
    if (!user) return

    const unsubscribe = partiesService.listenToPublicParties((parties) => {
      // Filter for active parties that can be joined immediately
      const activeParts = parties.filter(party => 
        party.status === 'active' && 
        party.roomId && 
        party.attendees.length < party.maxAttendees &&
        !party.attendees.some(attendee => attendee.id === user.uid)
      ).slice(0, 5) // Show max 5 active parties
      
      setActiveParties(activeParts)
    })

    return unsubscribe
  }, [user])

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

  // Join party by code
  const handleJoinPartyByCode = async () => {
    if (!joinPartyCode.trim() || !user) {
      console.log("Join party aborted: no code or user", { code: joinPartyCode.trim(), user: !!user })
      return
    }

    console.log("🎉 Starting join party process", { code: joinPartyCode.trim(), userId: user.uid })
    setIsJoining(true)
    try {
      // First find the party by code
      console.log("🔍 Finding party by code...")
      const findResult = await partiesService.findPartyByCode(joinPartyCode.trim())
      console.log("🔍 Find result:", findResult)
      
      if (!findResult.success) {
        console.log("❌ Party not found")
        showToast(findResult.error || "Party not found with this code.", "error")
        return
      }
      
      // Then try to join the party
      console.log("🚀 Attempting to join party:", findResult.partyId)
      const joinResult = await partiesService.joinParty(findResult.partyId, user.uid, user.name)
      console.log("🚀 Join result:", joinResult)
      
      if (joinResult.success) {
        // Navigate to party page to see the joined party
        setShowJoinPartyModal(false)
        setJoinPartyCode("")
        showToast(joinResult.message || "Successfully joined the party!", "success")
        
        // If party is active, navigate to the room
        if (findResult.party.status === 'active' && findResult.party.roomId) {
          console.log("🎬 Navigating to active room:", findResult.party.roomId)
          navigate("/home", { state: { joinRoomId: findResult.party.roomId } })
        } else {
          console.log("📝 Navigating to party page")
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

  // Join active party directly
  const handleJoinActiveParty = async (party) => {
    if (!user) return

    setIsJoining(true)
    try {
      const result = await partiesService.joinParty(party.firestoreId, user.uid, user.name)
      
      if (result.success) {
        setShowJoinPartyModal(false)
        showToast(`Joined "${party.title}" successfully!`, "success")
        // If party is active, navigate to the room
        if (party.status === 'active' && party.roomId) {
          navigate("/home", { state: { joinRoomId: party.roomId } })
        } else {
          navigate("/party")
        }
      } else {
        showToast("Failed to join party.", "error")
      }
    } catch (error) {
      console.error("Error joining party:", error)
      showToast("Failed to join party. Please try again.", "error")
    } finally {
      setIsJoining(false)
    }
  }

  // Enhanced join room function
  const handleJoinRoomOrParty = () => {
    setShowJoinPartyModal(true)
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
                // Updated to FireStream logo color scheme
                className="bg-gradient-to-r from-red-500 via-red-500 to-orange-500 hover:from-red-600 hover:to-orange-600 text-white rounded-full px-3 py-1 text-xs h-8 font-bold shadow-md transition-all duration-300"
              >
                <Crown className="w-3 h-3 mr-1" />
                Create Room
              </Button>
              <Button
                onClick={handleJoinRoomOrParty}
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

      {/* Enhanced Join Party Modal */}
      <AnimatePresence>
        {showJoinPartyModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4"
            onClick={(e) => e.target === e.currentTarget && setShowJoinPartyModal(false)}
          >
            <motion.div
              initial={{ scale: 0.8, opacity: 0, y: 50 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.8, opacity: 0, y: 50 }}
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
              className="relative overflow-hidden bg-gradient-to-br from-gray-900 via-black to-gray-900 border border-amber-500/30 rounded-3xl max-w-lg w-full shadow-2xl"
            >
              {/* Close button */}
              <button
                onClick={() => setShowJoinPartyModal(false)}
                className="absolute top-4 right-4 text-gray-400 hover:text-white transition-colors"
              >
                <X className="w-5 h-5" />
              </button>

              {/* Animated background */}
              <div className="absolute inset-0 bg-gradient-to-br from-purple-500/5 via-blue-500/5 to-purple-500/5" />
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-purple-400 via-blue-500 to-purple-400" />

              <div className="relative p-8">
                <div className="flex items-center space-x-3 mb-6">
                  <div className="p-3 rounded-full bg-gradient-to-r from-purple-500/20 to-blue-500/20">
                    <PartyPopper className="w-6 h-6 text-purple-400" />
                  </div>
                  <h3 className="text-2xl font-bold text-white">Join Watch Party</h3>
                </div>

                {/* Join by Code Section */}
                <div className="mb-8">
                  <h4 className="text-lg font-semibold text-white mb-2">Enter Party Code</h4>
                  <p className="text-gray-400 text-sm mb-4">Use the 8-character code shared by your friend</p>
                  <div className="flex space-x-3">
                    <Input
                      value={joinPartyCode}
                      onChange={(e) => setJoinPartyCode(e.target.value.toUpperCase())}
                      placeholder="Enter 8-character party code..."
                      className="flex-1 bg-gray-800/50 border-2 border-gray-600 focus:border-purple-500 text-white text-center text-lg font-mono tracking-wider rounded-xl h-12"
                      maxLength={20}
                    />
                    <Button
                      onClick={handleJoinPartyByCode}
                      disabled={!joinPartyCode.trim() || isJoining}
                      className="bg-gradient-to-r from-purple-500 to-blue-600 hover:from-purple-400 hover:to-blue-500 text-white font-semibold rounded-xl px-6 h-12"
                    >
                      {isJoining ? (
                        <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      ) : (
                        <>
                          <UserPlus className="w-4 h-4 mr-2" />
                          Join
                        </>
                      )}
                    </Button>
                  </div>
                </div>

                {/* Active Parties Section */}
                {activeParties.length > 0 && (
                  <div>
                    <h4 className="text-lg font-semibold text-white mb-4 flex items-center">
                      <Play className="w-5 h-5 mr-2 text-green-400" />
                      Active Parties ({activeParties.length})
                    </h4>
                    <div className="space-y-3 max-h-60 overflow-y-auto">
                      {activeParties.map((party) => (
                        <motion.div
                          key={party.firestoreId}
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          className="bg-gray-800/50 border border-gray-700 rounded-xl p-4 hover:bg-gray-800/70 transition-all duration-200"
                        >
                          <div className="flex items-center justify-between">
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center space-x-2 mb-1">
                                <h5 className="font-semibold text-white truncate">{party.title}</h5>
                                <div className="flex items-center space-x-1 text-xs text-green-400">
                                  <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
                                  <span>LIVE</span>
                                </div>
                              </div>
                              <div className="flex items-center space-x-4 text-xs text-gray-400">
                                <span className="flex items-center">
                                  <Users className="w-3 h-3 mr-1" />
                                  {party.attendees.length}/{party.maxAttendees}
                                </span>
                                <span className="flex items-center">
                                  <User className="w-3 h-3 mr-1" />
                                  {party.hostName}
                                </span>
                                {party.movie && (
                                  <span className="flex items-center">
                                    <Play className="w-3 h-3 mr-1" />
                                    {party.movie.title}
                                  </span>
                                )}
                              </div>
                            </div>
                            <Button
                              onClick={() => handleJoinActiveParty(party)}
                              disabled={isJoining}
                              size="sm"
                              className="bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white font-medium rounded-lg ml-3"
                            >
                              {isJoining ? (
                                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                              ) : (
                                <>
                                  <UserPlus className="w-3 h-3 mr-1" />
                                  Join
                                </>
                              )}
                            </Button>
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Empty State */}
                {activeParties.length === 0 && (
                  <div className="text-center py-6">
                    <Clock className="w-12 h-12 text-gray-600 mx-auto mb-3" />
                    <h4 className="text-lg font-semibold text-gray-400 mb-2">No Active Parties</h4>
                    <p className="text-gray-500 mb-4">No parties are currently active. Create one or check back later!</p>
                    <Button
                      onClick={() => {
                        setShowJoinPartyModal(false)
                        navigate("/party")
                      }}
                      className="bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-white font-semibold rounded-xl"
                    >
                      <PartyPopper className="w-4 h-4 mr-2" />
                      Browse All Parties
                    </Button>
                  </div>
                )}

                {/* Alternative Actions */}
                <div className="mt-8 pt-6 border-t border-gray-700">
                  <div className="flex space-x-3">
                    <Button
                      onClick={() => {
                        setShowJoinPartyModal(false)
                        onJoinRoom()
                      }}
                      variant="outline"
                      className="flex-1 border-gray-600 text-gray-300 hover:bg-gray-700 hover:text-white rounded-xl"
                    >
                      <Users className="w-4 h-4 mr-2" />
                      Join Room Instead
                    </Button>
                    <Button
                      onClick={() => {
                        setShowJoinPartyModal(false)
                        navigate("/party")
                      }}
                      variant="outline"
                      className="flex-1 border-purple-500/50 text-purple-300 hover:bg-purple-500/10 hover:text-purple-200 rounded-xl"
                    >
                      <PartyPopper className="w-4 h-4 mr-2" />
                      Manage Parties
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

"use client"

import { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import { motion, AnimatePresence } from "framer-motion"
import { 
  Calendar, 
  Clock, 
  Users, 
  Film, 
  Plus, 
  Search, 
  X, 
  Play,
  UserPlus,
  ArrowLeft,
  PartyPopper,
  Star,
  MapPin,
  Globe,
  Lock
} from "lucide-react"
import { Button } from "../../components/ui/button"
import { Input } from "../../components/ui/input"
import { Label } from "../../components/ui/label"
import { Navbar } from "../../components/home/layout/navbar"
import partiesService from "../../firebase/parties"
import authService from "../../firebase/auth"
import { movieCategories } from "../../components/home/content/movie-data"
import { useToast } from "../../components/ui/toast"

// Create a flattened array of all movies from categories
const featuredMovies = movieCategories.flatMap(category => category.movies)

const PartyPage = ({ onJoinRoom }) => {
  const [user, setUser] = useState(null)
  const [authLoading, setAuthLoading] = useState(true)
  const [activeTab, setActiveTab] = useState("browse") // browse, create, my-parties
  const [publicParties, setPublicParties] = useState([])
  const [userParties, setUserParties] = useState([])
  const [searchTerm, setSearchTerm] = useState("")
  const [isCreating, setIsCreating] = useState(false)
  const [quickJoinCode, setQuickJoinCode] = useState("")
  const [isJoining, setIsJoining] = useState(false)

  const navigate = useNavigate()
  const { showToast } = useToast()

  // Create party form state
  const [partyForm, setPartyForm] = useState({
    title: "",
    description: "",
    movie: null,
    scheduledTime: "",
    maxAttendees: 10,
    isPublic: true,
    tags: []
  })

  // Initialize user with Firebase auth - simplified since ProtectedRoute handles auth
  useEffect(() => {
    const storedUser = authService.getCurrentUser();
    if (storedUser) {
      setUser(storedUser);
      setAuthLoading(false);
    }

    const unsubscribe = authService.onAuthStateChange((firebaseUser) => {
      if (firebaseUser) {
        const userData = {
          uid: firebaseUser.uid,
          name: firebaseUser.displayName,
          email: firebaseUser.email,
          photoURL: firebaseUser.photoURL
        }
        setUser(userData)
      } else {
        setUser(null)
      }
      setAuthLoading(false)
    })

    return unsubscribe
  }, [])

  // Listen to parties when user is available
  useEffect(() => {
    if (!user) return

    // Listen to public parties
    const unsubscribePublic = partiesService.listenToPublicParties((parties) => {
      setPublicParties(parties)
    })

    // Listen to user's parties
    const unsubscribeUser = partiesService.listenToUserParties(user.uid, (parties) => {
      setUserParties(parties)
    })

    return () => {
      unsubscribePublic()
      unsubscribeUser()
    }
  }, [user])

  const handleCreateParty = async () => {
    if (!partyForm.title.trim() || !partyForm.scheduledTime) return

    setIsCreating(true)
    try {
      const scheduledTime = new Date(partyForm.scheduledTime).getTime()
      
      const result = await partiesService.createParty({
        ...partyForm,
        scheduledTime,
      }, user.uid, user.name)

      if (result.success) {
        // Reset form
        setPartyForm({
          title: "",
          description: "",
          movie: null,
          scheduledTime: "",
          maxAttendees: 10,
          isPublic: true,
          tags: []
        })
        
        // Switch to my parties tab to see the created party
        setActiveTab("my-parties")
        
        // If party is scheduled for now or very soon, start it immediately
        if (scheduledTime <= Date.now() + (5 * 60 * 1000)) { // Within 5 minutes
          const roomId = `party_${result.partyId}_${Date.now()}`
          await partiesService.startParty(result.partyId, roomId)
          
          // Navigate to home and join the room
          navigate("/", { state: { joinRoomId: roomId } })
        }
      }
    } catch (error) {
      console.error("Error creating party:", error)
    } finally {
      setIsCreating(false)
    }
  }

  const handleJoinParty = async (party) => {
    try {
      const result = await partiesService.joinParty(party.firestoreId, user.uid, user.name)
      
      if (result.success) {
        if (result.message) {
          showToast(result.message, "info")
        } else {
          // If party is active, join the room immediately
          if (party.status === 'active' && party.roomId) {
            navigate("/home", { state: { joinRoomId: party.roomId } })
            showToast(`Joining "${party.title}" watch party!`, "success")
          } else {
            // Party is scheduled, show confirmation
            showToast(`You've joined "${party.title}"! You'll be notified when it starts.`, "success")
          }
        }
      } else {
        showToast(result.error || "Failed to join party.", "error")
      }
    } catch (error) {
      console.error("Error joining party:", error)
      showToast("Failed to join party. Please try again.", "error")
    }
  }

  // Quick join function for party codes
  const handleQuickJoin = async () => {
    if (!quickJoinCode.trim() || !user) {
      console.log("Quick join aborted: no code or user", { code: quickJoinCode.trim(), user: !!user })
      return
    }

    console.log("🎉 Starting quick join process", { code: quickJoinCode.trim(), userId: user.uid })
    setIsJoining(true)
    try {
      // First find the party by code
      console.log("🔍 Finding party by code...")
      const findResult = await partiesService.findPartyByCode(quickJoinCode.trim())
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
        setQuickJoinCode("")
        showToast(joinResult.message || "Successfully joined the party!", "success")
        
        // If party is active, navigate to the room
        if (findResult.party.status === 'active' && findResult.party.roomId) {
          console.log("🎬 Navigating to active room:", findResult.party.roomId)
          navigate("/home", { state: { joinRoomId: findResult.party.roomId } })
        }
        // Otherwise just stay on party page to see the joined party
      } else {
        console.log("❌ Failed to join party:", joinResult.error)
        showToast(joinResult.error || "Failed to join party.", "error")
      }
    } catch (error) {
      console.error("❌ Error in quick join:", error)
      showToast("Failed to join party. Please try again.", "error")
    } finally {
      setIsJoining(false)
    }
  }

  const handleStartParty = async (party) => {
    if (party.hostId !== user.uid) return
    
    try {
      const roomId = `party_${party.firestoreId}_${Date.now()}`
      await partiesService.startParty(party.firestoreId, roomId)
      
      // Navigate to home and join the room
      navigate("/", { state: { joinRoomId: roomId } })
    } catch (error) {
      console.error("Error starting party:", error)
    }
  }

  const formatTime = (timestamp) => {
    return new Date(timestamp).toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    })
  }

  const getStatusColor = (status) => {
    switch (status) {
      case 'scheduled': return 'text-blue-400 bg-blue-500/20'
      case 'active': return 'text-green-400 bg-green-500/20'
      case 'ended': return 'text-gray-400 bg-gray-500/20'
      default: return 'text-gray-400 bg-gray-500/20'
    }
  }

  const filteredPublicParties = publicParties.filter(party =>
    party.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    party.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (party.movie && party.movie.title.toLowerCase().includes(searchTerm.toLowerCase()))
  )

  if (authLoading) {
    return (
      <div className="fixed inset-0 bg-gradient-to-br from-black via-gray-900 to-black flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500 mx-auto mb-4"></div>
          <p className="text-white text-lg">Loading...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-gray-900 to-black text-white">
      {/* Navbar */}
      <Navbar
        user={user}
        roomStatus="none"
        roomId=""
        roomMembers={[]}
        isFullscreen={false}
        onCreateRoom={() => {}}
        onJoinRoom={() => {}}
        onLeaveRoom={() => {}}
        onLogout={async () => {
          await authService.signOut()
          navigate("/")
        }}
      />

      <div className="pt-16 px-4 pb-8">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8"
          >
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center space-x-4">
                <Button
                  onClick={() => navigate("/")}
                  variant="ghost"
                  className="p-2 text-gray-400 hover:text-white hover:bg-gray-800"
                >
                  <ArrowLeft className="w-5 h-5" />
                </Button>
                <div>
                  <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-400 to-pink-500 bg-clip-text text-transparent">
                    Watch Parties
                  </h1>
                  <p className="text-gray-400 mt-1">Schedule, join, and enjoy movies together</p>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <PartyPopper className="w-8 h-8 text-purple-400" />
              </div>
            </div>

            {/* Tabs */}
            <div className="flex space-x-1 bg-gray-800/50 rounded-xl p-1">
              {[
                { id: 'browse', label: 'Browse Parties', icon: Search },
                { id: 'create', label: 'Create Party', icon: Plus },
                { id: 'my-parties', label: 'My Parties', icon: Users }
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex-1 flex items-center justify-center space-x-2 px-4 py-3 rounded-lg font-medium transition-all ${
                    activeTab === tab.id
                      ? 'bg-purple-600 text-white shadow-lg'
                      : 'text-gray-400 hover:text-white hover:bg-gray-700/50'
                  }`}
                >
                  <tab.icon className="w-4 h-4" />
                  <span>{tab.label}</span>
                </button>
              ))}
            </div>
          </motion.div>

          {/* Quick Join Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-gradient-to-r from-purple-900/30 to-blue-900/30 border border-purple-500/20 rounded-2xl p-6"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="p-2 rounded-full bg-purple-500/20">
                  <UserPlus className="w-5 h-5 text-purple-400" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-white">Quick Join</h3>
                  <p className="text-gray-400 text-sm">Enter a party code to join instantly</p>
                </div>
              </div>
              <div className="flex items-center space-x-3">
                <Input
                  value={quickJoinCode}
                  onChange={(e) => setQuickJoinCode(e.target.value.toUpperCase())}
                  placeholder="8-char code..."
                  className="w-40 bg-gray-800/50 border-gray-600 text-white text-center font-mono"
                  maxLength={20}
                />
                <Button
                  onClick={handleQuickJoin}
                  disabled={!quickJoinCode.trim() || isJoining}
                  className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white font-medium"
                >
                  {isJoining ? (
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <>
                      <UserPlus className="w-4 h-4 mr-2" />
                      Join
                    </>
                  )}
                </Button>
              </div>
            </div>
          </motion.div>

          {/* Content */}
          <AnimatePresence mode="wait">
            {activeTab === 'browse' && (
              <motion.div
                key="browse"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-6"
              >
                {/* Search */}
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <Input
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    placeholder="Search parties by title, description, or movie..."
                    className="pl-10 bg-gray-800/50 border-gray-700 text-white placeholder-gray-400 h-12"
                  />
                </div>

                {/* Public Parties Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {filteredPublicParties.map((party) => (
                    <motion.div
                      key={party.firestoreId}
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      className="bg-gradient-to-br from-gray-800/80 to-gray-900/80 backdrop-blur-sm border border-gray-700/50 rounded-2xl p-6 hover:border-purple-500/50 transition-all duration-300 hover:scale-105"
                    >
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex-1">
                          <h3 className="text-xl font-bold text-white mb-2">{party.title}</h3>
                          <p className="text-gray-300 text-sm mb-3 line-clamp-2">{party.description}</p>
                          
                          {/* Party Code */}
                          <div className="flex items-center space-x-2 mb-2">
                            <span className="text-xs text-gray-400">Join Code:</span>
                            <code className="px-2 py-1 bg-gray-700/50 rounded text-xs font-mono text-purple-300 border border-gray-600">
                              {party.firestoreId.slice(-8).toUpperCase()}
                            </code>
                            <button
                              onClick={() => {
                                const shortCode = party.firestoreId.slice(-8).toUpperCase()
                                navigator.clipboard.writeText(shortCode)
                                showToast(`Party code "${shortCode}" copied to clipboard!`, "success")
                              }}
                              className="text-gray-400 hover:text-white transition-colors"
                              title="Copy party code"
                            >
                              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                              </svg>
                            </button>
                          </div>
                        </div>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(party.status)}`}>
                          {party.status}
                        </span>
                      </div>

                      {party.movie && (
                        <div className="flex items-center space-x-3 mb-4 p-3 bg-gray-700/30 rounded-lg">
                          <img
                            src={party.movie.image}
                            alt={party.movie.title}
                            className="w-12 h-16 object-cover rounded-lg"
                          />
                          <div>
                            <p className="text-white font-medium">{party.movie.title}</p>
                            <p className="text-gray-400 text-sm">Featured Movie</p>
                          </div>
                        </div>
                      )}

                      <div className="space-y-2 mb-4">
                        <div className="flex items-center text-gray-300 text-sm">
                          <Clock className="w-4 h-4 mr-2" />
                          {formatTime(party.scheduledTime)}
                        </div>
                        <div className="flex items-center text-gray-300 text-sm">
                          <Users className="w-4 h-4 mr-2" />
                          {party.attendees?.length || 0} / {party.maxAttendees} attendees
                        </div>
                        <div className="flex items-center text-gray-300 text-sm">
                          <Globe className="w-4 h-4 mr-2" />
                          Public Party
                        </div>
                      </div>

                      <Button
                        onClick={() => handleJoinParty(party)}
                        disabled={party.attendees?.length >= party.maxAttendees}
                        className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 disabled:from-gray-600 disabled:to-gray-600 text-white font-medium"
                      >
                        {party.attendees?.some(a => a.id === user.uid) ? 'Joined' : 'Join Party'}
                      </Button>
                    </motion.div>
                  ))}
                </div>

                {filteredPublicParties.length === 0 && (
                  <div className="text-center py-12">
                    <PartyPopper className="w-16 h-16 text-gray-600 mx-auto mb-4" />
                    <h3 className="text-xl font-semibold text-gray-400 mb-2">No parties found</h3>
                    <p className="text-gray-500">Try adjusting your search or create a new party!</p>
                  </div>
                )}
              </motion.div>
            )}

            {activeTab === 'create' && (
              <motion.div
                key="create"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="max-w-2xl mx-auto"
              >
                <div className="bg-gradient-to-br from-gray-800/80 to-gray-900/80 backdrop-blur-sm border border-gray-700/50 rounded-2xl p-8">
                  <h2 className="text-2xl font-bold text-white mb-6">Create New Party</h2>
                  
                  <div className="space-y-6">
                    <div>
                      <Label className="text-white">Party Title</Label>
                      <Input
                        value={partyForm.title}
                        onChange={(e) => setPartyForm(prev => ({ ...prev, title: e.target.value }))}
                        placeholder="e.g., Friday Night Movie Marathon"
                        className="mt-2 bg-gray-700/50 border-gray-600 text-white"
                      />
                    </div>

                    <div>
                      <Label className="text-white">Description</Label>
                      <textarea
                        value={partyForm.description}
                        onChange={(e) => setPartyForm(prev => ({ ...prev, description: e.target.value }))}
                        placeholder="Tell people what to expect..."
                        className="mt-2 w-full p-3 bg-gray-700/50 border border-gray-600 rounded-lg text-white placeholder-gray-400 h-24 resize-none"
                      />
                    </div>

                    <div>
                      <Label className="text-white">Movie (Optional)</Label>
                      <select
                        value={partyForm.movie?.title || ""}
                        onChange={(e) => {
                          const movie = featuredMovies.find(m => m.title === e.target.value)
                          setPartyForm(prev => ({ ...prev, movie }))
                        }}
                        className="mt-2 w-full p-3 bg-gray-700/50 border border-gray-600 rounded-lg text-white"
                      >
                        <option value="">Select a movie</option>
                        {featuredMovies.map((movie) => (
                          <option key={movie.id} value={movie.title}>
                            {movie.title}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <Label className="text-white">Scheduled Time</Label>
                      <Input
                        type="datetime-local"
                        value={partyForm.scheduledTime}
                        onChange={(e) => setPartyForm(prev => ({ ...prev, scheduledTime: e.target.value }))}
                        min={new Date().toISOString().slice(0, 16)}
                        className="mt-2 bg-gray-700/50 border-gray-600 text-white"
                      />
                    </div>

                    <div>
                      <Label className="text-white">Max Attendees</Label>
                      <Input
                        type="number"
                        value={partyForm.maxAttendees}
                        onChange={(e) => setPartyForm(prev => ({ ...prev, maxAttendees: parseInt(e.target.value) }))}
                        min="2"
                        max="50"
                        className="mt-2 bg-gray-700/50 border-gray-600 text-white"
                      />
                    </div>

                    <div className="flex items-center space-x-3">
                      <input
                        type="checkbox"
                        id="isPublic"
                        checked={partyForm.isPublic}
                        onChange={(e) => setPartyForm(prev => ({ ...prev, isPublic: e.target.checked }))}
                        className="w-4 h-4 text-purple-600 bg-gray-700 border-gray-600 rounded focus:ring-purple-500"
                      />
                      <Label htmlFor="isPublic" className="text-white">
                        Make this party public (others can discover and join)
                      </Label>
                    </div>

                    <Button
                      onClick={handleCreateParty}
                      disabled={!partyForm.title.trim() || !partyForm.scheduledTime || isCreating}
                      className="w-full h-12 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 disabled:from-gray-600 disabled:to-gray-600 text-white font-medium"
                    >
                      {isCreating ? (
                        <div className="flex items-center space-x-2">
                          <div className="w-4 h-4 border border-white/30 border-t-white rounded-full animate-spin" />
                          <span>Creating...</span>
                        </div>
                      ) : (
                        <div className="flex items-center space-x-2">
                          <Plus className="w-4 h-4" />
                          <span>Create Party</span>
                        </div>
                      )}
                    </Button>
                  </div>
                </div>
              </motion.div>
            )}

            {activeTab === 'my-parties' && (
              <motion.div
                key="my-parties"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-6"
              >
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {userParties.map((party) => (
                    <motion.div
                      key={party.firestoreId}
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      className="bg-gradient-to-br from-gray-800/80 to-gray-900/80 backdrop-blur-sm border border-gray-700/50 rounded-2xl p-6 hover:border-purple-500/50 transition-all duration-300"
                    >
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex-1">
                          <h3 className="text-xl font-bold text-white mb-2">{party.title}</h3>
                          <p className="text-gray-300 text-sm mb-3">{party.description}</p>
                          
                          {/* Party Code - More prominent for host */}
                          <div className="flex items-center space-x-2 mb-2">
                            <span className="text-xs text-gray-400">Share Code:</span>
                            <code className="px-3 py-1 bg-purple-600/20 rounded-lg text-sm font-mono text-purple-300 border border-purple-500/30">
                              {party.firestoreId.slice(-8).toUpperCase()}
                            </code>
                            <button
                              onClick={() => {
                                const shortCode = party.firestoreId.slice(-8).toUpperCase()
                                navigator.clipboard.writeText(shortCode)
                                showToast(`Share code "${shortCode}" copied!`, "success")
                              }}
                              className="text-purple-400 hover:text-purple-300 transition-colors p-1 hover:bg-purple-500/10 rounded"
                              title="Copy party code to share"
                            >
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                              </svg>
                            </button>
                          </div>
                        </div>
                        <div className="flex flex-col items-end space-y-1">
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(party.status)}`}>
                            {party.status}
                          </span>
                          {party.hostId === user.uid && (
                            <span className="px-2 py-1 rounded-full text-xs font-medium bg-amber-500/20 text-amber-400">
                              Host
                            </span>
                          )}
                        </div>
                      </div>

                      <div className="space-y-2 mb-4">
                        <div className="flex items-center text-gray-300 text-sm">
                          <Clock className="w-4 h-4 mr-2" />
                          {formatTime(party.scheduledTime)}
                        </div>
                        <div className="flex items-center text-gray-300 text-sm">
                          <Users className="w-4 h-4 mr-2" />
                          {party.attendees?.length || 0} / {party.maxAttendees} attendees
                        </div>
                      </div>

                      {party.hostId === user.uid && party.status === 'scheduled' && (
                        <Button
                          onClick={() => handleStartParty(party)}
                          className="w-full bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white font-medium"
                        >
                          <Play className="w-4 h-4 mr-2" />
                          Start Party Now
                        </Button>
                      )}
                      
                      {party.status === 'active' && party.roomId && (
                        <Button
                          onClick={() => navigate("/", { state: { joinRoomId: party.roomId } })}
                          className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-medium"
                        >
                          <Play className="w-4 h-4 mr-2" />
                          Join Active Party
                        </Button>
                      )}
                    </motion.div>
                  ))}
                </div>

                {userParties.length === 0 && (
                  <div className="text-center py-12">
                    <Calendar className="w-16 h-16 text-gray-600 mx-auto mb-4" />
                    <h3 className="text-xl font-semibold text-gray-400 mb-2">No parties yet</h3>
                    <p className="text-gray-500 mb-4">Create your first party to get started!</p>
                    <Button
                      onClick={() => setActiveTab('create')}
                      className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white"
                    >
                      <Plus className="w-4 h-4 mr-2" />
                      Create Party
                    </Button>
                  </div>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  )
}

export default PartyPage

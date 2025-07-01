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
      case 'scheduled': return 'text-cyan-400 bg-cyan-500/20 border border-cyan-500/30'
      case 'active': return 'text-green-400 bg-green-500/20 border border-green-500/30'
      case 'ended': return 'text-gray-400 bg-gray-500/20 border border-gray-500/30'
      default: return 'text-gray-400 bg-gray-500/20 border border-gray-500/30'
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
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-cyan-500 mx-auto mb-3"></div>
          <p className="text-white text-sm">Loading...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Background gradient overlay */}
      <div className="fixed inset-0 bg-gradient-to-b from-gray-900/20 via-transparent to-black/60" />
      
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
        hostMovieState={null}
        onJoinHostMovie={() => {}}
        isHost={false}
        currentWatchingMovie={null}
      />

      <div className="relative pt-16 px-4 pb-8">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8"
          >
            <div className="flex items-center justify-between mb-8">
              <div className="flex items-center space-x-4">
                <Button
                  onClick={() => navigate("/")}
                  variant="ghost"
                  className="p-2 text-gray-400 hover:text-white hover:bg-gray-800/50 rounded-xl transition-all duration-200"
                >
                  <ArrowLeft className="w-5 h-5" />
                </Button>
                <div>
                  <div className="flex items-center space-x-4 mb-2">
                    <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-cyan-600 rounded-xl flex items-center justify-center shadow-xl">
                      <PartyPopper className="w-6 h-6 text-white" />
                    </div>
                    <h1 className="text-4xl font-black text-white">
                      Fire
                      <span className="text-transparent bg-gradient-to-r from-blue-400 to-cyan-500 bg-clip-text">Party</span>
                    </h1>
                  </div>
                  <p className="text-gray-400 text-lg">Schedule, join, and enjoy movies together</p>
                </div>
              </div>
            </div>

            {/* Enhanced Tabs with FireTV styling */}
            <div className="flex space-x-1 bg-gray-800/30 backdrop-blur-sm border border-gray-700/50 rounded-xl p-1 shadow-xl">
              {[
                { id: 'browse', label: 'Browse', icon: Search },
                { id: 'create', label: 'Create', icon: Plus },
                { id: 'my-parties', label: 'My Parties', icon: Users }
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex-1 flex items-center justify-center space-x-1.5 px-4 py-2.5 rounded-lg font-medium transition-all duration-300 text-sm ${
                    activeTab === tab.id
                      ? 'bg-gradient-to-r from-blue-500 to-cyan-500 text-white'
                      : 'text-gray-400 hover:text-white hover:bg-gray-700/30'
                  }`}
                >
                  <tab.icon className="w-4 h-4" />
                  <span>{tab.label}</span>
                </button>
              ))}
            </div>
          </motion.div>

          {/* Enhanced Quick Join Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-gradient-to-r from-blue-500/10 via-cyan-500/10 to-teal-500/10 border border-cyan-500/20 rounded-xl p-6 mb-8 backdrop-blur-sm shadow-lg"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className="p-3 rounded-xl bg-gradient-to-br from-blue-500/20 to-cyan-500/20 border border-cyan-500/30">
                  <UserPlus className="w-5 h-5 text-cyan-400" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-white mb-1">Quick Join</h3>
                  <p className="text-gray-300 text-sm">Enter a party code to join instantly and start watching together</p>
                </div>
              </div>
              <div className="flex items-center space-x-3">
                <Input
                  value={quickJoinCode}
                  onChange={(e) => setQuickJoinCode(e.target.value.toUpperCase())}
                  placeholder="PARTY CODE"
                  className="w-44 bg-gray-800/50 border-gray-600 text-white text-center font-mono tracking-wider rounded-lg h-11 text-sm focus:border-cyan-500 transition-all duration-200 placeholder-gray-500"
                  maxLength={20}
                />
                <Button
                  onClick={handleQuickJoin}
                  disabled={!quickJoinCode.trim() || isJoining}
                  className="bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 text-white font-semibold px-6 h-11 rounded-lg transition-all duration-200 text-sm shadow-lg"
                >
                  {isJoining ? (
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <>
                      <UserPlus className="w-4 h-4 mr-2" />
                      Join Party
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
                {/* Enhanced Search */}
                <div className="relative mb-6">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <Input
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    placeholder="Search parties..."
                    className="pl-10 bg-gray-800/30 border-gray-700/50 text-white placeholder-gray-400 h-10 rounded-lg backdrop-blur-sm focus:border-orange-500 transition-all duration-200 text-sm"
                  />
                </div>

                {/* Public Parties Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {filteredPublicParties.map((party) => (
                    <motion.div
                      key={party.firestoreId}
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      className="bg-gray-800/30 backdrop-blur-sm border border-gray-700/50 rounded-2xl p-6 hover:border-orange-500/50 transition-all duration-300 hover:scale-[1.02] shadow-xl"
                    >
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex-1">
                          <h3 className="text-xl font-bold text-white mb-2">{party.title}</h3>
                          <p className="text-gray-300 text-sm mb-3 line-clamp-2">{party.description}</p>
                          
                          {/* Party Code */}
                          <div className="flex items-center space-x-2 mb-3">
                            <span className="text-xs text-gray-400 font-medium">Join Code:</span>
                            <code className="px-3 py-1.5 bg-gray-700/50 rounded-lg text-sm font-mono text-cyan-300 border border-gray-600/50">
                              {party.firestoreId.slice(-8).toUpperCase()}
                            </code>
                            <button
                              onClick={() => {
                                const shortCode = party.firestoreId.slice(-8).toUpperCase()
                                navigator.clipboard.writeText(shortCode)
                                showToast(`Party code "${shortCode}" copied to clipboard!`, "success")
                              }}
                              className="text-gray-400 hover:text-cyan-400 transition-colors p-1 hover:bg-cyan-500/10 rounded"
                              title="Copy party code"
                            >
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                              </svg>
                            </button>
                          </div>
                        </div>
                        <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getStatusColor(party.status)}`}>
                          {party.status}
                        </span>
                      </div>

                      {party.movie && (
                        <div className="flex items-center space-x-3 mb-4 p-3 bg-gradient-to-r from-gray-700/30 to-gray-800/30 rounded-xl border border-gray-600/30">
                          <img
                            src={party.movie.image}
                            alt={party.movie.title}
                            className="w-12 h-16 object-cover rounded-lg border border-gray-600/30 shadow-lg"
                          />
                          <div>
                            <p className="text-white font-semibold">{party.movie.title}</p>
                            <p className="text-cyan-400 text-sm font-medium flex items-center">
                              <Film className="w-3 h-3 mr-1" />
                              Featured Movie
                            </p>
                          </div>
                        </div>
                      )}

                      <div className="space-y-3 mb-6">
                        <div className="flex items-center text-gray-300 text-sm">
                          <Clock className="w-4 h-4 mr-3 text-cyan-400" />
                          <span className="font-medium">{formatTime(party.scheduledTime)}</span>
                        </div>
                        <div className="flex items-center text-gray-300 text-sm">
                          <Users className="w-4 h-4 mr-3 text-blue-400" />
                          <span className="font-medium">{party.attendees?.length || 0} / {party.maxAttendees} attendees</span>
                          {party.attendees?.length >= party.maxAttendees && (
                            <span className="ml-2 px-2 py-1 bg-red-500/20 text-red-400 text-xs rounded-full">Full</span>
                          )}
                        </div>
                        <div className="flex items-center text-gray-300 text-sm">
                          <Globe className="w-4 h-4 mr-3 text-cyan-400" />
                          <span className="font-medium">Public Party</span>
                        </div>
                      </div>

                      <Button
                        onClick={() => handleJoinParty(party)}
                        disabled={party.attendees?.length >= party.maxAttendees}
                        className="w-full bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 disabled:from-gray-600 disabled:to-gray-600 text-white font-semibold h-10 rounded-lg transition-all duration-200 text-sm shadow-lg"
                      >
                        {party.attendees?.some(a => a.id === user.uid) ? (
                          <>
                            <Users className="w-4 h-4 mr-1.5" />
                            Joined
                          </>
                        ) : (
                          <>
                            <UserPlus className="w-4 h-4 mr-1.5" />
                            Join
                          </>
                        )}
                      </Button>
                    </motion.div>
                  ))}
                </div>

                {filteredPublicParties.length === 0 && (
                  <div className="text-center py-16">
                    <div className="w-24 h-24 bg-gradient-to-br from-blue-500/20 to-cyan-500/20 rounded-2xl flex items-center justify-center mx-auto mb-6 border border-cyan-500/20">
                      <PartyPopper className="w-12 h-12 text-cyan-400" />
                    </div>
                    <h3 className="text-2xl font-bold text-white mb-2">No parties found</h3>
                    <p className="text-gray-400 mb-4">Try adjusting your search or create a new party!</p>
                    <Button 
                      onClick={() => setActiveTab('create')}
                      className="bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 text-white font-semibold px-6 py-2 rounded-lg"
                    >
                      <Plus className="w-4 h-4 mr-2" />
                      Create Party
                    </Button>
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
                <div className="bg-gradient-to-br from-gray-800/40 to-gray-900/40 backdrop-blur-sm border border-gray-700/50 rounded-2xl p-8 shadow-xl">
                  <div className="flex items-center space-x-3 mb-8">
                    <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-cyan-600 rounded-xl flex items-center justify-center shadow-lg">
                      <Plus className="w-6 h-6 text-white" />
                    </div>
                    <h2 className="text-3xl font-bold text-white">Create New 
                      <span className="text-transparent bg-gradient-to-r from-blue-400 to-cyan-500 bg-clip-text ml-2">Party</span>
                    </h2>
                  </div>
                  
                  <div className="space-y-6">
                    <div>
                      <Label className="text-white font-semibold mb-2 block">Party Title</Label>
                      <Input
                        value={partyForm.title}
                        onChange={(e) => setPartyForm(prev => ({ ...prev, title: e.target.value }))}
                        placeholder="e.g., Friday Night Movie Marathon"
                        className="bg-gray-700/50 border-gray-600 text-white h-12 rounded-xl focus:border-cyan-500 transition-all duration-200 focus:ring-cyan-500/20"
                      />
                    </div>

                    <div>
                      <Label className="text-white font-semibold mb-2 block">Description</Label>
                      <textarea
                        value={partyForm.description}
                        onChange={(e) => setPartyForm(prev => ({ ...prev, description: e.target.value }))}
                        placeholder="Tell people what to expect..."
                        className="w-full p-4 bg-gray-700/50 border border-gray-600 rounded-xl text-white placeholder-gray-400 h-28 resize-none focus:border-cyan-500 transition-all duration-200 focus:ring-cyan-500/20"
                      />
                    </div>

                    <div>
                      <Label className="text-white font-semibold mb-2 block">Movie (Optional)</Label>
                      <select
                        value={partyForm.movie?.title || ""}
                        onChange={(e) => {
                          const movie = featuredMovies.find(m => m.title === e.target.value)
                          setPartyForm(prev => ({ ...prev, movie }))
                        }}
                        className="w-full p-3 bg-gray-700/50 border border-gray-600 rounded-xl text-white h-12 focus:border-cyan-500 transition-all duration-200 focus:ring-cyan-500/20"
                      >
                        <option value="">Select a movie</option>
                        {featuredMovies.map((movie) => (
                          <option key={movie.id} value={movie.title}>
                            {movie.title}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <Label className="text-white font-semibold">Scheduled Time</Label>
                        <Input
                          type="datetime-local"
                          value={partyForm.scheduledTime}
                          onChange={(e) => setPartyForm(prev => ({ ...prev, scheduledTime: e.target.value }))}
                          min={new Date().toISOString().slice(0, 16)}
                          className="mt-2 bg-gray-700/50 border-gray-600 text-white h-12 rounded-xl focus:border-orange-500 transition-all duration-200"
                        />
                      </div>

                      <div>
                        <Label className="text-white font-semibold">Max Attendees</Label>
                        <Input
                          type="number"
                          value={partyForm.maxAttendees}
                          onChange={(e) => setPartyForm(prev => ({ ...prev, maxAttendees: parseInt(e.target.value) }))}
                          min="2"
                          max="50"
                          className="mt-2 bg-gray-700/50 border-gray-600 text-white h-12 rounded-xl focus:border-orange-500 transition-all duration-200"
                        />
                      </div>
                    </div>

                    <div className="flex items-center space-x-3 p-4 bg-gray-700/30 rounded-xl border border-gray-600/50">
                      <input
                        type="checkbox"
                        id="isPublic"
                        checked={partyForm.isPublic}
                        onChange={(e) => setPartyForm(prev => ({ ...prev, isPublic: e.target.checked }))}
                        className="w-5 h-5 text-orange-500 bg-gray-700 border-gray-600 rounded focus:ring-orange-500 focus:ring-2"
                      />
                      <Label htmlFor="isPublic" className="text-white font-medium">
                        <div className="flex items-center space-x-2">
                          <Globe className="w-4 h-4 text-cyan-400" />
                          <span>Make this party public (others can discover and join)</span>
                        </div>
                      </Label>
                    </div>

                    <Button
                      onClick={handleCreateParty}
                      disabled={!partyForm.title.trim() || !partyForm.scheduledTime || isCreating}
                      className="w-full h-12 bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 disabled:from-gray-600 disabled:to-gray-600 text-white font-semibold rounded-xl transition-all duration-200 shadow-lg"
                    >
                      {isCreating ? (
                        <div className="flex items-center space-x-2">
                          <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                          <span className="text-sm">Creating...</span>
                        </div>
                      ) : (
                        <div className="flex items-center space-x-2">
                          <Plus className="w-4 h-4" />
                          <span className="text-sm">Create Party</span>
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
                      className="bg-gray-800/30 backdrop-blur-sm border border-gray-700/50 rounded-2xl p-6 hover:border-orange-500/50 transition-all duration-300 hover:scale-[1.02] shadow-xl"
                    >
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex-1">
                          <h3 className="text-xl font-bold text-white mb-2">{party.title}</h3>
                          <p className="text-gray-300 text-sm mb-3 line-clamp-2">{party.description}</p>
                          
                          {/* Party Code - Host Edition with FireStream styling */}
                          <div className="flex items-center space-x-2 mb-3">
                            <span className="text-xs text-gray-400 font-medium">Share Code:</span>
                            <code className="px-3 py-1.5 bg-gradient-to-r from-red-500/20 to-orange-500/20 rounded-lg text-sm font-mono text-orange-300 border border-orange-500/30">
                              {party.firestoreId.slice(-8).toUpperCase()}
                            </code>
                            <button
                              onClick={() => {
                                const shortCode = party.firestoreId.slice(-8).toUpperCase()
                                navigator.clipboard.writeText(shortCode)
                                showToast(`Share code "${shortCode}" copied!`, "success")
                              }}
                              className="text-gray-400 hover:text-orange-400 transition-colors p-1 hover:bg-orange-500/10 rounded"
                              title="Copy party code to share"
                            >
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                              </svg>
                            </button>
                          </div>
                        </div>
                        <div className="flex flex-col items-end space-y-1">
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(party.status)}`}>
                            {party.status}
                          </span>
                          {party.hostId === user.uid && (
                            <span className="px-2 py-1 rounded-full text-xs font-medium bg-gradient-to-r from-red-500/20 to-orange-500/20 text-orange-400 border border-orange-500/30">
                              Host
                            </span>
                          )}
                        </div>
                      </div>

                      <div className="space-y-2 mb-4">
                        <div className="flex items-center text-gray-300 text-sm">
                          <Clock className="w-4 h-4 mr-2 text-orange-400" />
                          {formatTime(party.scheduledTime)}
                        </div>
                        <div className="flex items-center text-gray-300 text-sm">
                          <Users className="w-4 h-4 mr-2 text-orange-400" />
                          {party.attendees?.length || 0} / {party.maxAttendees} attendees
                        </div>
                        {party.movie && (
                          <div className="flex items-center text-gray-300 text-sm">
                            <Film className="w-4 h-4 mr-2 text-orange-400" />
                            {party.movie.title}
                          </div>
                        )}
                      </div>

                      {party.hostId === user.uid && party.status === 'scheduled' && (
                        <Button
                          onClick={() => handleStartParty(party)}
                          className="w-full bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white font-medium h-9 rounded-lg transition-all duration-200 text-sm"
                        >
                          <Play className="w-4 h-4 mr-1.5" />
                          Start Now
                        </Button>
                      )}
                      
                      {party.status === 'active' && party.roomId && (
                        <Button
                          onClick={() => navigate("/", { state: { joinRoomId: party.roomId } })}
                          className="w-full bg-gradient-to-r from-red-500 to-orange-500 hover:from-red-600 hover:to-orange-600 text-white font-medium h-9 rounded-lg transition-all duration-200 text-sm"
                        >
                          <Play className="w-4 h-4 mr-1.5" />
                          Join Room
                        </Button>
                      )}
                    </motion.div>
                  ))}
                </div>

                {userParties.length === 0 && (
                  <div className="text-center py-16">
                    <div className="w-20 h-20 bg-gradient-to-br from-red-500/20 to-orange-500/20 rounded-2xl flex items-center justify-center mx-auto mb-6">
                      <Calendar className="w-10 h-10 text-orange-400" />
                    </div>
                    <h3 className="text-2xl font-bold text-white mb-2">No parties yet</h3>
                    <p className="text-gray-400 mb-6">Create your first party to get started!</p>
                    <Button
                      onClick={() => setActiveTab('create')}
                      className="bg-gradient-to-r from-red-500 to-orange-500 hover:from-red-600 hover:to-orange-600 text-white font-medium px-4 py-2 rounded-lg transition-all duration-200 text-sm"
                    >
                      <Plus className="w-4 h-4 mr-1.5" />
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

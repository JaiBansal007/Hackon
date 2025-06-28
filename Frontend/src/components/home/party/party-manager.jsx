import React, { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { 
  Calendar, 
  Clock, 
  Users, 
  MapPin, 
  Film, 
  Plus, 
  Search, 
  X, 
  Play,
  UserPlus,
  Settings,
  Globe,
  Lock,
  Star,
  ChevronRight,
  Timer
} from "lucide-react"
import { Button } from "../../ui/button"
import { Input } from "../../ui/input"
import { Label } from "../../ui/label"
import partiesService from "../../../firebase/parties"
import { movieCategories } from "../content/movie-data"

// Create a flattened array of all movies from categories
const featuredMovies = movieCategories.flatMap(category => category.movies)

export function PartyManager({ user, onJoinRoom, currentMovie }) {
  const [showCreateParty, setShowCreateParty] = useState(false)
  const [showPartyBrowser, setShowPartyBrowser] = useState(false)
  const [publicParties, setPublicParties] = useState([])
  const [userParties, setUserParties] = useState([])
  const [searchTerm, setSearchTerm] = useState("")
  const [isCreating, setIsCreating] = useState(false)

  // Create party form state
  const [partyForm, setPartyForm] = useState({
    title: "",
    description: "",
    movie: currentMovie || null,
    scheduledTime: "",
    maxAttendees: 10,
    isPublic: true,
    tags: []
  })

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
        movie: partyForm.movie || currentMovie
      }, user.uid, user.name)

      if (result.success) {
        // Reset form
        setPartyForm({
          title: "",
          description: "",
          movie: currentMovie || null,
          scheduledTime: "",
          maxAttendees: 10,
          isPublic: true,
          tags: []
        })
        setShowCreateParty(false)
        
        // If party is scheduled for now or very soon, start it immediately
        if (scheduledTime <= Date.now() + (5 * 60 * 1000)) { // Within 5 minutes
          // Auto-start the party and create room
          const roomId = `party_${result.partyId}_${Date.now()}`
          await partiesService.startParty(result.partyId, roomId)
          onJoinRoom(roomId)
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
      await partiesService.joinParty(party.firestoreId, user.uid, user.name)
      
      // If party is active and has a room, join it
      if (party.status === 'active' && party.roomId) {
        onJoinRoom(party.roomId)
      }
    } catch (error) {
      console.error("Error joining party:", error)
    }
  }

  const handleStartParty = async (party) => {
    if (party.hostId !== user.uid) return

    try {
      const roomId = `party_${party.firestoreId}_${Date.now()}`
      await partiesService.startParty(party.firestoreId, roomId)
      onJoinRoom(roomId)
    } catch (error) {
      console.error("Error starting party:", error)
    }
  }

  const formatPartyTime = (scheduledTime) => {
    const now = new Date()
    const partyTime = new Date(scheduledTime)
    const diff = partyTime.getTime() - now.getTime()

    if (diff < 0) {
      return "Started"
    } else if (diff < 60 * 60 * 1000) { // Less than 1 hour
      const minutes = Math.floor(diff / (60 * 1000))
      return `Starts in ${minutes}m`
    } else if (diff < 24 * 60 * 60 * 1000) { // Less than 1 day
      const hours = Math.floor(diff / (60 * 60 * 1000))
      return `Starts in ${hours}h`
    } else {
      return partyTime.toLocaleDateString('en-US', { 
        weekday: 'short', 
        month: 'short', 
        day: 'numeric',
        hour: 'numeric',
        minute: '2-digit'
      })
    }
  }

  const filteredParties = publicParties.filter(party =>
    party.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    party.movie?.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    party.description.toLowerCase().includes(searchTerm.toLowerCase())
  )

  return (
    <div className="space-y-4">
      {/* Action Buttons */}
      <div className="flex space-x-3">
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => setShowCreateParty(true)}
          className="flex-1 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white rounded-xl p-3 flex items-center justify-center space-x-2 font-medium"
        >
          <Plus className="w-4 h-4" />
          <span>Schedule Party</span>
        </motion.button>
        
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => setShowPartyBrowser(true)}
          className="flex-1 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white rounded-xl p-3 flex items-center justify-center space-x-2 font-medium"
        >
          <Search className="w-4 h-4" />
          <span>Browse Parties</span>
        </motion.button>
      </div>

      {/* User's Upcoming Parties */}
      {userParties.length > 0 && (
        <div className="space-y-2">
          <h3 className="text-lg font-semibold text-white">Your Parties</h3>
          <div className="space-y-2">
            {userParties.slice(0, 3).map((party) => (
              <motion.div
                key={party.firestoreId}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-gradient-to-r from-purple-500/10 to-pink-500/10 border border-purple-500/20 rounded-xl p-4"
              >
                <div className="flex items-center justify-between">
                  <div className="flex-1 min-w-0">
                    <h4 className="font-semibold text-white truncate">{party.title}</h4>
                    <div className="flex items-center space-x-3 mt-1 text-sm text-gray-300">
                      <div className="flex items-center space-x-1">
                        <Clock className="w-3 h-3" />
                        <span>{formatPartyTime(party.scheduledTime)}</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <Users className="w-3 h-3" />
                        <span>{party.attendees?.length || 0}/{party.maxAttendees}</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex space-x-2">
                    {party.hostId === user.uid && party.status === 'scheduled' && (
                      <Button
                        onClick={() => handleStartParty(party)}
                        size="sm"
                        className="bg-green-600 hover:bg-green-700"
                      >
                        <Play className="w-3 h-3 mr-1" />
                        Start
                      </Button>
                    )}
                    {party.status === 'active' && party.roomId && (
                      <Button
                        onClick={() => onJoinRoom(party.roomId)}
                        size="sm"
                        className="bg-blue-600 hover:bg-blue-700"
                      >
                        Join Room
                      </Button>
                    )}
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      )}

      {/* Create Party Modal */}
      <AnimatePresence>
        {showCreateParty && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={() => setShowCreateParty(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-gray-900 rounded-2xl p-6 w-full max-w-md max-h-[90vh] overflow-y-auto"
            >
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-white">Schedule Watch Party</h2>
                <button
                  onClick={() => setShowCreateParty(false)}
                  className="text-gray-400 hover:text-white"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <Label className="text-white">Party Title</Label>
                  <Input
                    value={partyForm.title}
                    onChange={(e) => setPartyForm(prev => ({ ...prev, title: e.target.value }))}
                    placeholder="Epic Movie Night"
                    className="bg-gray-800 border-gray-600 text-white"
                  />
                </div>

                <div>
                  <Label className="text-white">Description (Optional)</Label>
                  <textarea
                    value={partyForm.description}
                    onChange={(e) => setPartyForm(prev => ({ ...prev, description: e.target.value }))}
                    placeholder="Come join us for an amazing movie experience!"
                    className="w-full p-3 bg-gray-800 border border-gray-600 rounded-lg text-white placeholder-gray-400 resize-none"
                    rows="3"
                  />
                </div>

                <div>
                  <Label className="text-white">Movie</Label>
                  <select
                    value={partyForm.movie?.title || ""}
                    onChange={(e) => {
                      const movie = featuredMovies.find(m => m.title === e.target.value)
                      setPartyForm(prev => ({ ...prev, movie }))
                    }}
                    className="w-full p-3 bg-gray-800 border border-gray-600 rounded-lg text-white"
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
                    className="bg-gray-800 border-gray-600 text-white"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="text-white">Max Attendees</Label>
                    <Input
                      type="number"
                      value={partyForm.maxAttendees}
                      onChange={(e) => setPartyForm(prev => ({ ...prev, maxAttendees: parseInt(e.target.value) }))}
                      min="2"
                      max="50"
                      className="bg-gray-800 border-gray-600 text-white"
                    />
                  </div>
                  <div className="flex items-center space-x-2 pt-6">
                    <input
                      type="checkbox"
                      checked={partyForm.isPublic}
                      onChange={(e) => setPartyForm(prev => ({ ...prev, isPublic: e.target.checked }))}
                      className="rounded"
                    />
                    <Label className="text-white text-sm">Public Party</Label>
                  </div>
                </div>

                <div className="flex space-x-3 pt-4">
                  <Button
                    onClick={() => setShowCreateParty(false)}
                    variant="outline"
                    className="flex-1"
                  >
                    Cancel
                  </Button>
                  <Button
                    onClick={handleCreateParty}
                    disabled={!partyForm.title.trim() || !partyForm.scheduledTime || isCreating}
                    className="flex-1 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
                  >
                    {isCreating ? "Creating..." : "Create Party"}
                  </Button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Party Browser Modal */}
      <AnimatePresence>
        {showPartyBrowser && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={() => setShowPartyBrowser(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-gray-900 rounded-2xl p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto"
            >
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-white">Browse Watch Parties</h2>
                <button
                  onClick={() => setShowPartyBrowser(false)}
                  className="text-gray-400 hover:text-white"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="mb-4">
                <Input
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Search parties by title or movie..."
                  className="bg-gray-800 border-gray-600 text-white"
                />
              </div>

              <div className="space-y-3">
                {filteredParties.length === 0 ? (
                  <div className="text-center text-gray-400 py-8">
                    <Users className="w-12 h-12 mx-auto mb-3 opacity-50" />
                    <p>No parties found</p>
                    <p className="text-sm">Be the first to schedule one!</p>
                  </div>
                ) : (
                  filteredParties.map((party) => (
                    <motion.div
                      key={party.firestoreId}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="bg-gradient-to-r from-blue-500/10 to-indigo-500/10 border border-blue-500/20 rounded-xl p-4"
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center space-x-2 mb-2">
                            <h3 className="font-semibold text-white truncate">{party.title}</h3>
                            <div className="flex items-center space-x-1">
                              {party.isPublic ? (
                                <Globe className="w-3 h-3 text-blue-400" />
                              ) : (
                                <Lock className="w-3 h-3 text-gray-400" />
                              )}
                              <span className={`text-xs px-1.5 py-0.5 rounded-full ${
                                party.status === 'active' 
                                  ? 'bg-green-500/20 text-green-400' 
                                  : 'bg-yellow-500/20 text-yellow-400'
                              }`}>
                                {party.status}
                              </span>
                            </div>
                          </div>
                          
                          {party.movie && (
                            <div className="flex items-center space-x-2 mb-2">
                              <Film className="w-3 h-3 text-gray-400" />
                              <span className="text-sm text-gray-300">{party.movie.title}</span>
                            </div>
                          )}
                          
                          <div className="flex items-center space-x-4 text-sm text-gray-400">
                            <div className="flex items-center space-x-1">
                              <Clock className="w-3 h-3" />
                              <span>{formatPartyTime(party.scheduledTime)}</span>
                            </div>
                            <div className="flex items-center space-x-1">
                              <Users className="w-3 h-3" />
                              <span>{party.attendees?.length || 0}/{party.maxAttendees}</span>
                            </div>
                            <div className="flex items-center space-x-1">
                              <Star className="w-3 h-3" />
                              <span>{party.hostName}</span>
                            </div>
                          </div>
                          
                          {party.description && (
                            <p className="text-sm text-gray-300 mt-2 line-clamp-2">
                              {party.description}
                            </p>
                          )}
                        </div>
                        
                        <div className="ml-4">
                          {party.attendees?.some(a => a.id === user.uid) ? (
                            party.status === 'active' && party.roomId ? (
                              <Button
                                onClick={() => onJoinRoom(party.roomId)}
                                size="sm"
                                className="bg-green-600 hover:bg-green-700"
                              >
                                <Play className="w-3 h-3 mr-1" />
                                Join
                              </Button>
                            ) : (
                              <div className="text-xs text-green-400 font-medium">
                                Joined ✓
                              </div>
                            )
                          ) : (
                            <Button
                              onClick={() => handleJoinParty(party)}
                              size="sm"
                              disabled={party.attendees?.length >= party.maxAttendees}
                              className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600"
                            >
                              <UserPlus className="w-3 h-3 mr-1" />
                              Join
                            </Button>
                          )}
                        </div>
                      </div>
                    </motion.div>
                  ))
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

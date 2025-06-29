"use client"

import { useState, useEffect, useRef } from "react"
import { useNavigate } from "react-router-dom"
import { Navbar } from "@/components/home/layout/navbar"
import { Sidebar } from "@/components/home/layout/sidebar"
import { FeaturedSection } from "@/components/home/content/featured-section"
import { MovieCategories } from "@/components/home/content/movie-categories"
import { VideoPlayer } from "@/components/home/video/video-player"
import { ChatSidebar } from "@/components/home/chat/chat-sidebar"
import { PermissionManager } from "@/components/home/room/permission-manager"
import { RoomMembersSidebar } from "@/components/home/room/room-members-sidebar"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { MessageSquareIcon, Users, Crown } from "lucide-react"
import { AnimatePresence, motion } from "framer-motion"
import { GamificationManager } from "@/lib/gamification"
import { ViewingHistoryManager } from "@/lib/viewing-history"
import { featuredMovies } from "../../components/home/content/featured-movies"
import authService from "../../firebase/auth"
import chatService from "../../firebase/chat"
import videoSyncService from "../../firebase/videoSync"
import { WebSocketManager } from "@/lib/websocket"

const HomePage = ({ startPictureInPicture }) => {
  const [user, setUser] = useState(null)
  const [authLoading, setAuthLoading] = useState(true) // Add loading state
  const [isWatching, setIsWatching] = useState(false)
  const [currentWatchingMovie, setCurrentWatchingMovie] = useState(null)
  const [isFullscreen, setIsFullscreen] = useState(false)
  const [chatMessages, setChatMessages] = useState([])
  const [showChat, setShowChat] = useState(false)
  const [showReactions, setShowReactions] = useState(false)
  const [showRoomMembers, setShowRoomMembers] = useState(false)
  const [recentReactions, setRecentReactions] = useState([])
  const [currentVideoTime, setCurrentVideoTime] = useState(0)
  const [videoAnalyzed, setVideoAnalyzed] = useState(false)
  const [quizLocked, setQuizLocked] = useState(false)

  const [polls, setPolls] = useState({})
  const [pollsEnabled, setPollsEnabled] = useState(true)

  // Room functionality state
  const [roomStatus, setRoomStatus] = useState("none")
  const [roomId, setRoomId] = useState("")
  const [joinRoomId, setJoinRoomId] = useState("")
  const [showJoinDialog, setShowJoinDialog] = useState(false)
  const [showCreateDialog, setShowCreateDialog] = useState(false)
  const [roomMembers, setRoomMembers] = useState([])

  // Firebase-related state
  const [isHost, setIsHost] = useState(false)
  const [roomPermissions, setRoomPermissions] = useState(null)
  const [videoControlPermission, setVideoControlPermission] = useState(false)
  const [typingUsers, setTypingUsers] = useState([])
  const [syncedVideoState, setSyncedVideoState] = useState(null)

  // Permission management state
  const [showPermissionManager, setShowPermissionManager] = useState(false)

  const navigate = useNavigate()
  const chatUnsubscribeRef = useRef(null)
  const membersUnsubscribeRef = useRef(null)
  const videoUnsubscribeRef = useRef(null)
  const permissionsUnsubscribeRef = useRef(null)
  const typingTimeoutRef = useRef(null)
  const wsRef = useRef(null) // Add WebSocket manager ref

  // Initialize ViewingHistoryManager
  const viewingHistoryManager = ViewingHistoryManager.getInstance()

  const currentFeatured = featuredMovies[Math.floor(Math.random() * featuredMovies.length)]

  // Initialize user with Firebase auth
  useEffect(() => {
    // Check for stored user data first to prevent redirect
    const storedUser = authService.getCurrentUser()
    if (storedUser) {
      setUser(storedUser)
      setAuthLoading(false)
    }

    const unsubscribe = authService.onAuthStateChange((firebaseUser) => {
      if (firebaseUser) {
        const userData = {
          uid: firebaseUser.uid,
          name: firebaseUser.displayName,
          email: firebaseUser.email,
          photoURL: firebaseUser.photoURL,
        }
        setUser(userData)
        setAuthLoading(false)
      } else {
        // Only redirect if we're not loading and actually signed out
        setUser(null)
        setAuthLoading(false)
        // Add a small delay to prevent immediate redirect on refresh
        setTimeout(() => {
          if (!firebaseUser) {
            navigate("/signin")
          }
        }, 500) // Increased delay to give Firebase more time
      }
    })

    return unsubscribe
  }, [navigate])

  // Persist and restore watching state
  useEffect(() => {
    // Restore watching state from localStorage on mount
    const savedWatchingState = localStorage.getItem("watchingState")
    const savedMovie = localStorage.getItem("currentWatchingMovie")
    const savedRoomState = localStorage.getItem("roomState")

    if (savedWatchingState && savedMovie) {
      try {
        const watchingState = JSON.parse(savedWatchingState)
        const movie = JSON.parse(savedMovie)

        if (watchingState.isWatching && movie) {
          setIsWatching(true)
          setCurrentWatchingMovie(movie)
          setCurrentVideoTime(watchingState.videoTime || 0)
          console.log("🔄 Restored watching state:", movie.title)
        }
      } catch (error) {
        console.warn("Failed to restore watching state:", error)
        localStorage.removeItem("watchingState")
        localStorage.removeItem("currentWatchingMovie")
      }
    }

    if (savedRoomState) {
      try {
        const roomState = JSON.parse(savedRoomState)
        if (roomState.roomId && roomState.roomStatus !== "none") {
          setRoomId(roomState.roomId)
          setRoomStatus(roomState.roomStatus)
          setIsHost(roomState.isHost || false)
          console.log("🔄 Restored room state:", roomState.roomId)
        }
      } catch (error) {
        console.warn("Failed to restore room state:", error)
        localStorage.removeItem("roomState")
      }
    }
  }, [])

  // Save watching state to localStorage when it changes
  useEffect(() => {
    if (isWatching && currentWatchingMovie) {
      localStorage.setItem(
        "watchingState",
        JSON.stringify({
          isWatching: true,
          videoTime: currentVideoTime,
        }),
      )
      localStorage.setItem("currentWatchingMovie", JSON.stringify(currentWatchingMovie))
    } else {
      localStorage.removeItem("watchingState")
      localStorage.removeItem("currentWatchingMovie")
    }
  }, [isWatching, currentWatchingMovie, currentVideoTime])

  // Save room state to localStorage when it changes
  useEffect(() => {
    if (roomId && roomStatus !== "none") {
      localStorage.setItem(
        "roomState",
        JSON.stringify({
          roomId,
          roomStatus,
          isHost,
        }),
      )
    } else {
      localStorage.removeItem("roomState")
    }
  }, [roomId, roomStatus, isHost])

  // Firebase chat and video sync listeners
  useEffect(() => {
    if (!user || !roomId) return

    // Listen to chat messages
    const unsubscribeChat = chatService.listenToMessages(roomId, (messages) => {
      setChatMessages(
        messages.map((msg) => ({
          id: msg.id,
          user: msg.userName,
          text: msg.text,
          timestamp: new Date(msg.timestamp).toLocaleTimeString(),
          isSystem: false,
        })),
      )
    })

    // Listen to room members
    const unsubscribeMembers = chatService.listenToMembers(roomId, (members) => {
      setRoomMembers(members)
    })

    // Listen to video state
    const unsubscribeVideo = videoSyncService.listenToVideoState(roomId, (videoState) => {
      if (videoState) {
        setSyncedVideoState(videoState)
        setCurrentVideoTime(videoState.currentTime || 0)
        if (videoState.videoUrl) {
          const foundMovie = featuredMovies.find((m) => m.videoUrl === videoState.videoUrl)
          if (foundMovie) {
            setCurrentWatchingMovie(foundMovie)
            setIsWatching(true)
          }
        }
      }
    })

    // Listen to permissions
    const unsubscribePermissions = videoSyncService.listenToPermissions(roomId, (permissions) => {
      setRoomPermissions(permissions)

      // Check if user has video control permission
      const hasPermission =
        permissions?.allowedUsers?.[user.uid]?.canControl || permissions?.settings?.anyoneCanControl || false

      setVideoControlPermission(hasPermission)

      console.log("🔑 Permissions updated:", {
        userId: user.uid,
        hasPermission,
        isHost,
        canControlVideo: isHost || hasPermission,
        permissions: permissions?.allowedUsers?.[user.uid],
      })
    })

    // Listen to typing users
    const unsubscribeTyping = chatService.listenToTypingUsers(roomId, (typingUsersList) => {
      setTypingUsers(typingUsersList.filter((u) => u !== user.uid))
    })

    // Store unsubscribe functions
    chatUnsubscribeRef.current = unsubscribeChat
    membersUnsubscribeRef.current = unsubscribeMembers
    videoUnsubscribeRef.current = unsubscribeVideo
    permissionsUnsubscribeRef.current = unsubscribePermissions

    return () => {
      if (chatUnsubscribeRef.current) chatUnsubscribeRef.current()
      if (membersUnsubscribeRef.current) membersUnsubscribeRef.current()
      if (videoUnsubscribeRef.current) videoUnsubscribeRef.current()
      if (permissionsUnsubscribeRef.current) permissionsUnsubscribeRef.current()
      if (unsubscribeTyping) unsubscribeTyping()
    }
  }, [user, roomId, featuredMovies])

  // Initialize WebSocket manager for reactions and real-time sync
  useEffect(() => {
    if (!user) return

    // Initialize WebSocket manager if not already done
    if (!wsRef.current) {
      wsRef.current = new WebSocketManager(user.uid, user.name)
    }

    return () => {
      // Don't disconnect here as it's handled in leaveRoom
    }
  }, [user])

  // Connect WebSocket manager when joining a room
  useEffect(() => {
    if (!user || !roomId || roomStatus === "none" || !wsRef.current) return

    // Connect to room for real-time reactions
    if (wsRef.current.roomId !== roomId || !wsRef.current.isConnected) {
      wsRef.current.connect(roomId)
    }

    // Listen for reactions from other users
    wsRef.current.on("reaction", (data) => {
      const newReaction = {
        id: `${data.userName}-${data.timestamp}`,
        emoji: data.emoji,
        user: data.userName,
        timestamp: data.timestamp,
      }
      setRecentReactions((prev) => [...prev.slice(-14), newReaction]) // Keep last 15 reactions

      // Auto-remove reaction after 4 seconds
      setTimeout(() => {
        setRecentReactions((prev) => prev.filter((r) => r.id !== newReaction.id))
      }, 4000)
    })

    return () => {
      // Cleanup listeners when room changes
      if (wsRef.current) {
        wsRef.current.off("reaction")
      }
    }
  }, [user, roomId, roomStatus])

  // Handle fullscreen changes
  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement)
    }
    document.addEventListener("fullscreenchange", handleFullscreenChange)
    return () => document.removeEventListener("fullscreenchange", handleFullscreenChange)
  }, [])

  const handleLogout = async () => {
    try {
      await authService.signOut()
      navigate("/")
    } catch (error) {
      console.error("Logout error:", error)
      navigate("/")
    }
  }

  const createRoom = async () => {
    if (!user) return

    const newRoomId = Math.random().toString(36).substring(2, 8).toUpperCase()

    try {
      // Create room in Firebase
      const result = await chatService.createRoom(newRoomId, user)
      if (result.success) {
        setRoomId(newRoomId)
        setRoomStatus("host")
        setIsHost(true)
        setShowCreateDialog(false)

        // Initialize room permissions
        await videoSyncService.setRoomPermissions(newRoomId, user.uid, {
          anyoneCanControl: false,
          requirePermission: true,
        })

        // Join as member
        await chatService.joinRoom(newRoomId, user)

        console.log("🏠 Room created and permissions initialized:", newRoomId)
      } else {
        console.error("Failed to create room:", result.error)
      }
    } catch (error) {
      console.error("Error creating room:", error)
    }
  }

  const joinRoom = async () => {
    if (!user || !joinRoomId.trim()) return

    try {
      const result = await chatService.joinRoom(joinRoomId, user)
      if (result.success) {
        setRoomId(joinRoomId)
        setRoomStatus("member")
        setIsHost(false)
        setShowJoinDialog(false)
        setJoinRoomId("")
      } else {
        console.error("Failed to join room:", result.error)
      }
    } catch (error) {
      console.error("Error joining room:", error)
    }
  }

  const leaveRoom = async () => {
    if (!user || !roomId) return

    try {
      await chatService.leaveRoom(roomId, user)

      // Cleanup listeners
      if (chatUnsubscribeRef.current) chatUnsubscribeRef.current()
      if (membersUnsubscribeRef.current) membersUnsubscribeRef.current()
      if (videoUnsubscribeRef.current) videoUnsubscribeRef.current()
      if (permissionsUnsubscribeRef.current) permissionsUnsubscribeRef.current()

      // Disconnect WebSocket manager
      if (wsRef.current) {
        wsRef.current.disconnect()
      }

      setRoomStatus("none")
      setRoomId("")
      setRoomMembers([])
      setIsWatching(false)
      setShowChat(false)
      setShowReactions(false)
      setShowRoomMembers(false)
      setIsHost(false)
      setVideoControlPermission(false)
      setRoomPermissions(null)
      setSyncedVideoState(null)

      // Clear all persisted state
      localStorage.removeItem("roomState")
      localStorage.removeItem("watchingState")
      localStorage.removeItem("currentWatchingMovie")
    } catch (error) {
      console.error("Error leaving room:", error)
    }
  }

  const toggleFullscreen = () => {
    if (!isFullscreen) {
      if (document.documentElement.requestFullscreen) {
        document.documentElement.requestFullscreen()
      }
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen()
      }
    }
  }

  const exitVideo = () => {
    if (isFullscreen && document.exitFullscreen) {
      document.exitFullscreen()
    }
    setIsWatching(false)
    setShowChat(false)
    setShowReactions(false)
    setShowRoomMembers(false)
    setVideoAnalyzed(false)
    setCurrentVideoTime(0)

    // Clear watching state from localStorage
    localStorage.removeItem("watchingState")
    localStorage.removeItem("currentWatchingMovie")
  }

  const startWatching = (movie) => {
    // Ensure movie has movieId for tracking
    const movieWithId = {
      ...movie,
      movieId:
        movie.movieId ||
        movie.title
          .toLowerCase()
          .replace(/\s+/g, "-")
          .replace(/[^\w-]/g, ""),
    }

    setCurrentWatchingMovie(movieWithId)
    setIsWatching(true)
    setVideoAnalyzed(false)
    setCurrentVideoTime(0)
  }

  const startQuiz = (movieSlug) => {
    if (quizLocked) return
    navigate(`/quiz/${movieSlug}`)
  }

  const updateVideoTime = (time) => {
    setCurrentVideoTime(time)
  }

  const sendMessage = async (message) => {
    if (!user || !roomId || roomStatus === "none") return

    console.log("📤 Sending message:", message)

    try {
      // Send message via Firebase
      const result = await chatService.sendMessage(roomId, message, user)
      if (!result.success) {
        console.error("Failed to send message:", result.error)
      }
    } catch (error) {
      console.error("Error sending message:", error)
    }

    // Handle Tree.io AI responses
    if (message.includes("@Tree.io")) {
      console.log("🤖 Tree.io mentioned, processing...")
      console.log("🕐 Current video time:", currentVideoTime)
      console.log("📊 Video analyzed:", videoAnalyzed)

      try {
        console.log("🌐 Calling Tree.io API with video context...")

        const response = await fetch("http://localhost:8000/api/chat/tree-io", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            message: message.replace("@Tree.io", "").trim(),
            movie_title: currentWatchingMovie?.title || currentFeatured?.title || "Current Movie",
            movie_context: currentWatchingMovie?.description || currentFeatured?.description || "",
            video_url: currentWatchingMovie?.videoUrl || "",
            current_timestamp: currentVideoTime,
          }),
        })

        console.log("📡 API Response status:", response.status)

        if (response.ok) {
          const data = await response.json()
          console.log("✅ API Response data:", data)

          // Send Tree.io response via Firebase
          const treeIoUser = {
            uid: "tree-io-ai",
            name: "Tree.io",
            email: "tree.io@ai.com",
          }

          await chatService.sendMessage(roomId, `Tree.io: ${data.response}`, treeIoUser)
          console.log("🎉 Tree.io response sent to chat")
        } else {
          console.error("❌ Tree.io API error:", response.status)
          const errorUser = {
            uid: "tree-io-ai",
            name: "Tree.io",
            email: "tree.io@ai.com",
          }
          await chatService.sendMessage(
            roomId,
            "Tree.io: Sorry, I'm having trouble processing your request right now.",
            errorUser,
          )
        }
      } catch (error) {
        console.error("❌ Tree.io API error:", error)
        const errorUser = {
          uid: "tree-io-ai",
          name: "Tree.io",
          email: "tree.io@ai.com",
        }
        await chatService.sendMessage(
          roomId,
          "Tree.io: Sorry, I encountered an error while processing your request.",
          errorUser,
        )
      }
    }
  }

  // Enhanced permission management functions
  const handleToggleAnyoneCanControl = async () => {
    if (!isHost || !user || !roomId) return

    try {
      const currentSetting = roomPermissions?.settings?.anyoneCanControl || false
      await videoSyncService.setRoomPermissions(roomId, user.uid, {
        anyoneCanControl: !currentSetting,
        requirePermission: currentSetting, // Flip the requirement
      })
      console.log(`🔄 Toggled global video control: ${!currentSetting ? "enabled" : "disabled"}`)
    } catch (error) {
      console.error("Failed to toggle global permission:", error)
    }
  }

  // Enhanced reaction sending with proper WebSocket synchronization
  const sendReaction = (reaction) => {
    if (!user || !roomId || roomStatus === "none") return

    const reactionData = {
      id: Date.now() + Math.random(),
      emoji: reaction.emoji,
      user: user.name,
      userId: user.uid,
      timestamp: Date.now(),
    }

    // Add to local state immediately for responsive UI
    setRecentReactions((prev) => [...prev.slice(-14), reactionData]) // Keep last 15 reactions

    // Auto-remove local reaction after 4 seconds
    setTimeout(() => {
      setRecentReactions((prev) => prev.filter((r) => r.id !== reactionData.id))
    }, 4000)

    // Send reaction via WebSocket manager for real-time sync
    if (wsRef.current && wsRef.current.isConnected) {
      wsRef.current.sendReaction(reaction.emoji)
    }
  }

  const revokeVideoControl = async (userId) => {
    if (!isHost || !user || !roomId) return

    await videoSyncService.revokeVideoPermission(roomId, userId, user.uid, isHost)
  }

  const grantVideoControl = async (userId) => {
    if (!isHost || !user || !roomId) return

    await videoSyncService.grantVideoPermission(roomId, userId, user.uid, isHost)
  }

  const handlePlay = async () => {
    if (!user || !roomId || !currentWatchingMovie) return

    const hasPermission = isHost || videoControlPermission
    if (!hasPermission) {
      console.log("⚠️ No permission to control video")
      return
    }

    await videoSyncService.playVideo(roomId, currentVideoTime, currentWatchingMovie.videoUrl, user, isHost)
  }

  const handlePause = async () => {
    if (!user || !roomId || !currentWatchingMovie) return

    const hasPermission = isHost || videoControlPermission
    if (!hasPermission) {
      console.log("⚠️ No permission to control video")
      return
    }

    await videoSyncService.pauseVideo(roomId, currentVideoTime, currentWatchingMovie.videoUrl, user, isHost)
  }

  const handleSeek = async (newTime) => {
    if (!user || !roomId || !currentWatchingMovie) return

    const hasPermission = isHost || videoControlPermission
    if (!hasPermission) {
      console.log("⚠️ No permission to control video")
      return
    }

    await videoSyncService.seekVideo(roomId, newTime, currentWatchingMovie.videoUrl, user, isHost)
  }

  const togglePictureInPicture = (movie) => {
    if (startPictureInPicture) {
      startPictureInPicture(
        movie || currentWatchingMovie,
        currentVideoTime,
        false, // Default to paused when entering PiP
        roomStatus,
        roomId,
        roomMembers,
      )
    }

    setIsWatching(false)
    setShowChat(false)
    setShowReactions(false)
    setShowRoomMembers(false)
  }

  useEffect(() => {
    // Check quiz lock status on mount and when user changes
    setQuizLocked(!GamificationManager.getInstance().canAttemptQuiz())
  }, [user])

  // Typing indicator function
  const handleTyping = async () => {
    if (!user || !roomId || roomStatus === "none") return

    await chatService.setTyping(roomId, user.uid, true)

    // Clear previous timeout
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current)
    }

    // Set typing to false after 3 seconds
    typingTimeoutRef.current = setTimeout(async () => {
      await chatService.setTyping(roomId, user.uid, false)
    }, 3000)
  }

  // Enhanced periodic sync for hosts to keep everyone in sync
  useEffect(() => {
    if (!isHost || !isWatching || !user || !roomId || !currentWatchingMovie) return

    const syncInterval = setInterval(async () => {
      const videoElement = document.querySelector("video")
      if (videoElement && !videoElement.paused) {
        // Broadcast current state every 5 seconds to keep everyone in sync
        await videoSyncService.broadcastCurrentState(
          roomId,
          videoElement.currentTime,
          !videoElement.paused,
          currentWatchingMovie.videoUrl,
          user,
          isHost,
        )
      }
    }, 5000) // Every 5 seconds

    return () => clearInterval(syncInterval)
  }, [isHost, isWatching, user, roomId, currentWatchingMovie])

  // Initial sync when joining a room with ongoing video
  useEffect(() => {
    const syncOnJoin = async () => {
      if (!user || !roomId || roomStatus === "none") return

      // Get current video state when joining
      const result = await videoSyncService.getCurrentVideoState(roomId)
      if (result.success && result.state) {
        const videoState = result.state
        console.log("🔄 Syncing to ongoing video on room join:", videoState)

        setSyncedVideoState(videoState)
        setCurrentVideoTime(videoState.currentTime || 0)

        if (videoState.videoUrl) {
          const foundMovie = featuredMovies.find((m) => m.videoUrl === videoState.videoUrl)
          if (foundMovie) {
            setCurrentWatchingMovie(foundMovie)
            setIsWatching(true)
          }
        }
      }
    }

    syncOnJoin()
  }, [user, roomId, roomStatus, featuredMovies])

  if (authLoading) {
    return (
      <div className="fixed inset-0 bg-gradient-to-br from-black via-gray-900 to-black flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-amber-500 mx-auto mb-4"></div>
          <p className="text-white text-lg">Loading...</p>
        </div>
      </div>
    )
  }

  if (!user) return null

  return (
    <>
      <div className="fixed inset-0 bg-black">
        <div className="absolute inset-0 bg-gradient-to-b from-gray-900/20 via-transparent to-black/60" />
      </div>

      {/* Show Enhanced Navbar only when not watching */}
      {!isWatching && (
        <Navbar
          user={user}
          roomStatus={roomStatus}
          roomId={roomId}
          roomMembers={roomMembers}
          isFullscreen={isFullscreen}
          onCreateRoom={() => setShowCreateDialog(true)}
          onJoinRoom={() => setShowJoinDialog(true)}
          onLeaveRoom={leaveRoom}
          onLogout={handleLogout}
        />
      )}

      <div className="relative w-full h-full min-h-screen text-white overflow-x-hidden flex">
        {/* Enhanced Sidebar */}
        <Sidebar
          user={user}
          roomStatus={roomStatus}
          roomMembers={roomMembers}
          isFullscreen={isFullscreen}
          isWatching={isWatching}
        />

        {/* Main content with enhanced styling */}
        <div className={`flex-1 ${!isFullscreen ? "" : ""} min-w-0 relative z-10`}>
          <div
            className={`transition-all duration-500 ease-in-out
              ${!isFullscreen ? "pt-16" : ""}
              ${(showChat || showRoomMembers) && isWatching && !isFullscreen ? "mr-80" : ""}
            `}
          >
            {/* Chat toggle button */}
            {!isFullscreen && (
              <motion.div
                initial={{ scale: 0, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ delay: 0.5, type: "spring", stiffness: 200 }}
                className="fixed bottom-6 right-6 z-50"
              >
                <Button
                  onClick={() => setShowChat(!showChat)}
                  className="rounded-full p-3 bg-amber-400 hover:bg-amber-600 text-white shadow-lg transition-all duration-300 hover:scale-110"
                >
                  <MessageSquareIcon className="w-5 h-5" />
                </Button>
              </motion.div>
            )}

            {!isWatching && (
              <div className="relative">
                {/* Featured Section with fixed height */}
                <FeaturedSection
                  movie={currentFeatured}
                  onStartWatching={startWatching}
                  onStartQuiz={startQuiz}
                  quizLocked={quizLocked}
                />

                {/* Movie Categories - positioned after the fixed height featured section */}
                <div className="relative z-20 bg-black">
                  <MovieCategories
                    onStartWatching={startWatching}
                    onStartQuiz={startQuiz}
                    quizLocked={quizLocked}
                    user={user}
                  />
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Video Player */}
        {isWatching && (
          <VideoPlayer
            key={currentWatchingMovie?.videoUrl || "video-player"}
            movie={currentWatchingMovie}
            user={user}
            isWatching={isWatching}
            isFullscreen={isFullscreen}
            roomStatus={roomStatus}
            roomId={roomId}
            roomMembers={roomMembers}
            recentReactions={recentReactions}
            onToggleFullscreen={toggleFullscreen}
            onExitVideo={exitVideo}
            onToggleChat={() => setShowChat(!showChat)}
            onToggleReactions={() => setShowReactions(!showReactions)}
            onToggleRoomMembers={() => setShowRoomMembers(!showRoomMembers)}
            onSendReaction={sendReaction}
            onTimeUpdate={updateVideoTime}
            showReactions={showReactions}
            showChat={showChat}
            showRoomMembers={showRoomMembers}
            wsRef={wsRef}
            // Video sync props
            // Firebase video sync props
            onPlay={handlePlay}
            onPause={handlePause}
            onSeek={handleSeek}
            syncedVideoState={syncedVideoState}
            currentVideoTime={syncedVideoState ? syncedVideoState.currentTime : currentVideoTime}
            playing={syncedVideoState ? syncedVideoState.isPlaying : undefined}
            // Permission props
            isHost={isHost}
            hasVideoPermission={videoControlPermission}
            canControlVideo={isHost || videoControlPermission}
            onTogglePiP={() => togglePictureInPicture()}
          />
        )}

        {/* Enhanced Chat sidebar */}
        <ChatSidebar
          show={showChat}
          onClose={() => setShowChat(false)}
          messages={chatMessages}
          onSendMessage={sendMessage}
          onTyping={handleTyping}
          typingUsers={typingUsers}
          roomStatus={roomStatus}
          roomMembers={roomMembers}
          user={user}
          polls={polls}
          roomId={roomId}
          onReactionSend={sendReaction}
        />

        {/* Enhanced Room Members Sidebar */}
        <RoomMembersSidebar
          show={showRoomMembers && roomStatus !== "none"}
          onClose={() => setShowRoomMembers(false)}
          members={roomMembers}
          currentUser={user}
          roomStatus={roomStatus}
          isHost={isHost}
          roomPermissions={roomPermissions}
          onGrantVideoControl={grantVideoControl}
          onRevokeVideoControl={revokeVideoControl}
          onOpenPermissionManager={() => setShowPermissionManager(true)}
        />

        {/* Enhanced Create Room Dialog */}
        <AnimatePresence>
          {showCreateDialog && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4"
            >
              <motion.div
                initial={{ scale: 0.8, opacity: 0, y: 50 }}
                animate={{ scale: 1, opacity: 1, y: 0 }}
                exit={{ scale: 0.8, opacity: 0, y: 50 }}
                transition={{ type: "spring", stiffness: 300, damping: 30 }}
                className="relative overflow-hidden bg-gradient-to-br from-gray-900 via-black to-gray-900 border border-amber-500/30 rounded-3xl max-w-md w-full shadow-2xl"
              >
                {/* Animated background */}
                <div className="absolute inset-0 bg-gradient-to-br from-amber-500/5 via-orange-500/5 to-amber-500/5" />
                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-amber-400 via-orange-500 to-amber-400" />

                <div className="relative p-8">
                  <div className="flex items-center space-x-3 mb-6">
                    <div className="p-3 rounded-full bg-gradient-to-r from-amber-500/20 to-orange-500/20">
                      <Crown className="w-6 h-6 text-amber-400" />
                    </div>
                    <h3 className="text-2xl font-bold text-white">Create Room</h3>
                  </div>

                  <p className="text-gray-300 mb-8 leading-relaxed">
                    Create a premium watch party room to enjoy movies with friends. You'll receive a unique room ID to
                    share.
                  </p>

                  <div className="flex space-x-4">
                    <Button
                      onClick={createRoom}
                      className="flex-1 h-12 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-black font-semibold rounded-xl transition-all duration-300 hover:scale-105 shadow-lg hover:shadow-amber-500/25"
                    >
                      <Crown className="w-5 h-5 mr-2" />
                      Create Room
                    </Button>
                    <Button
                      onClick={() => setShowCreateDialog(false)}
                      variant="outline"
                      className="flex-1 h-12 border-2 border-gray-600 hover:border-amber-500/50 text-black hover:bg-amber-500/10 rounded-xl transition-all duration-300"
                    >
                      Cancel
                    </Button>
                  </div>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Enhanced Join Room Dialog */}
        <AnimatePresence>
          {showJoinDialog && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4"
            >
              <motion.div
                initial={{ scale: 0.8, opacity: 0, y: 50 }}
                animate={{ scale: 1, opacity: 1, y: 0 }}
                exit={{ scale: 0.8, opacity: 0, y: 50 }}
                transition={{ type: "spring", stiffness: 300, damping: 30 }}
                className="relative overflow-hidden bg-gradient-to-br from-gray-900 via-black to-gray-900 border border-amber-500/30 rounded-3xl max-w-md w-full shadow-2xl"
              >
                {/* Animated background */}
                <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 via-purple-500/5 to-blue-500/5" />
                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-400 via-purple-500 to-blue-400" />

                <div className="relative p-8">
                  <div className="flex items-center space-x-3 mb-6">
                    <div className="p-3 rounded-full bg-gradient-to-r from-blue-500/20 to-purple-500/20">
                      <Users className="w-6 h-6 text-blue-400" />
                    </div>
                    <h3 className="text-2xl font-bold text-white">Join Room</h3>
                  </div>

                  <p className="text-gray-300 mb-6 leading-relaxed">
                    Enter the room ID shared by your friend to join their watch party:
                  </p>

                  <div className="relative mb-8">
                    <Input
                      value={joinRoomId}
                      onChange={(e) => setJoinRoomId(e.target.value.toUpperCase())}
                      placeholder="Enter Room ID"
                      className="h-12 bg-gray-800/50 border-2 border-gray-600 focus:border-blue-500 text-white text-center text-lg font-mono tracking-wider rounded-xl transition-all duration-300"
                    />
                    <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-blue-500/10 to-purple-500/10 pointer-events-none" />
                  </div>

                  <div className="flex space-x-4">
                    <Button
                      onClick={joinRoom}
                      className="flex-1 h-12 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-400 hover:to-purple-500 text-white font-semibold rounded-xl transition-all duration-300 hover:scale-105 shadow-lg hover:shadow-blue-500/25"
                    >
                      <Users className="w-5 h-5 mr-2" />
                      Join Room
                    </Button>
                    <Button
                      onClick={() => {
                        setShowJoinDialog(false)
                        setJoinRoomId("")
                      }}
                      variant="outline"
                      className="flex-1 h-12 border-2 border-gray-600 hover:border-blue-500/50 text-black hover:bg-blue-500/10 rounded-xl transition-all duration-300"
                    >
                      Cancel
                    </Button>
                  </div>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Permission Manager Modal */}
        <PermissionManager
          isOpen={showPermissionManager}
          onClose={() => setShowPermissionManager(false)}
          roomMembers={roomMembers}
          roomPermissions={roomPermissions}
          currentUser={user}
          isHost={isHost}
          onGrantPermission={grantVideoControl}
          onRevokePermission={revokeVideoControl}
          onToggleAnyoneCanControl={handleToggleAnyoneCanControl}
        />
      </div>
    </>
  )
}

export default HomePage

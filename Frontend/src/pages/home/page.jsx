"use client"

import { useState, useEffect, useRef } from "react"
import { useNavigate } from "react-router-dom"
import { WebSocketManager } from "@/lib/websocket"
import { Navbar } from "@/components/home/layout/navbar"
import { Sidebar } from "@/components/home/layout/sidebar"
import { FeaturedSection } from "@/components/home/content/featured-section"
import { MovieCategories } from "@/components/home/content/movie-categories"
import { VideoPlayer } from "@/components/home/video/video-player"
import { ChatSidebar } from "@/components/home/chat/chat-sidebar"
import { RoomMembersSidebar } from "@/components/home/room/room-members-sidebar"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { MessageSquareIcon, Users, Crown } from "lucide-react"
import { AnimatePresence, motion } from "framer-motion"
import { GamificationManager } from "@/lib/gamification"
import { ViewingHistoryManager } from "@/lib/viewing-history"
import { featuredMovies } from "../../components/home/content/featured-movies"

const HomePage = ({ startPictureInPicture }) => {
  const [user, setUser] = useState(null)
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

  // Room functionality state
  const [roomStatus, setRoomStatus] = useState("none")
  const [roomId, setRoomId] = useState("")
  const [joinRoomId, setJoinRoomId] = useState("")
  const [showJoinDialog, setShowJoinDialog] = useState(false)
  const [showCreateDialog, setShowCreateDialog] = useState(false)
  const [roomMembers, setRoomMembers] = useState([])

  const wsRef = useRef(null)
  const navigate = useNavigate()

  // Initialize ViewingHistoryManager
  const viewingHistoryManager = ViewingHistoryManager.getInstance()

  const currentFeatured = featuredMovies[Math.floor(Math.random() * featuredMovies.length)]

  // Initialize user and WebSocket
  useEffect(() => {
    const userData = localStorage.getItem("user")
    if (!userData) {
      navigate("/signin")
      return
    }
    const parsedUser = JSON.parse(userData)
    setUser(parsedUser)

    // Only create the manager once
    if (!wsRef.current) {
      wsRef.current = new WebSocketManager(parsedUser.email, parsedUser.name)
    }

    return () => {
      if (wsRef.current) wsRef.current.disconnect()
    }
  }, [navigate])

  // Register listeners when roomId changes and connect
  useEffect(() => {
    if (!user || !roomId || !wsRef.current) return

    // Prevent multiple connects to the same room
    if (wsRef.current.roomId !== roomId || !wsRef.current.isConnected) {
      wsRef.current.connect(roomId)
    }

    // Fetch current video state on join
    const fetchVideoState = async () => {
      const { db } = await import("@/firebase/db")
      const { doc, getDoc } = await import("firebase/firestore")
      const videoStateRef = doc(db, "rooms", roomId, "sync", "videoState")
      const snap = await getDoc(videoStateRef)
      if (snap.exists()) {
        const data = snap.data()
        setCurrentVideoTime(data.currentTime)
        setIsWatching(true)
        setCurrentWatchingMovie((prev) => {
          if (!prev || prev.videoUrl !== data.videoUrl) {
            const found = featuredMovies.find((m) => m.videoUrl === data.videoUrl)
            return found || prev
          }
          return prev
        })
      }
    }
    fetchVideoState()

    wsRef.current.on("user_joined", (data) => {
      setChatMessages((prev) => [
        ...prev,
        {
          id: `system-joined-${data.userId}-${Date.now()}`,
          user: "System",
          text: `${data.userName} joined the room`,
          timestamp: new Date().toLocaleTimeString(),
          isSystem: true,
        },
      ])
    })

    wsRef.current.on("user_left", (data) => {
      setChatMessages((prev) => [
        ...prev,
        {
          id: `system-left-${data.userId}-${Date.now()}`,
          user: "System",
          text: `${data.userName} left the room`,
          timestamp: new Date().toLocaleTimeString(),
          isSystem: true,
        },
      ])
    })

    wsRef.current.on("room_members_update", (data) => {
      setRoomMembers(data.members || [])
    })

    wsRef.current.on("chat_message", (data) => {
      setChatMessages((prev) => [
        ...prev,
        {
          id: data.id || `${data.userName}-${data.timestamp}`, // Use Firestore doc id if available
          user: data.userName,
          text: data.message,
          timestamp: new Date(data.timestamp).toLocaleTimeString(),
        },
      ])
    })

    wsRef.current.on("reaction", (data) => {
      const newReaction = {
        id: `${data.userName}-${data.timestamp}`,
        emoji: data.emoji,
        user: data.userName,
        timestamp: data.timestamp,
      }
      setRecentReactions((prev) => [...prev, newReaction])
      setTimeout(() => {
        setRecentReactions((prev) => prev.filter((r) => r.id !== newReaction.id))
      }, 4000)
    })

    return () => {
      // Optionally remove listeners here if you add an off() method
    }
  }, [user, roomId, featuredMovies])

  // Add: state for video sync
  const [syncedVideoState, setSyncedVideoState] = useState(null)

  // Listen for video state updates from Firestore and sync local player
  useEffect(() => {
    if (!wsRef.current) return

    wsRef.current.on("video_state_update", (data) => {
      setSyncedVideoState(data)
      setIsWatching(true)
      setCurrentWatchingMovie((prev) => {
        if (!prev || prev.videoUrl !== data.videoUrl) {
          const found = featuredMovies.find((m) => m.videoUrl === data.videoUrl)
          return found || prev
        }
        return prev
      })
    })
  }, [wsRef, featuredMovies])

  // Handle fullscreen changes
  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement)
    }
    document.addEventListener("fullscreenchange", handleFullscreenChange)
    return () => document.removeEventListener("fullscreenchange", handleFullscreenChange)
  }, [])

  const handleLogout = () => {
    if (wsRef.current) {
      wsRef.current.disconnect()
    }
    localStorage.removeItem("user")
    sessionStorage.removeItem("pipState")
    navigate("/")
  }

  const createRoom = () => {
    const newRoomId = Math.random().toString(36).substring(2, 8).toUpperCase()
    setRoomId(newRoomId)
    setRoomStatus("host")
    setShowCreateDialog(false)
    if (wsRef.current) {
      wsRef.current.connect(newRoomId)
    }
  }

  const joinRoom = () => {
    if (joinRoomId.trim()) {
      setRoomId(joinRoomId)
      setRoomStatus("member")
      setShowJoinDialog(false)
      setJoinRoomId("")
      if (wsRef.current) {
        wsRef.current.connect(joinRoomId)
      }
    }
  }

  const leaveRoom = () => {
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
    console.log("📤 Sending message:", message)

    // Do NOT optimistically update chatMessages here!
    // Only send to Firestore, let the listener update the UI

    if (wsRef.current && roomStatus !== "none") {
      wsRef.current.sendChatMessage(message)
    }

    if (message.includes("@Tree.io")) {
      console.log("🤖 Tree.io mentioned, processing...")
      console.log("🕐 Current video time:", currentVideoTime)
      console.log("📊 Video analyzed:", videoAnalyzed)

      const typingMessage = {
        id: Date.now() + 1,
        user: "Tree.io",
        text: "Tree.io is thinking...",
        timestamp: new Date().toLocaleTimeString(),
        isTyping: true,
      }

      setChatMessages((prev) => [...prev, typingMessage])
      console.log("💭 Typing indicator added")

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

        setChatMessages((prev) => prev.filter((msg) => !msg.isTyping))

        if (response.ok) {
          const data = await response.json()
          console.log("✅ API Response data:", data)

          const treeIoMessage = {
            id: Date.now() + 2,
            user: "Tree.io",
            text: data.response,
            timestamp: new Date().toLocaleTimeString(),
            isAI: true,
          }

          setChatMessages((prev) => [...prev, treeIoMessage])
          console.log("🎉 Tree.io response added to chat")

          // Send Tree.io response via WebSocket if in room
          if (wsRef.current && roomStatus !== "none") {
            wsRef.current.sendChatMessage(`Tree.io: ${data.response}`)
          }
        } else {
          console.error("❌ API Error - Status:", response.status)
          const errorText = await response.text()
          console.error("❌ API Error - Response:", errorText)

          setChatMessages((prev) => [
            ...prev,
            {
              id: Date.now() + 2,
              user: "Tree.io",
              text: "Sorry, I'm having trouble processing your request right now. Please try again later.",
              timestamp: new Date().toLocaleTimeString(),
              isAI: true,
            },
          ])
        }
      } catch (error) {
        console.error("💥 Network Error calling Tree.io API:", error)
        setChatMessages((prev) => [
          ...prev,
          {
            id: Date.now() + 2,
            user: "Tree.io",
            text: "Sorry, I'm currently unavailable. Please try again later.",
            timestamp: new Date().toLocaleTimeString(),
            isAI: true,
          },
        ])
      }
    }
  }

  const sendReaction = (reaction) => {
    const newReaction = {
      id: Date.now(),
      emoji: reaction.emoji,
      user: user?.name || "User",
      timestamp: Date.now(),
    }
    setRecentReactions((prev) => [...prev, newReaction])
    setTimeout(() => {
      setRecentReactions((prev) => prev.filter((r) => r.id !== newReaction.id))
    }, 4000)

    setShowReactions(false)
    if (wsRef.current && roomStatus !== "none") {
      wsRef.current.sendReaction(reaction.emoji)
    }
  }

  // Handler to sync play
  const handlePlay = (currentTime, videoUrl) => {
    if (wsRef.current && roomStatus !== "none") {
      wsRef.current.playVideo(currentTime, videoUrl)
    }
  }

  // Handler to sync pause
  const handlePause = (currentTime, videoUrl) => {
    if (wsRef.current && roomStatus !== "none") {
      wsRef.current.pauseVideo(currentTime, videoUrl)
    }
  }

  // Handler to sync seek
  const handleSeek = (currentTime, videoUrl) => {
    if (wsRef.current && roomStatus !== "none") {
      wsRef.current.seekVideo(currentTime, videoUrl)
    }
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

  if (!user) return null

  return (
    <>
      {/* Enhanced Background with Gradient Overlay */}
      <div className="fixed inset-0 bg-gradient-to-br from-black via-gray-900 to-black">
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/40" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-amber-900/20 via-transparent to-transparent" />
      </div>

      {/* Show Enhanced Navbar only when not watching */}
      {!isWatching && (
        <Navbar
          user={user}
          roomStatus={roomStatus}
          roomId={roomId}
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
            {/* Enhanced Chat toggle button */}
            {!isFullscreen && (
              <motion.div
                initial={{ scale: 0, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ delay: 0.5, type: "spring", stiffness: 200 }}
                className="fixed bottom-6 right-6 z-50"
              >
                <Button
                  onClick={() => setShowChat(!showChat)}
                  className="relative group rounded-full p-4 shadow-2xl bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-black border-2 border-amber-400/50 hover:border-amber-300 transition-all duration-300 hover:scale-110"
                >
                  <MessageSquareIcon className="w-6 h-6" />
                  <div className="absolute inset-0 rounded-full bg-gradient-to-r from-amber-400/20 to-orange-400/20 blur-xl group-hover:blur-2xl transition-all duration-300" />
                </Button>
              </motion.div>
            )}

            {!isWatching && (
              <div className="relative">
                {/* Enhanced content grid with better spacing */}
                <div className="grid grid-cols-1 gap-8 px-6 py-8 md:px-8 lg:px-12 max-w-none">
                  {/* Room Status Banner */}
                  {roomStatus !== "none" && (
                    <motion.div
                      initial={{ y: -50, opacity: 0 }}
                      animate={{ y: 0, opacity: 1 }}
                      className="relative ml-18 overflow-hidden rounded-2xl bg-gradient-to-r from-amber-500/10 via-orange-500/10 to-amber-500/10 border border-amber-500/30 backdrop-blur-sm"
                    >
                      <div className="absolute inset-0 bg-gradient-to-r from-amber-500/5 to-orange-500/5" />
                      <div className="relative p-6 flex items-center justify-between">
                        <div className="flex items-center space-x-4">
                          {roomStatus === "host" ? (
                            <Crown className="w-8 h-8 text-amber-400" />
                          ) : (
                            <Users className="w-8 h-8 text-amber-400" />
                          )}
                          <div>
                            <h3 className="text-xl font-bold text-white">
                              {roomStatus === "host" ? "Hosting Room" : "In Room"}
                            </h3>
                            <p className="text-amber-200">
                              Room ID: <span className="font-mono text-amber-400">{roomId}</span>
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center space-x-3">
                          <div className="flex items-center space-x-2 text-amber-200">
                            <Users className="w-5 h-5" />
                            <span className="font-semibold">{roomMembers.length}</span>
                          </div>
                          <div className="w-3 h-3 bg-green-400 rounded-full animate-pulse" />
                        </div>
                      </div>
                    </motion.div>
                  )}

                  <FeaturedSection
                    movie={currentFeatured}
                    onStartWatching={startWatching}
                    onStartQuiz={startQuiz}
                    quizLocked={quizLocked}
                  />
                  <MovieCategories onStartWatching={startWatching} onStartQuiz={startQuiz} quizLocked={quizLocked} />
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
            wsRef={wsRef}
            // Video sync props
            onPlay={handlePlay}
            onPause={handlePause}
            onSeek={handleSeek}
            currentVideoTime={syncedVideoState ? syncedVideoState.currentTime : currentVideoTime}
            playing={syncedVideoState ? syncedVideoState.playing : undefined}
            onTogglePiP={() => togglePictureInPicture()}
          />
        )}

        {/* Enhanced Chat sidebar */}
        <ChatSidebar
          show={showChat}
          onClose={() => setShowChat(false)}
          messages={chatMessages}
          onSendMessage={sendMessage}
          roomStatus={roomStatus}
          roomMembers={roomMembers}
          user={user}
        />

        {/* Enhanced Room Members Sidebar */}
        <RoomMembersSidebar
          show={showRoomMembers && roomStatus !== "none"}
          onClose={() => setShowRoomMembers(false)}
          roomMembers={roomMembers}
          user={user}
          roomStatus={roomStatus}
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
      </div>
    </>
  )
}

export default HomePage

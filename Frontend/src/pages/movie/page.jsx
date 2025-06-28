"use client"

import { useState, useRef, useEffect } from "react"
import { useParams, useNavigate } from "react-router-dom"
import { WebSocketManager } from "@/lib/websocket"
import { Navbar } from "@/components/home/layout/navbar"
import { Sidebar } from "@/components/home/layout/sidebar"
import { VideoPlayer } from "@/components/home/video/video-player"
import { ChatSidebar } from "@/components/home/chat/chat-sidebar"
import { RoomMembersSidebar } from "@/components/home/room/room-members-sidebar"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { MessageSquareIcon } from "lucide-react"
import { AnimatePresence, motion } from "framer-motion"
import { movieCategories } from "@/components/home/content/movie-data"

const MoviePage = ({ startPictureInPicture }) => {
  const { movieId } = useParams()
  const navigate = useNavigate()

  // Get movie data based on movieId slug
  const getMovieFromSlug = (slug) => {
    const allMovies = movieCategories.flatMap((cat) => cat.movies)
    return allMovies.find(
      (movie) =>
        movie.title
          .toLowerCase()
          .replace(/\s+/g, "-")
          .replace(/[^\w-]/g, "") === slug,
    )
  }

  const currentMovie = movieId ? getMovieFromSlug(movieId) : null

  const [user, setUser] = useState(null)
  const [isWatching, setIsWatching] = useState(true) // Auto start watching
  const [currentWatchingMovie, setCurrentWatchingMovie] = useState(null)
  const [isFullscreen, setIsFullscreen] = useState(false)
  const [chatMessages, setChatMessages] = useState([])
  const [showChat, setShowChat] = useState(false)
  const [showReactions, setShowReactions] = useState(false)
  const [showRoomMembers, setShowRoomMembers] = useState(false)
  const [recentReactions, setRecentReactions] = useState([])
  const [currentVideoTime, setCurrentVideoTime] = useState(0)
  const [isVideoPlaying, setIsVideoPlaying] = useState(false)

  // Room functionality state
  const [roomStatus, setRoomStatus] = useState("none")
  const [roomId, setRoomId] = useState("")
  const [joinRoomId, setJoinRoomId] = useState("")
  const [showJoinDialog, setShowJoinDialog] = useState(false)
  const [showCreateDialog, setShowCreateDialog] = useState(false)
  const [roomMembers, setRoomMembers] = useState([])

  const wsRef = useRef(null)
  const videoPlayerRef = useRef(null)

  // Check for returning from PiP
  useEffect(() => {
    const pipState = sessionStorage.getItem("pipState")
    if (pipState) {
      try {
        const pipData = JSON.parse(pipState)
        if (pipData.movie && pipData.movie.movieId === movieId) {
          // Restore video state from PiP
          setCurrentVideoTime(pipData.currentTime || 0)
          setIsVideoPlaying(pipData.playing || false)

          // Restore room state if it exists
          if (pipData.roomStatus && pipData.roomStatus !== "none") {
            setRoomStatus(pipData.roomStatus)
            setRoomId(pipData.roomId)
            setRoomMembers(pipData.roomMembers || [])
          }

          // Clear the PiP state
          sessionStorage.removeItem("pipState")
        }
      } catch (error) {
        console.error("Error parsing PiP state:", error)
        sessionStorage.removeItem("pipState")
      }
    }
  }, [movieId])

  // Set up movie data with the specific video URL
  useEffect(() => {
    if (movieId && !currentMovie) {
      navigate("/home")
      return
    }

    if (currentMovie) {
      const movieWithId = {
        movieId: movieId,
        title: currentMovie.title,
        description: currentMovie.description || "A great movie to watch",
        rating: currentMovie.rating || "8.0",
        year: "2024",
        genre: "Action, Drama",
        mood: currentMovie.mood || ["thrilling"],
        image: currentMovie.image || "/placeholder.svg",
        videoUrl: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4",
      }
      setCurrentWatchingMovie(movieWithId)
    }
  }, [movieId, currentMovie, navigate])

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
          id: data.id || `${data.userName}-${data.timestamp}`,
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
  }, [user, roomId])

  // Add: state for video sync
  const [syncedVideoState, setSyncedVideoState] = useState(null)

  // Listen for video state updates from Firestore and sync local player
  useEffect(() => {
    if (!wsRef.current) return

    wsRef.current.on("video_state_update", (data) => {
      setSyncedVideoState(data)
      setCurrentVideoTime(data.currentTime)
    })
  }, [wsRef])

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
    navigate("/home")
  }

  const updateVideoTime = (time) => {
    setCurrentVideoTime(time)
  }

  const updateVideoPlayingState = (playing) => {
    setIsVideoPlaying(playing)
  }

  const sendMessage = async (message) => {
    console.log("📤 Sending message:", message)

    if (wsRef.current && roomStatus !== "none") {
      wsRef.current.sendChatMessage(message)
    }

    if (message.includes("@Tree.io")) {
      console.log("🤖 Tree.io mentioned, processing...")
      console.log("🕐 Current video time:", currentVideoTime)

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
            movie_title: currentWatchingMovie?.title || "Current Movie",
            movie_context: currentWatchingMovie?.description || "",
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
    setIsVideoPlaying(true)
    if (wsRef.current && roomStatus !== "none") {
      wsRef.current.playVideo(currentTime, videoUrl)
    }
  }

  // Handler to sync pause
  const handlePause = (currentTime, videoUrl) => {
    setIsVideoPlaying(false)
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

  const togglePictureInPicture = () => {
    if (currentWatchingMovie && startPictureInPicture) {
      startPictureInPicture(currentWatchingMovie, currentVideoTime, isVideoPlaying, roomStatus, roomId, roomMembers)

      // Navigate to home
      navigate("/home")
    }
  }

  if (!user || !currentWatchingMovie) return null

  return (
    <>
      {/* Show Navbar only when not watching */}
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
      <div className="relative w-full h-full min-h-screen bg-gray-950 text-white overflow-x-hidden flex">
        {/* Sidebar */}
        <Sidebar
          user={user}
          roomStatus={roomStatus}
          roomMembers={roomMembers}
          isFullscreen={isFullscreen}
          isWatching={isWatching}
        />

        {/* Main content */}
        <div className={`flex-1 ${!isFullscreen ? "ml-16" : ""} min-w-0`}>
          <div
            className={`transition-all duration-300
              ${!isFullscreen ? "pt-20" : ""}
              ${(showChat || showRoomMembers) && isWatching && !isFullscreen ? "mr-80" : ""}
            `}
          >
            {/* Chat toggle button */}
            {!isFullscreen && (
              <Button
                onClick={() => setShowChat(!showChat)}
                variant="secondary"
                className="fixed bottom-4 text-black right-4 z-50 rounded-full p-3 shadow-lg"
              >
                <MessageSquareIcon className="w-5 h-5" />
              </Button>
            )}
          </div>
        </div>

        {/* Video Player */}
        {isWatching && (
          <VideoPlayer
            ref={videoPlayerRef}
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
            onPlayingStateChange={updateVideoPlayingState}
            showReactions={showReactions}
            // Video sync props
            onPlay={handlePlay}
            onPause={handlePause}
            onSeek={handleSeek}
            currentVideoTime={syncedVideoState ? syncedVideoState.currentTime : currentVideoTime}
            playing={syncedVideoState ? syncedVideoState.playing : isVideoPlaying}
            onTogglePiP={togglePictureInPicture}
            initialPlaying={isVideoPlaying}
            initialCurrentTime={currentVideoTime}
          />
        )}

        {/* Chat sidebar */}
        <ChatSidebar
          show={showChat}
          onClose={() => setShowChat(false)}
          messages={chatMessages}
          onSendMessage={sendMessage}
          roomStatus={roomStatus}
          roomMembers={roomMembers}
          user={user}
        />

        {/* Room Members Sidebar */}
        <RoomMembersSidebar
          show={showRoomMembers && roomStatus !== "none"}
          onClose={() => setShowRoomMembers(false)}
          roomMembers={roomMembers}
          user={user}
          roomStatus={roomStatus}
        />

        {/* Create Room Dialog */}
        <AnimatePresence>
          {showCreateDialog && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/50 flex items-center justify-center z-50"
            >
              <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
                className="bg-gray-900 p-6 rounded-lg max-w-md w-full mx-4"
              >
                <h3 className="text-xl font-bold mb-4 text-white">Create Room</h3>
                <p className="text-gray-300 mb-6">
                  Create a room to watch with friends. You'll get a unique room ID to share.
                </p>
                <div className="flex space-x-4">
                  <Button
                    onClick={createRoom}
                    className="flex-1 bg-gradient-to-r from-yellow-400 to-orange-500 text-black hover:from-yellow-500 hover:to-orange-600"
                  >
                    Create Room
                  </Button>
                  <Button
                    onClick={() => setShowCreateDialog(false)}
                    variant="outline"
                    className="flex-1 border-gray-600 text-white hover:bg-gray-800"
                  >
                    Cancel
                  </Button>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Join Room Dialog */}
        <AnimatePresence>
          {showJoinDialog && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/50 flex items-center justify-center z-50"
            >
              <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
                className="bg-gray-900 p-6 rounded-lg max-w-md w-full mx-4"
              >
                <h3 className="text-xl font-bold mb-4 text-white">Join Room</h3>
                <p className="text-gray-300 mb-4">Enter the room ID shared by your friend:</p>
                <Input
                  value={joinRoomId}
                  onChange={(e) => setJoinRoomId(e.target.value.toUpperCase())}
                  placeholder="Enter Room ID"
                  className="mb-6 bg-gray-800 border-gray-600 text-white"
                />
                <div className="flex space-x-4">
                  <Button
                    onClick={joinRoom}
                    className="flex-1 bg-gradient-to-r from-blue-400 to-blue-600 text-white hover:from-blue-500 hover:to-blue-700"
                  >
                    Join Room
                  </Button>
                  <Button
                    onClick={() => {
                      setShowJoinDialog(false)
                      setJoinRoomId("")
                    }}
                    variant="outline"
                    className="flex-1 border-gray-600 text-white hover:bg-gray-800"
                  >
                    Cancel
                  </Button>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </>
  )
}

export default MoviePage

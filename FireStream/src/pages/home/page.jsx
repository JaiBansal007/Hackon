"use client"

import { useState, useEffect, useRef } from "react"
import { useNavigate } from "react-router-dom"
import { initializeApp } from "firebase/app"
import { getDatabase, ref, set, push, onValue, remove, off, get } from "firebase/database"
import { motion, AnimatePresence } from "framer-motion"
import { FeaturedSection } from "@/components/home/content/featured-section"
import { MovieCategories } from "@/components/home/content/movie-categories"
import { ChatSidebar } from "@/components/home/chat/chat-sidebar"
import { VideoPlayer } from "@/components/home/video/video-player"
import { RoomMembersSidebar } from "@/components/home/room/room-members-sidebar"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { MessageSquareIcon } from "lucide-react"
import { Navbar } from "../../components/home/layout/navbar"
import { Sidebar } from "@/components/home/layout/sidebar"

// --- Firebase config and initialization ---
const firebaseConfig = {
  apiKey: "AIzaSyBfU99fHdfCGsmO0uXTnQKLVX-2f5IrRd0",
  authDomain: "firestream-e8465.firebaseapp.com",
  databaseURL: "https://firestream-e8465-default-rtdb.firebaseio.com",
  projectId: "firestream-e8465",
  storageBucket: "firestream-e8465.firebasestorage.app",
  messagingSenderId: "869857658241",
  appId: "1:869857658241:web:6bbffa799a37f54e9e9480",
  measurementId: "G-6RXNYL8D6H"
}
const app = initializeApp(firebaseConfig)
const db = getDatabase(app)

// --- WebSocket-like manager ---
function useFirebaseRoom(user, roomId, setRoomMembers, setChatMessages) {
  const listenersRef = useRef([])

  useEffect(() => {
    if (!user || !roomId) return

    // 1. Create room meta if not exists
    const metaRef = ref(db, `rooms/${roomId}/meta`)
    set(metaRef, {
      createdAt: Date.now(),
      hostId: user.email,
      hostName: user.name,
    })

    // 2. Add user to members
    const memberRef = ref(db, `rooms/${roomId}/members/${user.email.replace(/\W/g, "_")}`)
    set(memberRef, {
      userId: user.email,
      userName: user.name,
      joinedAt: Date.now(),
    })

    // 3. Listen for members
    const membersRef = ref(db, `rooms/${roomId}/members`)
    const membersListener = onValue(membersRef, (snap) => {
      const members = snap.val() ? Object.values(snap.val()) : []
      setRoomMembers(members)
    })
    listenersRef.current.push({ ref: membersRef, listener: membersListener })

    // 4. Listen for chat messages
    const chatRef = ref(db, `rooms/${roomId}/messages`)
    const chatListener = onValue(chatRef, (snap) => {
      const messages = snap.val() ? Object.values(snap.val()) : []
      setChatMessages(messages)
    })
    listenersRef.current.push({ ref: chatRef, listener: chatListener })

    // Cleanup on unmount/leave
    return () => {
      listenersRef.current.forEach(({ ref: r, listener: l }) => off(r, "value", l))
      listenersRef.current = []
      remove(memberRef)
    }
  }, [user, roomId, setRoomMembers, setChatMessages])

  // Send chat message
  const sendChatMessage = (message) => {
    if (!user || !roomId) return
    const chatRef = ref(db, `rooms/${roomId}/messages`)
    push(chatRef, {
      userId: user.email,
      userName: user.name,
      message,
      timestamp: Date.now(),
    })
  }

  return { sendChatMessage }
}

const HomePage = () => {
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
  
  // Room functionality state
  const [roomStatus, setRoomStatus] = useState("none")
  const [roomId, setRoomId] = useState("")
  const [joinRoomId, setJoinRoomId] = useState("")
  const [showJoinDialog, setShowJoinDialog] = useState(false)
  const [showCreateDialog, setShowCreateDialog] = useState(false)
  const [roomMembers, setRoomMembers] = useState([])
  
  const wsRef = useRef(null)
  const navigate = useNavigate()

  const featuredMovies = [
    {
      movieId: "the-dark-knight",
      title: "The Dark Knight",
      description:
        "When the menace known as the Joker wreaks havoc and chaos on the people of Gotham...",
      rating: "9.0/10",
      year: "2008",
      genre: "Action, Crime, Drama",
      mood: ["intense", "dark", "thrilling"],
      image: "https://image.tmdb.org/t/p/w1280/qJ2tW6WMUDux911r6m7haRef0WH.jpg",
      videoUrl: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4",
    },
    {
      movieId: "inception",
      title: "Inception",
      description:
        "A thief who steals corporate secrets through dream-sharing technology...",
      rating: "8.8/10",
      year: "2010",
      genre: "Action, Sci-Fi, Thriller",
      mood: ["mind-bending", "complex", "thrilling"],
      image: "https://image.tmdb.org/t/p/w1280/edv5CZvWj09upOsy2Y6mWp9AHt6.jpg",
      videoUrl: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4",
    },
    {
      movieId: "interstellar",
      title: "Interstellar",
      description:
        "A team of explorers travel through a wormhole in space to ensure humanity's survival.",
      rating: "8.6/10",
      year: "2014",
      genre: "Adventure, Drama, Sci-Fi",
      mood: ["thought-provoking", "epic", "emotional"],
      image: "https://image.tmdb.org/t/p/w1280/gEU2QniE6E77NI6lCU6mWp9AHt6.jpg",
      videoUrl: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4",
    },
    {
      title: "The Matrix",
      description:
        "A computer programmer is led to fight an underground war against powerful computers who have constructed his entire reality with a system called the Matrix.",
      rating: "8.7/10",
      year: "1999",
      genre: "Action, Sci-Fi",
      mood: ["revolutionary", "mind-bending", "action-packed"],
      image: "https://image.tmdb.org/t/p/w1280/f89U3ADr1oiB1s9GkdPOEpXUk5H.jpg",
      videoUrl: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4",
    },
    {
      title: "Pulp Fiction",
      description:
        "The lives of two mob hitmen, a boxer, a gangster and his wife, and a pair of diner bandits intertwine in four tales of violence and redemption.",
      rating: "8.9/10",
      year: "1994",
      genre: "Crime, Drama",
      mood: ["quirky", "violent", "stylish"],
      image: "https://image.tmdb.org/t/p/w1280/d5iIlFn5s0ImszYzBPb8JPIf3XD.jpg",
      videoUrl: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4",
    },
  ]

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

    wsRef.current.connect(roomId)

    wsRef.current.on("user_joined", (data) => {
      setChatMessages((prev) => [
        ...prev,
        {
          id: Date.now(),
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
          id: Date.now(),
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
          id: Date.now(),
          user: data.userName,
          text: data.message,
          timestamp: new Date(data.timestamp).toLocaleTimeString(),
        },
      ])
    })

    wsRef.current.on("reaction", (data) => {
      const newReaction = {
        id: Date.now(),
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

  // Handle fullscreen changes
  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement)
    }
    document.addEventListener("fullscreenchange", handleFullscreenChange)
    return () => document.removeEventListener("fullscreenchange", handleFullscreenChange)
  }, [])

  // Analyze video when starting to watch
  const analyzeCurrentVideo = async (movie) => {
    if (!movie.videoUrl) {
      console.log("No video URL provided, skipping analysis")
      setVideoAnalyzed(true)
      return
    }

    try {
      console.log("🎬 Starting video analysis for:", movie.title)

      setChatMessages((prev) => [
        ...prev,
        {
          id: Date.now(),
          user: "System",
          text: `🎬 Analyzing "${movie.title}" for Tree.io insights...`,
          timestamp: new Date().toLocaleTimeString(),
          isSystem: true,
        },
      ])

      const response = await fetch("http://localhost:8000/api/video/analyze", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          video_url: movie.videoUrl,
          movie_title: movie.title,
        }),
      })

      if (response.ok) {
        const data = await response.json()
        console.log("✅ Video analysis completed:", data)
        setVideoAnalyzed(true)

        setChatMessages((prev) => [
          ...prev,
          {
            id: Date.now(),
            user: "System",
            text: `✅ Video analysis completed! Tree.io can now provide timestamp-based insights for "${movie.title}".`,
            timestamp: new Date().toLocaleTimeString(),
            isSystem: true,
          },
        ])
      } else {
        console.error("❌ Video analysis failed:", response.status)
        setVideoAnalyzed(true)

        setChatMessages((prev) => [
          ...prev,
          {
            id: Date.now(),
            user: "System",
            text: `⚠️ Video analysis service unavailable. Tree.io will use movie knowledge instead.`,
            timestamp: new Date().toLocaleTimeString(),
            isSystem: true,
          },
        ])
      }
    } catch (error) {
      console.error("💥 Error analyzing video:", error)
      setVideoAnalyzed(true)

      setChatMessages((prev) => [
        ...prev,
        {
          id: Date.now(),
          user: "System",
          text: `⚠️ Video analysis failed. Tree.io will use movie knowledge instead.`,
          timestamp: new Date().toLocaleTimeString(),
          isSystem: true,
        },
      ])
    }
  }

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
    setCurrentWatchingMovie(movie)
    setIsWatching(true)
    setVideoAnalyzed(false)
    setCurrentVideoTime(0)
    analyzeCurrentVideo(movie)
  }

  const updateVideoTime = (time) => {
    setCurrentVideoTime(time)
  }

  const sendMessage = async (message) => {
    console.log("📤 Sending message:", message)

    const userMessage = {
      id: Date.now(),
      user: user?.name || "User",
      text: message,
      timestamp: new Date().toLocaleTimeString(),
    }

    setChatMessages((prev) => [...prev, userMessage])
    console.log("✅ User message added to chat")

    // Send via WebSocket if in room
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

  if (!user) return null

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
                className="fixed bottom-4 right-4 z-50 rounded-full p-3 shadow-lg"
              >
                <MessageSquareIcon className="w-5 h-5" />
              </Button>
            )}

            {!isWatching && (
              <div className="grid grid-cols-1 gap-10 px-4 py-8 md:px-12 lg:px-24">
                <FeaturedSection movie={currentFeatured} onStartWatching={startWatching} />
                <MovieCategories onStartWatching={startWatching} />
              </div>
            )}
          </div>
        </div>

        {/* Video Player */}
        {isWatching && (
          <VideoPlayer
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

export default HomePage
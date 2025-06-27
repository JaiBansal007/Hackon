"use client"

import { useState, useEffect, useRef } from "react"
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom"
import LandingPage from "./pages/page"
import SignInPage from "./pages/signin/page"
import SignUpPage from "./pages/signup/page"
import HomePage from "./pages/home/page"
import MoviePage from "./pages/movie/page"
import QuizPage from "./pages/quiz/page"
import RedeemPage from "./pages/redeem/page"
import ProfilePage from "./pages/profile/page"
import MovieInfoPage from "./pages/info/page"
import { PictureInPicturePlayer } from "./components/home/video/picture-in-picture-player"
import { WebSocketManager } from "./lib/websocket"

function App() {
  const [user, setUser] = useState(true)

  // Global Picture-in-Picture state
  const [showPiP, setShowPiP] = useState(false)
  const [pipMovie, setPipMovie] = useState(null)
  const [pipCurrentTime, setPipCurrentTime] = useState(0)
  const [pipPlaying, setPipPlaying] = useState(false)
  const [pipRoomStatus, setPipRoomStatus] = useState("none")
  const [pipRoomId, setPipRoomId] = useState("")
  const [pipRoomMembers, setPipRoomMembers] = useState([])

  const wsRef = useRef(null)

  useEffect(() => {
    const userData = localStorage.getItem("user")
    if (userData) {
      setUser(JSON.parse(userData))
    }
  }, [])

  // Check for PiP state on app mount
  useEffect(() => {
    const pipState = sessionStorage.getItem("pipState")
    if (pipState) {
      try {
        const pipData = JSON.parse(pipState)
        // Check if the data is recent (within last 5 minutes)
        if (Date.now() - pipData.timestamp < 5 * 60 * 1000) {
          setShowPiP(true)
          setPipMovie(pipData.movie)
          setPipCurrentTime(pipData.currentTime || 0)
          setPipPlaying(pipData.playing || false)
          setPipRoomStatus(pipData.roomStatus || "none")
          setPipRoomId(pipData.roomId || "")
          setPipRoomMembers(pipData.roomMembers || [])
        } else {
          // Clear old PiP state
          sessionStorage.removeItem("pipState")
        }
      } catch (error) {
        console.error("Error parsing PiP state:", error)
        sessionStorage.removeItem("pipState")
      }
    }
  }, [])

  // Initialize WebSocket for PiP if needed
  useEffect(() => {
    if (showPiP && pipRoomStatus !== "none" && user && !wsRef.current) {
      const userData = typeof user === "object" ? user : JSON.parse(localStorage.getItem("user") || "{}")
      wsRef.current = new WebSocketManager(userData.email, userData.name)

      if (pipRoomId) {
        wsRef.current.connect(pipRoomId)
      }
    }

    return () => {
      if (wsRef.current && !showPiP) {
        wsRef.current.disconnect()
        wsRef.current = null
      }
    }
  }, [showPiP, pipRoomStatus, pipRoomId, user])

  // Global PiP handlers
  const handlePipTimeUpdate = (time) => {
    setPipCurrentTime(time)
    // Update sessionStorage
    const pipState = sessionStorage.getItem("pipState")
    if (pipState) {
      try {
        const pipData = JSON.parse(pipState)
        pipData.currentTime = time
        sessionStorage.setItem("pipState", JSON.stringify(pipData))
      } catch (error) {
        console.error("Error updating PiP time in sessionStorage:", error)
      }
    }
  }

  const handlePipPlayingStateChange = (playing) => {
    setPipPlaying(playing)
    // Update sessionStorage
    const pipState = sessionStorage.getItem("pipState")
    if (pipState) {
      try {
        const pipData = JSON.parse(pipState)
        pipData.playing = playing
        sessionStorage.setItem("pipState", JSON.stringify(pipData))
      } catch (error) {
        console.error("Error updating PiP playing state in sessionStorage:", error)
      }
    }
  }

  const handlePipPlay = (currentTime, videoUrl) => {
    setPipPlaying(true)
    if (wsRef.current && pipRoomStatus !== "none") {
      wsRef.current.playVideo(currentTime, videoUrl)
    }
  }

  const handlePipPause = (currentTime, videoUrl) => {
    setPipPlaying(false)
    if (wsRef.current && pipRoomStatus !== "none") {
      wsRef.current.pauseVideo(currentTime, videoUrl)
    }
  }

  const handlePipSeek = (currentTime, videoUrl) => {
    setPipCurrentTime(currentTime)
    if (wsRef.current && pipRoomStatus !== "none") {
      wsRef.current.seekVideo(currentTime, videoUrl)
    }
  }

  const closePictureInPicture = () => {
    setShowPiP(false)
    setPipMovie(null)
    setPipCurrentTime(0)
    setPipPlaying(false)
    setPipRoomStatus("none")
    setPipRoomId("")
    setPipRoomMembers([])

    // Disconnect WebSocket
    if (wsRef.current) {
      wsRef.current.disconnect()
      wsRef.current = null
    }

    // Clear PiP state from sessionStorage
    sessionStorage.removeItem("pipState")
  }

  const expandFromPiP = () => {
    if (pipMovie) {
      // Update sessionStorage with current PiP state before expanding
      const pipData = {
        movie: pipMovie,
        currentTime: pipCurrentTime,
        playing: pipPlaying,
        roomStatus: pipRoomStatus,
        roomId: pipRoomId,
        roomMembers: pipRoomMembers,
        timestamp: Date.now(),
      }
      sessionStorage.setItem("pipState", JSON.stringify(pipData))

      const movieSlug =
        pipMovie.movieId ||
        pipMovie.title
          .toLowerCase()
          .replace(/\s+/g, "-")
          .replace(/[^\w-]/g, "")

      // Close PiP and navigate
      setShowPiP(false)

      // Navigate to movie page
      window.location.href = `/movie/${movieSlug}`
    }
  }

  // Global function to start PiP from any page
  const startPictureInPicture = (
    movie,
    currentTime = 0,
    playing = false,
    roomStatus = "none",
    roomId = "",
    roomMembers = [],
  ) => {
    setShowPiP(true)
    setPipMovie(movie)
    setPipCurrentTime(currentTime)
    setPipPlaying(playing)
    setPipRoomStatus(roomStatus)
    setPipRoomId(roomId)
    setPipRoomMembers(roomMembers)

    // Save to sessionStorage
    const pipData = {
      movie,
      currentTime,
      playing,
      roomStatus,
      roomId,
      roomMembers,
      timestamp: Date.now(),
    }
    sessionStorage.setItem("pipState", JSON.stringify(pipData))
  }

  return (
    <Router>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/signin" element={<SignInPage />} />
        <Route path="/signup" element={<SignUpPage />} />
        <Route
          path="/home"
          element={true ? <HomePage startPictureInPicture={startPictureInPicture} /> : <Navigate to="/signin" />}
        />
        <Route path="/movie/:movieId" element={<MoviePage startPictureInPicture={startPictureInPicture} />} />
        <Route path="/quiz/:movieId" element={<QuizPage />} />
        <Route path="/redeem" element={<RedeemPage />} />
        <Route path="/profile" element={<ProfilePage />} />
        <Route path="/info/:movieId" element={<MovieInfoPage />} />
      </Routes>

      {/* Global Picture-in-Picture Player */}
      {showPiP && pipMovie && (
        <PictureInPicturePlayer
          movie={pipMovie}
          onClose={closePictureInPicture}
          onExpand={expandFromPiP}
          roomStatus={pipRoomStatus}
          wsRef={wsRef}
          currentVideoTime={pipCurrentTime}
          playing={pipPlaying}
          onPlay={handlePipPlay}
          onPause={handlePipPause}
          onSeek={handlePipSeek}
          onTimeUpdate={handlePipTimeUpdate}
          onPlayingStateChange={handlePipPlayingStateChange}
          initialPlaying={pipPlaying}
          initialCurrentTime={pipCurrentTime}
        />
      )}
    </Router>
  )
}

export default App

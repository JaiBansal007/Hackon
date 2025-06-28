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
import authService from "./firebase/auth"
import { ref, set, onValue, off } from "firebase/database"
import { realtimeDb } from "./firebase/config"

function App() {
  const [user, setUser] = useState(null)
  const [isAuthLoading, setIsAuthLoading] = useState(true)

  // Global Picture-in-Picture state
  const [showPiP, setShowPiP] = useState(false)
  const [pipMovie, setPipMovie] = useState(null)
  const [pipCurrentTime, setPipCurrentTime] = useState(0)
  const [pipPlaying, setPipPlaying] = useState(false)
  const [pipRoomStatus, setPipRoomStatus] = useState("none")
  const [pipRoomId, setPipRoomId] = useState("")
  const [pipRoomMembers, setPipRoomMembers] = useState([])

  // Listen to authentication state with persistence
  useEffect(() => {
    // Check for cached user data immediately
    const cachedUser = localStorage.getItem("user");
    if (cachedUser) {
      try {
        const userData = JSON.parse(cachedUser);
        setUser(userData);
        console.log("🔄 Restored user from cache:", userData.name);
      } catch (error) {
        console.error("Error parsing cached user data:", error);
        localStorage.removeItem("user");
      }
    }

    const unsubscribe = authService.onAuthStateChange((firebaseUser) => {
      setUser(firebaseUser)
      setIsAuthLoading(false)
    })

    return unsubscribe
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

  // Note: Firebase video sync will be handled in the PiP component
  const handlePipPlay = (currentTime, videoUrl) => {
    setPipPlaying(true)
    // Firebase sync will be handled in the component
  }

  const handlePipPause = (currentTime, videoUrl) => {
    setPipPlaying(false)
    // Firebase sync will be handled in the component
  }

  const handlePipSeek = (currentTime, videoUrl) => {
    setPipCurrentTime(currentTime)
    // Firebase sync will be handled in the component
  }

  const closePictureInPicture = () => {
    setShowPiP(false)
    setPipMovie(null)
    setPipCurrentTime(0)
    setPipPlaying(false)
    setPipRoomStatus("none")
    setPipRoomId("")
    setPipRoomMembers([])

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

  // Show loading spinner while checking auth
  if (isAuthLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-950 via-black to-gray-900">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-orange-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-white text-lg">Loading FireStream...</p>
        </div>
      </div>
    )
  }

  return (
    <Router>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/signin" element={<SignInPage />} />
        <Route path="/signup" element={<SignUpPage />} />
        <Route
          path="/home"
          element={user ? <HomePage startPictureInPicture={startPictureInPicture} /> : <Navigate to="/signin" />}
        />
        <Route 
          path="/movie/:movieId" 
          element={user ? <MoviePage startPictureInPicture={startPictureInPicture} /> : <Navigate to="/signin" />} 
        />
        <Route 
          path="/quiz/:movieId" 
          element={user ? <QuizPage /> : <Navigate to="/signin" />} 
        />
        <Route 
          path="/redeem" 
          element={user ? <RedeemPage /> : <Navigate to="/signin" />} 
        />
        <Route 
          path="/profile" 
          element={user ? <ProfilePage /> : <Navigate to="/signin" />} 
        />
        <Route 
          path="/info/:movieId" 
          element={user ? <MovieInfoPage /> : <Navigate to="/signin" />} 
        />
      </Routes>

      {/* Global Picture-in-Picture Player */}
      {showPiP && pipMovie && (
        <PictureInPicturePlayer
          movie={pipMovie}
          onClose={closePictureInPicture}
          onExpand={expandFromPiP}
          roomStatus={pipRoomStatus}
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

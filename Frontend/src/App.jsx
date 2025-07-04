"use client"

import { useState, useEffect, useRef } from "react"
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom"
import { Play } from "lucide-react"
import LandingPage from "./pages/page"
import SignInPage from "./pages/signin/page"
import SignUpPage from "./pages/signup/page"
import HomePage from "./pages/home/page"
import MoviePage from "./pages/movie/page"
import QuizPage from "./pages/quiz/page"
import RedeemPage from "./pages/redeem/page"
import ProfilePage from "./pages/profile/page"
import MovieInfoPage from "./pages/info/page"
import PartyPage from "./pages/party/page"
import ProtectedRoute from "./components/auth/ProtectedRoute"
import { AuthProvider, useAuth } from "./contexts/AuthContext"
import { PictureInPicturePlayer } from "./components/home/video/picture-in-picture-player"
import { BeautifulLoader } from "./components/ui/beautiful-loader"
import { ToastProvider } from "./components/ui/toast"
import authService from "./firebase/auth"
import { ref, set, onValue, off } from "firebase/database"
import { realtimeDb } from "./firebase/config"

const PiPWrapper = ({ movie, onClose, onExpand, roomStatus, roomId, roomMembers, ...pipProps }) => {
  const { user } = useAuth();
  
  return (
    <PictureInPicturePlayer
      movie={movie}
      onClose={onClose}
      onExpand={onExpand}
      roomStatus={roomStatus}
      roomId={roomId}
      user={user}
      roomMembers={roomMembers}
      {...pipProps}
    />
  );
};

function App() {
  // Global Picture-in-Picture state
  const [showPiP, setShowPiP] = useState(false)
  const [pipMovie, setPipMovie] = useState(null)
  const [pipCurrentTime, setPipCurrentTime] = useState(0)
  const [pipPlaying, setPipPlaying] = useState(false)
  const [pipRoomStatus, setPipRoomStatus] = useState("none")
  const [pipRoomId, setPipRoomId] = useState("")
  const [pipRoomMembers, setPipRoomMembers] = useState([])

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
      sessionStorage.setItem("expandFromPiP", JSON.stringify(pipData))

      // Navigate to movie page
      const movieSlug =
        pipMovie.movieId ||
        pipMovie.title
          .toLowerCase()
          .replace(/\s+/g, "-")
          .replace(/[^\w-]/g, "")

      // Close PiP
      setShowPiP(false)

      // Navigate to movie page - the movie page will handle fullscreen
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
    console.log('🎬 CUSTOM PiP startPictureInPicture called!', { movie: movie?.title, currentTime, playing })
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
    <AuthProvider>
      <ToastProvider>
        <Router>
        <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/signin" element={<SignInPage />} />
        <Route path="/signup" element={<SignUpPage />} />
        <Route
          path="/home"
          element={
            <ProtectedRoute>
              <HomePage 
                startPictureInPicture={startPictureInPicture} 
                isPiPActive={showPiP}
              />
            </ProtectedRoute>
          }
        />
        <Route 
          path="/movie/:movieId" 
          element={
            <ProtectedRoute>
              <MoviePage 
                isPiPActive={showPiP}
              />
            </ProtectedRoute>
          }
        />
        <Route 
          path="/quiz/:movieId" 
          element={
            <ProtectedRoute>
              <QuizPage />
            </ProtectedRoute>
          }
        />
        <Route 
          path="/redeem" 
          element={
            <ProtectedRoute>
              <RedeemPage />
            </ProtectedRoute>
          }
        />
        <Route 
          path="/profile" 
          element={
            <ProtectedRoute>
              <ProfilePage />
            </ProtectedRoute>
          }
        />
        <Route 
          path="/info/:movieId" 
          element={
            <ProtectedRoute>
              <MovieInfoPage />
            </ProtectedRoute>
          }
        />
        <Route 
          path="/party" 
          element={
            <ProtectedRoute>
              <PartyPage />
            </ProtectedRoute>
          }
        />

      </Routes>

      {/* Global Picture-in-Picture Player */}
      {showPiP && pipMovie && (
        <PiPWrapper
          movie={pipMovie}
          onClose={closePictureInPicture}
          onExpand={expandFromPiP}
          roomStatus={pipRoomStatus}
          roomId={pipRoomId}
          roomMembers={pipRoomMembers}
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
    </ToastProvider>
    </AuthProvider>
  )
}

export default App

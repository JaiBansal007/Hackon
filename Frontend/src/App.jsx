"use client"

import { useState, useEffect } from "react"
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

function App() {
  const [user, setUser] = useState(true)

  useEffect(() => {
    const userData = localStorage.getItem("user")
    if (userData) {
      setUser(JSON.parse(userData))
    }
  }, [])

  return (
    <Router>
      {/* <Navbar/> */}
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/signin" element={<SignInPage />} />
        <Route path="/signup" element={<SignUpPage />} />
        <Route path="/home" element={true ? <HomePage /> : <Navigate to="/signin" />} />
        <Route path="/movie/:movieId" element={<MoviePage />} />
        <Route path="/quiz/:movieId" element={<QuizPage />} />
        <Route path="/redeem" element={<RedeemPage />} />
        <Route path="/profile" element={<ProfilePage />} />
        <Route path="/info/:movieId" element={<MovieInfoPage />} />
      </Routes>
    </Router>
  )
}

export default App

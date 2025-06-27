"use client"

import { useState, useEffect, useRef } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Play, ChevronLeft, ChevronRight, Info } from "lucide-react"
import { featuredMovies } from "./featured-movies"

export function FeaturedSection({ movie, onStartWatching, onStartQuiz, quizLocked }) {
  const [currentIndex, setCurrentIndex] = useState(0)
  const [isAutoPlaying, setIsAutoPlaying] = useState(true)
  const [isPaused, setIsPaused] = useState(false)
  const intervalRef = useRef(null)

  // Auto-scroll functionality
  useEffect(() => {
    if (isAutoPlaying && !isPaused) {
      intervalRef.current = setInterval(() => {
        setCurrentIndex((prevIndex) => (prevIndex + 1) % featuredMovies.length)
      }, 5000) // Change slide every 5 seconds
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
      }
    }
  }, [isAutoPlaying, isPaused])

  const goToSlide = (index) => {
    setCurrentIndex(index)
    setIsAutoPlaying(false)
    setTimeout(() => setIsAutoPlaying(true), 10000) // Resume auto-play after 10 seconds
  }

  const handleQuizClick = (movieData) => {
    const movieSlug = movieData.title
      .toLowerCase()
      .replace(/\s+/g, "-")
      .replace(/[^\w-]/g, "")
    if (onStartQuiz) {
      onStartQuiz(movieSlug)
    }
  }

  const handleMoreInfo = (movieData) => {
    const movieSlug = movieData.title
      .toLowerCase()
      .replace(/\s+/g, "-")
      .replace(/[^\w-]/g, "")
    window.location.href = `/info/${movieSlug}`
  }

  const currentMovie = featuredMovies[currentIndex]

  return (
    <div className="relative inset-0 h-screen w-screen overflow-hidden z-0">
      {/* Background Images with Smooth Transitions */}
      <AnimatePresence mode="wait">
        <motion.div
          key={currentIndex}
          initial={{ opacity: 0, scale: 1.1 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          transition={{ duration: 0.8, ease: "easeInOut" }}
          className="absolute inset-0 h-full w-full"
          onMouseEnter={() => setIsPaused(true)}
          onMouseLeave={() => setIsPaused(false)}
        >
          <img
            src={currentMovie.image || "/placeholder.svg?height=1080&width=1920"}
            alt={currentMovie.title}
            className="w-screen h-screen object-cover absolute inset-0 left-0 top-0"
            style={{ marginLeft: 0 }}
          />
          <div className="absolute inset-0 bg-gradient-to-r from-black/90 via-black/40 to-transparent" />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
        </motion.div>
      </AnimatePresence>

      {/* Main Content */}
      <div className="absolute inset-0 flex items-center z-10">
        <div className="w-full px-8 md:px-16 lg:px-24 mt-32">
          <div className="max-w-4xl">
            <AnimatePresence mode="wait">
              <motion.div
                key={currentIndex}
                initial={{ opacity: 0, y: 50 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.6, ease: "easeOut" }}
              >
                <motion.h1
                  className="text-4xl md:text-6xl lg:text-7xl font-bold mb-6 text-white leading-tight"
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1, duration: 0.6 }}
                >
                  {currentMovie.title}
                </motion.h1>

                <motion.p
                  className="text-lg md:text-xl text-gray-300 mb-6 max-w-2xl leading-relaxed"
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2, duration: 0.6 }}
                >
                  {currentMovie.description}
                </motion.p>

                <motion.div
                  className="flex items-center space-x-6 mb-8"
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3, duration: 0.6 }}
                >
                  <div className="flex items-center space-x-2">
                    <span className="text-amber-400 font-bold text-lg">{currentMovie.rating}</span>
                  </div>
                  <div className="w-1 h-1 bg-gray-500 rounded-full" />
                  <span className="text-gray-400 font-medium">{currentMovie.year}</span>
                  <div className="w-1 h-1 bg-gray-500 rounded-full" />
                  <span className="text-gray-400 font-medium">{currentMovie.genre}</span>
                </motion.div>

                <motion.div
                  className="flex flex-wrap items-center gap-4"
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4, duration: 0.6 }}
                >
                  <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                    <Button
                      onClick={() => onStartWatching(currentMovie)}
                      className="bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-black font-bold px-8 py-4 text-lg rounded-xl shadow-lg hover:shadow-amber-500/25 transition-all duration-300"
                    >
                      <Play className="w-6 h-6 mr-3 fill-current" />
                      Play Now
                    </Button>
                  </motion.div>

                  <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                    <Button
                      onClick={() => handleMoreInfo(currentMovie)}
                      variant="outline"
                      className="border-2 border-white/30 hover:border-white/60 text-black hover:bg-white/10 backdrop-blur-sm px-8 py-4 text-lg rounded-xl transition-all duration-300"
                    >
                      <Info className="w-5 h-5 mr-3" />
                      More Info
                    </Button>
                  </motion.div>

                  <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                    <Button
                      onClick={() => handleQuizClick(currentMovie)}
                      disabled={quizLocked}
                      className="bg-gradient-to-r from-blue-500 via-indigo-500 to-violet-500 hover:from-blue-400 hover:via-indigo-400 hover:to-violet-400 focus:ring-4 focus:ring-blue-300 text-white font-bold px-8 py-4 text-lg rounded-xl shadow-lg hover:shadow-blue-500/25 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Quiz Challenge
                    </Button>
                  </motion.div>
                </motion.div>
              </motion.div>
            </AnimatePresence>
          </div>
        </div>
      </div>

      {/* Slide Indicators */}
      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-20">
        <div className="flex space-x-3">
          {featuredMovies.map((_, index) => (
            <button
              key={index}
              onClick={() => goToSlide(index)}
              className={`relative overflow-hidden rounded-full transition-all duration-300 ${
                index === currentIndex
                  ? "bg-gradient-to-r from-amber-400 to-orange-500"
                  : "bg-white/30 hover:bg-white/50"
              }`}
            >
              {index === currentIndex && (
                <motion.div
                  className="absolute inset-0 bg-gradient-to-r from-amber-400 to-orange-500"
                  initial={{ width: "0%" }}
                  animate={{ width: "100%" }}
                  transition={{ duration: 5, ease: "linear" }}
                  key={`progress-${currentIndex}`}
                />
              )}
            </button>
          ))}
        </div>
      </div>

    </div>
  )
}

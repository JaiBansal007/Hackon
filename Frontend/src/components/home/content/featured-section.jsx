"use client"

import { useState, useEffect, useRef } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Play, ChevronLeft, ChevronRight, Info, Plus, Volume2, VolumeX } from "lucide-react"
import { useNavigate } from "react-router-dom"
import { featuredMovies } from "./featured-movies"

export function FeaturedSection({ movie, onStartWatching, onStartSoloWatching, onStartQuiz, quizLocked, roomStatus }) {
  const navigate = useNavigate()
  const [currentIndex, setCurrentIndex] = useState(0)
  const [isAutoPlaying, setIsAutoPlaying] = useState(true)
  const [isPaused, setIsPaused] = useState(false)
  const [isMuted, setIsMuted] = useState(true)
  const [showVideo, setShowVideo] = useState(false)
  const [scrollY, setScrollY] = useState(0)
  const intervalRef = useRef(null)
  const videoRef = useRef(null)
  const sectionRef = useRef(null)

  // Handle scroll for parallax effect
  useEffect(() => {
    const handleScroll = () => {
      setScrollY(window.scrollY)
    }

    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  // Auto-scroll functionality
  useEffect(() => {
    if (isAutoPlaying && !isPaused) {
      intervalRef.current = setInterval(() => {
        setCurrentIndex((prevIndex) => (prevIndex + 1) % featuredMovies.length)
      }, 6000) // Change slide every 6 seconds
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
      }
    }
  }, [isAutoPlaying, isPaused])

  // Show video after 3 seconds on each slide
  useEffect(() => {
    setShowVideo(false)
    const timer = setTimeout(() => {
      setShowVideo(true)
    }, 3000)

    return () => clearTimeout(timer)
  }, [currentIndex])

  const goToSlide = (index) => {
    setCurrentIndex(index)
    setIsAutoPlaying(false)
    setTimeout(() => setIsAutoPlaying(true), 15000) // Resume auto-play after 15 seconds
  }

  const nextSlide = () => {
    setCurrentIndex((prevIndex) => (prevIndex + 1) % featuredMovies.length)
    setIsAutoPlaying(false)
    setTimeout(() => setIsAutoPlaying(true), 15000)
  }

  const prevSlide = () => {
    setCurrentIndex((prevIndex) => 
      prevIndex === 0 ? featuredMovies.length - 1 : prevIndex - 1
    )
    setIsAutoPlaying(false)
    setTimeout(() => setIsAutoPlaying(true), 15000)
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
  
  // Fixed height for featured section
  const sectionHeight = 800
  const parallaxOffset = Math.max(0, Math.min(scrollY * 0.3, sectionHeight * 0.2))
  const isInHeroSection = scrollY < sectionHeight

  return (
    <div ref={sectionRef} className="relative w-full overflow-hidden bg-black" style={{ height: `${sectionHeight}px` }}>
      {/* Gradient overlay when scrolling */}
      <div 
        className="absolute inset-0 w-full h-full z-5 pointer-events-none transition-opacity duration-300"
        style={{
          background: scrollY > 100 ? 'linear-gradient(to bottom, rgba(0,0,0,0.3) 0%, rgba(0,0,0,0.7) 100%)' : 'transparent',
          opacity: Math.min(scrollY / 200, 0.8)
        }}
      />
      
      {/* Fixed Background Layer - only when in hero section */}
      <div 
        className={`${isInHeroSection ? 'fixed' : 'absolute'} inset-0 w-full h-full z-0`}
        style={{
          transform: isInHeroSection ? `translateY(${parallaxOffset}px)` : 'none',
          willChange: 'transform'
        }}
      >
        <AnimatePresence mode="wait">
          <motion.div
            key={`bg-${currentIndex}`}
            initial={{ scale: 1.1, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.95, opacity: 0 }}
            transition={{ duration: 1, ease: "easeInOut" }}
            className="absolute inset-0 w-full h-full"
          >
            {/* Background Image */}
            <motion.div
              className="absolute inset-0 w-full h-full"
              animate={{ 
                scale: isPaused ? 1.05 : 1,
                y: isPaused ? -10 : 0 
              }}
              transition={{ duration: 0.8, ease: "easeOut" }}
            >
              <img
                src={currentMovie.image || "/placeholder.svg?height=1080&width=1920"}
                alt={currentMovie.title}
                className="w-full h-full object-cover"
              />
            </motion.div>

            {/* Video Overlay */}
            <AnimatePresence>
              {showVideo && (
                <motion.video
                  ref={videoRef}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 0.8 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 1 }}
                  className="absolute inset-0 w-full h-full object-cover"
                  src={currentMovie.videoUrl}
                  autoPlay
                  loop
                  muted={isMuted}
                  playsInline
                />
              )}
            </AnimatePresence>

            <div className="absolute inset-0 bg-gradient-to-r from-black/90 via-black/40 to-transparent" />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
            <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-black/60" />
            
            {/* Scroll-based gradient overlay */}
            <div 
              className="absolute inset-0 transition-opacity duration-500"
              style={{
                background: 'linear-gradient(to bottom, rgba(0,0,0,0.2) 0%, rgba(0,0,0,0.6) 70%, rgba(0,0,0,0.9) 100%)',
                opacity: Math.min(scrollY / 300, 0.8)
              }}
            />
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Content Container - positioned to scroll over fixed background */}
      <div 
        className="absolute inset-0 z-10 h-full"
        style={{ 
          height: `${sectionHeight}px`,
          transform: scrollY > 100 ? `translateY(${Math.min(scrollY * 0.1, 50)}px)` : 'none',
          transition: 'transform 0.1s ease-out'
        }}
        onMouseEnter={() => setIsPaused(true)}
        onMouseLeave={() => setIsPaused(false)}
      >
        {/* Navigation Arrows
        <button
          onClick={prevSlide}
          className="absolute left-4 top-1/2 -translate-y-1/2 z-30 bg-black/20 hover:bg-black/40 text-white p-2 rounded-full backdrop-blur-sm transition-all duration-300"
        >
          <ChevronLeft className="w-8 h-8" />
        </button>
        
        <button
          onClick={nextSlide}
          className="absolute right-4 top-1/2 -translate-y-1/2 z-30 bg-black/20 hover:bg-black/40 text-white p-2 rounded-full backdrop-blur-sm transition-all duration-300"
        >
          <ChevronRight className="w-8 h-8" />
        </button> */}

        {/* Volume Control */}
        {showVideo && (
          <button
            onClick={() => setIsMuted(!isMuted)}
            className="absolute top-4 right-4 z-30 bg-black/30 hover:bg-black/50 text-white p-2 rounded-full backdrop-blur-sm transition-all duration-300"
          >
            {isMuted ? <VolumeX className="w-5 h-5" /> : <Volume2 className="w-5 h-5" />}
          </button>
        )}

        {/* Content */}
        <div className="absolute inset-0 flex items-center z-20 ml-16">
          <div className="w-full max-w-4xl px-8">
            <AnimatePresence mode="wait">
              <motion.div
                key={`content-${currentIndex}`}
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.6, ease: "easeOut" }}
                className="space-y-6"
              >
                {/* Title */}
                <motion.h1
                  className="text-4xl md:text-6xl font-bold text-white leading-tight max-w-3xl"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1, duration: 0.6 }}
                >
                  {currentMovie.title}
                </motion.h1>

                {/* Metadata */}
                <motion.div
                  className="flex items-center space-x-4 text-sm text-gray-300"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2, duration: 0.6 }}
                >
                  <span className="bg-yellow-500 text-black px-2 py-1 rounded text-xs font-bold">
                    IMDb {currentMovie.rating}
                  </span>
                  <span>{currentMovie.year}</span>
                  <span>•</span>
                  <span>{currentMovie.genre}</span>
                </motion.div>

                {/* Description */}
                <motion.p
                  className="text-gray-300 text-lg max-w-2xl leading-relaxed"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3, duration: 0.6 }}
                >
                  {currentMovie.description}
                </motion.p>

                {/* Action Buttons */}
                <motion.div
                  className="flex items-center space-x-4"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4, duration: 0.6 }}
                >
                  <Button
                    onClick={() => {
                      if (roomStatus === "none") {
                        onStartSoloWatching(currentMovie)
                      } else {
                        onStartWatching(currentMovie)
                      }
                    }}
                    className={`${
                      roomStatus === "none" 
                        ? "bg-white hover:bg-gray-200 text-black" 
                        : "bg-blue-600 hover:bg-blue-700 text-white"
                    } font-bold px-8 py-3 rounded-md flex items-center space-x-2 transition-all duration-200`}
                  >
                    <Play className="w-5 h-5 fill-current" />
                    <span>{roomStatus === "none" ? "Watch Solo" : "Watch with Room"}</span>
                  </Button>
                  
                  {/* <Button
                    variant="outline"
                    className="border-2 border-gray-400 hover:border-white text-white hover:bg-white/10 backdrop-blur-sm px-6 py-3 rounded-md flex items-center space-x-2"
                  >
                    <Plus className="w-5 h-5" />
                    <span>Watchlist</span>
                  </Button> */}
                  
                  <Button
                    onClick={() => handleMoreInfo(currentMovie)}
                    variant="ghost"
                    className="text-white hover:bg-white/10 px-6 py-3 rounded-md flex items-center space-x-2"
                  >
                    <Info className="w-5 h-5" />
                    <span>More Info</span>
                  </Button>

                  <Button
                    onClick={() => handleQuizClick(currentMovie)}
                    disabled={quizLocked}
                    className="bg-gradient-to-r from-blue-500 via-blue-500 to-blue-500 hover:from-blue-600 hover:to-blue-600 text-white font-bold px-6 py-3 rounded-md flex items-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <span>Quiz Challenge</span>
                  </Button>
                </motion.div>
              </motion.div>
            </AnimatePresence>
          </div>
        </div>

        {/* Slide Indicators */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-30">
          <div className="flex space-x-2">
            {featuredMovies.map((_, index) => (
              <button
                key={index}
                onClick={() => goToSlide(index)}
                className={`w-2 h-2 rounded-full transition-all duration-300 ${
                  index === currentIndex
                    ? "bg-white scale-125"
                    : "bg-white/50 hover:bg-white/75"
                }`}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

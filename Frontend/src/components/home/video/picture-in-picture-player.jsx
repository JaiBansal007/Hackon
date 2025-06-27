"use client"

import { useRef, useEffect, useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Button } from "../../ui/button"
import { Play, Pause, Volume2, VolumeX, Maximize, X } from "lucide-react"

export function PictureInPicturePlayer({
  movie,
  onClose,
  onExpand,
  roomStatus,
  wsRef,
  currentVideoTime,
  playing,
  onPlay,
  onPause,
  onSeek,
  onTimeUpdate,
  onPlayingStateChange,
  initialPlaying = false,
  initialCurrentTime = 0,
}) {
  const videoRef = useRef(null)
  const containerRef = useRef(null)
  const [isPlaying, setIsPlaying] = useState(initialPlaying)
  const [currentTime, setCurrentTime] = useState(initialCurrentTime)
  const [videoDuration, setVideoDuration] = useState(0)
  const [volume, setVolume] = useState(0.5) // Lower volume for PiP
  const [isMuted, setIsMuted] = useState(false)
  const [isDragging, setIsDragging] = useState(false)
  const [position, setPosition] = useState({ x: window.innerWidth - 320, y: window.innerHeight - 240 })
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 })
  const [showControls, setShowControls] = useState(false)

  useEffect(() => {
    const video = videoRef.current
    if (video) {
      const handleTimeUpdate = () => {
        const newTime = video.currentTime
        setCurrentTime(newTime)
        // Update parent component with current time
        if (onTimeUpdate) {
          onTimeUpdate(newTime)
        }
      }

      const handleLoadedMetadata = () => {
        setVideoDuration(video.duration)
        video.volume = volume

        // Set initial time and playing state
        if (initialCurrentTime > 0) {
          video.currentTime = initialCurrentTime
          setCurrentTime(initialCurrentTime)
        }

        // Set initial playing state - don't auto-play unless it was playing
        if (initialPlaying) {
          video.play().catch(console.error)
        } else {
          video.pause()
        }
      }

      const handlePlay = () => {
        setIsPlaying(true)
        if (onPlayingStateChange) {
          onPlayingStateChange(true)
        }
      }

      const handlePause = () => {
        setIsPlaying(false)
        if (onPlayingStateChange) {
          onPlayingStateChange(false)
        }
      }

      video.addEventListener("timeupdate", handleTimeUpdate)
      video.addEventListener("loadedmetadata", handleLoadedMetadata)
      video.addEventListener("play", handlePlay)
      video.addEventListener("pause", handlePause)

      return () => {
        video.removeEventListener("timeupdate", handleTimeUpdate)
        video.removeEventListener("loadedmetadata", handleLoadedMetadata)
        video.removeEventListener("play", handlePlay)
        video.removeEventListener("pause", handlePause)
      }
    }
  }, [volume, initialCurrentTime, initialPlaying, onTimeUpdate, onPlayingStateChange])

  // Sync with room video state only if not user-initiated
  useEffect(() => {
    const video = videoRef.current
    if (!video) return

    // Only sync if there's a significant difference and it's from room sync
    if (typeof currentVideoTime === "number" && Math.abs(video.currentTime - currentVideoTime) > 1) {
      video.currentTime = currentVideoTime
      setCurrentTime(currentVideoTime)
    }

    if (typeof playing === "boolean") {
      if (playing && video.paused) {
        video.play().catch(console.error)
        setIsPlaying(true)
      } else if (!playing && !video.paused) {
        video.pause()
        setIsPlaying(false)
      }
    }
  }, [currentVideoTime, playing])

  const togglePlayPause = () => {
    if (videoRef.current) {
      const currentVideoTime = videoRef.current.currentTime
      if (isPlaying) {
        videoRef.current.pause()
        setIsPlaying(false)
        if (onPlayingStateChange) onPlayingStateChange(false)
        if (onPause) onPause(currentVideoTime, movie?.videoUrl)
      } else {
        videoRef.current.play().catch(console.error)
        setIsPlaying(true)
        if (onPlayingStateChange) onPlayingStateChange(true)
        if (onPlay) onPlay(currentVideoTime, movie?.videoUrl)
      }
    }
  }

  const toggleMute = () => {
    if (videoRef.current) {
      if (isMuted) {
        videoRef.current.volume = volume
        setIsMuted(false)
      } else {
        videoRef.current.volume = 0
        setIsMuted(true)
      }
    }
  }

  const handleMouseDown = (e) => {
    // Prevent dragging when clicking on controls
    if (e.target.closest(".pip-controls")) return

    setIsDragging(true)
    const rect = containerRef.current.getBoundingClientRect()
    setDragOffset({
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    })

    // Prevent text selection during drag
    e.preventDefault()
  }

  const handleMouseMove = (e) => {
    if (!isDragging) return

    e.preventDefault()

    const newX = e.clientX - dragOffset.x
    const newY = e.clientY - dragOffset.y

    // Keep within viewport bounds with some padding
    const padding = 10
    const maxX = window.innerWidth - 300 - padding
    const maxY = window.innerHeight - 200 - padding

    setPosition({
      x: Math.max(padding, Math.min(newX, maxX)),
      y: Math.max(padding, Math.min(newY, maxY)),
    })
  }

  const handleMouseUp = () => {
    setIsDragging(false)
  }

  // Global mouse event listeners for dragging
  useEffect(() => {
    if (isDragging) {
      const handleGlobalMouseMove = (e) => handleMouseMove(e)
      const handleGlobalMouseUp = () => handleMouseUp()

      document.addEventListener("mousemove", handleGlobalMouseMove)
      document.addEventListener("mouseup", handleGlobalMouseUp)

      // Prevent text selection during drag
      document.body.style.userSelect = "none"
      document.body.style.cursor = "grabbing"

      return () => {
        document.removeEventListener("mousemove", handleGlobalMouseMove)
        document.removeEventListener("mouseup", handleGlobalMouseUp)
        document.body.style.userSelect = ""
        document.body.style.cursor = ""
      }
    }
  }, [isDragging, dragOffset])

  // Update position on window resize to keep PiP within bounds
  useEffect(() => {
    const handleResize = () => {
      const padding = 10
      const maxX = window.innerWidth - 300 - padding
      const maxY = window.innerHeight - 200 - padding
      setPosition((prev) => ({
        x: Math.max(padding, Math.min(prev.x, maxX)),
        y: Math.max(padding, Math.min(prev.y, maxY)),
      }))
    }

    window.addEventListener("resize", handleResize)
    return () => window.removeEventListener("resize", handleResize)
  }, [])

  // Touch support for mobile devices
  const handleTouchStart = (e) => {
    if (e.target.closest(".pip-controls")) return

    const touch = e.touches[0]
    setIsDragging(true)
    const rect = containerRef.current.getBoundingClientRect()
    setDragOffset({
      x: touch.clientX - rect.left,
      y: touch.clientY - rect.top,
    })

    e.preventDefault()
  }

  const handleTouchMove = (e) => {
    if (!isDragging) return

    e.preventDefault()

    const touch = e.touches[0]
    const newX = touch.clientX - dragOffset.x
    const newY = touch.clientY - dragOffset.y

    // Keep within viewport bounds with padding
    const padding = 10
    const maxX = window.innerWidth - 300 - padding
    const maxY = window.innerHeight - 200 - padding

    setPosition({
      x: Math.max(padding, Math.min(newX, maxX)),
      y: Math.max(padding, Math.min(newY, maxY)),
    })
  }

  const handleTouchEnd = () => {
    setIsDragging(false)
  }

  return (
    <AnimatePresence>
      <motion.div
        ref={containerRef}
        initial={{ scale: 0, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0, opacity: 0 }}
        className={`fixed z-[9999] bg-black rounded-xl overflow-hidden shadow-2xl border-2 border-orange-500/30 select-none transition-all duration-200 ${
          isDragging ? "cursor-grabbing scale-105 shadow-3xl border-orange-500/50" : "cursor-grab hover:shadow-3xl"
        }`}
        style={{
          left: position.x,
          top: position.y,
          width: 300,
          height: 200,
        }}
        onMouseDown={handleMouseDown}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        onMouseEnter={() => setShowControls(true)}
        onMouseLeave={() => !isDragging && setShowControls(false)}
      >
        {/* Video */}
        <video
          ref={videoRef}
          src={movie?.videoUrl}
          className="w-full h-full object-cover pointer-events-none"
          muted={isMuted}
          poster={movie?.image}
          playsInline
        >
          <source
            src="https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4"
            type="video/mp4"
          />
        </video>

        {/* Drag Handle Indicator */}
        {!showControls && !isDragging && (
          <div className="absolute top-2 left-1/2 transform -translate-x-1/2 w-8 h-1 bg-white/30 rounded-full pointer-events-none" />
        )}

        {/* Controls Overlay */}
        <AnimatePresence>
          {showControls && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/60 flex flex-col justify-between p-3 pip-controls pointer-events-auto"
              onMouseDown={(e) => e.stopPropagation()}
              onTouchStart={(e) => e.stopPropagation()}
            >
              {/* Top Controls */}
              <div className="flex justify-between items-start">
                <div className="bg-black/70 rounded-lg px-2 py-1 max-w-[150px]">
                  <span className="text-white text-xs font-medium truncate block">{movie?.title}</span>
                </div>
                <div className="flex space-x-1">
                  <Button
                    onClick={onExpand}
                    size="sm"
                    className="w-6 h-6 p-0 bg-white/20 hover:bg-white/30 text-black border-none backdrop-blur-sm rounded transition-all duration-200 hover:scale-110"
                  >
                    <Maximize className="w-3 h-3" />
                  </Button>
                  <Button
                    onClick={onClose}
                    size="sm"
                    className="w-6 h-6 p-0 bg-white/20 hover:bg-red-500/30 text-black border-none backdrop-blur-sm rounded transition-all duration-200 hover:scale-110"
                  >
                    <X className="w-3 h-3" />
                  </Button>
                </div>
              </div>

              {/* Bottom Controls */}
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Button
                    onClick={togglePlayPause}
                    size="sm"
                    className="w-8 h-8 p-0 bg-white/20 hover:bg-white/30 text-black border-none backdrop-blur-sm rounded transition-all duration-200 hover:scale-110"
                  >
                    {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                  </Button>
                </div>

                {roomStatus !== "none" && (
                  <div className="bg-black/70 rounded px-2 py-1">
                    <span className="text-orange-400 text-xs font-medium">
                      Room {roomStatus === "host" ? "HOST" : "MEMBER"}
                    </span>
                  </div>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Dragging indicator with enhanced visual feedback */}
        {isDragging && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="absolute inset-0 bg-gradient-to-br from-orange-500/30 via-transparent to-orange-500/30 border-2 border-orange-500 rounded-xl pointer-events-none"
          >
            <div className="absolute inset-2 border border-dashed border-orange-300/50 rounded-lg" />
            <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-orange-500/80 text-white text-xs px-2 py-1 rounded font-medium">
              Dragging...
            </div>
          </motion.div>
        )}

        {/* Position indicator when dragging */}
        {isDragging && (
          <div className="absolute -top-8 left-1/2 transform -translate-x-1/2 bg-black/80 text-white text-xs px-2 py-1 rounded whitespace-nowrap">
            {Math.round(position.x)}, {Math.round(position.y)}
          </div>
        )}
      </motion.div>
    </AnimatePresence>
  )
}

"use client"

import { useRef, useEffect, useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Button } from "../../ui/button"
import { Play, Pause, Volume2, VolumeX, Maximize, X } from "lucide-react"
import videoSyncService from "../../../firebase/videoSync"

export function PictureInPicturePlayer({
  movie,
  onClose,
  onExpand,
  roomStatus,
  roomId,
  user,
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
  const [pipSize, setPipSize] = useState('normal') // 'normal' or 'compact'
  const [isHovered, setIsHovered] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const controlsTimeoutRef = useRef(null)

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
        setIsLoading(false)

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

      const handleLoadStart = () => {
        setIsLoading(true)
      }

      const handleCanPlay = () => {
        setIsLoading(false)
      }

      const handleWaiting = () => {
        setIsLoading(true)
      }

      const handlePlaying = () => {
        setIsLoading(false)
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
      video.addEventListener("loadstart", handleLoadStart)
      video.addEventListener("canplay", handleCanPlay)
      video.addEventListener("waiting", handleWaiting)
      video.addEventListener("playing", handlePlaying)
      video.addEventListener("play", handlePlay)
      video.addEventListener("pause", handlePause)

      return () => {
        video.removeEventListener("timeupdate", handleTimeUpdate)
        video.removeEventListener("loadedmetadata", handleLoadedMetadata)
        video.removeEventListener("loadstart", handleLoadStart)
        video.removeEventListener("canplay", handleCanPlay)
        video.removeEventListener("waiting", handleWaiting)
        video.removeEventListener("playing", handlePlaying)
        video.removeEventListener("play", handlePlay)
        video.removeEventListener("pause", handlePause)
      }
    }
  }, [volume, initialCurrentTime, initialPlaying, onTimeUpdate, onPlayingStateChange])

  // Listen to Firebase video state changes if in a room
  useEffect(() => {
    if (roomStatus === "none" || !roomId || !user) return;

    // Set up Firebase video sync listener
    const unsubscribe = videoSyncService.listenToVideoState(roomId, (syncedState) => {
      if (!syncedState || syncedState.lastUpdatedBy === user.uid) return;

      console.log("🎬 PiP: Received room sync:", syncedState);
      
      const video = videoRef.current;
      if (!video) return;

      // Handle sync based on action
      switch (syncedState.action) {
        case 'play':
          if (syncedState.isPlaying && video.paused) {
            if (Math.abs(video.currentTime - syncedState.currentTime) > 1) {
              video.currentTime = syncedState.currentTime;
            }
            video.play().catch(console.error);
            setIsPlaying(true);
          }
          break;
        case 'pause':
          if (!syncedState.isPlaying && !video.paused) {
            video.currentTime = syncedState.currentTime;
            video.pause();
            setIsPlaying(false);
          }
          break;
        case 'seek':
          video.currentTime = syncedState.currentTime;
          setCurrentTime(syncedState.currentTime);
          break;
      }
    });

    return () => {
      if (unsubscribe) unsubscribe();
    };
  }, [roomStatus, roomId, user]);

  const togglePlayPause = async () => {
    if (videoRef.current) {
      const currentVideoTime = videoRef.current.currentTime
      if (isPlaying) {
        videoRef.current.pause()
        setIsPlaying(false)
        if (onPlayingStateChange) onPlayingStateChange(false)
        
        // Sync with room if in a room
        if (roomStatus !== "none" && roomId && user) {
          await videoSyncService.pauseVideo(roomId, currentVideoTime, movie?.videoUrl, user, roomStatus === "host")
        } else if (onPause) {
          onPause(currentVideoTime, movie?.videoUrl)
        }
      } else {
        videoRef.current.play().catch(console.error)
        setIsPlaying(true)
        if (onPlayingStateChange) onPlayingStateChange(true)
        
        // Sync with room if in a room
        if (roomStatus !== "none" && roomId && user) {
          await videoSyncService.playVideo(roomId, currentVideoTime, movie?.videoUrl, user, roomStatus === "host")
        } else if (onPlay) {
          onPlay(currentVideoTime, movie?.videoUrl)
        }
      }
      resetControlsTimeout()
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
      resetControlsTimeout()
    }
  }

  const handleSeek = async (newTime) => {
    if (videoRef.current) {
      videoRef.current.currentTime = newTime
      setCurrentTime(newTime)
      
      // Sync with room if in a room
      if (roomStatus !== "none" && roomId && user) {
        await videoSyncService.seekVideo(roomId, newTime, movie?.videoUrl, user, roomStatus === "host")
      } else if (onSeek) {
        onSeek(newTime, movie?.videoUrl)
      }
    }
  }

  const handleDoubleClick = () => {
    setPipSize(pipSize === 'normal' ? 'compact' : 'normal')
  }

  const handleMouseDown = (e) => {
    // Prevent dragging when clicking on controls
    if (e.target.closest(".pip-controls")) return

    const rect = containerRef.current.getBoundingClientRect()
    const offsetX = e.clientX - rect.left
    const offsetY = e.clientY - rect.top
    
    setDragOffset({ x: offsetX, y: offsetY })
    setIsDragging(true)

    // Immediate visual feedback
    document.body.style.cursor = "grabbing"
    document.body.style.userSelect = "none"

    // Prevent text selection during drag
    e.preventDefault()
    e.stopPropagation()
  }

  // Global mouse event listeners for dragging
  useEffect(() => {
    if (isDragging) {
      const handleGlobalMouseMove = (e) => {
        if (!isDragging) return
        e.preventDefault()

        const newX = e.clientX - dragOffset.x
        const newY = e.clientY - dragOffset.y

        // Keep within viewport bounds with some padding
        const padding = 10
        const pipWidth = pipSize === 'normal' ? 300 : 200
        const pipHeight = pipSize === 'normal' ? 200 : 133
        const maxX = window.innerWidth - pipWidth - padding
        const maxY = window.innerHeight - pipHeight - padding

        const boundedX = Math.max(padding, Math.min(newX, maxX))
        const boundedY = Math.max(padding, Math.min(newY, maxY))

        setPosition({
          x: boundedX,
          y: boundedY,
        })
      }

      const handleGlobalMouseUp = () => {
        setIsDragging(false)
        
        // Snap to corners if close to them
        const snapDistance = 50
        const windowWidth = window.innerWidth
        const windowHeight = window.innerHeight
        const pipWidth = pipSize === 'normal' ? 300 : 200
        const pipHeight = pipSize === 'normal' ? 200 : 133
        
        setPosition(currentPos => {
          let newX = currentPos.x
          let newY = currentPos.y
          
          // Snap to left or right edge
          if (currentPos.x < snapDistance) {
            newX = 10 // Left edge with padding
          } else if (currentPos.x > windowWidth - pipWidth - snapDistance) {
            newX = windowWidth - pipWidth - 10 // Right edge with padding
          }
          
          // Snap to top or bottom edge
          if (currentPos.y < snapDistance) {
            newY = 10 // Top edge with padding
          } else if (currentPos.y > windowHeight - pipHeight - snapDistance) {
            newY = windowHeight - pipHeight - 10 // Bottom edge with padding
          }
          
          return { x: newX, y: newY }
        })
      }

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
  }, [isDragging, dragOffset.x, dragOffset.y, pipSize])

  // Keyboard controls for PiP positioning
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (!containerRef.current) return
      
      const step = e.shiftKey ? 50 : 10 // Hold shift for bigger steps
      const padding = 10
      const pipWidth = pipSize === 'normal' ? 300 : 200
      const pipHeight = pipSize === 'normal' ? 200 : 133
      const maxX = window.innerWidth - pipWidth - padding
      const maxY = window.innerHeight - pipHeight - padding
      
      let newPosition = { ...position }
      
      switch(e.key) {
        case 'ArrowUp':
          newPosition.y = Math.max(padding, position.y - step)
          e.preventDefault()
          break
        case 'ArrowDown':
          newPosition.y = Math.min(maxY, position.y + step)
          e.preventDefault()
          break
        case 'ArrowLeft':
          newPosition.x = Math.max(padding, position.x - step)
          e.preventDefault()
          break
        case 'ArrowRight':
          newPosition.x = Math.min(maxX, position.x + step)
          e.preventDefault()
          break
        case 'Escape':
          onClose()
          e.preventDefault()
          break
      }
      
      if (newPosition.x !== position.x || newPosition.y !== position.y) {
        setPosition(newPosition)
      }
    }

    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [position, onClose, pipSize])

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
    const rect = containerRef.current.getBoundingClientRect()
    const offsetX = touch.clientX - rect.left
    const offsetY = touch.clientY - rect.top
    
    setDragOffset({ x: offsetX, y: offsetY })
    setIsDragging(true)

    e.preventDefault()
    e.stopPropagation()
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

    const boundedX = Math.max(padding, Math.min(newX, maxX))
    const boundedY = Math.max(padding, Math.min(newY, maxY))

    setPosition({
      x: boundedX,
      y: boundedY,
    })
  }

  const handleTouchEnd = () => {
    setIsDragging(false)
    
    // Same snap logic for touch
    const snapDistance = 50
    const windowWidth = window.innerWidth
    const windowHeight = window.innerHeight
    const pipWidth = 300
    const pipHeight = 200
    
    let newX = position.x
    let newY = position.y
    
    if (position.x < snapDistance) {
      newX = 10
    } else if (position.x > windowWidth - pipWidth - snapDistance) {
      newX = windowWidth - pipWidth - 10
    }
    
    if (position.y < snapDistance) {
      newY = 10
    } else if (position.y > windowHeight - pipHeight - snapDistance) {
      newY = windowHeight - pipHeight - 10
    }
    
    if (newX !== position.x || newY !== position.y) {
      setPosition({ x: newX, y: newY })
    }
  }

  // Auto-hide controls after 3 seconds
  const resetControlsTimeout = () => {
    if (controlsTimeoutRef.current) {
      clearTimeout(controlsTimeoutRef.current)
    }
    
    setShowControls(true)
    
    if (!isHovered && !isDragging) {
      controlsTimeoutRef.current = setTimeout(() => {
        setShowControls(false)
      }, 3000)
    }
  }

  // Handle controls visibility
  useEffect(() => {
    resetControlsTimeout()
    return () => {
      if (controlsTimeoutRef.current) {
        clearTimeout(controlsTimeoutRef.current)
      }
    }
  }, [isHovered, isDragging])

  // Keyboard controls
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (!containerRef.current || !isHovered) return
      
      switch (e.key) {
        case ' ':
        case 'k':
          e.preventDefault()
          togglePlayPause()
          break
        case 'm':
          e.preventDefault()
          toggleMute()
          break
        case 'f':
          e.preventDefault()
          // Trigger expand to fullscreen
          if (onExpand) {
            const currentVideoState = {
              currentTime: videoRef.current?.currentTime || currentTime,
              playing: isPlaying,
              roomStatus,
              roomId,
              roomMembers: [],
              movie
            }
            sessionStorage.setItem("expandFromPiP", JSON.stringify(currentVideoState))
            onExpand()
          }
          break
        case 'Escape':
          e.preventDefault()
          if (onClose) onClose()
          break
        case 'ArrowUp':
          e.preventDefault()
          setPosition(prev => ({ ...prev, y: Math.max(10, prev.y - (e.shiftKey ? 50 : 10)) }))
          break
        case 'ArrowDown':
          e.preventDefault()
          setPosition(prev => ({ ...prev, y: Math.min(window.innerHeight - (pipSize === 'normal' ? 200 : 133) - 10, prev.y + (e.shiftKey ? 50 : 10)) }))
          break
        case 'ArrowLeft':
          e.preventDefault()
          setPosition(prev => ({ ...prev, x: Math.max(10, prev.x - (e.shiftKey ? 50 : 10)) }))
          break
        case 'ArrowRight':
          e.preventDefault()
          setPosition(prev => ({ ...prev, x: Math.min(window.innerWidth - (pipSize === 'normal' ? 300 : 200) - 10, prev.x + (e.shiftKey ? 50 : 10)) }))
          break
      }
      resetControlsTimeout()
    }

    if (isHovered) {
      document.addEventListener('keydown', handleKeyDown)
      return () => document.removeEventListener('keydown', handleKeyDown)
    }
  }, [isHovered, togglePlayPause, toggleMute, isPlaying, currentTime, roomStatus, roomId, movie, onExpand, onClose, pipSize])

  return (
    <AnimatePresence>
      <motion.div
        ref={containerRef}
        initial={{ scale: 0, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0, opacity: 0 }}
        className={`fixed bg-black rounded-xl overflow-hidden shadow-2xl border-2 select-none transition-all duration-200 ${
          isDragging 
            ? "cursor-grabbing scale-105 shadow-3xl border-orange-500/70 ring-4 ring-orange-500/30" 
            : "cursor-grab hover:shadow-3xl border-orange-500/30 hover:border-orange-500/50"
        }`}
        style={{
          left: position.x,
          top: position.y,
          width: pipSize === 'normal' ? 300 : 200,
          height: pipSize === 'normal' ? 200 : 133,
          transition: isDragging ? 'none' : 'left 0.3s ease-out, top 0.3s ease-out, width 0.3s ease-out, height 0.3s ease-out',
          zIndex: 10000, // Very high z-index to ensure it's always on top
          cursor: isDragging ? 'grabbing' : 'grab', // Ensure cursor is properly set
          userSelect: 'none', // Prevent text selection
        }}
        onMouseDown={handleMouseDown}
        onDoubleClick={handleDoubleClick}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        onMouseEnter={() => {
          setIsHovered(true)
          setShowControls(true)
        }}
        onMouseLeave={() => {
          setIsHovered(false)
          if (!isDragging) setShowControls(false)
        }}
        onMouseMove={resetControlsTimeout}
        role="application"
        aria-label={`Picture-in-Picture player: ${movie?.title || 'Video'}`}
        tabIndex={0}
      >
        {/* Video */}
        <video
          ref={videoRef}
          src={movie?.videoUrl}
          className="w-full h-full object-cover pointer-events-none select-none"
          muted={isMuted}
          onMouseDown={(e) => e.preventDefault()} // Prevent any video-specific mouse handling
          poster={movie?.image}
          playsInline
        >
          <source
            src="https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4"
            type="video/mp4"
          />
        </video>

        {/* Loading Spinner */}
        {isLoading && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/50">
            <div className="w-8 h-8 border-2 border-orange-500 border-t-transparent rounded-full animate-spin" />
          </div>
        )}

        {/* Drag Handle Indicator */}
        {!showControls && !isDragging && (
          <div className="absolute top-2 left-1/2 transform -translate-x-1/2 flex flex-col items-center pointer-events-none">
            <div className="w-8 h-1 bg-white/40 rounded-full mb-1" />
            <div className="text-white/60 text-xs font-medium">Click & drag to move</div>
            <div className="text-white/40 text-xs">Arrow keys to fine-tune • ESC to close</div>
          </div>
        )}

        {/* Simple Progress Bar */}
        {!showControls && !isDragging && videoDuration > 0 && (
          <div className="absolute bottom-0 left-0 right-0 h-1 bg-black/30">
            <div 
              className="h-full bg-red-500 transition-all duration-200"
              style={{ width: `${(currentTime / videoDuration) * 100}%` }}
            />
          </div>
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
                    onClick={() => {
                      // Save current state before expanding
                      const currentVideoState = {
                        currentTime: videoRef.current?.currentTime || currentTime,
                        playing: isPlaying,
                        roomStatus,
                        timestamp: Date.now()
                      };
                      
                      // Store state in sessionStorage for the movie page to pick up
                      sessionStorage.setItem("expandFromPiP", JSON.stringify(currentVideoState));
                      
                      onExpand();
                      onClose();
                    }}
                    size="sm"
                    className="w-6 h-6 p-0 bg-white/20 hover:bg-white/30 text-black border-none backdrop-blur-sm rounded transition-all duration-200 hover:scale-110 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-offset-2 focus:ring-offset-black"
                    aria-label="Expand to fullscreen"
                  >
                    <Maximize className="w-3 h-3" />
                  </Button>
                  <Button
                    onClick={onClose}
                    size="sm"
                    className="w-6 h-6 p-0 bg-white/20 hover:bg-red-500/30 text-black border-none backdrop-blur-sm rounded transition-all duration-200 hover:scale-110 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 focus:ring-offset-black"
                    aria-label="Close Picture-in-Picture"
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
                    className="w-8 h-8 p-0 bg-white/20 hover:bg-white/30 text-black border-none backdrop-blur-sm rounded transition-all duration-200 hover:scale-110 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-offset-2 focus:ring-offset-black"
                    aria-label={isPlaying ? 'Pause video' : 'Play video'}
                  >
                    {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4 ml-0.5" />}
                  </Button>
                  
                  <Button
                    onClick={toggleMute}
                    size="sm"
                    className="w-8 h-8 p-0 bg-white/20 hover:bg-white/30 text-black border-none backdrop-blur-sm rounded transition-all duration-200 hover:scale-110 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-offset-2 focus:ring-offset-black"
                    aria-label={isMuted ? 'Unmute video' : 'Mute video'}
                  >
                    {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
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
            className="absolute inset-0 bg-gradient-to-br from-orange-500/40 via-transparent to-orange-500/40 border-2 border-orange-400 rounded-xl pointer-events-none"
          >
            <div className="absolute inset-2 border border-dashed border-orange-300/70 rounded-lg" />
            <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-orange-500/90 text-white text-xs px-3 py-2 rounded-lg font-bold shadow-lg">
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-white rounded-full animate-pulse" />
                <span>Moving...</span>
              </div>
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

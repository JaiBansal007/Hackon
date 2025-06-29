"use client"

import { useRef, useEffect, useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Button } from "../../ui/button"
import {
  Play,
  Pause,
  Volume2,
  VolumeX,
  Maximize,
  X,
  MessageCircle,
  Smile,
  UserCheck,
  PictureInPicture2,
} from "lucide-react"
import { FloatingReactions } from "./floating-reactions"
import { ReactionsPanel } from "./reactions-panel"
import { ViewingHistoryManager } from "../../../lib/viewing-history"

export function VideoPlayer({
  movie,
  user,
  currentVideoTime,
  playing,
  syncedVideoState,
  isWatching,
  isFullscreen,
  roomStatus,
  roomId,
  roomMembers,
  recentReactions,
  onToggleFullscreen,
  onExitVideo,
  onToggleChat,
  onToggleReactions,
  onToggleRoomMembers,
  onSendReaction,
  showReactions,
  showChat,
  showRoomMembers,
  wsRef,
  // Firebase video sync props
  onPlay,
  onPause,
  onSeek,
  onTimeUpdate,
  // Permission props
  isHost,
  hasVideoPermission,
  canControlVideo,
  onPlayingStateChange,
  initialPlaying = false,
  initialCurrentTime = 0,
}) {
  const videoRef = useRef(null)
  const volumeTimeoutRef = useRef(null)
  const lastSeekRef = useRef(null)
  const progressSaveIntervalRef = useRef(null)
  const [isPlaying, setIsPlaying] = useState(initialPlaying)
  const [currentTime, setCurrentTime] = useState(initialCurrentTime)
  const [videoDuration, setVideoDuration] = useState(0)
  const [volume, setVolume] = useState(1)
  const [isMuted, setIsMuted] = useState(false)
  const [showVolumeSlider, setShowVolumeSlider] = useState(false)
  const [hasResumed, setHasResumed] = useState(false)
  const [syncStatus, setSyncStatus] = useState({ syncing: false, message: "" })
  
  // Native Picture-in-Picture state
  const [isNativePiP, setIsNativePiP] = useState(false)
  const [pipSupported, setPipSupported] = useState(false)
  const [showPiPPlaceholder, setShowPiPPlaceholder] = useState(false)
  const [pipPlaceholderPosition, setPipPlaceholderPosition] = useState({ x: 20, y: 20 })
  const [isDraggingPlaceholder, setIsDraggingPlaceholder] = useState(false)
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 })
  const placeholderRef = useRef(null)

  const viewingHistoryManager = ViewingHistoryManager.getInstance()

  useEffect(() => {
    const video = videoRef.current
    if (video) {
      const handleTimeUpdate = () => {
        setCurrentTime(video.currentTime)
        if (onTimeUpdate) onTimeUpdate(video.currentTime)

        // Save progress every 10 seconds while playing
        if (!video.paused && video.duration && movie?.movieId) {
          const now = Date.now()
          if (!progressSaveIntervalRef.current || now - progressSaveIntervalRef.current > 10000) {
            progressSaveIntervalRef.current = now
            saveProgress()
          }
        }
      }

      const handleLoadedMetadata = () => {
        setVideoDuration(video.duration)
        video.volume = volume

        // Set initial time if provided
        if (initialCurrentTime > 0) {
          video.currentTime = initialCurrentTime
          setCurrentTime(initialCurrentTime)
        } else if (movie?.movieId && !hasResumed) {
          // Auto-resume from saved position only if no initial time provided
          const resumeTime = viewingHistoryManager.getResumeTime(movie.movieId)
          if (resumeTime > 0 && resumeTime < video.duration * 0.95) {
            video.currentTime = resumeTime
            setCurrentTime(resumeTime)
            console.log(
              `Resuming ${movie.title} from ${Math.floor(resumeTime / 60)}:${Math.floor(resumeTime % 60)
                .toString()
                .padStart(2, "0")}`,
            )
          }
        }

        // Set initial playing state - don't auto-play unless specified
        if (initialPlaying) {
          video.play().catch(console.error)
          setIsPlaying(true)
        } else {
          video.pause()
          setIsPlaying(false)
        }

        setHasResumed(true)
      }

      const handlePlay = () => {
        setIsPlaying(true)
        if (onPlayingStateChange) onPlayingStateChange(true)
      }

      const handlePause = () => {
        setIsPlaying(false)
        if (onPlayingStateChange) onPlayingStateChange(false)
      }

      const handleEnded = () => {
        // Mark as completed when video ends
        if (movie?.movieId) {
          viewingHistoryManager.markAsCompleted(movie.movieId)
        }
      }

      video.addEventListener("timeupdate", handleTimeUpdate)
      video.addEventListener("loadedmetadata", handleLoadedMetadata)
      video.addEventListener("play", handlePlay)
      video.addEventListener("pause", handlePause)
      video.addEventListener("ended", handleEnded)

      return () => {
        video.removeEventListener("timeupdate", handleTimeUpdate)
        video.removeEventListener("loadedmetadata", handleLoadedMetadata)
        video.removeEventListener("play", handlePlay)
        video.removeEventListener("pause", handlePause)
        video.removeEventListener("ended", handleEnded)
      }
    }
  }, [volume, movie?.movieId, hasResumed, initialPlaying, initialCurrentTime, onTimeUpdate, onPlayingStateChange])

  // Save progress function
  const saveProgress = () => {
    const video = videoRef.current
    if (video && movie?.movieId && video.duration) {
      viewingHistoryManager.updateMovieProgress({
        movieId: movie.movieId,
        title: movie.title,
        image: movie.image,
        watchedDuration: video.currentTime,
        totalDuration: video.duration,
        videoUrl: movie.videoUrl,
      })
    }
  }

  // Save progress when component unmounts or video stops
  useEffect(() => {
    return () => {
      saveProgress()
    }
  }, [])

  // Save progress when user pauses or seeks
  useEffect(() => {
    const video = videoRef.current
    if (video && movie?.movieId) {
      const handlePause = () => saveProgress()
      const handleSeeked = () => saveProgress()

      video.addEventListener("pause", handlePause)
      video.addEventListener("seeked", handleSeeked)

      return () => {
        video.removeEventListener("pause", handlePause)
        video.removeEventListener("seeked", handleSeeked)
      }
    }
  }, [movie?.movieId])

  // Video sync is now handled via Firebase Real-time Database
  // Legacy WebSocket code removed

  useEffect(() => {
    const video = videoRef.current
    if (!video) return

    // Seek if currentVideoTime changes and is different from current time
    if (
      typeof currentVideoTime === "number" &&
      Math.abs(video.currentTime - currentVideoTime) > 0.5 // avoid micro-jumps
    ) {
      video.currentTime = currentVideoTime
      lastSeekRef.current = currentVideoTime
    }

    // Play/pause if playing prop changes
    if (typeof playing === "boolean") {
      if (playing && video.paused) {
        video.play()
      } else if (!playing && !video.paused) {
        video.pause()
      }
    }
  }, [currentVideoTime, playing, movie?.videoUrl])

  const togglePlayPause = () => {
    // Check permissions
    if (roomStatus !== "none" && !canControlVideo) {
      console.warn("🚫 No permission to control video", {
        roomStatus,
        canControlVideo,
        isHost,
        hasVideoPermission
      });
      return;
    }

    console.log("🎮 Video control action:", {
      action: isPlaying ? "pause" : "play",
      canControlVideo,
      isHost,
      hasVideoPermission,
      roomStatus
    });

    if (videoRef.current) {
      const currentVideoTime = videoRef.current.currentTime
      if (isPlaying) {
        videoRef.current.pause()
        setIsPlaying(false)
        if (onPlayingStateChange) onPlayingStateChange(false)
        // Use Firebase video sync
        if (onPause && roomStatus !== "none") {
          onPause(currentVideoTime, movie?.videoUrl)
        }
      } else {
        videoRef.current.play()
        setIsPlaying(true)
        if (onPlayingStateChange) onPlayingStateChange(true)
        // Use Firebase video sync
        if (onPlay && roomStatus !== "none") {
          onPlay(currentVideoTime, movie?.videoUrl)
        }
      }
    }
  }

  const handleVideoSeek = (e) => {
    // Check permissions
    if (roomStatus !== "none" && !canControlVideo) {
      console.warn("🚫 No permission to seek video");
      return;
    }

    const newTime = Number.parseFloat(e.target.value)
    if (videoRef.current) {
      videoRef.current.currentTime = newTime
      setCurrentTime(newTime)
      if (onTimeUpdate) onTimeUpdate(newTime)
      // Use Firebase video sync
      if (onSeek && roomStatus !== "none") {
        onSeek(newTime, movie?.videoUrl)
      }
      // Save progress immediately when user seeks
      setTimeout(saveProgress, 100)
    }
  }

  const handleVolumeChange = (e) => {
    const newVolume = Number.parseFloat(e.target.value)
    setVolume(newVolume)
    setIsMuted(newVolume === 0)
    if (videoRef.current) videoRef.current.volume = newVolume
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

  const formatTime = (time) => {
    const minutes = Math.floor(time / 60)
    const seconds = Math.floor(time % 60)
    return `${minutes}:${seconds.toString().padStart(2, "0")}`
  }

  const handleVolumeMouseEnter = () => {
    if (volumeTimeoutRef.current) clearTimeout(volumeTimeoutRef.current)
    setShowVolumeSlider(true)
  }

  const handleVolumeMouseLeave = () => {
    volumeTimeoutRef.current = setTimeout(() => setShowVolumeSlider(false), 300)
  }

  // Handle user play/pause/seek events
  const handlePlay = () => {
    if (onPlay && videoRef.current) {
      onPlay(videoRef.current.currentTime, movie?.videoUrl)
    }
  }
  const handlePause = () => {
    if (onPause && videoRef.current) {
      onPause(videoRef.current.currentTime, movie?.videoUrl)
    }
  }
  const handleSeek = (e) => {
    if (onSeek && videoRef.current) {
      // Only trigger if seek is user-initiated
      if (lastSeekRef.current === null || Math.abs(videoRef.current.currentTime - lastSeekRef.current) > 0.5) {
        onSeek(videoRef.current.currentTime, movie?.videoUrl)
        lastSeekRef.current = videoRef.current.currentTime
      }
    }
  }

  // Enhanced synced video state handler with better accuracy and status feedback
  useEffect(() => {
    if (!syncedVideoState || !videoRef.current) return;

    const video = videoRef.current;
    const { 
      isPlaying, 
      currentTime: syncTime, 
      action, 
      lastUpdatedBy,
      networkDelay = 0,
      syncId,
      lastUpdatedByName 
    } = syncedVideoState;

    // Prevent sync loops - don't process our own updates
    if (lastUpdatedBy === user?.uid) {
      return;
    }

    // Show sync status
    setSyncStatus({ 
      syncing: true, 
      message: `Syncing with ${lastUpdatedByName || 'host'}...` 
    });

    console.log("🎬 Processing video sync:", {
      action,
      isPlaying,
      syncTime,
      networkDelay: networkDelay + "ms",
      from: lastUpdatedByName
    });

    // Calculate time difference with network compensation
    const timeDiff = Math.abs(video.currentTime - syncTime);
    const syncThreshold = 0.5; // More aggressive sync threshold

    // Handle different sync actions
    switch (action) {
      case 'play':
        if (video.paused && isPlaying) {
          // Seek first if there's a significant time difference
          if (timeDiff > syncThreshold) {
            video.currentTime = syncTime;
          }
          video.play().then(() => {
            setIsPlaying(true);
            setCurrentTime(syncTime);
            setSyncStatus({ syncing: false, message: "" });
          }).catch(err => {
            console.warn("Play failed:", err);
            setSyncStatus({ syncing: false, message: "" });
          });
        } else {
          setSyncStatus({ syncing: false, message: "" });
        }
        break;

      case 'pause':
        if (!video.paused && !isPlaying) {
          video.currentTime = syncTime;
          video.pause();
          setIsPlaying(false);
          setCurrentTime(syncTime);
        }
        setSyncStatus({ syncing: false, message: "" });
        break;

      case 'seek':
        video.currentTime = syncTime;
        setCurrentTime(syncTime);
        setSyncStatus({ syncing: false, message: "" });
        break;

      default:
        // General sync - only sync if time difference is significant
        if (timeDiff > syncThreshold) {
          video.currentTime = syncTime;
          setCurrentTime(syncTime);
        }

        // Sync play/pause state
        if (video.paused !== !isPlaying) {
          if (isPlaying) {
            video.play().catch(err => console.warn("Play failed:", err));
            setIsPlaying(true);
          } else {
            video.pause();
            setIsPlaying(false);
          }
        }
        setSyncStatus({ syncing: false, message: "" });
        break;
    }

    // Clear sync status after a timeout
    setTimeout(() => setSyncStatus({ syncing: false, message: "" }), 1000);
  }, [syncedVideoState, user?.uid]);

  // Check for native Picture-in-Picture support
  useEffect(() => {
    const video = videoRef.current
    if (video && 'requestPictureInPicture' in video) {
      setPipSupported(true)
    }
  }, [])

  // Handle native PiP events
  useEffect(() => {
    const video = videoRef.current
    if (!video || !pipSupported) return

    const handleEnterpictureinpicture = () => {
      console.log('🎭 ENTERED native PiP mode')
      setIsNativePiP(true)
      setShowPiPPlaceholder(true)
    }

    const handleLeavepictureinpicture = () => {
      console.log('🎭 LEFT native PiP mode')
      setIsNativePiP(false)
      setShowPiPPlaceholder(false)
    }

    video.addEventListener('enterpictureinpicture', handleEnterpictureinpicture)
    video.addEventListener('leavepictureinpicture', handleLeavepictureinpicture)

    return () => {
      video.removeEventListener('enterpictureinpicture', handleEnterpictureinpicture)
      video.removeEventListener('leavepictureinpicture', handleLeavepictureinpicture)
    }
  }, [pipSupported])

  // Native PiP toggle function
  const toggleNativePiP = async () => {
    console.log('🎭 Native PiP toggle called - Current state:', { isNativePiP, pipSupported })
    
    const video = videoRef.current
    if (!video || !pipSupported) {
      console.warn('Picture-in-Picture is not supported')
      // You could show a toast notification here
      return
    }

    try {
      if (isNativePiP) {
        console.log('🎭 Exiting native PiP...')
        await document.exitPictureInPicture()
      } else {
        console.log('🎭 Entering native PiP...')
        // Ensure video is playing before entering PiP
        if (video.paused) {
          await video.play()
        }
        await video.requestPictureInPicture()
      }
    } catch (error) {
      console.error('Error toggling Picture-in-Picture:', error)
      
      // Handle specific PiP errors
      if (error.name === 'InvalidStateError') {
        console.warn('Video is not ready for Picture-in-Picture')
      } else if (error.name === 'NotSupportedError') {
        console.warn('Picture-in-Picture is not supported by this browser')
      } else if (error.name === 'NotAllowedError') {
        console.warn('Picture-in-Picture was denied by user or browser policy')
      }
      
      // Reset PiP state if there was an error
      setIsNativePiP(false)
      setShowPiPPlaceholder(false)
    }
  }

  // Draggable placeholder mouse event handlers
  const handlePlaceholderMouseDown = (e) => {
    setIsDraggingPlaceholder(true)
    const rect = placeholderRef.current?.getBoundingClientRect()
    if (rect) {
      setDragOffset({
        x: e.clientX - rect.left,
        y: e.clientY - rect.top
      })
    }
    e.preventDefault()
  }

  // Double-click to toggle PiP
  const handlePlaceholderDoubleClick = (e) => {
    e.preventDefault()
    e.stopPropagation()
    toggleNativePiP()
  }

  // Global mouse move and up handlers for dragging
  useEffect(() => {
    if (!isDraggingPlaceholder) return

    const handleMouseMove = (e) => {
      const newX = e.clientX - dragOffset.x
      const newY = e.clientY - dragOffset.y
      
      // Constrain within window bounds
      const windowWidth = window.innerWidth
      const windowHeight = window.innerHeight
      const placeholderWidth = 240 // placeholder width
      const placeholderHeight = 135 // placeholder height
      
      const constrainedX = Math.max(0, Math.min(newX, windowWidth - placeholderWidth))
      const constrainedY = Math.max(0, Math.min(newY, windowHeight - placeholderHeight))
      
      setPipPlaceholderPosition({ x: constrainedX, y: constrainedY })
    }

    const handleMouseUp = () => {
      setIsDraggingPlaceholder(false)
    }

    document.addEventListener('mousemove', handleMouseMove)
    document.addEventListener('mouseup', handleMouseUp)

    return () => {
      document.removeEventListener('mousemove', handleMouseMove)
      document.removeEventListener('mouseup', handleMouseUp)
    }
  }, [isDraggingPlaceholder, dragOffset])

  // ESC key to exit PiP mode
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && isNativePiP) {
        e.preventDefault()
        toggleNativePiP()
      }
    }

    document.addEventListener('keydown', handleKeyDown)
    return () => {
      document.removeEventListener('keydown', handleKeyDown)
    }
  }, [isNativePiP])

  if (!isWatching) return null

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className={`fixed bg-black z-40 flex transition-all duration-300 ${
        isFullscreen ? "inset-0 z-50" : `inset-0 ${showChat || showRoomMembers ? "right-80" : ""}`
      }`}
    >
      <div className="relative w-full h-full bg-black">
        <video
          ref={videoRef}
          src={movie?.videoUrl}
          className="w-full h-full object-cover"
          controls={false}
          poster={movie.image}
          onPlay={handlePlay}
          onPause={handlePause}
          onSeeked={handleSeek}
        >
          <source
            src="https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4"
            type="video/mp4"
          />
          Your browser does not support the video tag.
        </video>

        <FloatingReactions reactions={recentReactions} />

        {/* Sync Status Indicator */}
        <AnimatePresence>
          {syncStatus.syncing && (
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="absolute top-4 left-1/2 transform -translate-x-1/2 bg-black/80 text-white px-4 py-2 rounded-lg flex items-center space-x-2 z-50"
            >
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              <span className="text-sm">{syncStatus.message}</span>
            </motion.div>
          )}
        </AnimatePresence>

        <ReactionsPanel show={showReactions} onReactionSelect={onSendReaction} />

        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/90 via-black/60 to-transparent">
          {/* Progress Bar */}
          <div className="px-4 pt-3 pb-2">
            <input
              type="range"
              min="0"
              max={videoDuration}
              value={currentTime}
              onChange={handleVideoSeek}
              disabled={roomStatus !== "none" && !canControlVideo}
              className={`w-full h-1 rounded-lg appearance-none transition-all ${
                roomStatus !== "none" && !canControlVideo ? "cursor-not-allowed opacity-50" : "cursor-pointer hover:h-1.5"
              }`}
              style={{
                background: `linear-gradient(to right, #f97316 0%, #f97316 ${
                  videoDuration ? (currentTime / videoDuration) * 100 : 0
                }%, #374151 ${videoDuration ? (currentTime / videoDuration) * 100 : 0}%, #374151 100%)`,
              }}
            />
          </div>

          {/* Controls Bar */}
          <div className="flex items-center justify-between px-4 pb-3">
            {/* Left Controls */}
            <div className="flex items-center space-x-3">
              {/* Play/Pause Button */}
              <motion.button
                onClick={togglePlayPause}
                disabled={roomStatus !== "none" && !canControlVideo}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className={`p-2 rounded-full transition-all ${
                  roomStatus !== "none" && !canControlVideo 
                    ? "bg-gray-600/50 text-gray-400 cursor-not-allowed" 
                    : "bg-white/20 hover:bg-white/30 text-white backdrop-blur-sm"
                }`}
                title={roomStatus !== "none" && !canControlVideo ? "No video control permission" : ""}
              >
                {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
              </motion.button>

              {/* Volume Control */}
              <div
                className="relative flex items-center"
                onMouseEnter={handleVolumeMouseEnter}
                onMouseLeave={handleVolumeMouseLeave}
              >
                <motion.button
                  onClick={toggleMute}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="p-2 rounded-full bg-white/20 hover:bg-white/30 text-white border-none backdrop-blur-sm transition-all"
                >
                  {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
                </motion.button>

                <AnimatePresence>
                  {showVolumeSlider && (
                    <motion.div
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -10 }}
                      className="absolute left-full ml-2 bg-black/80 backdrop-blur-sm rounded-lg p-2"
                    >
                      <input
                        type="range"
                        min="0"
                        max="1"
                        step="0.1"
                        value={isMuted ? 0 : volume}
                        onChange={handleVolumeChange}
                        className="w-16 h-1 bg-gray-600 rounded-lg appearance-none cursor-pointer"
                        style={{
                          background: `linear-gradient(to right, #f97316 0%, #f97316 ${
                            (isMuted ? 0 : volume) * 100
                          }%, #4b5563 ${(isMuted ? 0 : volume) * 100}%, #4b5563 100%)`,
                        }}
                      />
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* Time Display */}
              <div className="flex items-center space-x-1 text-xs text-gray-300 font-mono">
                <span>{formatTime(currentTime)}</span>
                <span>/</span>
                <span>{formatTime(videoDuration)}</span>
              </div>

              {/* Permission Status */}
              {roomStatus !== "none" && (
                <div className="flex items-center space-x-1 text-xs">
                  {isHost ? (
                    <span className="bg-yellow-500/20 text-yellow-400 px-2 py-1 rounded-full border border-yellow-500/30">
                      👑 Host
                    </span>
                  ) : hasVideoPermission ? (
                    <span className="bg-green-500/20 text-green-400 px-2 py-1 rounded-full border border-green-500/30">
                      🎮 Control
                    </span>
                  ) : (
                    <span className="bg-gray-500/20 text-gray-400 px-2 py-1 rounded-full border border-gray-500/30">
                      👀 Viewer
                    </span>
                  )}
                </div>
              )}
            </div>

            {/* Center - Movie Title */}
            <div className="flex-1 text-center">
              <h2 className="text-white text-sm font-medium truncate max-w-xs mx-auto">
                {movie.title}
              </h2>
            </div>

            {/* Right Controls */}
            <div className="flex items-center space-x-2">
              {roomStatus !== "none" && (
                <>
                  <motion.button
                    onClick={onToggleReactions}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="p-2 rounded-full bg-white/20 hover:bg-white/30 text-white border-none backdrop-blur-sm transition-all"
                  >
                    <Smile className="w-4 h-4" />
                  </motion.button>
                  <motion.button
                    onClick={onToggleRoomMembers}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="p-2 rounded-full bg-white/20 hover:bg-white/30 text-white border-none backdrop-blur-sm transition-all relative"
                  >
                    <UserCheck className="w-4 h-4" />
                    {roomMembers.length > 0 && (
                      <span className="absolute -top-1 -right-1 bg-blue-500 text-white text-xs rounded-full w-4 h-4 flex items-center justify-center">
                        {roomMembers.length}
                      </span>
                    )}
                  </motion.button>
                </>
              )}
              <motion.button
                onClick={onToggleChat}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="p-2 rounded-full bg-white/20 hover:bg-white/30 text-white border-none backdrop-blur-sm transition-all"
              >
                <MessageCircle className="w-4 h-4" />
              </motion.button>
              <motion.button
                onClick={toggleNativePiP}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className={`p-2 rounded-full ${pipSupported 
                  ? (isNativePiP 
                    ? 'bg-blue-500/30 text-blue-400' 
                    : 'bg-white/20 hover:bg-white/30 text-white'
                  ) 
                  : 'bg-gray-500/20 text-gray-500 cursor-not-allowed'
                } border-none backdrop-blur-sm transition-all`}
                disabled={!pipSupported}
                title={pipSupported 
                  ? (isNativePiP ? 'Exit Picture-in-Picture' : 'Enter Picture-in-Picture')
                  : 'Picture-in-Picture not supported'
                }
              >
                <PictureInPicture2 className="w-4 h-4" />
              </motion.button>
              <motion.button
                onClick={() => {
                  // Check if we're exiting fullscreen and should restore PiP state
                  const expandFromPiP = sessionStorage.getItem("expandFromPiP");
                  if (expandFromPiP && document.fullscreenElement) {
                    // We're exiting fullscreen from PiP expansion
                    try {
                      const pipState = JSON.parse(expandFromPiP);
                      // Clear the flag
                      sessionStorage.removeItem("expandFromPiP");
                      
                      // Exit fullscreen first, then handle the video state
                      document.exitFullscreen().then(() => {
                        // The video should continue playing with the same state
                        if (videoRef.current) {
                          videoRef.current.currentTime = pipState.currentTime;
                          if (pipState.playing) {
                            videoRef.current.play().catch(console.error);
                          } else {
                            videoRef.current.pause();
                          }
                        }
                      }).catch(console.error);
                      return;
                    } catch (error) {
                      console.error("Error parsing PiP expand state:", error);
                      sessionStorage.removeItem("expandFromPiP");
                    }
                  }
                  
                  // Normal fullscreen toggle
                  onToggleFullscreen();
                }}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="p-2 rounded-full bg-white/20 hover:bg-white/30 text-white border-none backdrop-blur-sm transition-all"
              >
                <Maximize className="w-4 h-4" />
              </motion.button>
              <motion.button
                onClick={onExitVideo}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="p-2 rounded-full bg-red-500/20 hover:bg-red-500/30 text-red-400 border-none backdrop-blur-sm transition-all"
              >
                <X className="w-4 h-4" />
              </motion.button>
            </div>
          </div>
        </div>

        {roomStatus !== "none" && (
          <div className="absolute top-4 left-4 bg-black/70 backdrop-blur-sm px-4 py-2 rounded-lg">
            <span className="text-white text-sm">
              Room {roomId} • {roomStatus === "host" ? "HOST" : "MEMBER"}
            </span>
          </div>
        )}
      </div>

    </motion.div>
  )
}

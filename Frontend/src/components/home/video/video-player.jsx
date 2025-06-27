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
  currentVideoTime,
  playing,
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
  onTogglePiP,
  onSendReaction,
  showReactions,
  wsRef,
  onPlay,
  onPause,
  onSeek,
  onTimeUpdate,
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

  useEffect(() => {
    if (wsRef.current && roomStatus !== "none") {
      const handleVideoSync = (data) => {
        if (videoRef.current) {
          const timeDiff = Math.abs(data.currentTime - videoRef.current.currentTime)
          if (timeDiff > 1) videoRef.current.currentTime = data.currentTime
          if (data.playing && videoRef.current.paused) {
            videoRef.current.play()
          } else if (!data.playing && !videoRef.current.paused) {
            videoRef.current.pause()
          }
        }
      }

      const handleVideoPlay = (data) => {
        if (videoRef.current && data.userId !== wsRef.current?.userId) {
          videoRef.current.currentTime = data.currentTime
          videoRef.current.play()
          setIsPlaying(true)
        }
      }

      const handleVideoPause = (data) => {
        if (videoRef.current && data.userId !== wsRef.current?.userId) {
          videoRef.current.currentTime = data.currentTime
          videoRef.current.pause()
          setIsPlaying(false)
        }
      }

      const handleVideoSeek = (data) => {
        if (videoRef.current && data.userId !== wsRef.current?.userId) {
          videoRef.current.currentTime = data.currentTime
        }
      }

      wsRef.current.on("video_sync", handleVideoSync)
      wsRef.current.on("video_play", handleVideoPlay)
      wsRef.current.on("video_pause", handleVideoPause)
      wsRef.current.on("video_seek", handleVideoSeek)

      return () => {
        if (wsRef.current) {
          wsRef.current.off("video_sync", handleVideoSync)
          wsRef.current.off("video_play", handleVideoPlay)
          wsRef.current.off("video_pause", handleVideoPause)
          wsRef.current.off("video_seek", handleVideoSeek)
        }
      }
    }
  }, [roomStatus, wsRef])

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
    if (videoRef.current) {
      const currentVideoTime = videoRef.current.currentTime
      if (isPlaying) {
        videoRef.current.pause()
        setIsPlaying(false)
        if (onPlayingStateChange) onPlayingStateChange(false)
        if (wsRef.current && roomStatus !== "none") wsRef.current.pause(currentVideoTime)
      } else {
        videoRef.current.play()
        setIsPlaying(true)
        if (onPlayingStateChange) onPlayingStateChange(true)
        if (wsRef.current && roomStatus !== "none") wsRef.current.play(currentVideoTime)
      }
    }
  }

  const handleVideoSeek = (e) => {
    const newTime = Number.parseFloat(e.target.value)
    if (videoRef.current) {
      videoRef.current.currentTime = newTime
      setCurrentTime(newTime)
      if (onTimeUpdate) onTimeUpdate(newTime)
      if (wsRef.current && roomStatus !== "none") wsRef.current.seek(newTime)
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

  if (!isWatching) return null

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className={`fixed inset-0 bg-black z-40 flex ${isFullscreen ? "z-50" : ""}`}
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
        <ReactionsPanel show={showReactions} onReactionSelect={onSendReaction} />

        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent p-4">
          <div className="mb-4">
            <input
              type="range"
              min="0"
              max={videoDuration}
              value={currentTime}
              onChange={handleVideoSeek}
              className="w-full h-1 bg-gray-600 rounded-lg appearance-none cursor-pointer"
              style={{
                background: `linear-gradient(to right, #f97316 0%, #f97316 ${
                  videoDuration ? (currentTime / videoDuration) * 100 : 0
                }%, #4b5563 ${videoDuration ? (currentTime / videoDuration) * 100 : 0}%, #4b5563 100%)`,
              }}
            />
            <div className="flex justify-between text-xs text-gray-300 mt-1">
              <span>{formatTime(currentTime)}</span>
              <span>{formatTime(videoDuration)}</span>
            </div>
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Button
                onClick={togglePlayPause}
                size="sm"
                className="bg-white/20 hover:bg-white/30 text-black border-none backdrop-blur-sm"
              >
                {isPlaying ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5" />}
              </Button>

              <div
                className="relative flex items-center space-x-2"
                onMouseEnter={handleVolumeMouseEnter}
                onMouseLeave={handleVolumeMouseLeave}
              >
                <Button
                  onClick={toggleMute}
                  size="sm"
                  className="bg-white/20 hover:bg-white/30 text-black border-none backdrop-blur-sm"
                >
                  {isMuted ? <VolumeX className="w-5 h-5" /> : <Volume2 className="w-5 h-5" />}
                </Button>

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
                        className="w-20 h-1 bg-gray-600 rounded-lg appearance-none cursor-pointer"
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

              <div className="text-white text-sm font-medium">{movie.title}</div>
            </div>

            <div className="flex items-center space-x-2">
              {roomStatus !== "none" && (
                <>
                  <Button
                    onClick={onToggleReactions}
                    size="sm"
                    className="bg-white/20 hover:bg-white/30 text-black border-none backdrop-blur-sm"
                  >
                    <Smile className="w-5 h-5" />
                  </Button>
                  <Button
                    onClick={onToggleRoomMembers}
                    size="sm"
                    className="bg-white/20 hover:bg-white/30 text-black border-none backdrop-blur-sm"
                  >
                    <UserCheck className="w-5 h-5" />
                    {roomMembers.length > 0 && <span className="ml-1 text-xs">{roomMembers.length}</span>}
                  </Button>
                </>
              )}
              <Button
                onClick={onToggleChat}
                size="sm"
                className="bg-white/20 hover:bg-white/30 text-black border-none backdrop-blur-sm"
              >
                <MessageCircle className="w-5 h-5" />
              </Button>
              <Button
                onClick={onTogglePiP}
                size="sm"
                className="bg-white/20 hover:bg-white/30 text-black border-none backdrop-blur-sm"
              >
                <PictureInPicture2 className="w-5 h-5" />
              </Button>
              <Button
                onClick={onToggleFullscreen}
                size="sm"
                className="bg-white/20 hover:bg-white/30 text-black border-none backdrop-blur-sm"
              >
                <Maximize className="w-5 h-5" />
              </Button>
              <Button
                onClick={onExitVideo}
                size="sm"
                className="bg-white/20 hover:bg-white/30 text-black border-none backdrop-blur-sm"
              >
                <X className="w-5 h-5" />
              </Button>
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

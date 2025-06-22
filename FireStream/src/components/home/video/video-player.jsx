"use client"

import { useRef, useEffect, useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Button } from "../../ui/button"
import { Play, Pause, Volume2, VolumeX, Maximize, X, MessageCircle, Smile, UserCheck } from "lucide-react"
import { FloatingReactions } from "./floating-reactions"
import { ReactionsPanel } from "./reactions-panel"

export default function VideoPlayer({
  movie,
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
  wsRef,
}) {
  const videoRef = useRef(null)
  const [isPlaying, setIsPlaying] = useState(true)
  const [currentTime, setCurrentTime] = useState(0)
  const [videoDuration, setVideoDuration] = useState(0)
  const [volume, setVolume] = useState(1)
  const [isMuted, setIsMuted] = useState(false)
  const [showVolumeSlider, setShowVolumeSlider] = useState(false)
  const volumeTimeoutRef = useRef(null)

  useEffect(() => {
    const video = videoRef.current
    if (video) {
      const handleTimeUpdate = () => setCurrentTime(video.currentTime)
      const handleLoadedMetadata = () => {
        setVideoDuration(video.duration)
        video.volume = volume
      }
      const handlePlay = () => setIsPlaying(true)
      const handlePause = () => setIsPlaying(false)

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
  }, [volume])

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

  const togglePlayPause = () => {
    if (videoRef.current) {
      const currentVideoTime = videoRef.current.currentTime
      if (isPlaying) {
        videoRef.current.pause()
        setIsPlaying(false)
        if (wsRef.current && roomStatus !== "none") wsRef.current.pause(currentVideoTime)
      } else {
        videoRef.current.play()
        setIsPlaying(true)
        if (wsRef.current && roomStatus !== "none") wsRef.current.play(currentVideoTime)
      }
    }
  }

  const handleVideoSeek = (e) => {
    const newTime = parseFloat(e.target.value)
    if (videoRef.current) {
      videoRef.current.currentTime = newTime
      setCurrentTime(newTime)
      if (wsRef.current && roomStatus !== "none") wsRef.current.seek(newTime)
    }
  }

  const handleVolumeChange = (e) => {
    const newVolume = parseFloat(e.target.value)
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

  if (!isWatching) return null

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className={`fixed inset-0 bg-black z-40 flex ${isFullscreen ? "z-50" : ""}`}
    >
      <div className="relative w-full h-full bg-black">
        <video ref={videoRef} className="w-full h-full object-cover" autoPlay controls={false} poster={movie.image}>
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
                className="bg-white/20 hover:bg-white/30 text-white border-none backdrop-blur-sm"
              >
                {isPlaying ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5" />}
              </Button>

              <div className="relative flex items-center space-x-2" onMouseEnter={handleVolumeMouseEnter} onMouseLeave={handleVolumeMouseLeave}>
                <Button
                  onClick={toggleMute}
                  size="sm"
                  className="bg-white/20 hover:bg-white/30 text-white border-none backdrop-blur-sm"
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
                    className="bg-white/20 hover:bg-white/30 text-white border-none backdrop-blur-sm"
                  >
                    <Smile className="w-5 h-5" />
                  </Button>
                  <Button
                    onClick={onToggleRoomMembers}
                    size="sm"
                    className="bg-white/20 hover:bg-white/30 text-white border-none backdrop-blur-sm"
                  >
                    <UserCheck className="w-5 h-5" />
                    {roomMembers.length > 0 && <span className="ml-1 text-xs">{roomMembers.length}</span>}
                  </Button>
                </>
              )}
              <Button
                onClick={onToggleChat}
                size="sm"
                className="bg-white/20 hover:bg-white/30 text-white border-none backdrop-blur-sm"
              >
                <MessageCircle className="w-5 h-5" />
              </Button>
              <Button
                onClick={onToggleFullscreen}
                size="sm"
                className="bg-white/20 hover:bg-white/30 text-white border-none backdrop-blur-sm"
              >
                <Maximize className="w-5 h-5" />
              </Button>
              <Button
                onClick={onExitVideo}
                size="sm"
                className="bg-white/20 hover:bg-white/30 text-white border-none backdrop-blur-sm"
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
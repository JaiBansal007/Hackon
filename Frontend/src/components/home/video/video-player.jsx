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
  const [showMovieChangeNotification, setShowMovieChangeNotification] = useState(false)
  const [movieChangeDetails, setMovieChangeDetails] = useState(null)
  const [hostMovieState, setHostMovieState] = useState(null) // Track host's current movie
  
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

  // Function to join host's movie
  const joinHostMovie = () => {
    if (!hostMovieState?.videoUrl || !videoRef.current || !syncedVideoState) return;
    
    const video = videoRef.current;
    
    console.log('🎬 Guest joining host movie:', {
      currentVideo: movie?.videoUrl,
      hostVideo: hostMovieState.videoUrl,
      hostName: hostMovieState.hostName,
      syncedState: syncedVideoState
    });
    
    // Exit PiP mode if currently active
    if (isNativePiP) {
      console.log('🎭 Exiting PiP to join host movie...');
      document.exitPictureInPicture().catch(console.error);
      setIsNativePiP(false);
      setShowPiPPlaceholder(false);
    }
    
    // Update video source to host's movie
    video.src = hostMovieState.videoUrl;
    
    // Show sync status
    setSyncStatus({ 
      syncing: true, 
      message: `Joining ${hostMovieState.hostName}'s movie...` 
    });
    
    // When video loads, sync with host's current state
    const handleLoadedData = () => {
      console.log('🎬 Video loaded, syncing with host state:', syncedVideoState);
      
      // Sync to host's current time
      if (syncedVideoState.currentTime !== undefined) {
        video.currentTime = syncedVideoState.currentTime;
        setCurrentTime(syncedVideoState.currentTime);
      }
      
      // Sync play/pause state
      if (syncedVideoState.isPlaying) {
        video.play().then(() => {
          setIsPlaying(true);
          setSyncStatus({ syncing: false, message: "" });
          console.log('🎬 Successfully joined and synced with host');
        }).catch(err => {
          console.warn("Play failed after join:", err);
          setSyncStatus({ syncing: false, message: "" });
        });
      } else {
        video.pause();
        setIsPlaying(false);
        setSyncStatus({ syncing: false, message: "" });
        console.log('🎬 Successfully joined and synced with host (paused)');
      }
      
      // Remove the event listener after use
      video.removeEventListener('loadeddata', handleLoadedData);
    };
    
    // Add event listener for when video data is loaded
    video.addEventListener('loadeddata', handleLoadedData);
    
    // Load the new video
    video.load();
    
    // Clear any pending notifications since we're manually joining
    setShowMovieChangeNotification(false);
    setMovieChangeDetails(null);
  };

  // Check if guest can join host's movie (different videos and not host)
  const canJoinHostMovie = !isHost && 
    hostMovieState?.videoUrl && 
    movie?.videoUrl && 
    hostMovieState.videoUrl !== movie.videoUrl;

  // Optimized video sync handler with debouncing and better performance
  const syncTimeoutRef = useRef(null);
  const lastSyncIdRef = useRef(null);
  
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
      lastUpdatedByName,
      videoUrl: syncVideoUrl
    } = syncedVideoState;

    // Update host movie state if this sync comes from host and has a video URL
    if (syncVideoUrl && lastUpdatedBy && lastUpdatedByName && !isHost) {
      setHostMovieState({
        videoUrl: syncVideoUrl,
        hostName: lastUpdatedByName,
        hostUid: lastUpdatedBy,
        timestamp: Date.now()
      });
    }

    // Prevent sync loops - don't process our own updates or duplicate sync IDs
    if (lastUpdatedBy === user?.uid || syncId === lastSyncIdRef.current) {
      return;
    }
    
    // Track this sync ID to prevent duplicates
    lastSyncIdRef.current = syncId;

    // Check if video URL has changed - if so, exit PiP mode and switch to new video
    if (syncVideoUrl && movie?.videoUrl && syncVideoUrl !== movie?.videoUrl) {
      console.log('🎬 Video URL changed - exiting PiP and switching video:', {
        currentVideo: movie?.videoUrl,
        newVideo: syncVideoUrl,
        isInPiP: isNativePiP
      });
      
      // If user is not the host, show notification popup
      if (!isHost && lastUpdatedByName) {
        setMovieChangeDetails({
          newVideoUrl: syncVideoUrl,
          hostName: lastUpdatedByName,
          hostUid: lastUpdatedBy
        });
        setShowMovieChangeNotification(true);
        return; // Don't auto-switch, wait for user consent
      }
      
      // Exit PiP mode if currently active
      if (isNativePiP) {
        console.log('🎭 Auto-exiting PiP due to video change...');
        document.exitPictureInPicture().catch(console.error);
        setIsNativePiP(false);
        setShowPiPPlaceholder(false);
      }
      
      // Update video source to new video (for host or auto-accepted changes)
      video.src = syncVideoUrl;
      video.load(); // Force reload of new video
      
      // Show sync status for video change
      setSyncStatus({ 
        syncing: true, 
        message: `Switching to new video from ${lastUpdatedByName || 'host'}...` 
      });
      
      return;
    }

    // Debounce sync operations to prevent rapid fire updates
    if (syncTimeoutRef.current) {
      clearTimeout(syncTimeoutRef.current);
    }
    
    syncTimeoutRef.current = setTimeout(() => {
      performVideoSync(video, {
        isPlaying,
        syncTime,
        action,
        lastUpdatedByName,
        networkDelay,
        isInPiP: isNativePiP
      });
    }, 50); // 50ms debounce to batch rapid updates

  }, [syncedVideoState, user?.uid, movie?.videoUrl, isNativePiP]);

  // Optimized sync function with better logic
  const performVideoSync = (video, syncData) => {
    const { isPlaying, syncTime, action, lastUpdatedByName, networkDelay, isInPiP } = syncData;
    
    // Show sync status only for significant actions
    if (action && action !== 'timeupdate') {
      setSyncStatus({ 
        syncing: true, 
        message: `Syncing with ${lastUpdatedByName || 'host'}...` 
      });
    }

    console.log("🎬 Processing optimized sync:", {
      action,
      isPlaying,
      syncTime,
      networkDelay: networkDelay + "ms",
      from: lastUpdatedByName,
      isInPiP,
      currentVideoTime: video.currentTime.toFixed(2)
    });

    // Calculate time difference with network compensation
    const timeDiff = Math.abs(video.currentTime - syncTime);
    // Use more relaxed thresholds to prevent constant adjustments
    const syncThreshold = isInPiP ? 1.5 : 2.0; // Increased thresholds for stability
    const microSyncThreshold = 0.3; // For very small adjustments

    // Handle different sync actions with optimized logic
    switch (action) {
      case 'play':
        if (video.paused && isPlaying) {
          // Only seek if there's a significant time difference
          if (timeDiff > microSyncThreshold) {
            console.log(`🎬 Sync play + seek: ${video.currentTime.toFixed(2)} -> ${syncTime.toFixed(2)} (diff: ${timeDiff.toFixed(2)}s)`);
            video.currentTime = syncTime;
            setCurrentTime(syncTime);
          }
          
          video.play().then(() => {
            setIsPlaying(true);
            setSyncStatus({ syncing: false, message: "" });
            console.log('🎬 Sync play successful', { isInPiP, finalTime: video.currentTime.toFixed(2) });
          }).catch(err => {
            console.warn("Play failed during sync:", err);
            setSyncStatus({ syncing: false, message: "" });
          });
        } else {
          setSyncStatus({ syncing: false, message: "" });
        }
        break;

      case 'pause':
        if (!video.paused && !isPlaying) {
          console.log(`🎬 Sync pause at: ${syncTime.toFixed(2)}`);
          video.currentTime = syncTime;
          video.pause();
          setIsPlaying(false);
          setCurrentTime(syncTime);
        }
        setSyncStatus({ syncing: false, message: "" });
        break;

      case 'seek':
        if (timeDiff > microSyncThreshold) {
          console.log(`🎬 Sync seek: ${video.currentTime.toFixed(2)} -> ${syncTime.toFixed(2)} (diff: ${timeDiff.toFixed(2)}s)`);
          video.currentTime = syncTime;
          setCurrentTime(syncTime);
        }
        setSyncStatus({ syncing: false, message: "" });
        break;

      case 'timeupdate':
      default:
        // Only sync for significant differences to prevent micro-adjustments
        if (timeDiff > syncThreshold) {
          console.log(`🎬 General time sync: ${video.currentTime.toFixed(2)} -> ${syncTime.toFixed(2)} (diff: ${timeDiff.toFixed(2)}s)`);
          video.currentTime = syncTime;
          setCurrentTime(syncTime);
        }

        // Sync play/pause state only if different
        const needsPlayStateSync = video.paused === isPlaying;
        if (needsPlayStateSync) {
          if (isPlaying && video.paused) {
            video.play().then(() => {
              setIsPlaying(true);
              console.log('🎬 General sync play successful', { isInPiP, time: video.currentTime.toFixed(2) });
            }).catch(err => console.warn("General play failed:", err));
          } else if (!isPlaying && !video.paused) {
            video.pause();
            setIsPlaying(false);
            console.log('🎬 General sync pause successful', { isInPiP, time: video.currentTime.toFixed(2) });
          }
        }
        
        // Clear sync status for general updates
        setSyncStatus({ syncing: false, message: "" });
        break;
    }
  };

  // Handle movie change notification actions
  const handleAcceptMovieChange = () => {
    if (movieChangeDetails && videoRef.current) {
      console.log('✅ User accepted movie change');
      
      // Exit PiP mode if currently active
      if (isNativePiP) {
        console.log('🎭 Auto-exiting PiP due to accepted video change...');
        document.exitPictureInPicture().catch(console.error);
        setIsNativePiP(false);
        setShowPiPPlaceholder(false);
      }
      
      // Update video source to new video
      const video = videoRef.current;
      video.src = movieChangeDetails.newVideoUrl;
      video.load();
      
      // Show sync status
      setSyncStatus({ 
        syncing: true, 
        message: `Switching to new video from ${movieChangeDetails.hostName}...` 
      });
      
      // Clear notification
      setShowMovieChangeNotification(false);
      setMovieChangeDetails(null);
    }
  };

  const handleDeclineMovieChange = () => {
    console.log('❌ User declined movie change');
    setShowMovieChangeNotification(false);
    setMovieChangeDetails(null);
  };

  // Auto-dismiss movie change notification after 15 seconds
  useEffect(() => {
    if (showMovieChangeNotification) {
      const timer = setTimeout(() => {
        console.log('⏰ Movie change notification auto-dismissed');
        setShowMovieChangeNotification(false);
        setMovieChangeDetails(null);
      }, 15000); // 15 seconds

      return () => clearTimeout(timer);
    }
  }, [showMovieChangeNotification]);

  // Handle movie changes - exit PiP if movie changes
  useEffect(() => {
    // If we're in PiP mode and the movie changes, exit PiP
    if (isNativePiP && movie?.movieId) {
      console.log('🎬 Movie changed while in PiP - auto-exiting PiP mode');
      document.exitPictureInPicture().catch(console.error);
      setIsNativePiP(false);
      setShowPiPPlaceholder(false);
    }
  }, [movie?.movieId, movie?.videoUrl]);

  // Enhanced PiP support detection and error handling
  useEffect(() => {
    const checkPiPSupport = () => {
      const hasBasicSupport = 'pictureInPictureEnabled' in document;
      const hasVideoSupport = videoRef.current && 'requestPictureInPicture' in videoRef.current;
      
      if (hasBasicSupport && hasVideoSupport) {
        setPipSupported(true);
        console.log('🎭 Picture-in-Picture fully supported');
      } else {
        setPipSupported(false);
        console.warn('🎭 Picture-in-Picture not supported:', {
          basicSupport: hasBasicSupport,
          videoSupport: hasVideoSupport
        });
      }
    };

    checkPiPSupport();
  }, [videoRef.current]);

  // Handle native PiP events
  useEffect(() => {
    const video = videoRef.current
    if (!video || !pipSupported) return

    const handleEnterpictureinpicture = () => {
      console.log('🎭 ENTERED native PiP mode')
      setIsNativePiP(true)
      setShowPiPPlaceholder(true)
      
      // Log current sync state when entering PiP
      if (syncedVideoState) {
        console.log('🎭 PiP entered with sync state:', {
          hostTime: syncedVideoState.currentTime,
          videoTime: video.currentTime,
          hostPlaying: syncedVideoState.isPlaying,
          videoPlaying: !video.paused,
          isHost: isHost
        });
      }
      
      // Auto-redirect to home page when entering PiP
      setTimeout(() => {
        if (onExitVideo) {
          console.log('🏠 Auto-redirecting to home page from PiP...')
          onExitVideo()
        }
      }, 100) // Small delay to ensure PiP is fully established
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
  }, [pipSupported, onExitVideo])

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

  // Handle tab visibility changes to auto-exit PiP when returning to video tab
  useEffect(() => {
    const handleVisibilityChange = () => {
      // If the tab becomes visible and we're in PiP mode, exit PiP
      if (!document.hidden && isNativePiP) {
        console.log('🎭 Tab became visible while in PiP - auto-exiting PiP mode')
        document.exitPictureInPicture().catch(console.error)
      }
    }

    document.addEventListener('visibilitychange', handleVisibilityChange)

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange)
    }
  }, [isNativePiP])

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

  // Cleanup function for sync timeout
  useEffect(() => {
    return () => {
      if (syncTimeoutRef.current) {
        clearTimeout(syncTimeoutRef.current);
      }
    };
  }, []);

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
          className={`w-full h-full object-cover ${isNativePiP ? 'opacity-0 pointer-events-none' : ''}`}
          controls={false}
          poster={movie.image}
          onPlay={handlePlay}
          onPause={handlePause}
          onSeeked={handleSeek}
        >
          <source
            src="http://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4"
            type="video/mp4"
          />
          Your browser does not support the video tag.
        </video>

        <FloatingReactions reactions={recentReactions} />

        {/* PiP Mode Overlay */}
        <AnimatePresence>
          {isNativePiP && (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="absolute inset-0 flex items-center justify-center bg-black z-30"
            >
              <div className="text-center text-white">
                <div className="mb-4">
                  <PictureInPicture2 className="w-16 h-16 mx-auto text-blue-400" />
                </div>
                <h3 className="text-xl font-semibold mb-2">Picture-in-Picture Active</h3>
                <p className="text-gray-300 mb-6">Video is playing in a floating window</p>
                
                <div className="flex flex-col gap-3 items-center">
                  <motion.button
                    onClick={toggleNativePiP}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="px-6 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-colors"
                  >
                    Exit Picture-in-Picture
                  </motion.button>
                  
                  <motion.button
                    onClick={onExitVideo}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="px-6 py-2 bg-red-500/20 hover:bg-red-500/30 text-red-400 border border-red-500/30 rounded-lg transition-colors flex items-center gap-2"
                  >
                    <X className="w-4 h-4" />
                    Exit Video Completely
                  </motion.button>
                </div>
                
                <p className="text-gray-400 text-sm mt-4">
                  Or press ESC to exit Picture-in-Picture
                </p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Movie Change Notification */}
        <AnimatePresence>
          {showMovieChangeNotification && movieChangeDetails && (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="fixed inset-0 flex items-center justify-center bg-black/70 backdrop-blur-sm z-50"
            >
              <motion.div
                initial={{ y: 50, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                exit={{ y: 50, opacity: 0 }}
                className="bg-gradient-to-br from-gray-900 to-black border border-gray-700 rounded-2xl p-8 max-w-md mx-4 shadow-2xl"
              >
                <div className="text-center">
                  <div className="mb-6">
                    <div className="w-16 h-16 mx-auto bg-blue-500/20 rounded-full flex items-center justify-center mb-4">
                      <PictureInPicture2 className="w-8 h-8 text-blue-400" />
                    </div>
                    <h3 className="text-xl font-bold text-white mb-2">New Movie Started!</h3>
                    <p className="text-gray-300 text-sm leading-relaxed">
                      <span className="font-semibold text-blue-400">{movieChangeDetails.hostName}</span> has started a new movie. 
                      Would you like to join and watch together? You can also use the "Join" button in the navbar anytime.
                    </p>
                  </div>
                  
                  <div className="flex flex-col gap-3">
                    <motion.button
                      onClick={handleAcceptMovieChange}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      className="w-full py-3 bg-blue-500 hover:bg-blue-600 text-white font-medium rounded-lg transition-colors flex items-center justify-center gap-2"
                    >
                      <Play className="w-4 h-4" />
                      Join Movie
                    </motion.button>
                    
                    <motion.button
                      onClick={handleDeclineMovieChange}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      className="w-full py-3 bg-gray-700 hover:bg-gray-600 text-gray-300 font-medium rounded-lg transition-colors"
                    >
                      Stay Here
                    </motion.button>
                  </div>
                  
                  <p className="text-gray-500 text-xs mt-4">
                    This notification will auto-dismiss in 15 seconds
                  </p>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

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

              {/* Join Host's Movie Button - Persistent */}
              {canJoinHostMovie && (
                <motion.button
                  onClick={joinHostMovie}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="px-3 py-1 bg-blue-500/20 hover:bg-blue-500/30 text-blue-400 border border-blue-500/30 rounded-full text-xs font-medium transition-all flex items-center gap-1"
                  title={`Join ${hostMovieState?.hostName}'s movie`}
                >
                  <span>📺</span>
                  <span>Join {hostMovieState?.hostName}</span>
                </motion.button>
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

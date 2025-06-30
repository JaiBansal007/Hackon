"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { Play, ChevronRight } from "lucide-react"
import { useNavigate } from "react-router-dom"
import { ViewingHistoryManager } from "../../../lib/viewing-history"

export function ContinueWatching({ onStartWatching, user }) {
  const navigate = useNavigate()
  const [continueWatchingMovies, setContinueWatchingMovies] = useState([])

  const handleMovieClick = (movie) => {
    const movieSlug = movie.movieId || movie.title
      .toLowerCase()
      .replace(/\s+/g, "-")
      .replace(/[^\w-]/g, "")
    navigate(`/movie/${movieSlug}`)
  }

  useEffect(() => {
    if (!user) {
      setContinueWatchingMovies([])
      return
    }
    // Use ViewingHistoryManager to get user's viewing history
    const viewingHistoryManager = ViewingHistoryManager.getInstance()
    const history = viewingHistoryManager.getViewingHistory()
    // Show movies that have been started (watchedDuration > 0) and not fully watched (< 95%)
    const filtered = history
      .filter(
        (item) =>
          item.totalDuration &&
          item.watchedDuration > 0 &&
          item.watchedDuration / item.totalDuration < 0.95
      )
      .sort((a, b) => new Date(b.lastWatched) - new Date(a.lastWatched))
      .slice(0, 6)
    setContinueWatchingMovies(filtered)
  }, [user])

  if (continueWatchingMovies.length === 0) {
    return null
  }

  return (
    <>
      <style>{`
        .fire-scroll {
          scrollbar-width: thin;
          scrollbar-color: rgba(255, 255, 255, 0.3) transparent;
        }
        .fire-scroll::-webkit-scrollbar {
          height: 4px;
        }
        .fire-scroll::-webkit-scrollbar-track {
          background: transparent;
        }
        .fire-scroll::-webkit-scrollbar-thumb {
          background: rgba(255, 255, 255, 0.3);
          border-radius: 2px;
        }
        .fire-scroll::-webkit-scrollbar-thumb:hover {
          background: rgba(255, 255, 255, 0.5);
        }
      `}</style>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="py-6 px-4"
      >
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-bold text-white">Continue Watching</h2>
          <button className="flex items-center text-gray-400 hover:text-white transition-colors">
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
        
        <div className="flex space-x-3 overflow-x-auto pb-2 fire-scroll">
          {continueWatchingMovies.map((movie, index) => (
            <motion.div
              key={movie.movieId}
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.05, duration: 0.3 }}
              className="flex-shrink-0 relative group cursor-pointer"
              onClick={() => handleMovieClick(movie)}
            >
              <div className="w-40 h-24 relative rounded-md overflow-hidden">
                <img
                  src={movie.image || "/placeholder.svg"}
                  alt={movie.title}
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-black/20 group-hover:bg-black/40 transition-all duration-300" />
                {/* Progress bar */}
                <div className="absolute bottom-0 left-0 right-0 bg-black/60 p-2">
                  <div className="bg-gray-600 h-0.5 rounded-full mb-1">
                    <div
                      className="bg-blue-500 h-full rounded-full"
                      style={{
                        width: `${
                          movie.totalDuration
                            ? ((movie.watchedDuration / movie.totalDuration) * 100).toFixed(0)
                            : 0
                        }%`
                      }}
                    />
                  </div>
                  <p className="text-white text-xs truncate">{movie.title}</p>
                </div>
                
                {/* Play button */}
                <button 
                  className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-black/60 hover:bg-black/80 text-white p-2 rounded-full opacity-0 group-hover:opacity-100 transition-all duration-300"
                  onClick={(e) => {
                    e.stopPropagation()
                    handleMovieClick(movie)
                  }}
                >
                  <Play className="w-3 h-3 fill-current" />
                </button>
              </div>
            </motion.div>
          ))}
        </div>
      </motion.div>
    </>
  )
}
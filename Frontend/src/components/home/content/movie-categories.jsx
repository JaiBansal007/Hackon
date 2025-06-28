"use client"

import { motion } from "framer-motion"
import { Play, Plus, ChevronRight } from "lucide-react"
import { useNavigate } from "react-router-dom"
import { movieCategories } from "./movie-data"
import { ContinueWatching } from "./continue-watching"
import "./scrollbar-hide.css"

export function MovieCategories({ onStartWatching, onStartSoloWatching, user, roomStatus }) {
  const navigate = useNavigate()

  const handleMovieClick = (movie) => {
    const movieSlug = movie.title
      .toLowerCase()
      .replace(/\s+/g, "-")
      .replace(/[^\w-]/g, "")
    navigate(`/movie/${movieSlug}`)
  }

  // Add handleMoreInfo function
  const handleMoreInfo = (movie) => {
    const movieSlug = movie.title
      .toLowerCase()
      .replace(/\s+/g, "-")
      .replace(/[^\w-]/g, "")
    window.location.href = `/info/${movieSlug}`
  }

  return (
    <div className="ml-16">
      {/* Continue Watching */}
      <ContinueWatching onStartWatching={onStartWatching} user={user} />
      
      {/* Movie Categories */}
      <div className="space-y-6 px-4 pb-8">
          {movieCategories.map((category, categoryIndex) => (
            <motion.div
              key={categoryIndex}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: categoryIndex * 0.05, duration: 0.4 }}
            >
              <div className="flex items-center justify-between mb-3">
                <h2 className="text-lg font-bold text-white">{category.title}</h2>
                <button className="flex items-center text-gray-400 hover:text-white transition-colors">
                  <span className="text-sm mr-1">See All</span>
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
              <div 
                className="flex space-x-3 overflow-x-auto pb-2 scrollbar-hide"
              >
                {category.movies.map((movie, movieIndex) => (
                  <motion.div
                    key={movie.id}
                    initial={{ opacity: 0, x: 30 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: movieIndex * 0.02, duration: 0.3 }}
                    whileHover={{ scale: 1.05, y: -3 }}
                    className="flex-shrink-0 w-28 md:w-32 group cursor-pointer"
                    onClick={() => handleMovieClick(movie)}
                  >
                    <div className="relative rounded-md overflow-hidden mb-2">
                      <img
                        src={movie.image || "/placeholder.svg"}
                        alt={movie.title}
                        className="w-full h-40 md:h-48 object-cover"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-all duration-300" />
                      
                      {/* Hover overlay with room-aware options */}
                      <div className="absolute inset-0 flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300">
                        {roomStatus === "none" ? (
                          // Solo watching option when not in room
                          <button
                            className="bg-white/90 hover:bg-white text-black rounded-full p-2 mb-2 shadow-lg"
                            onClick={(e) => {
                              e.stopPropagation()
                              if (onStartSoloWatching) onStartSoloWatching(movie)
                            }}
                          >
                            <Play className="w-3 h-3 fill-current" />
                          </button>
                        ) : (
                          // Room watching option when in room
                          <button
                            className="bg-blue-500/90 hover:bg-blue-600 text-white rounded-full p-2 mb-2 shadow-lg"
                            onClick={(e) => {
                              e.stopPropagation()
                              if (onStartWatching) onStartWatching(movie)
                            }}
                          >
                            <Play className="w-3 h-3 fill-current" />
                          </button>
                        )}
                        <button
                          className="bg-black/70 hover:bg-black/90 text-white rounded-full p-1.5"
                          onClick={(e) => {
                            e.stopPropagation()
                            handleMoreInfo(movie)
                          }}
                        >
                          <Plus className="w-2.5 h-2.5" />
                        </button>
                      </div>
                      
                      {/* Rating badge */}
                      <div className="absolute top-1 right-1 bg-black/80 px-1.5 py-0.5 rounded text-xs text-yellow-400 font-semibold">
                        {movie.rating}
                      </div>
                    </div>
                    <h3 className="text-white font-medium text-xs truncate group-hover:text-gray-300 transition-colors duration-300">
                      {movie.title}
                    </h3>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          ))}
        </div>
      </div>
  )
}

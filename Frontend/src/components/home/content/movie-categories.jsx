"use client"

import { motion } from "framer-motion"
import { Play } from "lucide-react"
import { useNavigate } from "react-router-dom"
import { movieCategories } from "./movie-data"
import { Button } from "../../ui/button"

export function MovieCategories({ onStartWatching }) {
  const navigate = useNavigate()

  const handleMovieClick = (movie) => {
    const movieSlug = movie.title
      .toLowerCase()
      .replace(/\s+/g, "-")
      .replace(/[^\w-]/g, "")
    navigate(`/movie/${movieSlug}`)
  }

  return (
    <>
      <style jsx>{`
        .movie-scroll {
          scrollbar-width: none;
        }
        .movie-scroll::-webkit-scrollbar {
          display: none;
        }
      `}</style>
      {/* Netflix-like background */}
      <div className="fixed inset-0 -z-10">
        <div className="absolute inset-0 bg-gradient-to-b from-black via-gray-900/90 to-gray-950/95" />
        <div className="absolute inset-0 bg-gradient-to-tr from-amber-900/10 via-purple-900/10 to-blue-900/10 blur-2xl opacity-60" />
        <div className="absolute top-0 left-0 w-1/2 h-1/3 bg-gradient-to-br from-amber-500/10 via-orange-500/10 to-transparent rounded-full blur-3xl opacity-40" />
        <div className="absolute bottom-0 right-0 w-1/3 h-1/4 bg-gradient-to-tr from-blue-500/10 via-purple-500/10 to-transparent rounded-full blur-3xl opacity-30" />
      </div>
      <div className="space-y-12 md:space-y-16 ml-16">
        {movieCategories.map((category, categoryIndex) => (
          <motion.div
            key={categoryIndex}
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: categoryIndex * 0.05, duration: 0.4 }}
          >
            <h2 className="text-2xl md:text-3xl font-bold mb-6 md:mb-8 text-white px-2">{category.title}</h2>
            <div className="flex space-x-5 md:space-x-8 overflow-x-auto pb-6 movie-scroll px-2">
              {category.movies.map((movie, movieIndex) => (
                <motion.div
                  key={movie.id}
                  initial={{ opacity: 0, x: 50 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: movieIndex * 0.02, duration: 0.3 }}
                  whileHover={{ scale: 1.12, y: -18, boxShadow: "0 8px 32px 0 rgba(0,0,0,0.7)" }}
                  className="flex-shrink-0 w-40 md:w-56 lg:w-64 group cursor-pointer relative rounded-xl overflow-visible transition-all duration-300"
                  onClick={() => handleMovieClick(movie)}
                  style={{ zIndex: 2 }}
                >
                  <div className="relative rounded-xl overflow-hidden shadow-2xl">
                    <img
                      src={movie.image || "/placeholder.svg"}
                      alt={movie.title}
                      className="w-full h-60 md:h-80 lg:h-96 object-cover rounded-xl transition-all duration-300"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent opacity-0 group-hover:opacity-100 transition-all duration-300 rounded-xl flex flex-col items-center justify-center">
                      <motion.button
                        whileHover={{ scale: 1.15 }}
                        className="flex items-center justify-center bg-white/90 hover:bg-white text-black rounded-full w-14 h-14 mb-4 shadow-lg transition-all duration-200"
                        onClick={e => {
                          e.stopPropagation()
                          if (onStartWatching) onStartWatching(movie)
                        }}
                      >
                        <Play className="w-7 h-7" />
                      </motion.button>
                      <motion.button
                        whileHover={{ scale: 1.1 }}
                        className="flex items-center justify-center bg-black/70 hover:bg-black text-white rounded-full w-10 h-10 shadow-md transition-all duration-200"
                        onClick={e => {
                          e.stopPropagation()
                          const movieSlug = movie.title
                            .toLowerCase()
                            .replace(/\s+/g, "-")
                            .replace(/[^\w-]/g, "")
                          navigate(`/info/${movieSlug}`)
                        }}
                      >
                        <span className="sr-only">More Info</span>
                        <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                          <circle cx="12" cy="12" r="10" />
                          <line x1="12" y1="8" x2="12" y2="12" />
                          <circle cx="12" cy="16" r="1" />
                        </svg>
                      </motion.button>
                    </div>
                    <div className="absolute top-3 right-3 bg-black/80 px-2 py-1 rounded text-xs md:text-sm text-yellow-400 font-semibold shadow">
                      ⭐ {movie.rating}
                    </div>
                  </div>
                  <h3 className="mt-3 text-white font-semibold truncate text-base md:text-lg text-center">{movie.title}</h3>
                </motion.div>
              ))}
            </div>
          </motion.div>
        ))}
      </div>
    </>
  )
}
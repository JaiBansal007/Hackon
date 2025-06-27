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
          scrollbar-width: thin;
          scrollbar-color: #f97316 transparent;
        }
        
        .movie-scroll::-webkit-scrollbar {
          height: 6px;
        }
        
        .movie-scroll::-webkit-scrollbar-track {
          background: transparent;
        }
        
        .movie-scroll::-webkit-scrollbar-thumb {
          background: #f97316;
          border-radius: 3px;
        }
        
        .movie-scroll::-webkit-scrollbar-thumb:hover {
          background: #ea580c;
        }
      `}</style>
      <div className="space-y-8 md:space-y-12">
        {movieCategories.map((category, categoryIndex) => (
          <motion.div
            key={categoryIndex}
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: categoryIndex * 0.05, duration: 0.4 }}
          >
            <h2 className="text-xl md:text-2xl font-bold mb-4 md:mb-6 text-white">{category.title}</h2>
            <div className="flex space-x-3 md:space-x-4 overflow-x-auto pb-4 movie-scroll">
              {category.movies.map((movie, movieIndex) => (
                <motion.div
                  key={movie.id}
                  initial={{ opacity: 0, x: 50 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: movieIndex * 0.02, duration: 0.3 }}
                  whileHover={{ scale: 1.05, y: -10 }}
                  className="flex-shrink-0 w-36 md:w-48 group cursor-pointer relative"
                  onClick={() => handleMovieClick(movie)}
                >
                  <div className="relative">
                    <img
                      src={movie.image || "/placeholder.svg"}
                      alt={movie.title}
                      className="w-full h-52 md:h-72 object-cover rounded-lg"
                    />
                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/50 transition-all duration-300 rounded-lg flex items-center justify-center">
                      <div className="opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center space-y-3">
                        <Play className="w-8 h-8 md:w-12 md:h-12 text-white" />
                        <div className="flex space-x-2">
                          <Button
                            onClick={(e) => {
                              e.stopPropagation()
                              const movieSlug = movie.title
                                .toLowerCase()
                                .replace(/\s+/g, "-")
                                .replace(/[^\w-]/g, "")
                              navigate(`/info/${movieSlug}`)
                            }}
                            variant="outline" className="border-gray-600 text-black hover:bg-gray-800 px-8 py-3"
                          >
                            More Info
                          </Button>
                        </div>
                      </div>
                    </div>
                    <div className="absolute top-2 right-2 bg-black/70 px-2 py-1 rounded text-xs md:text-sm text-yellow-400">
                      ⭐ {movie.rating}
                    </div>
                  </div>
                  <h3 className="mt-2 text-white font-medium truncate text-sm md:text-base">{movie.title}</h3>
                </motion.div>
              ))}
            </div>
          </motion.div>
        ))}
      </div>
    </>
  )
}

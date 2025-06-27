"use client"

import { useState, useEffect } from "react"
import { Link,useParams, useNavigate } from "react-router-dom"
import { motion } from "framer-motion"
import { Button } from "../../components/ui/button"
import { ArrowLeft, Play, Star, Calendar, Clock, Users, Award, Heart, Share2, Bookmark } from 'lucide-react'
import { movieCategories } from "../../components/home/content/movie-data"
import { featuredMovies } from "../../components/home/content/featured-movies"

export default function MovieInfoPage() {
  const { movieId } = useParams()
  const navigate = useNavigate()
  const [movie, setMovie] = useState(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    // Find movie from all categories and featured movies
    const allMovies = [
      ...movieCategories.flatMap((cat) => cat.movies),
      ...featuredMovies
    ]
    const foundMovie = allMovies.find(
      (m) =>
        m.title
          .toLowerCase()
          .replace(/\s+/g, "-")
          .replace(/[^\w-]/g, "") === movieId
    )

    if (foundMovie) {
      // Enhanced movie data with additional details
      setMovie({
        ...foundMovie,
        description: foundMovie.description || "A captivating story that will keep you on the edge of your seat. Experience stunning visuals and compelling characters in this must-watch entertainment.",
        year: foundMovie.year || "2024",
        genre: foundMovie.genre || "Action, Drama, Thriller",
        duration: "2h 15m",
        director: "Christopher Nolan",
        cast: ["Leonardo DiCaprio", "Marion Cotillard", "Tom Hardy", "Elliot Page"],
        language: "English",
        country: "USA",
        ageRating: "PG-13",
        imdbRating: foundMovie.rating || "8.5",
        rottenTomatoes: "87%",
        metacritic: "74",
        awards: ["Academy Award Winner", "Golden Globe Nominee", "BAFTA Winner"],
        plot: "A mind-bending thriller that explores the depths of human consciousness and the power of dreams. When reality becomes indistinguishable from imagination, our protagonist must navigate through layers of complexity to uncover the truth.",
        trivia: [
          "The movie was filmed across 6 different countries",
          "Over 500 visual effects shots were created",
          "The soundtrack features a 100-piece orchestra"
        ]
      })
    }
    setIsLoading(false)
  }, [movieId])

  const handleWatchMovie = () => {
    navigate(`/movie/${movieId}`)
  }

  const handleQuizClick = () => {
    navigate(`/quiz/${movieId}`)
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-orange-400 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-white text-lg">Loading movie details...</p>
        </div>
      </div>
    )
  }

  if (!movie) {
    return (
      <div className="min-h-screen w-screen bg-black flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-white mb-4">Movie Not Found</h1>
          <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
            <Link
              to="/home"
              className="flex items-center space-x-3 group bg-gray-800/50 backdrop-blur-sm px-6 py-3 rounded-xl border border-amber-500/20 hover:border-amber-500/40 transition-all duration-300"
            >
              <ArrowLeft className="w-5 h-5 text-amber-400 group-hover:text-amber-300 transition-colors" />
              <span className="text-amber-400 group-hover:text-amber-300 font-medium transition-colors">
                Back to Home
              </span>
            </Link>
          </motion.div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen w-[98.8vw] bg-black text-white">
      {/* Background with movie poster */}
      <div className="absolute inset-0 opacity-20">
        <img 
          src={movie.image || "/placeholder.svg"} 
          alt={movie.title}
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-black via-black/80 to-black"></div>
      </div>

      <div className="relative z-10">
        {/* Header */}
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center justify-between p-6"
        >
          <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
            <Link
              to="/home"
              className="flex items-center space-x-3 group bg-gray-800/50 backdrop-blur-sm px-6 py-3 rounded-xl border border-amber-500/20 hover:border-amber-500/40 transition-all duration-300"
            >
              <ArrowLeft className="w-5 h-5 text-amber-400 group-hover:text-amber-300 transition-colors" />
              <span className="text-amber-400 group-hover:text-amber-300 font-medium transition-colors">
                Back to Home
              </span>
            </Link>
          </motion.div>

          <div className="flex items-center space-x-4">
            <Button variant="ghost" size="icon" className="text-gray-400 hover:text-white">
              <Heart className="w-5 h-5" />
            </Button>
            <Button variant="ghost" size="icon" className="text-gray-400 hover:text-white">
              <Bookmark className="w-5 h-5" />
            </Button>
            <Button variant="ghost" size="icon" className="text-gray-400 hover:text-white">
              <Share2 className="w-5 h-5" />
            </Button>
          </div>
        </motion.div>

        {/* Main Content */}
        <div className="container mx-auto px-6 py-8">
          <div className="grid lg:grid-cols-3 gap-12">
            {/* Left Side - Movie Poster */}
            <motion.div 
              initial={{ opacity: 0, x: -50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
              className="lg:col-span-1"
            >
              <div className="bg-gradient-to-br from-gray-900/80 to-black/80 backdrop-blur-lg rounded-3xl p-6 border border-orange-500/20 shadow-2xl">
                <div className="relative group">
                  <img 
                    src={movie.image || "/placeholder.svg"} 
                    alt={movie.title}
                    className="w-full rounded-2xl shadow-2xl transition-transform duration-500 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                </div>

                {/* Action Buttons */}
                <div className="mt-6 space-y-4">
                  <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                    <Button
                      onClick={handleWatchMovie}
                      className="w-full bg-gradient-to-r from-yellow-400 to-orange-500 text-black hover:from-yellow-500 hover:to-orange-600 py-4 text-lg font-bold rounded-xl shadow-lg"
                    >
                      <Play className="w-6 h-6 mr-3" />
                      Watch Now
                    </Button>
                  </motion.div>

                  <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                    <Button
                      onClick={handleQuizClick}
                      variant="outline"
                      className="w-full border-2 border-orange-400 text-orange-400 hover:bg-orange-400 hover:text-black py-4 text-lg font-bold rounded-xl"
                    >
                      <Award className="w-6 h-6 mr-3" />
                      Take Quiz
                    </Button>
                  </motion.div>
                </div>

                {/* Ratings */}
                <div className="mt-6 grid grid-cols-3 gap-4">
                  <div className="text-center bg-yellow-400/20 rounded-xl p-3 border border-yellow-400/30">
                    <div className="text-yellow-400 font-bold text-lg">{movie.imdbRating}</div>
                    <div className="text-xs text-gray-400">IMDb</div>
                  </div>
                  <div className="text-center bg-red-400/20 rounded-xl p-3 border border-red-400/30">
                    <div className="text-red-400 font-bold text-lg">{movie.rottenTomatoes}</div>
                    <div className="text-xs text-gray-400">RT</div>
                  </div>
                  <div className="text-center bg-green-400/20 rounded-xl p-3 border border-green-400/30">
                    <div className="text-green-400 font-bold text-lg">{movie.metacritic}</div>
                    <div className="text-xs text-gray-400">Meta</div>
                  </div>
                </div>
              </div>
              {/* Trivia */}
                <div className="bg-gradient-to-br mt-8 from-gray-900/60 to-black/60 backdrop-blur-lg rounded-2xl p-6 border border-gray-700/50">
                  <h2 className="text-2xl font-bold text-orange-400 mb-4">Did You Know?</h2>
                  <div className="space-y-3">
                    {movie.trivia.map((fact, index) => (
                      <div key={index} className="flex items-start space-x-3">
                        <div className="w-2 h-2 bg-orange-400 rounded-full mt-2 flex-shrink-0"></div>
                        <p className="text-gray-300">{fact}</p>
                      </div>
                    ))}
                  </div>
                </div>
            </motion.div>

            {/* Right Side - Movie Details */}
            <motion.div 
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.4 }}
              className="lg:col-span-2"
            >
              <div className="space-y-8">
                {/* Title and Basic Info */}
                <div>
                  <h1 className="text-5xl font-black mb-4 bg-gradient-to-r from-yellow-400 via-orange-500 to-yellow-400 bg-clip-text text-transparent">
                    {movie.title}
                  </h1>
                  
                  <div className="flex flex-wrap items-center gap-4 mb-6">
                    <div className="flex items-center space-x-2 bg-gray-800/50 rounded-full px-4 py-2">
                      <Calendar className="w-4 h-4 text-orange-400" />
                      <span className="text-gray-300">{movie.year}</span>
                    </div>
                    <div className="flex items-center space-x-2 bg-gray-800/50 rounded-full px-4 py-2">
                      <Clock className="w-4 h-4 text-orange-400" />
                      <span className="text-gray-300">{movie.duration}</span>
                    </div>
                    <div className="flex items-center space-x-2 bg-gray-800/50 rounded-full px-4 py-2">
                      <Star className="w-4 h-4 text-yellow-400" />
                      <span className="text-gray-300">{movie.ageRating}</span>
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-2 mb-6">
                    {movie.genre.split(", ").map((genre, index) => (
                      <span 
                        key={index}
                        className="bg-gradient-to-r from-orange-400/20 to-yellow-400/20 border border-orange-400/30 rounded-full px-4 py-2 text-sm font-medium text-orange-300"
                      >
                        {genre}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Description */}
                <div className="bg-gradient-to-br from-gray-900/60 to-black/60 backdrop-blur-lg rounded-2xl p-6 border border-gray-700/50">
                  <h2 className="text-2xl font-bold text-orange-400 mb-4">Synopsis</h2>
                  <p className="text-gray-300 leading-relaxed text-lg mb-4">{movie.description}</p>
                  <p className="text-gray-400 leading-relaxed">{movie.plot}</p>
                </div>

                {/* Cast and Crew */}
                <div className="bg-gradient-to-br from-gray-900/60 to-black/60 backdrop-blur-lg rounded-2xl p-6 border border-gray-700/50">
                  <h2 className="text-2xl font-bold text-orange-400 mb-4">Cast & Crew</h2>
                  <div className="grid md:grid-cols-2 gap-6">
                    <div>
                      <h3 className="text-lg font-semibold text-white mb-3">Director</h3>
                      <p className="text-gray-300">{movie.director}</p>
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-white mb-3">Starring</h3>
                      <div className="space-y-1">
                        {movie.cast.map((actor, index) => (
                          <p key={index} className="text-gray-300">{actor}</p>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Technical Details */}
                <div className="bg-gradient-to-br from-gray-900/60 to-black/60 backdrop-blur-lg rounded-2xl p-6 border border-gray-700/50">
                  <h2 className="text-2xl font-bold text-orange-400 mb-4">Details</h2>
                  <div className="grid md:grid-cols-2 gap-6">
                    <div className="space-y-3">
                      <div className="flex justify-between">
                        <span className="text-gray-400">Language:</span>
                        <span className="text-white">{movie.language}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-400">Country:</span>
                        <span className="text-white">{movie.country}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-400">Duration:</span>
                        <span className="text-white">{movie.duration}</span>
                      </div>
                    </div>
                    <div className="space-y-3">
                      <div>
                        <span className="text-gray-400 block mb-2">Awards:</span>
                        <div className="space-y-1">
                          {movie.awards.map((award, index) => (
                            <div key={index} className="flex items-center space-x-2">
                              <Award className="w-4 h-4 text-yellow-400" />
                              <span className="text-white text-sm">{award}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  )
}
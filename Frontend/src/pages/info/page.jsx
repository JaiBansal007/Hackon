"use client"

import { useState, useEffect } from "react"
import { Link, useParams, useNavigate } from "react-router-dom"
import { motion } from "framer-motion"
import { Button } from "../../components/ui/button"
import { ArrowLeft, Play, Star, Calendar, Clock, Users, Award, Heart, Share2, Bookmark, Sparkles } from "lucide-react"
import { movieCategories } from "../../components/home/content/movie-data"
import { featuredMovies } from "../../components/home/content/featured-movies"

export default function MovieInfoPage() {
  const { movieId } = useParams()
  const navigate = useNavigate()
  const [movie, setMovie] = useState(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    // Find movie from all categories and featured movies
    const allMovies = [...movieCategories.flatMap((cat) => cat.movies), ...featuredMovies]

    const foundMovie = allMovies.find(
      (m) =>
        m.title
          .toLowerCase()
          .replace(/\s+/g, "-")
          .replace(/[^\w-]/g, "") === movieId,
    )

    if (foundMovie) {
      // Enhanced movie data with additional details
      setMovie({
        ...foundMovie,
        description:
          foundMovie.description ||
          "A captivating story that will keep you on the edge of your seat. Experience stunning visuals and compelling characters in this must-watch entertainment.",
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
          "The soundtrack features a 100-piece orchestra",
        ],
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
      <div className="min-h-screen bg-gradient-to-br from-black via-gray-950 to-black flex items-center justify-center">
        <div className="text-center">
          <motion.div
            className="w-20 h-20 border-4 border-orange-400 border-t-transparent rounded-full mx-auto mb-6"
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Number.POSITIVE_INFINITY, ease: "linear" }}
          />
          <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-white text-xl font-medium">
            Loading movie details...
          </motion.p>
        </div>
      </div>
    )
  }

  if (!movie) {
    return (
      <div className="min-h-screen w-screen bg-gradient-to-br from-black via-gray-950 to-black flex items-center justify-center">
        <div className="text-center">
          <motion.h1
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-3xl font-bold text-white mb-6"
          >
            Movie Not Found
          </motion.h1>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <Link
              to="/home"
              className="flex items-center space-x-3 group bg-gradient-to-r from-gray-800/60 to-gray-900/60 backdrop-blur-xl px-8 py-4 rounded-2xl border border-amber-500/30 hover:border-amber-500/60 transition-all duration-300 shadow-xl hover:shadow-amber-500/20"
            >
              <ArrowLeft className="w-5 h-5 text-amber-400 group-hover:text-amber-300 transition-colors group-hover:-translate-x-1 duration-300" />
              <span className="text-amber-400 group-hover:text-amber-300 font-semibold transition-colors">
                Back to Home
              </span>
            </Link>
          </motion.div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen w-full bg-gradient-to-br from-black via-gray-950 to-black text-white overflow-hidden">
      {/* Enhanced Background with movie poster */}
      <div className="absolute inset-0">
        <img src={movie.image || "/placeholder.svg"} alt={movie.title} className="w-full h-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-r from-black via-black/90 to-black/80"></div>
        <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-black/50"></div>
        <div className="absolute inset-0 bg-gradient-to-br from-orange-500/5 via-transparent to-yellow-500/5"></div>
      </div>

      {/* Floating particles effect */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {[...Array(20)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-1 h-1 bg-orange-400/30 rounded-full"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
            }}
            animate={{
              y: [-20, -100],
              opacity: [0, 1, 0],
            }}
            transition={{
              duration: Math.random() * 3 + 2,
              repeat: Number.POSITIVE_INFINITY,
              delay: Math.random() * 2,
            }}
          />
        ))}
      </div>

      <div className="relative z-10">
        {/* Enhanced Header */}
        <motion.div
          initial={{ opacity: 0, y: -30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="flex items-center justify-between p-8"
        >
          <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
            <Link
              to="/home"
              className="flex items-center space-x-3 group bg-gradient-to-r from-gray-800/60 to-gray-900/60 backdrop-blur-xl px-8 py-4 rounded-2xl border border-amber-500/30 hover:border-amber-500/60 transition-all duration-300 shadow-xl hover:shadow-amber-500/20"
            >
              <ArrowLeft className="w-5 h-5 text-amber-400 group-hover:text-amber-300 transition-all duration-300 group-hover:-translate-x-1" />
              <span className="text-amber-400 group-hover:text-amber-300 font-semibold transition-colors">
                Back to Home
              </span>
            </Link>
          </motion.div>

          <div className="flex items-center space-x-3">
            {[
              { icon: Heart, color: "text-red-400 hover:text-red-300" },
              { icon: Bookmark, color: "text-blue-400 hover:text-blue-300" },
              { icon: Share2, color: "text-green-400 hover:text-green-300" },
            ].map(({ icon: Icon, color }, index) => (
              <motion.div key={index} whileHover={{ scale: 1.1, y: -2 }} whileTap={{ scale: 0.9 }}>
                <Button
                  variant="ghost"
                  size="icon"
                  className={`${color} bg-gray-800/40 backdrop-blur-sm hover:bg-gray-700/60 rounded-xl border border-gray-600/30 hover:border-gray-500/50 transition-all duration-300 w-12 h-12`}
                >
                  <Icon className="w-5 h-5" />
                </Button>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Enhanced Main Content */}
        <div className="container mx-auto px-8 py-4">
          <div className="grid lg:grid-cols-3 gap-12">
            {/* Left Side - Enhanced Movie Poster */}
            <motion.div
              initial={{ opacity: 0, x: -60 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3, duration: 0.8 }}
              className="lg:col-span-1"
            >
              <div className="bg-gradient-to-br from-gray-900/90 via-gray-800/80 to-black/90 backdrop-blur-2xl rounded-3xl p-8 border border-orange-500/30 shadow-2xl hover:shadow-orange-500/20 transition-all duration-500">
                <div className="relative group">
                  <div className="absolute -inset-1 bg-gradient-to-r from-orange-400 via-yellow-400 to-orange-400 rounded-3xl blur opacity-20 group-hover:opacity-40 transition-opacity duration-500"></div>
                  <img
                    src={movie.image || "/placeholder.svg"}
                    alt={movie.title}
                    className="relative w-full rounded-2xl shadow-2xl transition-all duration-500 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                  <div className="absolute top-4 right-4 bg-black/60 backdrop-blur-sm rounded-full p-2 opacity-0 group-hover:opacity-100 transition-opacity duration-500">
                    <Sparkles className="w-5 h-5 text-yellow-400" />
                  </div>
                </div>

                {/* Enhanced Action Buttons */}
                <div className="mt-8 space-y-4">
                  <motion.div
                    whileHover={{ scale: 1.03, y: -2 }}
                    whileTap={{ scale: 0.97 }}
                    transition={{ type: "spring", stiffness: 400, damping: 17 }}
                  >
                    <Button
                      onClick={handleWatchMovie}
                      className="w-full bg-gradient-to-r from-yellow-400 via-orange-500 to-yellow-400 text-black hover:from-yellow-300 hover:via-orange-400 hover:to-yellow-300 py-5 text-lg font-bold rounded-2xl shadow-xl hover:shadow-orange-500/30 transition-all duration-400 border border-orange-300/30 relative overflow-hidden group"
                    >
                      <div className="absolute inset-0 bg-gradient-to-r from-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-400" />
                      <Play className="w-6 h-6 mr-3 relative z-10" />
                      <span className="relative z-10">Watch Now</span>
                    </Button>
                  </motion.div>

                  <motion.div
                    whileHover={{ scale: 1.03, y: -2 }}
                    whileTap={{ scale: 0.97 }}
                    transition={{ type: "spring", stiffness: 400, damping: 17 }}
                  >
                    <Button
                      onClick={handleQuizClick}
                      variant="outline"
                      className="w-full border-2 border-orange-400/60 text-orange-400 hover:bg-orange-400 hover:text-black py-5 text-lg font-bold rounded-2xl backdrop-blur-sm bg-orange-400/5 hover:shadow-xl hover:shadow-orange-500/20 transition-all duration-400"
                    >
                      <Award className="w-6 h-6 mr-3" />
                      Take Quiz
                    </Button>
                  </motion.div>
                </div>

                {/* Enhanced Ratings */}
                <div className="mt-8 grid grid-cols-3 gap-4">
                  {[
                    {
                      rating: movie.imdbRating,
                      label: "IMDb",
                      color: "yellow",
                      bg: "bg-yellow-400/20",
                      border: "border-yellow-400/40",
                    },
                    {
                      rating: movie.rottenTomatoes,
                      label: "RT",
                      color: "red",
                      bg: "bg-red-400/20",
                      border: "border-red-400/40",
                    },
                    {
                      rating: movie.metacritic,
                      label: "Meta",
                      color: "green",
                      bg: "bg-green-400/20",
                      border: "border-green-400/40",
                    },
                  ].map((item, index) => (
                    <motion.div
                      key={index}
                      whileHover={{ scale: 1.05, y: -2 }}
                      className={`text-center ${item.bg} backdrop-blur-sm rounded-2xl p-4 border ${item.border} hover:shadow-lg transition-all duration-300`}
                    >
                      <div className={`text-${item.color}-400 font-bold text-xl`}>{item.rating}</div>
                      <div className="text-xs text-gray-400 font-medium mt-1">{item.label}</div>
                    </motion.div>
                  ))}
                </div>
              </div>

              {/* Enhanced Trivia */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6 }}
                className="bg-gradient-to-br from-gray-900/80 to-black/80 backdrop-blur-2xl rounded-3xl p-8 border border-gray-700/50 mt-8 hover:border-gray-600/60 transition-all duration-500"
              >
                <h2 className="text-2xl font-bold bg-gradient-to-r from-orange-400 to-yellow-400 bg-clip-text text-transparent mb-6 flex items-center">
                  <Sparkles className="w-6 h-6 text-orange-400 mr-3" />
                  Did You Know?
                </h2>
                <div className="space-y-4">
                  {movie.trivia.map((fact, index) => (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.7 + index * 0.1 }}
                      className="flex items-start space-x-4 group"
                    >
                      <div className="w-3 h-3 bg-gradient-to-r from-orange-400 to-yellow-400 rounded-full mt-2 flex-shrink-0 group-hover:scale-125 transition-transform duration-300"></div>
                      <p className="text-gray-300 leading-relaxed group-hover:text-white transition-colors duration-300">
                        {fact}
                      </p>
                    </motion.div>
                  ))}
                </div>
              </motion.div>
            </motion.div>

            {/* Right Side - Enhanced Movie Details */}
            <motion.div
              initial={{ opacity: 0, x: 60 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.5, duration: 0.8 }}
              className="lg:col-span-2"
            >
              <div className="space-y-8">
                {/* Enhanced Title and Basic Info */}
                <div>
                  <motion.h1
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.6 }}
                    className="text-6xl font-black mb-6 bg-gradient-to-r from-yellow-400 via-orange-500 to-yellow-400 bg-clip-text text-transparent leading-tight"
                  >
                    {movie.title}
                  </motion.h1>

                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.7 }}
                    className="flex flex-wrap items-center gap-4 mb-8"
                  >
                    {[
                      { icon: Calendar, text: movie.year },
                      { icon: Clock, text: movie.duration },
                      { icon: Star, text: movie.ageRating },
                    ].map((item, index) => (
                      <motion.div
                        key={index}
                        whileHover={{ scale: 1.05, y: -2 }}
                        className="flex items-center space-x-3 bg-gradient-to-r from-gray-800/60 to-gray-900/60 backdrop-blur-sm rounded-2xl px-6 py-3 border border-gray-600/40 hover:border-orange-400/40 transition-all duration-300"
                      >
                        <item.icon className="w-5 h-5 text-orange-400" />
                        <span className="text-gray-300 font-medium">{item.text}</span>
                      </motion.div>
                    ))}
                  </motion.div>

                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.8 }}
                    className="flex flex-wrap gap-3 mb-8"
                  >
                    {movie.genre.split(", ").map((genre, index) => (
                      <motion.span
                        key={index}
                        whileHover={{ scale: 1.05, y: -2 }}
                        className="bg-gradient-to-r from-orange-400/20 to-yellow-400/20 backdrop-blur-sm border border-orange-400/40 rounded-2xl px-6 py-3 text-sm font-semibold text-orange-300 hover:text-orange-200 hover:border-orange-400/60 transition-all duration-300"
                      >
                        {genre}
                      </motion.span>
                    ))}
                  </motion.div>
                </div>

                {/* Enhanced Description */}
                <motion.div
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.9 }}
                  className="bg-gradient-to-br from-gray-900/80 to-black/80 backdrop-blur-2xl rounded-3xl p-8 border border-gray-700/50 hover:border-gray-600/60 transition-all duration-500"
                >
                  <h2 className="text-3xl font-bold bg-gradient-to-r from-orange-400 to-yellow-400 bg-clip-text text-transparent mb-6">
                    Synopsis
                  </h2>
                  <p className="text-gray-300 leading-relaxed text-lg mb-6 hover:text-white transition-colors duration-300">
                    {movie.description}
                  </p>
                  <p className="text-gray-400 leading-relaxed hover:text-gray-300 transition-colors duration-300">
                    {movie.plot}
                  </p>
                </motion.div>

                {/* Enhanced Cast and Crew */}
                <motion.div
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 1.0 }}
                  className="bg-gradient-to-br from-gray-900/80 to-black/80 backdrop-blur-2xl rounded-3xl p-8 border border-gray-700/50 hover:border-gray-600/60 transition-all duration-500"
                >
                  <h2 className="text-3xl font-bold bg-gradient-to-r from-orange-400 to-yellow-400 bg-clip-text text-transparent mb-6">
                    Cast & Crew
                  </h2>
                  <div className="grid md:grid-cols-2 gap-8">
                    <div>
                      <h3 className="text-xl font-semibold text-white mb-4 flex items-center">
                        <Users className="w-5 h-5 text-orange-400 mr-2" />
                        Director
                      </h3>
                      <p className="text-gray-300 text-lg hover:text-white transition-colors duration-300">
                        {movie.director}
                      </p>
                    </div>
                    <div>
                      <h3 className="text-xl font-semibold text-white mb-4 flex items-center">
                        <Star className="w-5 h-5 text-orange-400 mr-2" />
                        Starring
                      </h3>
                      <div className="space-y-2">
                        {movie.cast.map((actor, index) => (
                          <motion.p
                            key={index}
                            whileHover={{ x: 5 }}
                            className="text-gray-300 hover:text-white transition-all duration-300 cursor-pointer"
                          >
                            {actor}
                          </motion.p>
                        ))}
                      </div>
                    </div>
                  </div>
                </motion.div>

                {/* Enhanced Technical Details */}
                <motion.div
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 1.1 }}
                  className="bg-gradient-to-br from-gray-900/80 to-black/80 backdrop-blur-2xl rounded-3xl p-8 border border-gray-700/50 hover:border-gray-600/60 transition-all duration-500"
                >
                  <h2 className="text-3xl font-bold bg-gradient-to-r from-orange-400 to-yellow-400 bg-clip-text text-transparent mb-6">
                    Details
                  </h2>
                  <div className="grid md:grid-cols-2 gap-8">
                    <div className="space-y-4">
                      {[
                        { label: "Language", value: movie.language },
                        { label: "Country", value: movie.country },
                        { label: "Duration", value: movie.duration },
                      ].map((item, index) => (
                        <motion.div
                          key={index}
                          whileHover={{ x: 5 }}
                          className="flex justify-between items-center py-2 border-b border-gray-700/30 hover:border-orange-400/30 transition-all duration-300"
                        >
                          <span className="text-gray-400 font-medium">{item.label}:</span>
                          <span className="text-white font-semibold">{item.value}</span>
                        </motion.div>
                      ))}
                    </div>
                    <div>
                      <span className="text-gray-400 block mb-4 font-medium">Awards:</span>
                      <div className="space-y-3">
                        {movie.awards.map((award, index) => (
                          <motion.div
                            key={index}
                            whileHover={{ scale: 1.02, x: 5 }}
                            className="flex items-center space-x-3 p-3 bg-gradient-to-r from-yellow-400/10 to-orange-400/10 rounded-xl border border-yellow-400/20 hover:border-yellow-400/40 transition-all duration-300"
                          >
                            <Award className="w-5 h-5 text-yellow-400 flex-shrink-0" />
                            <span className="text-white font-medium">{award}</span>
                          </motion.div>
                        ))}
                      </div>
                    </div>
                  </div>
                </motion.div>
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  )
}

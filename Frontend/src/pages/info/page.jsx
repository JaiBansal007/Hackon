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
    <div className="relative min-h-screen w-full bg-black text-white overflow-x-hidden">
      
      <div className="fixed inset-0 z-0">
        <img
          src={movie.image || "/placeholder.svg"}
          alt={movie.title}
          className="w-full h-full object-cover object-top opacity-60"
        />
        <div
          className="absolute inset-0"
          style={{
            background:
              "linear-gradient(90deg, rgba(16,18,27,0.98) 0%, rgba(16,18,27,0.95) 60%, rgba(16,18,27,0.0) 100%)",
            backdropFilter: "blur(18px)",
            WebkitBackdropFilter: "blur(18px)",
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/60" />
      </div>

      {/* Sticky navbar-like header */}
      <div className="sticky top-0 z-30">
        <motion.div
          initial={{ y: -40, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.4, ease: "easeOut" }}
          className="flex items-center justify-between px-8 py-4 bg-black/70 backdrop-blur-md border-b border-gray-800"
        >
          <Link
            to="/home"
            className="flex items-center space-x-2 group bg-gray-900/60 px-5 py-2 rounded-full border border-gray-700 hover:border-orange-400 transition-all"
          >
            <ArrowLeft className="w-5 h-5 text-orange-400 group-hover:-translate-x-1 transition-all" />
            <span className="text-orange-300 font-semibold">Home</span>
          </Link>
          <div className="flex items-center gap-2">
            <Button
              onClick={handleQuizClick}
              variant="outline"
              className="border-orange-400/60 text-orange-400 hover:bg-orange-400 hover:text-black rounded-full px-4 py-2 text-sm font-bold"
            >
              <Award className="w-4 h-4 mr-2" />
              Take Quiz
            </Button>
            <Button
              onClick={handleWatchMovie}
              className="bg-gradient-to-r from-yellow-400 via-orange-500 to-yellow-400 text-black hover:from-yellow-300 hover:via-orange-400 hover:to-yellow-300 rounded-full px-6 py-2 text-sm font-bold"
            >
              <Play className="w-4 h-4 mr-2" />
              Watch Now
            </Button>
          </div>
        </motion.div>
      </div>

      {/* Main Content */}
      <div className="relative z-10 container mx-auto px-4 py-10">
        <div className="flex flex-col lg:flex-row gap-10">
          {/* Poster & Actions Card */}
          <motion.div
            initial={{ opacity: 0, x: -40 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2, duration: 0.7 }}
            className="w-full max-w-xs mx-auto lg:mx-0 bg-gradient-to-br from-gray-900/90 via-gray-800/80 to-black/90 backdrop-blur-2xl rounded-3xl p-6 border border-orange-500/20 shadow-2xl"
          >
            <div className="relative group mb-6">
              <img
                src={movie.image || "/placeholder.svg"}
                alt={movie.title}
                className="w-full rounded-2xl shadow-xl transition-all duration-500 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
            </div>
            {/* Ratings */}
            <div className="flex justify-between items-center mb-6">
              <div className="flex items-center gap-2">
                <Star className="w-5 h-5 text-yellow-400" />
                <span className="text-yellow-300 font-bold">{movie.imdbRating}</span>
                <span className="text-xs text-gray-400">IMDb</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-red-400 font-bold">{movie.rottenTomatoes}</span>
                <span className="text-xs text-gray-400">RT</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-green-400 font-bold">{movie.metacritic}</span>
                <span className="text-xs text-gray-400">Meta</span>
              </div>
            </div>
            {/* Quick Info */}
            <div className="flex flex-wrap gap-2 mb-6">
              <span className="bg-gray-800/60 px-3 py-1 rounded-full text-xs text-gray-300 flex items-center gap-1">
                <Calendar className="w-4 h-4 text-orange-400" /> {movie.year}
              </span>
              <span className="bg-gray-800/60 px-3 py-1 rounded-full text-xs text-gray-300 flex items-center gap-1">
                <Clock className="w-4 h-4 text-orange-400" /> {movie.duration}
              </span>
              <span className="bg-gray-800/60 px-3 py-1 rounded-full text-xs text-gray-300 flex items-center gap-1">
                <Star className="w-4 h-4 text-orange-400" /> {movie.ageRating}
              </span>
            </div>
            {/* Genres */}
            <div className="flex flex-wrap gap-2 mb-6">
              {movie.genre.split(", ").map((genre, idx) => (
                <span
                  key={idx}
                  className="bg-gradient-to-r from-orange-400/20 to-yellow-400/20 border border-orange-400/40 rounded-full px-3 py-1 text-xs font-semibold text-orange-300"
                >
                  {genre}
                </span>
              ))}
            </div>
            {/* Social/Bookmark/Share */}
            <div className="flex justify-between items-center mt-4">
              <Button variant="ghost" size="icon" className="text-red-400 hover:text-red-300 bg-gray-800/40 rounded-xl">
                <Heart className="w-5 h-5" />
              </Button>
              <Button variant="ghost" size="icon" className="text-blue-400 hover:text-blue-300 bg-gray-800/40 rounded-xl">
                <Bookmark className="w-5 h-5" />
              </Button>
              <Button variant="ghost" size="icon" className="text-green-400 hover:text-green-300 bg-gray-800/40 rounded-xl">
                <Share2 className="w-5 h-5" />
              </Button>
            </div>
          </motion.div>

          {/* Details Section */}
          <motion.div
            initial={{ opacity: 0, x: 40 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3, duration: 0.7 }}
            className="flex-1 space-y-8"
          >
            {/* Title */}
            <h1 className="text-5xl font-black mb-2 bg-gradient-to-r from-yellow-400 via-orange-500 to-yellow-400 bg-clip-text text-transparent leading-tight">
              {movie.title}
            </h1>
            {/* Description */}
            <div className="bg-gradient-to-br from-gray-900/80 to-black/80 backdrop-blur-2xl rounded-3xl p-6 border border-gray-700/40">
              <h2 className="text-2xl font-bold bg-gradient-to-r from-orange-400 to-yellow-400 bg-clip-text text-transparent mb-2">
                Synopsis
              </h2>
              <p className="text-gray-300 leading-relaxed text-lg mb-2">{movie.description}</p>
              <p className="text-gray-400 leading-relaxed">{movie.plot}</p>
            </div>
            {/* Cast & Crew */}
            <div className="bg-gradient-to-br from-gray-900/80 to-black/80 backdrop-blur-2xl rounded-3xl p-6 border border-gray-700/40">
              <h2 className="text-2xl font-bold bg-gradient-to-r from-orange-400 to-yellow-400 bg-clip-text text-transparent mb-4">
                Cast & Crew
              </h2>
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <h3 className="text-lg font-semibold text-white mb-2 flex items-center">
                    <Users className="w-5 h-5 text-orange-400 mr-2" />
                    Director
                  </h3>
                  <p className="text-gray-300 text-base">{movie.director}</p>
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-white mb-2 flex items-center">
                    <Star className="w-5 h-5 text-orange-400 mr-2" />
                    Starring
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {movie.cast.map((actor, idx) => (
                      <span
                        key={idx}
                        className="bg-gray-800/60 px-3 py-1 rounded-full text-xs text-gray-300 hover:text-white transition"
                      >
                        {actor}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </div>
            {/* Technical Details & Awards */}
            <div className="bg-gradient-to-br from-gray-900/80 to-black/80 backdrop-blur-2xl rounded-3xl p-6 border border-gray-700/40">
              <h2 className="text-2xl font-bold bg-gradient-to-r from-orange-400 to-yellow-400 bg-clip-text text-transparent mb-4">
                Details & Awards
              </h2>
              <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <div className="flex justify-between items-center py-1 border-b border-gray-700/30">
                    <span className="text-gray-400 font-medium">Language:</span>
                    <span className="text-white font-semibold">{movie.language}</span>
                  </div>
                  <div className="flex justify-between items-center py-1 border-b border-gray-700/30">
                    <span className="text-gray-400 font-medium">Country:</span>
                    <span className="text-white font-semibold">{movie.country}</span>
                  </div>
                  <div className="flex justify-between items-center py-1 border-b border-gray-700/30">
                    <span className="text-gray-400 font-medium">Duration:</span>
                    <span className="text-white font-semibold">{movie.duration}</span>
                  </div>
                </div>
                <div>
                  <span className="text-gray-400 block mb-2 font-medium">Awards:</span>
                  <div className="flex flex-wrap gap-2">
                    {movie.awards.map((award, idx) => (
                      <span
                        key={idx}
                        className="flex items-center gap-2 bg-gradient-to-r from-yellow-400/10 to-orange-400/10 rounded-xl border border-yellow-400/20 px-3 py-1 text-sm text-yellow-300"
                      >
                        <Award className="w-4 h-4 text-yellow-400" />
                        {award}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </div>
            {/* Trivia */}
            <div className="bg-gradient-to-br from-gray-900/80 to-black/80 backdrop-blur-2xl rounded-3xl p-6 border border-gray-700/40">
              <h2 className="text-2xl font-bold bg-gradient-to-r from-orange-400 to-yellow-400 bg-clip-text text-transparent mb-4 flex items-center">
                <Sparkles className="w-6 h-6 text-orange-400 mr-2" />
                Did You Know?
              </h2>
              <ul className="space-y-2">
                {movie.trivia.map((fact, idx) => (
                  <li key={idx} className="flex items-start gap-2">
                    <span className="w-2 h-2 mt-2 bg-gradient-to-r from-orange-400 to-yellow-400 rounded-full flex-shrink-0" />
                    <span className="text-gray-300">{fact}</span>
                  </li>
                ))}
              </ul>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  )
}
                  

"use client"

import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Play } from "lucide-react"

export function FeaturedSection({ movie, onStartWatching, onStartQuiz }) {
  const handleQuizClick = () => {
    const movieSlug = movie.title
      .toLowerCase()
      .replace(/\s+/g, "-")
      .replace(/[^\w-]/g, "")
    if (onStartQuiz) {
      onStartQuiz(movieSlug)
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="relative h-screen bg-gradient-to-r from-black via-transparent to-black"
    >
      <img src={movie.image || "/placeholder.svg"} alt={movie.title} className="w-full h-full object-cover" />
      <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-transparent to-black/80" />
      <div className="absolute bottom-8 left-8 max-w-2xl">
        <motion.h1
          initial={{ y: 30, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.1, duration: 0.4 }}
          className="text-5xl font-bold mb-4 text-white"
        >
          {movie.title}
        </motion.h1>
        <motion.p
          initial={{ y: 30, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.15, duration: 0.4 }}
          className="text-lg text-gray-300 mb-4 line-clamp-3"
        >
          {movie.description}
        </motion.p>
        <motion.div
          initial={{ y: 30, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.2, duration: 0.4 }}
          className="flex items-center space-x-4 mb-6"
        >
          <span className="text-yellow-400 font-semibold">{movie.rating}</span>
          <span className="text-gray-400">{movie.year}</span>
          <span className="text-gray-400">{movie.genre}</span>
        </motion.div>
        <motion.div
          initial={{ y: 30, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.25, duration: 0.4 }}
          className="flex items-center space-x-4"
        >
          <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
            <Button
              onClick={() => onStartWatching(movie)}
              className="bg-gradient-to-r from-yellow-400 to-orange-500 text-black hover:from-yellow-500 hover:to-orange-600 px-8 py-3 text-lg"
            >
              <Play className="w-5 h-5 mr-2" />
              Play
            </Button>
          </motion.div>
          <Button
            variant="outline" className="border-gray-600 text-black hover:bg-gray-800 px-8 py-3"
            onClick={() => {
              const movieSlug = movie.title
                .toLowerCase()
                .replace(/\s+/g, "-")
                .replace(/[^\w-]/g, "")
              window.location.href = `/info/${movieSlug}`
            }}
          >
            More Info
          </Button>
          <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
            <Button
              onClick={handleQuizClick}
              className="bg-gradient-to-r from-purple-400 to-pink-500 text-white hover:from-purple-500 hover:to-pink-600 px-8 py-3 text-lg"
            >
              Quiz
            </Button>
          </motion.div>
        </motion.div>
      </div>
    </motion.div>
  )
}

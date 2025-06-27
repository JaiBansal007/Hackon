"use client"

import { useState, useEffect } from "react"
import { Link, useNavigate } from "react-router-dom"
import { motion, AnimatePresence } from "framer-motion"
import { Button } from "../../components/ui/button"
import {
  ArrowLeft,
  Coins,
  Flame,
  Trophy,
  Calendar,
  Gift,
  TrendingUp,
  Play,
  Clock,
  Eye,
  Trash2,
  Star,
  Award,
  Target,
  Zap,
} from "lucide-react"
import { GamificationManager } from "../../lib/gamification"
import { ViewingHistoryManager } from "../../lib/viewing-history"

export default function ProfilePage() {
  const navigate = useNavigate()
  const [userStats, setUserStats] = useState(GamificationManager.getInstance().getUserStats())
  const [pointHistory, setPointHistory] = useState([])
  const [redemptionHistory, setRedemptionHistory] = useState([])
  const [viewingHistory, setViewingHistory] = useState([])
  const [activeTab, setActiveTab] = useState("activity")

  const viewingHistoryManager = ViewingHistoryManager.getInstance()

  useEffect(() => {
    const gamification = GamificationManager.getInstance()
    setUserStats(gamification.getUserStats())
    setPointHistory(gamification.getPointHistory())
    setRedemptionHistory(gamification.getRedemptionHistory())

    // Load real viewing history
    setViewingHistory(viewingHistoryManager.getViewingHistory())
  }, [])

  // Refresh viewing history when tab becomes active
  useEffect(() => {
    if (activeTab === "viewing") {
      setViewingHistory(viewingHistoryManager.getViewingHistory())
    }
  }, [activeTab])

  const formatDate = (dateString) => {
    const date = new Date(dateString)
    return date.toLocaleDateString("en-US", {
      weekday: "long",
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    })
  }

  const formatDuration = (seconds) => {
    const hours = Math.floor(seconds / 3600)
    const minutes = Math.floor((seconds % 3600) / 60)
    if (hours > 0) {
      return `${hours}h ${minutes}m`
    }
    return `${minutes}m`
  }

  const getWatchProgress = (watched, total) => {
    if (!total || total === 0) return 0
    return Math.min((watched / total) * 100, 100)
  }

  const handleContinueWatching = (movie) => {
    // Navigate directly to the movie page - the video player will auto-resume
    navigate(`/movie/${movie.movieId}`)
  }

  const handleRemoveFromHistory = (movieId) => {
    viewingHistoryManager.removeFromHistory(movieId)
    setViewingHistory(viewingHistoryManager.getViewingHistory())
  }

  const getActivityIcon = (type) => {
    switch (type) {
      case "daily_watch":
        return <Flame className="w-5 h-5 text-orange-400" />
      case "quiz":
        return <Trophy className="w-5 h-5 text-yellow-400" />
      case "streak_bonus":
        return <TrendingUp className="w-5 h-5 text-green-400" />
      case "redemption":
        return <Gift className="w-5 h-5 text-red-400" />
      default:
        return <Coins className="w-5 h-5 text-yellow-400" />
    }
  }

  const getActivityColor = (type) => {
    switch (type) {
      case "daily_watch":
        return "from-orange-400 to-yellow-400"
      case "quiz":
        return "from-yellow-400 to-orange-500"
      case "streak_bonus":
        return "from-green-400 to-emerald-500"
      case "redemption":
        return "from-red-400 to-pink-500"
      default:
        return "from-yellow-400 to-orange-500"
    }
  }

  return (
    <div className="min-h-screen w-full bg-gradient-to-br from-[#18181b] via-[#23272f] to-[#18181b] text-white font-inter">
      {/* Enhanced Glassmorphism Background */}
      <div className="fixed inset-0 z-0">
        <div className="absolute inset-0 bg-gradient-to-br from-black/90 via-gray-900/80 to-black/80" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-amber-900/20 via-transparent to-transparent" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_left,_var(--tw-gradient-stops))] from-blue-900/10 via-transparent to-transparent" />
      </div>

      <div className="relative z-10 container mx-auto px-4 md:px-8 py-10 max-w-7xl">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -30 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col md:flex-row items-center justify-between mb-14 gap-6"
        >
          <motion.div whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.97 }}>
            <Link
              to="/home"
              className="flex items-center space-x-3 group bg-gray-800/60 backdrop-blur-md px-6 py-3 rounded-xl border border-amber-500/30 hover:border-amber-400/60 shadow-md hover:shadow-lg transition-all duration-300"
            >
              <ArrowLeft className="w-5 h-5 text-amber-400 group-hover:text-amber-300 transition-colors" />
              <span className="text-amber-400 group-hover:text-amber-300 font-semibold transition-colors">
                Back to Home
              </span>
            </Link>
          </motion.div>

          <div className="text-center flex-1">
            <motion.h1
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="text-4xl md:text-5xl font-extrabold bg-gradient-to-r from-amber-400 via-orange-500 to-amber-400 bg-clip-text text-transparent mb-2 drop-shadow-lg"
            >
              Your Profile
            </motion.h1>
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.2 }}
              className="text-gray-300 text-lg font-medium"
            >
              Track your progress and achievements
            </motion.p>
          </div>

          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.3 }}
            className="flex items-center space-x-3 bg-gradient-to-r from-amber-500/30 to-orange-500/30 backdrop-blur-md rounded-xl px-7 py-5 border border-amber-500/40 shadow-lg"
          >
            <div className="p-2 bg-gradient-to-r from-amber-500 to-orange-500 rounded-full shadow-md">
              <Coins className="w-7 h-7 text-black" />
            </div>
            <div>
              <div className="text-2xl font-bold text-white drop-shadow">{userStats.totalPoints.toLocaleString()}</div>
              <div className="text-amber-200 text-sm font-semibold">Total Points</div>
            </div>
          </motion.div>
        </motion.div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-7 mb-14">
          {/* Total Points */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            whileHover={{ scale: 1.03, y: -3 }}
            className="relative overflow-hidden bg-gradient-to-br from-amber-500/15 via-orange-500/10 to-amber-500/15 backdrop-blur-md rounded-2xl p-8 border border-amber-500/30 group shadow-lg hover:shadow-2xl transition"
          >
            <div className="absolute inset-0 bg-gradient-to-br from-amber-500/10 to-orange-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            <div className="relative flex items-center space-x-4">
              <div className="p-4 bg-gradient-to-r from-amber-500 to-orange-500 rounded-2xl shadow-lg">
                <Coins className="w-8 h-8 text-black" />
              </div>
              <div>
                <p className="text-3xl font-extrabold text-white mb-1">{userStats.totalPoints.toLocaleString()}</p>
                <p className="text-amber-200 font-semibold">Total Points</p>
              </div>
            </div>
            <div className="absolute top-4 right-4">
              <Zap className="w-6 h-6 text-amber-400/30" />
            </div>
          </motion.div>
          {/* Current Streak */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            whileHover={{ scale: 1.03, y: -3 }}
            className="relative overflow-hidden bg-gradient-to-br from-orange-500/15 via-red-500/10 to-orange-500/15 backdrop-blur-md rounded-2xl p-8 border border-orange-500/30 group shadow-lg hover:shadow-2xl transition"
          >
            <div className="absolute inset-0 bg-gradient-to-br from-orange-500/10 to-red-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            <div className="relative flex items-center space-x-4">
              <div className="p-4 bg-gradient-to-r from-orange-500 to-red-500 rounded-2xl shadow-lg">
                <Flame className="w-8 h-8 text-white" />
              </div>
              <div>
                <p className="text-3xl font-extrabold text-white mb-1">{userStats.currentStreak}</p>
                <p className="text-orange-200 font-semibold">Current Streak</p>
              </div>
            </div>
            <div className="absolute top-4 right-4">
              <Target className="w-6 h-6 text-orange-400/30" />
            </div>
          </motion.div>
          {/* Longest Streak */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            whileHover={{ scale: 1.03, y: -3 }}
            className="relative overflow-hidden bg-gradient-to-br from-green-500/15 via-emerald-500/10 to-green-500/15 backdrop-blur-md rounded-2xl p-8 border border-green-500/30 group shadow-lg hover:shadow-2xl transition"
          >
            <div className="absolute inset-0 bg-gradient-to-br from-green-500/10 to-emerald-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            <div className="relative flex items-center space-x-4">
              <div className="p-4 bg-gradient-to-r from-green-500 to-emerald-500 rounded-2xl shadow-lg">
                <TrendingUp className="w-8 h-8 text-white" />
              </div>
              <div>
                <p className="text-3xl font-extrabold text-white mb-1">{userStats.longestStreak}</p>
                <p className="text-green-200 font-semibold">Longest Streak</p>
              </div>
            </div>
            <div className="absolute top-4 right-4">
              <Award className="w-6 h-6 text-green-400/30" />
            </div>
          </motion.div>
          {/* Movies Watched */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            whileHover={{ scale: 1.03, y: -3 }}
            className="relative overflow-hidden bg-gradient-to-br from-blue-500/15 via-purple-500/10 to-blue-500/15 backdrop-blur-md rounded-2xl p-8 border border-blue-500/30 group shadow-lg hover:shadow-2xl transition"
          >
            <div className="absolute inset-0 bg-gradient-to-br from-blue-500/10 to-purple-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            <div className="relative flex items-center space-x-4">
              <div className="p-4 bg-gradient-to-r from-blue-500 to-purple-500 rounded-2xl shadow-lg">
                <Eye className="w-8 h-8 text-white" />
              </div>
              <div>
                <p className="text-3xl font-extrabold text-white mb-1">{viewingHistory.length}</p>
                <p className="text-blue-200 font-semibold">Movies Watched</p>
              </div>
            </div>
            <div className="absolute top-4 right-4">
              <Star className="w-6 h-6 text-blue-400/30" />
            </div>
          </motion.div>
        </div>

        {/* Tabs */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="flex flex-wrap gap-3 mb-10 p-2 bg-gray-800/40 backdrop-blur-md rounded-2xl border border-gray-700/50 shadow"
        >
          {[
            { id: "activity", label: "Point Activity", icon: Coins },
            { id: "viewing", label: `Viewing History (${viewingHistory.length})`, icon: Eye },
            { id: "redemptions", label: "Redemption History", icon: Gift },
          ].map((tab) => (
            <motion.button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              whileHover={{ scale: 1.04 }}
              whileTap={{ scale: 0.98 }}
              className={`flex items-center space-x-3 px-7 py-4 rounded-xl font-semibold transition-all duration-300 shadow-sm ${
                activeTab === tab.id
                  ? "bg-gradient-to-r from-amber-500 to-orange-500 text-black shadow-lg"
                  : "text-white hover:bg-gray-700/60"
              }`}
            >
              <tab.icon className="w-5 h-5" />
              <span>{tab.label}</span>
            </motion.button>
          ))}
        </motion.div>

        {/* Content */}
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -30 }}
            transition={{ duration: 0.3 }}
            className="bg-gray-900/60 backdrop-blur-lg rounded-2xl p-8 border border-gray-700/40 shadow-2xl"
          >
            {activeTab === "activity" ? (
              <div>
                <h2 className="text-2xl font-bold text-white mb-8 flex items-center space-x-3">
                  <Coins className="w-7 h-7 text-amber-400" />
                  <span>Your Point Activity</span>
                </h2>

                {pointHistory.length === 0 ? (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="text-center py-16"
                  >
                    <div className="p-6 bg-gradient-to-r from-amber-500/10 to-orange-500/10 rounded-full w-32 h-32 mx-auto mb-6 flex items-center justify-center">
                      <Coins className="w-16 h-16 text-amber-400" />
                    </div>
                    <h3 className="text-2xl font-bold text-gray-300 mb-4">No activity yet</h3>
                    <p className="text-gray-500 text-lg mb-6">
                      Start watching movies and taking quizzes to earn points!
                    </p>
                    <Button
                      onClick={() => navigate("/home")}
                      className="bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-black font-bold px-8 py-4 rounded-xl"
                    >
                      Start Earning Points
                    </Button>
                  </motion.div>
                ) : (
                  <div className="space-y-4">
                    {pointHistory.map((activity, index) => (
                      <motion.div
                        key={activity.id}
                        initial={{ opacity: 0, x: -30 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.05 }}
                        whileHover={{ scale: 1.01, x: 5 }}
                        className="flex items-center space-x-6 p-6 bg-gray-800/40 backdrop-blur-sm rounded-xl hover:bg-gray-800/60 transition-all duration-300 border border-gray-700/30"
                      >
                        <div
                          className={`w-16 h-16 rounded-2xl bg-gradient-to-r ${getActivityColor(
                            activity.type,
                          )} flex items-center justify-center flex-shrink-0 shadow-lg`}
                        >
                          {getActivityIcon(activity.type)}
                        </div>

                        <div className="flex-1 min-w-0">
                          <div className="flex items-center space-x-3 mb-2">
                            <span className="text-sm text-gray-400 uppercase tracking-wider font-semibold px-3 py-1 bg-gray-700/50 rounded-full">
                              {activity.type.replace("_", " ")}
                            </span>
                          </div>
                          <p className="text-white font-semibold text-lg mb-1">{activity.description}</p>
                          <p className="text-gray-400">{formatDate(activity.date)}</p>
                        </div>

                        <div className="text-right">
                          <div
                            className={`text-2xl font-bold ${activity.points > 0 ? "text-green-400" : "text-red-400"}`}
                          >
                            {activity.points > 0 ? "+" : ""}
                            {activity.points}
                          </div>
                          <div className="text-sm text-gray-500">points</div>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                )}
              </div>
            ) : activeTab === "viewing" ? (
              <div>
                <div className="flex items-center justify-between mb-8">
                  <h2 className="text-2xl font-bold text-white flex items-center space-x-3">
                    <Eye className="w-7 h-7 text-blue-400" />
                    <span>Your Viewing History</span>
                  </h2>
                  {viewingHistory.length > 0 && (
                    <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                      <Button
                        onClick={() => {
                          viewingHistoryManager.clearHistory()
                          setViewingHistory([])
                        }}
                        className="bg-gradient-to-r from-red-500 to-red-600 hover:from-red-400 hover:to-red-500 text-white font-semibold px-6 py-3 rounded-xl"
                      >
                        <Trash2 className="w-5 h-5 mr-2" />
                        Clear All
                      </Button>
                    </motion.div>
                  )}
                </div>

                {viewingHistory.length === 0 ? (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="text-center py-16"
                  >
                    <div className="p-6 bg-gradient-to-r from-blue-500/10 to-purple-500/10 rounded-full w-32 h-32 mx-auto mb-6 flex items-center justify-center">
                      <Eye className="w-16 h-16 text-blue-400" />
                    </div>
                    <h3 className="text-2xl font-bold text-gray-300 mb-4">No viewing history yet</h3>
                    <p className="text-gray-500 text-lg mb-6">Start watching movies to build your viewing history!</p>
                    <Button
                      onClick={() => navigate("/home")}
                      className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-400 hover:to-purple-500 text-white font-bold px-8 py-4 rounded-xl"
                    >
                      Browse Movies
                    </Button>
                  </motion.div>
                ) : (
                  <div className="space-y-6">
                    {viewingHistory.map((movie, index) => (
                      <motion.div
                        key={movie.id}
                        initial={{ opacity: 0, x: -30 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.05 }}
                        whileHover={{ scale: 1.01, y: -2 }}
                        className="flex items-center space-x-6 p-6 bg-gray-800/40 backdrop-blur-sm rounded-2xl hover:bg-gray-800/60 transition-all duration-300 border border-gray-700/30 group"
                      >
                        <div className="flex-shrink-0 relative overflow-hidden rounded-xl">
                          <img
                            src={movie.image || "/placeholder.svg?height=160&width=120"}
                            alt={movie.title}
                            className="w-24 h-36 object-cover transition-transform duration-300 group-hover:scale-110"
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                        </div>

                        <div className="flex-1 min-w-0">
                          <h3 className="text-white font-bold text-xl mb-3">{movie.title}</h3>

                          <div className="flex items-center space-x-6 mb-4">
                            <div className="flex items-center space-x-2">
                              <Clock className="w-5 h-5 text-gray-400" />
                              <span className="text-gray-300 font-medium">
                                {formatDuration(movie.watchedDuration)} / {formatDuration(movie.totalDuration)}
                              </span>
                            </div>
                            <div className="flex items-center space-x-2">
                              <Calendar className="w-5 h-5 text-gray-400" />
                              <span className="text-gray-300 font-medium">
                                {new Date(movie.lastWatched).toLocaleDateString()}
                              </span>
                            </div>
                          </div>

                          {/* Enhanced Progress Bar */}
                          <div className="mb-4">
                            <div className="flex justify-between items-center mb-2">
                              <span className="text-sm text-gray-400 font-medium">Progress</span>
                              <span className="text-sm text-gray-400 font-bold">
                                {Math.round(getWatchProgress(movie.watchedDuration, movie.totalDuration))}%
                              </span>
                            </div>
                            <div className="w-full bg-gray-700 rounded-full h-3 overflow-hidden">
                              <motion.div
                                initial={{ width: 0 }}
                                animate={{
                                  width: `${getWatchProgress(movie.watchedDuration, movie.totalDuration)}%`,
                                }}
                                transition={{ duration: 1, delay: index * 0.1 }}
                                className={`h-3 rounded-full ${
                                  movie.completed
                                    ? "bg-gradient-to-r from-green-400 to-emerald-500"
                                    : "bg-gradient-to-r from-amber-400 to-orange-500"
                                }`}
                              />
                            </div>
                          </div>

                          <p className="text-gray-400">Last watched: {formatDate(movie.lastWatched)}</p>
                        </div>

                        <div className="flex flex-col space-y-3">
                          {movie.completed ? (
                            <div className="flex items-center space-x-3 text-green-400 font-semibold bg-green-500/10 px-4 py-2 rounded-xl">
                              <Trophy className="w-5 h-5" />
                              <span>Completed</span>
                            </div>
                          ) : (
                            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                              <Button
                                onClick={() => handleContinueWatching(movie)}
                                className="bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-black font-bold px-6 py-3 rounded-xl shadow-lg"
                              >
                                <Play className="w-5 h-5 mr-2" />
                                Continue
                              </Button>
                            </motion.div>
                          )}

                          <div className="flex space-x-2">
                            <Button
                              onClick={() => navigate(`/info/${movie.movieId}`)}
                              variant="outline"
                              className="border-gray-600 text-black hover:bg-gray-700 px-4 py-2 rounded-xl transition-all duration-300"
                            >
                              Info
                            </Button>
                            <Button
                              onClick={() => handleRemoveFromHistory(movie.movieId)}
                              variant="outline"
                              className="border-red-600 text-red-400 hover:bg-red-600 px-4 py-2 rounded-xl transition-all duration-300"
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                )}
              </div>
            ) : (
              <div>
                <h2 className="text-2xl font-bold text-white mb-8 flex items-center space-x-3">
                  <Gift className="w-7 h-7 text-red-400" />
                  <span>Redemption History</span>
                </h2>

                {redemptionHistory.length === 0 ? (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="text-center py-16"
                  >
                    <div className="p-6 bg-gradient-to-r from-red-500/10 to-pink-500/10 rounded-full w-32 h-32 mx-auto mb-6 flex items-center justify-center">
                      <Gift className="w-16 h-16 text-red-400" />
                    </div>
                    <h3 className="text-2xl font-bold text-gray-300 mb-4">No redemptions yet</h3>
                    <p className="text-gray-500 text-lg mb-6">Earn more points to unlock amazing rewards!</p>
                    <Button
                      onClick={() => navigate("/redeem")}
                      className="bg-gradient-to-r from-red-500 to-pink-500 hover:from-red-400 hover:to-pink-400 text-white font-bold px-8 py-4 rounded-xl"
                    >
                      View Rewards
                    </Button>
                  </motion.div>
                ) : (
                  <div className="space-y-4">
                    {redemptionHistory.map((redemption, index) => (
                      <motion.div
                        key={redemption.id}
                        initial={{ opacity: 0, x: -30 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.05 }}
                        whileHover={{ scale: 1.01, x: 5 }}
                        className="flex items-center space-x-6 p-6 bg-gray-800/40 backdrop-blur-sm rounded-xl hover:bg-gray-800/60 transition-all duration-300 border border-gray-700/30"
                      >
                        <div className="w-16 h-16 rounded-2xl bg-gradient-to-r from-red-500 to-pink-500 flex items-center justify-center flex-shrink-0 shadow-lg">
                          <Gift className="w-8 h-8 text-white" />
                        </div>

                        <div className="flex-1 min-w-0">
                          <p className="text-white font-semibold text-lg mb-1">{redemption.description}</p>
                          <p className="text-gray-400">{formatDate(redemption.date)}</p>
                        </div>

                        <div className="text-right">
                          <div className="text-2xl font-bold text-red-400">{redemption.points}</div>
                          <div className="text-sm text-gray-500">points</div>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  )
}

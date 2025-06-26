"use client"

import { useState, useEffect } from "react"
import { Link, useNavigate } from "react-router-dom"
import { motion } from "framer-motion"
import { Button } from "../../components/ui/button"
import { ArrowLeft, Coins, Flame, Trophy, Calendar, Gift, TrendingUp, Play, Clock, Eye, Trash2 } from "lucide-react"
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
    <div className="min-h-screen w-screen bg-black text-white">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <Link to="/home" className="flex items-center space-x-2">
            <ArrowLeft className="w-5 h-5 text-orange-400" />
            <span className="text-orange-400 hover:text-orange-300">Back to Home</span>
          </Link>

          <div className="text-center">
            <h1 className="text-3xl font-bold bg-gradient-to-r from-yellow-400 to-orange-500 bg-clip-text text-transparent">
              Your Profile
            </h1>
            <p className="text-gray-400">Track your progress and achievements</p>
          </div>

          <div className="flex items-center space-x-2 bg-gradient-to-r from-yellow-400/20 to-orange-500/20 rounded-lg px-4 py-2 border border-yellow-400/30">
            <Coins className="w-5 h-5 text-yellow-400" />
            <span className="text-white font-bold">{userStats.totalPoints.toLocaleString()}</span>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-gradient-to-r from-yellow-400/20 to-orange-500/20 rounded-xl p-6 border border-yellow-400/30"
          >
            <div className="flex items-center space-x-3 mb-2">
              <Coins className="w-8 h-8 text-yellow-400" />
              <div>
                <p className="text-2xl font-bold text-white">{userStats.totalPoints.toLocaleString()}</p>
                <p className="text-yellow-400 text-sm">Total Points</p>
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-gradient-to-r from-orange-400/20 to-red-500/20 rounded-xl p-6 border border-orange-400/30"
          >
            <div className="flex items-center space-x-3 mb-2">
              <Flame className="w-8 h-8 text-orange-400" />
              <div>
                <p className="text-2xl font-bold text-white">{userStats.currentStreak}</p>
                <p className="text-orange-400 text-sm">Current Streak</p>
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-gradient-to-r from-green-400/20 to-emerald-500/20 rounded-xl p-6 border border-green-400/30"
          >
            <div className="flex items-center space-x-3 mb-2">
              <TrendingUp className="w-8 h-8 text-green-400" />
              <div>
                <p className="text-2xl font-bold text-white">{userStats.longestStreak}</p>
                <p className="text-green-400 text-sm">Longest Streak</p>
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-gradient-to-r from-blue-400/20 to-purple-500/20 rounded-xl p-6 border border-blue-400/30"
          >
            <div className="flex items-center space-x-3 mb-2">
              <Eye className="w-8 h-8 text-blue-400" />
              <div>
                <p className="text-2xl font-bold text-white">{viewingHistory.length}</p>
                <p className="text-blue-400 text-sm">Movies Watched</p>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Tabs */}
        <div className="flex space-x-2 mb-6">
          <Button
            onClick={() => setActiveTab("activity")}
            variant={activeTab === "activity" ? "default" : "outline"}
            className={`text-black ${
              activeTab === "activity"
                ? "bg-gradient-to-r from-yellow-400 to-orange-500 text-black"
                : "border-gray-600 hover:bg-gray-800"
            }`}
          >
            Point Activity
          </Button>
          <Button
            onClick={() => setActiveTab("viewing")}
            variant={activeTab === "viewing" ? "default" : "outline"}
            className={`text-black ${
              activeTab === "viewing"
                ? "bg-gradient-to-r from-yellow-400 to-orange-500 text-black"
                : "border-gray-600 hover:bg-gray-800"
            }`}
          >
            Viewing History ({viewingHistory.length})
          </Button>
          <Button
            onClick={() => setActiveTab("redemptions")}
            variant={activeTab === "redemptions" ? "default" : "outline"}
            className={`text-black ${
              activeTab === "redemptions"
                ? "bg-gradient-to-r from-yellow-400 to-orange-500 text-black"
                : "border-gray-600 hover:bg-gray-800"
            }`}
          >
            Redemption History
          </Button>
        </div>

        {/* Content */}
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gray-900/50 rounded-xl p-6"
        >
          {activeTab === "activity" ? (
            <div>
              <h2 className="text-xl font-bold text-white mb-6">Your Point Activity</h2>

              {pointHistory.length === 0 ? (
                <div className="text-center py-12">
                  <Coins className="w-16 h-16 text-gray-600 mx-auto mb-4" />
                  <h3 className="text-xl font-bold text-gray-400 mb-2">No activity yet</h3>
                  <p className="text-gray-500">Start watching movies and taking quizzes to earn points!</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {pointHistory.map((activity, index) => (
                    <motion.div
                      key={activity.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.05 }}
                      className="flex items-center space-x-4 p-4 bg-gray-800/50 rounded-lg hover:bg-gray-800/70 transition-colors"
                    >
                      <div
                        className={`w-12 h-12 rounded-full bg-gradient-to-r ${getActivityColor(activity.type)} flex items-center justify-center flex-shrink-0`}
                      >
                        {getActivityIcon(activity.type)}
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-center space-x-2 mb-1">
                          <span className="text-sm text-gray-400 uppercase tracking-wide">
                            {activity.type.replace("_", " ")}
                          </span>
                        </div>
                        <p className="text-white font-medium">{activity.description}</p>
                        <p className="text-sm text-gray-500">{formatDate(activity.date)}</p>
                      </div>

                      <div className="text-right">
                        <div className={`text-lg font-bold ${activity.points > 0 ? "text-green-400" : "text-red-400"}`}>
                          {activity.points > 0 ? "+" : ""}
                          {activity.points}
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}
            </div>
          ) : activeTab === "viewing" ? (
            <div>
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-white">Your Viewing History</h2>
                {viewingHistory.length > 0 && (
                  <Button
                    onClick={() => {
                      viewingHistoryManager.clearHistory()
                      setViewingHistory([])
                    }}
                    variant="outline"
                    className="border-red-600 text-red-400 hover:bg-red-600 text-sm"
                  >
                    <Trash2 className="w-4 h-4 mr-2" />
                    Clear All
                  </Button>
                )}
              </div>

              {viewingHistory.length === 0 ? (
                <div className="text-center py-12">
                  <Eye className="w-16 h-16 text-gray-600 mx-auto mb-4" />
                  <h3 className="text-xl font-bold text-gray-400 mb-2">No viewing history yet</h3>
                  <p className="text-gray-500">Start watching movies to build your viewing history!</p>
                  <Button
                    onClick={() => navigate("/home")}
                    className="mt-4 bg-gradient-to-r from-yellow-400 to-orange-500 text-black hover:from-yellow-500 hover:to-orange-600"
                  >
                    Browse Movies
                  </Button>
                </div>
              ) : (
                <div className="space-y-4">
                  {viewingHistory.map((movie, index) => (
                    <motion.div
                      key={movie.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.05 }}
                      className="flex items-center space-x-4 p-4 bg-gray-800/50 rounded-lg hover:bg-gray-800/70 transition-colors group"
                    >
                      <div className="flex-shrink-0">
                        <img
                          src={movie.image || "/placeholder.svg"}
                          alt={movie.title}
                          className="w-20 h-28 object-cover rounded-lg"
                        />
                      </div>

                      <div className="flex-1 min-w-0">
                        <h3 className="text-white font-semibold text-lg mb-2">{movie.title}</h3>

                        <div className="flex items-center space-x-4 mb-3">
                          <div className="flex items-center space-x-2">
                            <Clock className="w-4 h-4 text-gray-400" />
                            <span className="text-sm text-gray-400">
                              {formatDuration(movie.watchedDuration)} / {formatDuration(movie.totalDuration)}
                            </span>
                          </div>
                          <div className="flex items-center space-x-2">
                            <Calendar className="w-4 h-4 text-gray-400" />
                            <span className="text-sm text-gray-400">
                              {new Date(movie.lastWatched).toLocaleDateString()}
                            </span>
                          </div>
                        </div>

                        {/* Progress Bar */}
                        <div className="mb-3">
                          <div className="flex justify-between items-center mb-1">
                            <span className="text-xs text-gray-400">Progress</span>
                            <span className="text-xs text-gray-400">
                              {Math.round(getWatchProgress(movie.watchedDuration, movie.totalDuration))}%
                            </span>
                          </div>
                          <div className="w-full bg-gray-700 rounded-full h-2">
                            <div
                              className={`h-2 rounded-full transition-all duration-300 ${
                                movie.completed
                                  ? "bg-gradient-to-r from-green-400 to-emerald-500"
                                  : "bg-gradient-to-r from-orange-400 to-yellow-500"
                              }`}
                              style={{ width: `${getWatchProgress(movie.watchedDuration, movie.totalDuration)}%` }}
                            />
                          </div>
                        </div>

                        <p className="text-sm text-gray-500">Last watched: {formatDate(movie.lastWatched)}</p>
                      </div>

                      <div className="flex flex-col space-y-2">
                        {movie.completed ? (
                          <div className="flex items-center space-x-2 text-green-400 text-sm">
                            <Trophy className="w-4 h-4" />
                            <span>Completed</span>
                          </div>
                        ) : (
                          <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                            <Button
                              onClick={() => handleContinueWatching(movie)}
                              className="bg-gradient-to-r from-orange-400 to-yellow-500 text-black hover:from-orange-500 hover:to-yellow-600 px-4 py-2 text-sm font-semibold rounded-lg"
                            >
                              <Play className="w-4 h-4 mr-2" />
                              Continue
                            </Button>
                          </motion.div>
                        )}

                        <div className="flex space-x-2">
                          <Button
                            onClick={() => navigate(`/info/${movie.movieId}`)}
                            variant="outline"
                            className="border-gray-600 text-black hover:bg-gray-700 px-3 py-1 text-xs rounded-lg"
                          >
                            Info
                          </Button>
                          <Button
                            onClick={() => handleRemoveFromHistory(movie.movieId)}
                            variant="outline"
                            className="border-red-600 text-red-400 hover:bg-red-600 px-3 py-1 text-xs rounded-lg transition-opacity"
                          >
                            <Trash2 className="w-3 h-3" />
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
              <h2 className="text-xl font-bold text-white mb-6">Redemption History</h2>

              {redemptionHistory.length === 0 ? (
                <div className="text-center py-12">
                  <Gift className="w-16 h-16 text-gray-600 mx-auto mb-4" />
                  <h3 className="text-xl font-bold text-gray-400 mb-2">No redemptions yet</h3>
                  <p className="text-gray-500">Earn more points to unlock amazing rewards!</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {redemptionHistory.map((redemption, index) => (
                    <motion.div
                      key={redemption.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.05 }}
                      className="flex items-center space-x-4 p-4 bg-gray-800/50 rounded-lg hover:bg-gray-800/70 transition-colors"
                    >
                      <div className="w-12 h-12 rounded-full bg-gradient-to-r from-red-400 to-pink-500 flex items-center justify-center flex-shrink-0">
                        <Gift className="w-6 h-6 text-white" />
                      </div>

                      <div className="flex-1 min-w-0">
                        <p className="text-white font-medium">{redemption.description}</p>
                        <p className="text-sm text-gray-500">{formatDate(redemption.date)}</p>
                      </div>

                      <div className="text-right">
                        <div className="text-lg font-bold text-red-400">{redemption.points}</div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}
            </div>
          )}
        </motion.div>
      </div>
    </div>
  )
}

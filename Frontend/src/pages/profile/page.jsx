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
import { PieChart } from 'react-minimal-pie-chart'

export default function ProfilePage() {
  const navigate = useNavigate()
  const [userStats, setUserStats] = useState(GamificationManager.getInstance().getUserStats())
  const [pointHistory, setPointHistory] = useState([])
  const [redemptionHistory, setRedemptionHistory] = useState([])
  const [viewingHistory, setViewingHistory] = useState([])
  const [activeTab, setActiveTab] = useState("activity")
  const [streakMode, setStreakMode] = useState("watchtime") // "watchtime" or "mood"

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

  // Generate streak heatmap data for the last year (fixed data)
  const generateStreakData = () => {
    const data = []
    const today = new Date()
    const startDate = new Date(today.getFullYear(), today.getMonth() - 11, 1) // Last 12 months
    
    // Fixed seed pattern for consistent data
    const seedPattern = [0, 1, 0, 2, 3, 1, 0, 4, 2, 0, 1, 3, 0, 2, 1, 4, 0, 3, 2, 1, 0, 2, 4, 1, 3, 0, 1, 2, 0, 3]
    let patternIndex = 0
    
    for (let d = new Date(startDate); d <= today; d.setDate(d.getDate() + 1)) {
      const dateStr = d.toISOString().split('T')[0]
      const dayIndex = Math.floor((d - startDate) / (1000 * 60 * 60 * 24))
      
      // Use fixed pattern with some variation based on day of week
      const baseLevel = seedPattern[dayIndex % seedPattern.length]
      const dayOfWeek = d.getDay()
      const isWeekend = dayOfWeek === 0 || dayOfWeek === 6
      
      // Weekend boost and weekday patterns
      let hoursWatched = 0
      if (baseLevel > 0) {
        hoursWatched = baseLevel + (isWeekend ? 1 : 0)
        if (hoursWatched > 4) hoursWatched = 4
      }
      
      data.push({
        date: dateStr,
        hours: hoursWatched,
        level: hoursWatched
      })
      patternIndex++
    }
    return data
  }

  // Generate mood-based streak data (fixed data)
  const generateMoodData = () => {
    const data = []
    const today = new Date()
    const startDate = new Date(today.getFullYear(), today.getMonth() - 11, 1)
    const moods = ['angry', 'happy', 'sad', 'fear', 'surprise', 'disgust']
    
    // Fixed mood patterns for consistency
    const moodPattern = [
      'happy', null, 'happy', 'sad', 'surprise', 'happy', null, 'angry', 'happy', null,
      'fear', 'happy', null, 'disgust', 'happy', 'surprise', null, 'sad', 'happy', 'angry',
      null, 'happy', 'fear', 'happy', 'surprise', null, 'happy', 'sad', null, 'happy'
    ]
    
    const intensityPattern = [2, 0, 3, 1, 2, 3, 0, 1, 2, 0, 1, 3, 0, 2, 3, 1, 0, 2, 3, 1, 0, 3, 1, 2, 3, 0, 2, 1, 0, 3]
    
    for (let d = new Date(startDate); d <= today; d.setDate(d.getDate() + 1)) {
      const dateStr = d.toISOString().split('T')[0]
      const dayIndex = Math.floor((d - startDate) / (1000 * 60 * 60 * 24))
      
      const mood = moodPattern[dayIndex % moodPattern.length]
      const intensity = mood ? intensityPattern[dayIndex % intensityPattern.length] : 0
      
      data.push({
        date: dateStr,
        mood: mood,
        intensity: intensity
      })
    }
    return data
  }

  const streakData = generateStreakData()
  const moodData = generateMoodData()

  const getHeatmapColor = (level) => {
    switch (level) {
      case 0: return 'bg-gray-800'
      case 1: return 'bg-green-900'
      case 2: return 'bg-green-700'
      case 3: return 'bg-green-500'
      case 4: return 'bg-green-400'
      default: return 'bg-gray-800'
    }
  }

  const getMoodColor = (mood, intensity) => {
    if (!mood || intensity === 0) return 'bg-gray-800'
    // Map mood and intensity to valid Tailwind color classes
    const colorMap = {
      angry:   ['bg-red-900', 'bg-red-700', 'bg-red-600', 'bg-red-500'],
      happy:   ['bg-yellow-900', 'bg-yellow-700', 'bg-yellow-500', 'bg-yellow-400'],
      sad:     ['bg-blue-900', 'bg-blue-700', 'bg-blue-500', 'bg-blue-400'],
      fear:    ['bg-purple-900', 'bg-purple-700', 'bg-purple-500', 'bg-purple-400'],
      surprise:['bg-orange-900', 'bg-orange-700', 'bg-orange-500', 'bg-orange-400'],
      disgust: ['bg-green-900', 'bg-green-700', 'bg-green-500', 'bg-green-400'],
    }
    // intensity: 1-3, use index 0-2, fallback to last for 3+
    const idx = Math.max(0, Math.min(3, intensity - 1))
    return colorMap[mood]?.[idx] || 'bg-gray-800'
  }

  const getMoodEmoji = (mood) => {
    const emojiMap = {
      angry: '😠',
      happy: '😊',
      sad: '😢',
      fear: '😨',
      surprise: '😲',
      disgust: '🤢'
    }
    return emojiMap[mood] || '😐'
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

  // Mood distribution data for pie chart
  const moodDistribution = [
    { mood: 'angry', color: '#dc2626', label: 'Angry' },
    { mood: 'happy', color: '#eab308', label: 'Happy' },
    { mood: 'sad', color: '#2563eb', label: 'Sad' },
    { mood: 'fear', color: '#a21caf', label: 'Fear' },
    { mood: 'surprise', color: '#ea580c', label: 'Surprise' },
    { mood: 'disgust', color: '#22c55e', label: 'Disgust' }
  ]
  const moodTotal = moodData.filter(d => d.mood).length
  const pieData = moodDistribution.map(({ mood, color, label }) => ({
    title: label,
    value: moodData.filter(d => d.mood === mood).length,
    color,
    mood,
  })).filter(d => d.value > 0)

  const [hoveredMoodIdx, setHoveredMoodIdx] = useState(undefined)

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white relative overflow-hidden">
      {/* Netflix-style Background with Movie Images */}
      <div className="absolute inset-0">
        {/* Blurred Movie Posters */}
        <div className="absolute top-20 left-20 w-72 h-40 opacity-8">
          <img 
            src="https://images.unsplash.com/photo-1485846234645-a62644f84728?w=400&h=600&fit=crop" 
            alt="" 
            className="w-full h-full object-cover rounded-xl blur-3xl"
          />
        </div>
        
        <div className="absolute top-1/3 right-20 w-80 h-48 opacity-6">
          <img 
            src="https://images.unsplash.com/photo-1478720568477-b0834d654936?w=400&h=600&fit=crop" 
            alt="" 
            className="w-full h-full object-cover rounded-xl blur-3xl"
          />
        </div>
        
        <div className="absolute bottom-1/4 left-1/4 w-96 h-56 opacity-10">
          <img 
            src="https://images.unsplash.com/photo-1489599314948-6a91eca13499?w=400&h=600&fit=crop" 
            alt="" 
            className="w-full h-full object-cover rounded-xl blur-3xl"
          />
        </div>

        {/* Dark overlay for readability */}
        <div className="absolute inset-0 bg-black/75" />
      </div>

      <div className="relative z-10 container mx-auto px-4 py-8 max-w-7xl">
        {/* Header */}
        <div className="flex items-center justify-between mb-12">
          <Link
            to="/home"
            className="flex items-center space-x-2 text-gray-300 hover:text-white transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
            <span className="text-sm font-medium">Back</span>
          </Link>
          
          <div>
            <h1 className="text-4xl md:text-5xl font-bold text-white mb-2">
              Your Profile
            </h1>
            <p className="text-gray-400 text-center">
              Track your progress and achievements
            </p>
          </div>

          <div className="flex items-center space-x-3 bg-black/50 backdrop-blur rounded-lg px-4 py-2">
            <Coins className="w-5 h-5 text-yellow-500" />
            <span className="text-yellow-500 font-semibold">{userStats.totalPoints.toLocaleString()}</span>
            <span className="text-gray-400 text-sm">points</span>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-12">
          {/* Total Points */}
          <div className="bg-gray-900/80 backdrop-blur rounded-lg p-6 border border-gray-800">
            <div className="flex items-center space-x-3 mb-3">
              <div className="p-2 bg-yellow-500 rounded-lg">
                <Coins className="w-5 h-5 text-black" />
              </div>
              <span className="text-gray-400 text-sm">Total Points</span>
            </div>
            <p className="text-2xl font-bold text-white">{userStats.totalPoints.toLocaleString()}</p>
          </div>

          {/* Current Streak */}
          <div className="bg-gray-900/80 backdrop-blur rounded-lg p-6 border border-gray-800">
            <div className="flex items-center space-x-3 mb-3">
              <div className="p-2 bg-orange-500 rounded-lg">
                <Flame className="w-5 h-5 text-white" />
              </div>
              <span className="text-gray-400 text-sm">Current Streak</span>
            </div>
            <p className="text-2xl font-bold text-white">{userStats.currentStreak}</p>
          </div>

          {/* Longest Streak */}
          <div className="bg-gray-900/80 backdrop-blur rounded-lg p-6 border border-gray-800">
            <div className="flex items-center space-x-3 mb-3">
              <div className="p-2 bg-green-500 rounded-lg">
                <TrendingUp className="w-5 h-5 text-white" />
              </div>
              <span className="text-gray-400 text-sm">Best Streak</span>
            </div>
            <p className="text-2xl font-bold text-white">{userStats.longestStreak}</p>
          </div>

          {/* Movies Watched */}
          <div className="bg-gray-900/80 backdrop-blur rounded-lg p-6 border border-gray-800">
            <div className="flex items-center space-x-3 mb-3">
              <div className="p-2 bg-blue-500 rounded-lg">
                <Eye className="w-5 h-5 text-white" />
              </div>
              <span className="text-gray-400 text-sm">Movies</span>
            </div>
            <p className="text-2xl font-bold text-white">{viewingHistory.length}</p>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex space-x-2 mb-8 overflow-x-auto">
          {[
            { id: "activity", label: "Activity", icon: Coins },
            { id: "streak", label: "Streak", icon: Flame },
            { id: "viewing", label: `Viewing (${viewingHistory.length})`, icon: Eye },
            { id: "redemptions", label: "Rewards", icon: Gift },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center space-x-2 px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-all ${
                activeTab === tab.id
                  ? "bg-white text-black"
                  : "bg-gray-800/60 text-gray-300 hover:bg-gray-700/60 hover:text-white"
              }`}
            >
              <tab.icon className="w-4 h-4" />
              <span>{tab.label}</span>
            </button>
          ))}
        </div>

        {/* Content */}
        <div className="bg-gray-900/50 backdrop-blur rounded-lg p-6 border border-gray-800">
          {activeTab === "activity" ? (
            <div>
              <h2 className="text-xl font-bold text-white mb-6 flex items-center space-x-2">
                <Coins className="w-5 h-5 text-yellow-500" />
                <span>Point Activity</span>
              </h2>

              {pointHistory.length === 0 ? (
                <div className="text-center py-12">
                  <Coins className="w-12 h-12 text-gray-600 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-gray-400 mb-2">No activity yet</h3>
                  <p className="text-gray-500 mb-4">Start watching movies to earn points!</p>
                  <Button
                    onClick={() => navigate("/home")}
                    className="bg-white text-black px-6 py-2 rounded font-semibold hover:bg-gray-200 transition-colors"
                  >
                    Start Earning
                  </Button>
                </div>
              ) : (
                <div className="space-y-3">
                  {pointHistory.map((activity, index) => (
                    <div
                      key={activity.id}
                      className="flex items-center space-x-4 p-4 bg-gray-800/40 rounded-lg hover:bg-gray-800/60 transition-colors"
                    >
                      <div className={`w-10 h-10 rounded-lg bg-gradient-to-r ${getActivityColor(activity.type)} flex items-center justify-center`}>
                        {getActivityIcon(activity.type)}
                      </div>

                      <div className="flex-1">
                        <p className="text-white font-medium">{activity.description}</p>
                        <p className="text-gray-400 text-sm">{formatDate(activity.date)}</p>
                      </div>

                      <div className="text-right">
                        <div className={`text-lg font-bold ${activity.points > 0 ? "text-green-400" : "text-red-400"}`}>
                          {activity.points > 0 ? "+" : ""}{activity.points}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ) : activeTab === "streak" ? (
            <div>
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-white flex items-center space-x-2">
                  <Flame className="w-5 h-5 text-orange-500" />
                  <span>Viewing Streak</span>
                </h2>
                
                {/* Toggle Button */}
                <div className="flex bg-gray-800/80 backdrop-blur rounded-xl p-1 border border-gray-700">
                  <button
                    onClick={() => setStreakMode("watchtime")}
                    className={`px-6 py-3 rounded-lg text-sm font-semibold transition-all duration-300 ${
                      streakMode === "watchtime"
                        ? "bg-white text-black shadow-lg"
                        : "text-gray-400 hover:text-white hover:bg-gray-700/50"
                    }`}
                  >
                    <div className="flex items-center space-x-2">
                      <Clock className="w-4 h-4" />
                      <span>Watch Time</span>
                    </div>
                  </button>
                  <button
                    onClick={() => setStreakMode("mood")}
                    className={`px-6 py-3 rounded-lg text-sm font-semibold transition-all duration-300 ${
                      streakMode === "mood"
                        ? "bg-white text-black shadow-lg"
                        : "text-gray-400 hover:text-white hover:bg-gray-700/50"
                    }`}
                  >
                    <div className="flex items-center space-x-2">
                      <Star className="w-4 h-4" />
                      <span>Mood Based</span>
                    </div>
                  </button>
                </div>
              </div>

              {streakMode === "watchtime" ? (
                <>
                  {/* Streak Stats */}
                  <div className="grid grid-cols-3 gap-4 mb-8">
                    <div className="text-center">
                      <div className="text-2xl font-bold text-white">{userStats.currentStreak}</div>
                      <div className="text-gray-400 text-sm">Current Streak</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-white">{userStats.longestStreak}</div>
                      <div className="text-gray-400 text-sm">Best Streak</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-white">{streakData.filter(d => d.hours > 0).length}</div>
                      <div className="text-gray-400 text-sm">Active Days</div>
                    </div>
                  </div>

                  {/* Watch Time Heatmap */}
                  <div className="mb-6">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="font-semibold text-white">Last 12 Months</h3>
                      <div className="flex items-center space-x-2 text-sm text-gray-400">
                        <span>Less</span>
                        <div className="flex space-x-1">
                          <div className="w-3 h-3 bg-gray-800 rounded-sm"></div>
                          <div className="w-3 h-3 bg-green-900 rounded-sm"></div>
                          <div className="w-3 h-3 bg-green-700 rounded-sm"></div>
                          <div className="w-3 h-3 bg-green-500 rounded-sm"></div>
                          <div className="w-3 h-3 bg-green-400 rounded-sm"></div>
                        </div>
                        <span>More</span>
                      </div>
                    </div>

                    <div className="overflow-x-auto">
                      <div className="inline-block min-w-full">
                        <div className="grid grid-cols-53 gap-1">
                          {streakData.map((day, index) => (
                            <div
                              key={index}
                              title={`${day.date}: ${day.hours} hours watched`}
                              className={`w-3 h-3 rounded-sm ${getHeatmapColor(day.level)} hover:opacity-80 transition-opacity cursor-pointer`}
                            />
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Monthly breakdown */}
                  <div>
                    <h3 className="font-semibold text-white mb-4">Monthly Breakdown</h3>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                      {Array.from({ length: 6 }, (_, i) => {
                        const month = new Date()
                        month.setMonth(month.getMonth() - i)
                        const monthName = month.toLocaleString('default', { month: 'long' })
                        const monthData = streakData.filter(d => d.date.startsWith(month.getFullYear() + '-' + String(month.getMonth() + 1).padStart(2, '0')))
                        const totalHours = monthData.reduce((sum, d) => sum + d.hours, 0)
                        
                        return (
                          <div key={i} className="bg-gray-800/40 rounded-lg p-4">
                            <div className="text-lg font-bold text-white">{totalHours}h</div>
                            <div className="text-gray-400 text-sm">{monthName}</div>
                          </div>
                        )
                      })}
                    </div>
                  </div>
                </>
              ) : (
                <>
                  {/* Mood Stats */}
                  <div className="grid grid-cols-3 gap-4 mb-8">
                    <div className="text-center">
                      <div className="text-2xl font-bold text-white">{moodData.filter(d => d.mood).length}</div>
                      <div className="text-gray-400 text-sm">Mood Entries</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl">
                        {getMoodEmoji(moodData.filter(d => d.mood).reduce((mostFrequent, current) => {
                          const currentCount = moodData.filter(d => d.mood === current.mood).length
                          const mostFrequentCount = moodData.filter(d => d.mood === mostFrequent.mood).length
                          return currentCount > mostFrequentCount ? current : mostFrequent
                        }, { mood: 'happy' }).mood)}
                      </div>
                      <div className="text-gray-400 text-sm">Most Common</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-white">
                        {Math.round((moodData.filter(d => d.mood === 'happy').length / moodData.filter(d => d.mood).length) * 100) || 0}%
                      </div>
                      <div className="text-gray-400 text-sm">Happy Days</div>
                    </div>
                  </div>

                  {/* Mood Heatmap */}
                  <div className="mb-6">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="font-semibold text-white">Mood Calendar</h3>
                      <div className="flex items-center space-x-4 text-xs text-gray-400">
                        <div className="flex items-center space-x-3">
                          <div className="flex items-center space-x-1">
                            <div className="w-3 h-3 bg-red-600 rounded-sm"></div>
                            <span>Angry</span>
                          </div>
                          <div className="flex items-center space-x-1">
                            <div className="w-3 h-3 bg-yellow-500 rounded-sm"></div>
                            <span>Happy</span>
                          </div>
                          <div className="flex items-center space-x-1">
                            <div className="w-3 h-3 bg-blue-500 rounded-sm"></div>
                            <span>Sad</span>
                          </div>
                          <div className="flex items-center space-x-1">
                            <div className="w-3 h-3 bg-purple-500 rounded-sm"></div>
                            <span>Fear</span>
                          </div>
                          <div className="flex items-center space-x-1">
                            <div className="w-3 h-3 bg-orange-500 rounded-sm"></div>
                            <span>Surprise</span>
                          </div>
                          <div className="flex items-center space-x-1">
                            <div className="w-3 h-3 bg-green-500 rounded-sm"></div>
                            <span>Disgust</span>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="overflow-x-auto">
                      <div className="inline-block min-w-full">
                        <div className="grid grid-cols-53 gap-1">
                          {moodData.map((day, index) => (
                            <div
                              key={index}
                              title={`${day.date}: ${day.mood ? `${getMoodEmoji(day.mood)} ${day.mood}` : 'No mood recorded'}`}
                              className={`w-3 h-3 rounded-sm ${getMoodColor(day.mood, day.intensity)} hover:opacity-80 transition-opacity cursor-pointer border border-gray-700`}
                            />
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Mood Distribution */}
                  <div>
                    <h3 className="font-semibold text-white mb-4">Mood Distribution</h3>
                    <div className="flex flex-col md:flex-row items-center gap-6">
                      <div className="w-48 h-48 flex-shrink-0">
                        <PieChart
                          data={pieData}
                          animate
                          lineWidth={40}
                          paddingAngle={2}
                          rounded
                          label={({ dataEntry }) =>
                            hoveredMoodIdx === undefined
                              ? ''
                              : dataEntry.title === pieData[hoveredMoodIdx]?.title
                                ? `${dataEntry.title} (${Math.round((dataEntry.value / moodTotal) * 100)}%)`
                                : ''
                          }
                          labelStyle={{
                            fontSize: '0.5em', // reduced from 1.1em
                            fontWeight: 'bold',
                            fill: '#fff',
                            wordBreak: 'break-word',
                            textAlign: 'center',
                          }}
                          segmentsStyle={(idx) => ({
                            cursor: 'pointer',
                            opacity: hoveredMoodIdx === undefined || hoveredMoodIdx === idx ? 1 : 0.5,
                            transition: 'opacity 0.2s',
                          })}
                          onMouseOver={(_, idx) => setHoveredMoodIdx(idx)}
                          onMouseOut={() => setHoveredMoodIdx(undefined)}
                        />
                      </div>
                      <div className="flex-1 grid grid-cols-2 md:grid-cols-3 gap-4">
                        {moodDistribution.map(({ mood, color, label }, idx) => {
                          const count = moodData.filter(d => d.mood === mood).length
                          const percentage = moodTotal > 0 ? Math.round((count / moodTotal) * 100) : 0
                          if (count === 0) return null
                          return (
                            <div
                              key={mood}
                              className={`bg-gray-800/40 rounded-lg p-4 text-center transition-all duration-200 ${
                                hoveredMoodIdx === idx ? 'ring-2 ring-white' : ''
                              }`}
                              onMouseEnter={() => setHoveredMoodIdx(pieData.findIndex(d => d.mood === mood))}
                              onMouseLeave={() => setHoveredMoodIdx(undefined)}
                            >
                              <div className="flex items-center justify-center mb-2">
                                <span className="text-2xl mr-2">{getMoodEmoji(mood)}</span>
                                <div className="w-5 h-5 rounded-full" style={{ background: color }}></div>
                              </div>
                              <div className="text-lg font-bold text-white">{count}</div>
                              <div className="text-gray-400 text-sm">{label} ({percentage}%)</div>
                            </div>
                          )
                        })}
                      </div>
                    </div>
                  </div>
                </>
              )}
            </div>
          ) : activeTab === "viewing" ? (
            <div>
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-white flex items-center space-x-2">
                  <Eye className="w-5 h-5 text-blue-500" />
                  <span>Viewing History</span>
                </h2>
                {viewingHistory.length > 0 && (
                  <Button
                    onClick={() => {
                      viewingHistoryManager.clearHistory()
                      setViewingHistory([])
                    }}
                    className="bg-red-600 hover:bg-red-700 text-white text-sm px-4 py-2 rounded"
                  >
                    <Trash2 className="w-4 h-4 mr-1" />
                    Clear
                  </Button>
                )}
              </div>

              {viewingHistory.length === 0 ? (
                <div className="text-center py-12">
                  <Eye className="w-12 h-12 text-gray-600 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-gray-400 mb-2">No viewing history</h3>
                  <p className="text-gray-500 mb-4">Start watching movies!</p>
                  <Button
                    onClick={() => navigate("/home")}
                    className="bg-white text-black px-6 py-2 rounded font-semibold hover:bg-gray-200 transition-colors"
                  >
                    Browse Movies
                  </Button>
                </div>
              ) : (
                <div className="space-y-4">
                  {viewingHistory.map((movie, index) => (
                    <div
                      key={movie.id}
                      className="flex items-center space-x-4 p-4 bg-gray-800/40 rounded-lg hover:bg-gray-800/60 transition-colors group"
                    >
                      <div className="flex-shrink-0">
                        <img
                          src={movie.image || "/placeholder.svg?height=120&width=80"}
                          alt={movie.title}
                          className="w-16 h-24 object-cover rounded"
                        />
                      </div>

                      <div className="flex-1">
                        <h3 className="text-white font-semibold mb-2">{movie.title}</h3>
                        
                        <div className="flex items-center space-x-4 mb-2 text-sm text-gray-400">
                          <span>{formatDuration(movie.watchedDuration)} / {formatDuration(movie.totalDuration)}</span>
                          <span>{new Date(movie.lastWatched).toLocaleDateString()}</span>
                        </div>

                        <div className="w-full bg-gray-700 rounded-full h-2">
                          <div
                            className={`h-2 rounded-full transition-all ${
                              movie.completed
                                ? "bg-green-500"
                                : "bg-yellow-500"
                            }`}
                            style={{ width: `${getWatchProgress(movie.watchedDuration, movie.totalDuration)}%` }}
                          />
                        </div>
                      </div>

                      <div className="flex space-x-2">
                        {movie.completed ? (
                          <div className="flex items-center text-green-400 text-sm">
                            <Trophy className="w-4 h-4 mr-1" />
                            Complete
                          </div>
                        ) : (
                          <Button
                            onClick={() => handleContinueWatching(movie)}
                            className="bg-white text-black text-sm px-4 py-2 rounded hover:bg-gray-200 transition-colors"
                          >
                            <Play className="w-4 h-4 mr-1" />
                            Continue
                          </Button>
                        )}
                        
                        <Button
                          onClick={() => handleRemoveFromHistory(movie.movieId)}
                          className="border border-gray-600 text-gray-400 hover:bg-gray-700 text-sm px-3 py-2 rounded"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ) : (
            <div>
              <h2 className="text-xl font-bold text-white mb-6 flex items-center space-x-2">
                <Gift className="w-5 h-5 text-red-500" />
                <span>Redemption History</span>
              </h2>

              {redemptionHistory.length === 0 ? (
                <div className="text-center py-12">
                  <Gift className="w-12 h-12 text-gray-600 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-gray-400 mb-2">No redemptions yet</h3>
                  <p className="text-gray-500 mb-4">Earn points to unlock rewards!</p>
                  <Button
                    onClick={() => navigate("/redeem")}
                    className="bg-white text-black px-6 py-2 rounded font-semibold hover:bg-gray-200 transition-colors"
                  >
                    View Rewards
                  </Button>
                </div>
              ) : (
                <div className="space-y-3">
                  {redemptionHistory.map((redemption, index) => (
                    <div
                      key={redemption.id}
                      className="flex items-center space-x-4 p-4 bg-gray-800/40 rounded-lg"
                    >
                      <div className="w-10 h-10 rounded-lg bg-red-500 flex items-center justify-center">
                        <Gift className="w-5 h-5 text-white" />
                      </div>

                      <div className="flex-1">
                        <p className="text-white font-medium">{redemption.description}</p>
                        <p className="text-gray-400 text-sm">{formatDate(redemption.date)}</p>
                      </div>

                      <div className="text-right">
                        <div className="text-lg font-bold text-red-400">{redemption.points}</div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

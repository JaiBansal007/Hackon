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
import ReactDOM from "react-dom"

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

    // Listen for localStorage changes (cross-tab sync)
    const handleStorage = (e) => {
      if (e.key === "firestream_viewing_history") {
        setViewingHistory(viewingHistoryManager.getViewingHistory())
      }
    }
    window.addEventListener("storage", handleStorage)
    return () => window.removeEventListener("storage", handleStorage)
  }, [])

  // Always reload viewing history when tab changes (not just for "viewing" tab)
  useEffect(() => {
    setViewingHistory(viewingHistoryManager.getViewingHistory())
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

  // --- Compute streak and mood data from real viewing history ---
  // Helper: get local date string (YYYY-MM-DD) from a Date or ISO string
  const getLocalDateString = (dateInput) => {
    const d = typeof dateInput === "string" ? new Date(dateInput) : dateInput
    const year = d.getFullYear()
    const month = String(d.getMonth() + 1).padStart(2, "0")
    const day = String(d.getDate()).padStart(2, "0")
    return `${year}-${month}-${day}`
  }

  // Helper: group viewing history by local date (YYYY-MM-DD)
  const getWatchTimeByDate = (history) => {
    const map = {}
    history.forEach(item => {
      const dateStr = getLocalDateString(item.lastWatched)
      if (!map[dateStr]) map[dateStr] = 0
      map[dateStr] += (item.watchedDuration || 0) / 3600 // convert to hours
    })
    return map
  }

  // Helper: group moods by local date if available (assume mood info in viewingHistory)
  const getMoodByDate = (history) => {
    const map = {}
    history.forEach(item => {
      if (item.mood) {
        const dateStr = getLocalDateString(item.lastWatched)
        map[dateStr] = { mood: item.mood, intensity: item.moodIntensity || 1 }
      }
    })
    return map
  }

  // --- Calculate streaks from real data ---
  const calculateStreaks = (history) => {
    const watchTimeMap = getWatchTimeByDate(history)
    const dates = Object.keys(watchTimeMap).filter(date => watchTimeMap[date] > 0).sort()
    if (dates.length === 0) return { currentStreak: 0, longestStreak: 0 }

    // Convert to Date objects and sort ascending
    const dateObjs = dates.map(d => new Date(d + "T00:00:00"))
    dateObjs.sort((a, b) => a - b)
    let longest = 1
    let current = 1
    let max = 1

    for (let i = 1; i < dateObjs.length; i++) {
      const diff = (dateObjs[i] - dateObjs[i - 1]) / (1000 * 60 * 60 * 24)
      if (diff === 1) {
        current += 1
        if (current > max) max = current
      } else {
        current = 1
      }
    }

    // Calculate current streak up to today (local)
    let today = new Date()
    today.setHours(0,0,0,0)
    let streak = 0
    for (let i = dateObjs.length - 1; i >= 0; i--) {
      const diff = (today - dateObjs[i]) / (1000 * 60 * 60 * 24)
      if (diff === 0 || diff === streak) {
        streak += 1
      } else {
        break
      }
    }

    return { currentStreak: streak, longestStreak: max }
  }

  // Generate streak heatmap data for the last year from real data
  const generateStreakData = () => {
    const data = []
    const today = new Date()
    const startDate = new Date(today.getFullYear(), today.getMonth() - 11, 1) // Last 12 months
    const watchTimeMap = getWatchTimeByDate(viewingHistory)
    for (let d = new Date(startDate); d <= today; d.setDate(d.getDate() + 1)) {
      const dateStr = getLocalDateString(d)
      const hoursWatched = watchTimeMap[dateStr] || 0
      let level = 0
      if (hoursWatched >= 3) level = 4
      else if (hoursWatched >= 2) level = 3
      else if (hoursWatched >= 1) level = 2
      else if (hoursWatched > 0) level = 1
      data.push({
        date: dateStr,
        hours: Math.round(hoursWatched * 10) / 10,
        level
      })
    }
    return data
  }

  // Generate mood-based streak data from real data (if available)
  const generateMoodData = () => {
    const data = []
    const today = new Date()
    const startDate = new Date(today.getFullYear(), today.getMonth() - 11, 1)
    const moodMap = getMoodByDate(viewingHistory)
    for (let d = new Date(startDate); d <= today; d.setDate(d.getDate() + 1)) {
      const dateStr = getLocalDateString(d)
      const moodObj = moodMap[dateStr]
      data.push({
        date: dateStr,
        mood: moodObj?.mood || null,
        intensity: moodObj?.intensity || 0
      })
    }
    return data
  }

  const streakData = generateStreakData()
  const moodData = generateMoodData()
  const { currentStreak, longestStreak } = calculateStreaks(viewingHistory)

  const getHeatmapColor = (level) => {
    switch (level) {
      case 0: return 'bg-gray-800'
      case 1: return 'bg-blue-900'
      case 2: return 'bg-blue-700'
      case 3: return 'bg-blue-500'
      case 4: return 'bg-blue-400'
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
        return <Flame className="w-5 h-5 text-cyan-400" />
      case "quiz":
        return <Trophy className="w-5 h-5 text-blue-400" />
      case "streak_bonus":
        return <TrendingUp className="w-5 h-5 text-teal-400" />
      case "redemption":
        return <Gift className="w-5 h-5 text-red-400" />
      default:
        return <Coins className="w-5 h-5 text-blue-400" />
    }
  }

  const getActivityColor = (type) => {
    switch (type) {
      case "daily_watch":
        return "from-cyan-400 to-blue-500"
      case "quiz":
        return "from-blue-400 to-cyan-500"
      case "streak_bonus":
        return "from-teal-400 to-cyan-500"
      case "redemption":
        return "from-red-400 to-pink-500"
      default:
        return "from-blue-400 to-cyan-500"
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

  // Add state for selected cell in heatmaps
  const [selectedStreakCell, setSelectedStreakCell] = useState(null)
  const [selectedMoodCell, setSelectedMoodCell] = useState(null)

  // Add state for tooltip info box (for heatmap cells)
  const [tooltip, setTooltip] = useState(null)
  // tooltip: { x, y, content: JSX }

  // Helper to close info box on outside click
  useEffect(() => {
    const handleClick = () => {
      setSelectedStreakCell(null)
      setSelectedMoodCell(null)
      setTooltip(null)
    }
    window.addEventListener('click', handleClick)
    return () => window.removeEventListener('click', handleClick)
  }, [])

  // Prevent closing when clicking inside info box
  const stopPropagation = (e) => e.stopPropagation()

  // Helper: group streak/mood data by week for vertical heatmap (column-major, oldest left, newest right, pad left)
  const groupDataByWeek = (data) => {
    // data: [{date, ...}]
    // Pad start so last day is at bottom-right (Saturday)
    const days = [...data]
    if (days.length === 0) return []
    const firstDate = new Date(days[0].date)
    const lastDate = new Date(days[days.length - 1].date)
    const lastDayOfWeek = lastDate.getDay() // 0 (Sun) - 6 (Sat)
    // Pad at start so first column starts with Sunday
    const padStart = firstDate.getDay()
    for (let i = 0; i < padStart; i++) {
      days.unshift(null)
    }
    // Pad at end so last column ends with Saturday
    const padEnd = 6 - lastDayOfWeek
    for (let i = 0; i < padEnd; i++) {
      days.push(null)
    }
    // Group into columns (weeks)
    const weeks = []
    for (let i = 0; i < days.length; i += 7) {
      weeks.push(days.slice(i, i + 7))
    }
    return weeks
  }

  const streakWeeks = groupDataByWeek(streakData)
  const moodWeeks = groupDataByWeek(moodData)

  // Helper to show tooltip above cell
  const showTooltip = (event, content) => {
    // Get bounding rect of the cell
    const rect = event.target.getBoundingClientRect()
    // Position tooltip above the cell, horizontally centered
    setTooltip({
      x: rect.left + rect.width / 2,
      y: rect.top - 8, // 8px above the cell
      content,
    })
  }

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
            <Coins className="w-5 h-5 text-blue-400" />
            <span className="text-blue-400 font-semibold">{userStats.totalPoints.toLocaleString()}</span>
            <span className="text-gray-400 text-sm">points</span>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-12">
          {/* Total Points */}
          <div className="bg-gray-900/80 backdrop-blur rounded-lg p-6 border border-gray-800">
            <div className="flex items-center space-x-3 mb-3">
              <div className="p-2 bg-blue-500 rounded-lg">
                <Coins className="w-5 h-5 text-white" />
              </div>
              <span className="text-gray-400 text-sm">Total Points</span>
            </div>
            <p className="text-2xl font-bold text-white">{userStats.totalPoints.toLocaleString()}</p>
          </div>

          {/* Current Streak */}
          <div className="bg-gray-900/80 backdrop-blur rounded-lg p-6 border border-gray-800">
            <div className="flex items-center space-x-3 mb-3">
              <div className="p-2 bg-cyan-500 rounded-lg">
                <Flame className="w-5 h-5 text-white" />
              </div>
              <span className="text-gray-400 text-sm">Current Streak</span>
            </div>
            <p className="text-2xl font-bold text-white">{currentStreak}</p>
          </div>

          {/* Longest Streak */}
          <div className="bg-gray-900/80 backdrop-blur rounded-lg p-6 border border-gray-800">
            <div className="flex items-center space-x-3 mb-3">
              <div className="p-2 bg-teal-500 rounded-lg">
                <TrendingUp className="w-5 h-5 text-white" />
              </div>
              <span className="text-gray-400 text-sm">Best Streak</span>
            </div>
            <p className="text-2xl font-bold text-white">{longestStreak}</p>
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
                  ? "bg-gradient-to-r from-blue-500 to-cyan-500 text-white"
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
                <Coins className="w-5 h-5 text-blue-400" />
                <span>Point Activity</span>
              </h2>

              {pointHistory.length === 0 ? (
                <div className="text-center py-12">
                  <Coins className="w-12 h-12 text-gray-600 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-gray-400 mb-2">No activity yet</h3>
                  <p className="text-gray-500 mb-4">Start watching movies to earn points!</p>
                  <Button
                    onClick={() => navigate("/home")}
                    className="bg-gradient-to-r from-blue-500 to-cyan-500 text-white px-6 py-2 rounded font-semibold hover:from-blue-600 hover:to-cyan-600 transition-all"
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
                  <Flame className="w-5 h-5 text-cyan-500" />
                  <span>Viewing Streak</span>
                </h2>
                
                {/* Toggle Button */}
                <div className="flex bg-gray-800/80 backdrop-blur rounded-xl p-1 border border-gray-700">
                  <button
                    onClick={() => setStreakMode("watchtime")}
                    className={`px-6 py-3 rounded-lg text-sm font-semibold transition-all duration-300 ${
                      streakMode === "watchtime"
                        ? "bg-gradient-to-r from-blue-500 to-cyan-500 text-white shadow-lg"
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
                        ? "bg-gradient-to-r from-blue-500 to-cyan-500 text-white shadow-lg"
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
                      <div className="text-2xl font-bold text-white">{currentStreak}</div>
                      <div className="text-gray-400 text-sm">Current Streak</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-white">{longestStreak}</div>
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
                          <div className="w-3 h-3 bg-blue-900 rounded-sm"></div>
                          <div className="w-3 h-3 bg-blue-700 rounded-sm"></div>
                          <div className="w-3 h-3 bg-blue-500 rounded-sm"></div>
                          <div className="w-3 h-3 bg-blue-400 rounded-sm"></div>
                        </div>
                        <span>More</span>
                      </div>
                    </div>

                    <div className="overflow-x-auto">
                      <div className="inline-block">
                        <div className="flex">
                          {/* Heatmap grid: rows = days, columns = weeks */}
                          <div className="flex flex-col">
                            {['S','M','T','W','T','F','S'].map((d, rowIdx) => (
                              <div key={rowIdx} className="flex items-center">
                                {/* Row label */}
                                <div className="w-4 h-4 text-xs text-gray-500 flex items-center justify-center mr-1">{d}</div>
                                {/* Heatmap cells for this row (day of week) */}
                                {streakWeeks.map((week, colIdx) => (
                                  <div
                                    key={colIdx}
                                    title={week[rowIdx] ? `${week[rowIdx].date}: ${week[rowIdx].hours} hours watched` : ''}
                                    className={`w-4 h-4 rounded-sm m-0.5 ${week[rowIdx] ? getHeatmapColor(week[rowIdx].level) : 'bg-gray-900'} hover:opacity-80 transition-opacity cursor-pointer`}
                                    onClick={e => {
                                      e.stopPropagation()
                                      setSelectedStreakCell(
                                        week[rowIdx]
                                          ? { ...week[rowIdx], x: colIdx, y: rowIdx }
                                          : null
                                      )
                                      setSelectedMoodCell(null)
                                      if (week[rowIdx]) {
                                        showTooltip(e, (
                                          <div className="font-semibold">{week[rowIdx].date}</div>
                                        ))
                                        showTooltip(e, (
                                          <div>
                                            <div className="font-semibold">{week[rowIdx].date}</div>
                                            <div>
                                              {week[rowIdx].hours > 0
                                                ? `${week[rowIdx].hours} hour${week[rowIdx].hours > 1 ? 's' : ''} watched`
                                                : 'No watch activity'}
                                            </div>
                                          </div>
                                        ))
                                      } else {
                                        setTooltip(null)
                                      }
                                    }}
                                    style={{ position: 'relative', zIndex: 1 }}
                                  >
                                    {/* No inline info box here */}
                                  </div>
                                ))}
                              </div>
                            ))}
                          </div>
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
                          <div className="text-lg font-bold text-white">{totalHours.toFixed(1)}h</div>
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
                      <div className="inline-block">
                        <div className="flex">
                          {/* Heatmap grid: rows = days, columns = weeks */}
                          <div className="flex flex-col">
                            {['S','M','T','W','T','F','S'].map((d, rowIdx) => (
                              <div key={rowIdx} className="flex items-center">
                                {/* Row label */}
                                <div className="w-4 h-4 text-xs text-gray-500 flex items-center justify-center mr-1">{d}</div>
                                {/* Heatmap cells for this row (day of week) */}
                                {moodWeeks.map((week, colIdx) => (
                                  <div
                                    key={colIdx}
                                    title={week[rowIdx] ? `${week[rowIdx].date}: ${week[rowIdx].mood ? `${getMoodEmoji(week[rowIdx].mood)} ${week[rowIdx].mood}` : 'No mood recorded'}` : ''}
                                    className={`w-4 h-4 rounded-sm m-0.5 ${week[rowIdx] ? getMoodColor(week[rowIdx].mood, week[rowIdx].intensity) : 'bg-gray-900'} hover:opacity-80 transition-opacity cursor-pointer`}
                                    onClick={e => {
                                      e.stopPropagation()
                                      setSelectedMoodCell(
                                        week[rowIdx]
                                          ? { ...week[rowIdx], x: colIdx, y: rowIdx }
                                          : null
                                      )
                                      setSelectedStreakCell(null)
                                      if (week[rowIdx]) {
                                        showTooltip(e, (
                                          <div>
                                            <div className="font-semibold">{week[rowIdx].date}</div>
                                            <div>
                                              {week[rowIdx].mood
                                                ? <>
                                                    <span className="mr-1">{getMoodEmoji(week[rowIdx].mood)}</span>
                                                    <span className="capitalize">{week[rowIdx].mood}</span>
                                                    <span> (Intensity: {week[rowIdx].intensity})</span>
                                                  </>
                                                : 'No mood recorded'}
                                            </div>
                                          </div>
                                        ))
                                      } else {
                                        setTooltip(null)
                                      }
                                    }}
                                    style={{ position: 'relative', zIndex: 1 }}
                                  >
                                    {/* No inline info box here */}
                                  </div>
                                ))}
                              </div>
                            ))}
                          </div>
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
                  <Eye className="w-5 h-5 text-cyan-500" />
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
                    className="bg-gradient-to-r from-blue-500 to-cyan-500 text-white px-6 py-2 rounded font-semibold hover:from-blue-600 hover:to-cyan-600 transition-all"
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
                                ? "bg-cyan-500"
                                : "bg-blue-500"
                            }`}
                            style={{ width: `${getWatchProgress(movie.watchedDuration, movie.totalDuration)}%` }}
                          />
                        </div>
                      </div>

                      <div className="flex space-x-2">
                        {movie.completed ? (
                          <div className="flex items-center text-cyan-400 text-sm">
                            <Trophy className="w-4 h-4 mr-1" />
                            Complete
                          </div>
                        ) : (
                          <Button
                            onClick={() => handleContinueWatching(movie)}
                            className="bg-gradient-to-r from-blue-500 to-cyan-500 text-white text-sm px-4 py-2 rounded hover:from-blue-600 hover:to-cyan-600 transition-all"
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
                <Gift className="w-5 h-5 text-blue-500" />
                <span>Redemption History</span>
              </h2>

              {redemptionHistory.length === 0 ? (
                <div className="text-center py-12">
                  <Gift className="w-12 h-12 text-gray-600 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-gray-400 mb-2">No redemptions yet</h3>
                  <p className="text-gray-500 mb-4">Earn points to unlock rewards!</p>
                  <Button
                    onClick={() => navigate("/redeem")}
                    className="bg-gradient-to-r from-blue-500 to-cyan-500 text-white px-6 py-2 rounded font-semibold hover:from-blue-600 hover:to-cyan-600 transition-all"
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
                      <div className="w-10 h-10 rounded-lg bg-blue-500 flex items-center justify-center">
                        <Gift className="w-5 h-5 text-white" />
                      </div>

                      <div className="flex-1">
                        <p className="text-white font-medium">{redemption.description}</p>
                        <p className="text-gray-400 text-sm">{formatDate(redemption.date)}</p>
                      </div>

                      <div className="text-right">
                        <div className="text-lg font-bold text-blue-400">{redemption.points}</div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
      {/* Tooltip Portal */}
      {tooltip &&
        ReactDOM.createPortal(
          <div
            className="z-[9999] fixed pointer-events-none"
            style={{
              left: tooltip.x,
              top: tooltip.y, // <-- FIXED: remove - 40
              transform: "translate(-50%, -100%)",
              minWidth: 120,
              background: "#18181b",
              color: "#fff",
              borderRadius: 8,
              boxShadow: "0 4px 16px rgba(0,0,0,0.4)",
              padding: "10px 14px",
              border: "1px solid #27272a",
              fontSize: 13,
              pointerEvents: "auto",
            }}
            onClick={stopPropagation}
          >
            {tooltip.content}
          </div>,
          document.body
        )
      }
    </div>
  )
}
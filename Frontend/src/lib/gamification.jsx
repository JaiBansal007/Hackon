export class GamificationManager {
  static instance

  constructor() {
    if (GamificationManager.instance) {
      return GamificationManager.instance
    }
    this.loadUserData()
    GamificationManager.instance = this
  }

  static getInstance() {
    if (!GamificationManager.instance) {
      GamificationManager.instance = new GamificationManager()
    }
    return GamificationManager.instance
  }

  loadUserData() {
    const savedStats = localStorage.getItem("firestream_user_stats")
    const savedHistory = localStorage.getItem("firestream_point_history")
    const savedRedemptions = localStorage.getItem("firestream_redemption_history")

    this.userStats = savedStats
      ? JSON.parse(savedStats)
      : {
          totalPoints: 0,
          currentStreak: 0,
          longestStreak: 0,
          dailyWatchTime: 0,
          lastWatchDate: "",
          lastQuizDate: "",
          quizAttemptedToday: false,
          dailyTaskCompleted: false,
        }

    this.pointHistory = savedHistory ? JSON.parse(savedHistory) : []
    this.redemptionHistory = savedRedemptions ? JSON.parse(savedRedemptions) : []
    this.checkNewDay()
  }

  saveUserData() {
    localStorage.setItem("firestream_user_stats", JSON.stringify(this.userStats))
    localStorage.setItem("firestream_point_history", JSON.stringify(this.pointHistory))
    localStorage.setItem("firestream_redemption_history", JSON.stringify(this.redemptionHistory))
  }

  checkNewDay() {
    const today = new Date().toDateString()
    const lastDate = new Date(this.userStats.lastWatchDate || "").toDateString()

    if (today !== lastDate) {
      this.userStats.dailyWatchTime = 0
      this.userStats.quizAttemptedToday = false
      this.userStats.dailyTaskCompleted = false

      const yesterday = new Date()
      yesterday.setDate(yesterday.getDate() - 1)

      if (lastDate !== yesterday.toDateString() && this.userStats.lastWatchDate) {
        this.userStats.currentStreak = 0
      }
    }
  }

  updateWatchTime(minutes) {
    this.userStats.dailyWatchTime += minutes
    if (this.userStats.dailyWatchTime >= 15 && !this.userStats.dailyTaskCompleted) {
      this.completeDailyTask()
    }
    this.saveUserData()
  }

  completeDailyTask() {
    const today = new Date().toDateString()
    const lastDate = new Date(this.userStats.lastWatchDate || "").toDateString()

    if (today !== lastDate) {
      this.userStats.totalPoints += 1
      this.userStats.dailyTaskCompleted = true
      this.userStats.lastWatchDate = new Date().toISOString()

      const yesterday = new Date()
      yesterday.setDate(yesterday.getDate() - 1)

      if (lastDate === yesterday.toDateString() || !this.userStats.lastWatchDate) {
        this.userStats.currentStreak += 1
        if (this.userStats.currentStreak > this.userStats.longestStreak) {
          this.userStats.longestStreak = this.userStats.currentStreak
        }
      } else {
        this.userStats.currentStreak = 1
      }

      if (this.userStats.currentStreak === 50) {
        this.userStats.totalPoints += 20
        this.addPointActivity("streak_bonus", 20, "50-day streak bonus achieved!")
      }

      this.addPointActivity("daily_watch", 1, "Completed daily 15-minute watch mission")
    }
  }

  submitQuiz(movieTitle, correctAnswers) {
    const today = new Date().toDateString()
    const lastQuizDate = new Date(this.userStats.lastQuizDate || "").toDateString()

    if (today === lastQuizDate) {
      return false
    }

    this.userStats.quizAttemptedToday = true
    this.userStats.lastQuizDate = new Date().toISOString()
    this.userStats.totalPoints += correctAnswers

    this.addPointActivity("quiz", correctAnswers, `Quiz completed for "${movieTitle}" - ${correctAnswers}/5 correct`)
    this.saveUserData()
    return true
  }

  redeemOffer(offer) {
    if (this.userStats.totalPoints < offer.points) {
      return false
    }

    this.userStats.totalPoints -= offer.points
    this.addPointActivity("redemption", -offer.points, `Redeemed: ${offer.title}`)
    this.redemptionHistory.push({
      id: Date.now().toString(),
      type: "redemption",
      points: -offer.points,
      description: offer.title,
      date: new Date().toISOString(),
    })

    this.saveUserData()
    return true
  }

  addPointActivity(type, points, description, movieTitle) {
    const activity = {
      id: Date.now().toString(),
      type,
      points,
      description,
      date: new Date().toISOString(),
      movieTitle,
    }

    this.pointHistory.unshift(activity)
    if (this.pointHistory.length > 100) {
      this.pointHistory = this.pointHistory.slice(0, 100)
    }
  }

  getUserStats() {
    return { ...this.userStats }
  }

  getPointHistory() {
    return [...this.pointHistory]
  }

  getRedemptionHistory() {
    return [...this.redemptionHistory]
  }

  canAttemptQuiz() {
    const today = new Date().toDateString()
    const lastQuizDate = new Date(this.userStats.lastQuizDate || "").toDateString()
    return today !== lastQuizDate
  }

  isDailyTaskCompleted() {
    const today = new Date().toDateString()
    const lastDate = new Date(this.userStats.lastWatchDate || "").toDateString()
    return today === lastDate && this.userStats.dailyTaskCompleted
  }
}

export const movieQuizzes = {
  "the-dark-knight": {
    movieId: "the-dark-knight",
    movieTitle: "The Dark Knight",
    questions: [
      {
        id: "1",
        question: "Who plays the Joker in The Dark Knight?",
        options: ["Heath Ledger","Jack Nicholson", "Joaquin Phoenix", "Mark Hamill"],
        correctAnswer: 0,
        explanation: "Heath Ledger gave an iconic performance as the Joker, winning a posthumous Academy Award.",
      },
      {
        id: "2",
        question: "What is Harvey Dent's nickname?",
        options: ["White Knight","Two-Face", "The Judge", "Gotham's Hope"],
        correctAnswer: 0,
        explanation: 'Harvey Dent was known as the "White Knight" of Gotham before his transformation.',
      },
    ],
  },
  inception: {
    movieId: "inception",
    movieTitle: "Inception",
    questions: [
      {
        id: "1",
        question: "What is Dom Cobb's profession?",
        options: ["Extractor","Architect", "Forger", "Point Man"],
        correctAnswer: 0,
        explanation: "Dom Cobb is an extractor who specializes in stealing secrets from people's dreams.",
      },
      {
        id: "2",
        question: "What is the name of Cobb's spinning top?",
        options: ["Totem", "Anchor", "Reality Check", "Dream Spinner"],
        correctAnswer: 0,
        explanation: "The spinning top is Cobb's totem, used to distinguish dreams from reality.",
      },
    ],
  },
}

export const redemptionOffers = [
  {
    id: "1",
    title: "3-Day Amazon Prime Premium",
    description: "Get 3 days of Amazon Prime with access to exclusive content",
    points: 1,
    category: "prime",
    image: "https://i0.wp.com/telechargi.com/wp-content/uploads/2023/12/amazon-prime-video-poster.png?fit=512%2C512&ssl=1",
    available: true,
  },
  {
    id: "2",
    title: "7-Day Amazon Prime Premium",
    description: "Enjoy a full week of Amazon Prime benefits including Prime Video",
    points: 1000,
    category: "prime",
    image: "https://m.media-amazon.com/images/G/01/primevideo/seo/primevideo-seo-logo.png",
    available: true,
  },
  {
    id: "3",
    title: "Fire TV Stick 4K - 20% Off",
    description: "Get 20% discount on Fire TV Stick 4K with Alexa Voice Remote",
    points: 1500,
    category: "products",
    image: "https://images.unsplash.com/photo-1593359677879-a4bb92f829d1?w=300&h=200&fit=crop&auto=format",
    available: true,
  },
  {
    id: "5",
    title: "Amazon Music Unlimited - 1 Month",
    description: "One month free access to Amazon Music Unlimited",
    points: 600,
    category: "services",
    image: "https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=300&h=200&fit=crop&auto=format",
    available: true,
  },
  {
    id: "6",
    title: "Kindle Unlimited - 2 Weeks",
    description: "Two weeks of unlimited access to Kindle books",
    points: 400,
    category: "services",
    image: "https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=300&h=200&fit=crop&auto=format",
    available: true,
  },
]
export class ViewingHistoryManager {
  static instance

  constructor() {
    if (ViewingHistoryManager.instance) {
      return ViewingHistoryManager.instance
    }
    this.loadViewingHistory()
    ViewingHistoryManager.instance = this
  }

  static getInstance() {
    if (!ViewingHistoryManager.instance) {
      ViewingHistoryManager.instance = new ViewingHistoryManager()
    }
    return ViewingHistoryManager.instance
  }

  loadViewingHistory() {
    const savedHistory = localStorage.getItem("firestream_viewing_history")
    this.viewingHistory = savedHistory ? JSON.parse(savedHistory) : []
  }

  saveViewingHistory() {
    localStorage.setItem("firestream_viewing_history", JSON.stringify(this.viewingHistory))
  }

  updateMovieProgress(movieData) {
    const { movieId, title, image, watchedDuration, totalDuration, videoUrl } = movieData

    // Find existing entry or create new one
    const existingIndex = this.viewingHistory.findIndex((item) => item.movieId === movieId)

    const progressData = {
      id: movieId,
      movieId,
      title,
      image,
      watchedDuration: Math.floor(watchedDuration),
      totalDuration: Math.floor(totalDuration),
      lastWatched: new Date().toISOString(),
      completed: watchedDuration >= totalDuration * 0.95, // 95% watched = completed
      videoUrl,
    }

    if (existingIndex >= 0) {
      // Update existing entry
      this.viewingHistory[existingIndex] = {
        ...this.viewingHistory[existingIndex],
        ...progressData,
      }
    } else {
      // Add new entry at the beginning
      this.viewingHistory.unshift(progressData)
    }

    // Keep only last 50 items
    if (this.viewingHistory.length > 50) {
      this.viewingHistory = this.viewingHistory.slice(0, 50)
    }

    this.saveViewingHistory()
  }

  getViewingHistory() {
    return [...this.viewingHistory]
  }

  getMovieProgress(movieId) {
    const movie = this.viewingHistory.find((item) => item.movieId === movieId)
    return movie ? movie.watchedDuration : 0
  }

  removeFromHistory(movieId) {
    this.viewingHistory = this.viewingHistory.filter((item) => item.movieId !== movieId)
    this.saveViewingHistory()
  }

  clearHistory() {
    this.viewingHistory = []
    this.saveViewingHistory()
  }

  // Get resume time for a specific movie
  getResumeTime(movieId) {
    const movie = this.viewingHistory.find((item) => item.movieId === movieId)
    return movie && !movie.completed ? movie.watchedDuration : 0
  }

  // Mark movie as completed
  markAsCompleted(movieId) {
    const existingIndex = this.viewingHistory.findIndex((item) => item.movieId === movieId)
    if (existingIndex >= 0) {
      this.viewingHistory[existingIndex].completed = true
      this.viewingHistory[existingIndex].watchedDuration = this.viewingHistory[existingIndex].totalDuration
      this.saveViewingHistory()
    }
  }
}

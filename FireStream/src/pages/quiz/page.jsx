"use client"

import { useState, useEffect } from "react"
import { Link,useParams, useNavigate } from "react-router-dom"
import { motion, AnimatePresence } from "framer-motion"
import { Button } from "../../components/ui/button"
import { ArrowLeft, CheckCircle, XCircle, Trophy, Coins, Clock, Star } from "lucide-react"
import { movieQuizzes, GamificationManager } from "../../lib/gamification"

export default function QuizPage() {
  const { movieId } = useParams()
  const navigate = useNavigate()
  const [currentQuestion, setCurrentQuestion] = useState(0)
  const [selectedAnswers, setSelectedAnswers] = useState([])
  const [showResults, setShowResults] = useState(false)
  const [score, setScore] = useState(0)
  const [quizSubmitted, setQuizSubmitted] = useState(false)
  const [timeLeft, setTimeLeft] = useState(300) // 5 minutes

  const quiz = movieId ? movieQuizzes[movieId] : null

  useEffect(() => {
    if (!quiz) {
      navigate("/home")
      return
    }

    const gamification = GamificationManager.getInstance()
    if (!gamification.canAttemptQuiz()) {
      navigate("/home")
    }
  }, [quiz, navigate])

  if (!quiz) {
    return null
  }

  useEffect(() => {
    if (!showResults && timeLeft > 0) {
      const timer = setTimeout(() => setTimeLeft(timeLeft - 1), 1000)
      return () => clearTimeout(timer)
    }
    // Auto-submit when time runs out
    if (!showResults && timeLeft === 0) {
      calculateResults()
    }
  }, [timeLeft, showResults])

  const handleAnswerSelect = (answerIndex) => {
    const newAnswers = [...selectedAnswers]
    newAnswers[currentQuestion] = answerIndex
    setSelectedAnswers(newAnswers)
  }

  const handleNext = () => {
    if (currentQuestion < quiz.questions.length - 1) {
      setCurrentQuestion(currentQuestion + 1)
    } else {
      calculateResults()
    }
  }

  const handlePrevious = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion(currentQuestion - 1)
    }
  }

  const calculateResults = () => {
    let correctCount = 0
    quiz.questions.forEach((question, index) => {
      if (selectedAnswers[index] === question.correctAnswer) {
        correctCount++
      }
    })
    setScore(correctCount)
    setShowResults(true)
  }

  const submitQuiz = () => {
    const gamification = GamificationManager.getInstance()
    const success = gamification.submitQuiz(quiz.movieTitle, score)

    if (success) {
      setQuizSubmitted(true)
    }
  }

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  const currentQ = quiz.questions[currentQuestion]
  const isAnswered = selectedAnswers[currentQuestion] !== undefined
  const isLastQuestion = currentQuestion === quiz.questions.length - 1
  const progressPercentage = ((currentQuestion + 1) / quiz.questions.length) * 100

  if (showResults) {
    const percentage = Math.round((score / quiz.questions.length) * 100)
    const getPerformanceMessage = () => {
      if (percentage >= 90) return { message: "Outstanding!", color: "text-emerald-400", icon: "🏆" }
      if (percentage >= 70) return { message: "Great Job!", color: "text-blue-400", icon: "🎉" }
      if (percentage >= 50) return { message: "Good Effort!", color: "text-yellow-400", icon: "👍" }
      return { message: "Keep Practicing!", color: "text-orange-400", icon: "💪" }
    }

    const performance = getPerformanceMessage()

    return (
      <div className="min-h-screen w-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
        {/* Animated background elements */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -top-40 -right-40 w-80 h-80 bg-purple-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse"></div>
          <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-blue-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse delay-1000"></div>
        </div>

        <div className="relative z-10 container mx-auto px-4 py-8">
          <motion.div 
            initial={{ opacity: 0, y: 30 }} 
            animate={{ opacity: 1, y: 0 }} 
            transition={{ duration: 0.6 }}
            className="max-w-4xl mx-auto"
          >
            {/* Results Header */}
            <div className="text-center mb-12">
              <motion.div
                initial={{ scale: 0, rotate: -180 }}
                animate={{ scale: 1, rotate: 0 }}
                transition={{ delay: 0.3, type: "spring", stiffness: 200 }}
                className="relative inline-block mb-8"
              >
                <div className="w-32 h-32 bg-gradient-to-r from-yellow-400 via-orange-500 to-pink-500 rounded-full flex items-center justify-center shadow-2xl">
                  <Trophy className="w-16 h-16 text-white" />
                </div>
                <div className="absolute -top-2 -right-2 w-12 h-12 bg-gradient-to-r from-emerald-400 to-cyan-400 rounded-full flex items-center justify-center text-2xl">
                  {performance.icon}
                </div>
              </motion.div>

              <motion.h1 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
                className="text-5xl font-bold mb-4 bg-gradient-to-r from-yellow-400 via-orange-500 to-pink-500 bg-clip-text text-transparent"
              >
                Quiz Complete!
              </motion.h1>

              <motion.p 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.7 }}
                className="text-2xl text-gray-300 mb-4"
              >
                {quiz.movieTitle}
              </motion.p>

              <motion.p 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.8 }}
                className={`text-xl font-semibold ${performance.color}`}
              >
                {performance.message}
              </motion.p>
            </div>

            {/* Score Cards */}
            <div className="grid md:grid-cols-3 gap-6 mb-12">
              <motion.div
                initial={{ opacity: 0, x: -50 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.4 }}
                className="bg-gradient-to-br from-gray-800/50 to-gray-900/50 backdrop-blur-lg rounded-2xl p-6 border border-gray-700/50"
              >
                <div className="text-center">
                  <div className="text-4xl font-bold text-white mb-2">
                    {score}/{quiz.questions.length}
                  </div>
                  <p className="text-gray-400">Correct Answers</p>
                </div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 50 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
                className="bg-gradient-to-br from-purple-800/50 to-purple-900/50 backdrop-blur-lg rounded-2xl p-6 border border-purple-700/50"
              >
                <div className="text-center">
                  <div className="text-4xl font-bold text-purple-300 mb-2">
                    {percentage}%
                  </div>
                  <p className="text-gray-400">Accuracy</p>
                </div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, x: 50 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.6 }}
                className="bg-gradient-to-br from-yellow-800/50 to-orange-800/50 backdrop-blur-lg rounded-2xl p-6 border border-yellow-700/50"
              >
                <div className="text-center flex items-center justify-center space-x-2">
                  <Coins className="w-8 h-8 text-yellow-400" />
                  <div>
                    <div className="text-3xl font-bold text-yellow-400">+{score}</div>
                    <p className="text-gray-400 text-sm">Points Earned</p>
                  </div>
                </div>
              </motion.div>
            </div>

            {/* Detailed Results */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.8 }}
              className="bg-gradient-to-br from-gray-800/30 to-gray-900/30 backdrop-blur-lg rounded-2xl p-8 border border-gray-700/50 mb-8"
            >
              <h3 className="text-2xl font-bold text-white mb-6 flex items-center">
                <Star className="w-6 h-6 text-yellow-400 mr-2" />
                Detailed Results
              </h3>
              
              <div className="space-y-6">
                {quiz.questions.map((question, index) => (
                  <motion.div
                    key={question.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.9 + index * 0.1 }}
                    className="bg-gradient-to-r from-gray-800/50 to-gray-900/50 rounded-xl p-6 border border-gray-700/30"
                  >
                    <div className="flex items-start space-x-4">
                      <div className="flex-shrink-0">
                        {selectedAnswers[index] === question.correctAnswer ? (
                          <div className="w-12 h-12 bg-gradient-to-r from-emerald-500 to-green-500 rounded-full flex items-center justify-center">
                            <CheckCircle className="w-6 h-6 text-white" />
                          </div>
                        ) : (
                          <div className="w-12 h-12 bg-gradient-to-r from-red-500 to-pink-500 rounded-full flex items-center justify-center">
                            <XCircle className="w-6 h-6 text-white" />
                          </div>
                        )}
                      </div>
                      
                      <div className="flex-1">
                        <p className="font-semibold text-white mb-3 text-lg">{question.question}</p>
                        
                        <div className="space-y-2">
                          <div className="flex items-center space-x-2">
                            <span className="text-sm text-gray-400">Your answer:</span>
                            <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                              selectedAnswers[index] === question.correctAnswer 
                                ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                                : 'bg-red-500/20 text-red-300 border border-red-500/30'
                            }`}>
                              {question.options[selectedAnswers[index]]}
                            </span>
                          </div>
                          
                          {selectedAnswers[index] !== question.correctAnswer && (
                            <div className="flex items-center space-x-2">
                              <span className="text-sm text-gray-400">Correct answer:</span>
                              <span className="px-3 py-1 rounded-full text-sm font-medium bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                                {question.options[question.correctAnswer]}
                              </span>
                            </div>
                          )}
                        </div>
                        
                        {question.explanation && (
                          <div className="mt-3 p-3 bg-blue-500/10 border border-blue-500/20 rounded-lg">
                            <p className="text-sm text-blue-300 italic">💡 {question.explanation}</p>
                          </div>
                        )}
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </motion.div>

            {/* Action Button */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1.2 }}
              className="text-center"
            >
              {!quizSubmitted ? (
                <Button
                  onClick={submitQuiz}
                  className="bg-gradient-to-r from-yellow-400 via-orange-500 to-pink-500 text-white hover:from-yellow-500 hover:via-orange-600 hover:to-pink-600 px-12 py-4 text-lg font-semibold rounded-xl shadow-2xl transform transition-all duration-200 hover:scale-105"
                >
                  <Coins className="w-6 h-6 mr-2" />
                  Claim Your {score} Points
                </Button>
              ) : (
                <Link to="/home" className="flex items-center space-x-2">
                <ArrowLeft className="w-5 h-5 text-orange-400" />
                <span className="text-orange-400 hover:text-orange-300">Back to Home</span>
              </Link>
              )}
            </motion.div>
          </motion.div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen w-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-purple-500 rounded-full mix-blend-multiply filter blur-xl opacity-10 animate-pulse"></div>
        <div className="absolute top-3/4 right-1/4 w-64 h-64 bg-blue-500 rounded-full mix-blend-multiply filter blur-xl opacity-10 animate-pulse delay-1000"></div>
        <div className="absolute top-1/2 left-3/4 w-64 h-64 bg-pink-500 rounded-full mix-blend-multiply filter blur-xl opacity-10 animate-pulse delay-2000"></div>
      </div>

      <div className="relative z-10 container mx-auto px-4 py-8">
        <motion.div 
          initial={{ opacity: 0, y: 20 }} 
          animate={{ opacity: 1, y: 0 }} 
          className="max-w-4xl mx-auto"
        >
          {/* Enhanced Header */}
          <div className="flex items-center justify-between mb-8 bg-gradient-to-r from-gray-800/30 to-gray-900/30 backdrop-blur-lg rounded-2xl p-6 border border-gray-700/50">
            <Link to="/home" className="flex items-center space-x-2">
            <ArrowLeft className="w-5 h-5 text-orange-400" />
            <span className="text-orange-400 hover:text-orange-300">Back to Home</span>
          </Link>

            <div className="text-center">
              <h1 className="text-3xl font-bold bg-gradient-to-r from-yellow-400 via-orange-500 to-pink-500 bg-clip-text text-transparent">
                {quiz.movieTitle}
              </h1>
              <p className="text-gray-400 text-sm mt-1">Movie Quiz Challenge</p>
            </div>

            <div className="flex items-center space-x-6">
              {/* Timer */}
              <div className="flex items-center space-x-2 bg-gradient-to-r from-red-500/20 to-orange-500/20 px-4 py-2 rounded-full border border-red-500/30">
                <Clock className="w-4 h-4 text-red-400" />
                <span className="text-red-400 font-mono font-bold">{formatTime(timeLeft)}</span>
              </div>

              {/* Question Counter */}
              <div className="text-right">
                <p className="text-sm text-gray-400">Question</p>
                <p className="text-2xl font-bold bg-gradient-to-r from-yellow-400 to-orange-500 bg-clip-text text-transparent">
                  {currentQuestion + 1}/{quiz.questions.length}
                </p>
              </div>
            </div>
          </div>

          {/* Enhanced Progress Bar */}
          <div className="mb-8">
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm text-gray-400">Progress</span>
              <span className="text-sm text-gray-400">{Math.round(progressPercentage)}% Complete</span>
            </div>
            <div className="w-full bg-gray-800/50 rounded-full h-3 border border-gray-700/50">
              <motion.div
                className="bg-gradient-to-r from-yellow-400 via-orange-500 to-pink-500 h-3 rounded-full shadow-lg"
                initial={{ width: 0 }}
                animate={{ width: `${progressPercentage}%` }}
                transition={{ duration: 0.5, ease: "easeOut" }}
              />
            </div>
          </div>

          {/* Enhanced Question Card */}
          <AnimatePresence mode="wait">
            <motion.div
              key={currentQuestion}
              initial={{ opacity: 0, x: 100, scale: 0.95 }}
              animate={{ opacity: 1, x: 0, scale: 1 }}
              exit={{ opacity: 0, x: -100, scale: 0.95 }}
              transition={{ duration: 0.4, ease: "easeInOut" }}
              className="bg-gradient-to-br from-gray-800/50 to-gray-900/50 backdrop-blur-lg rounded-2xl p-8 mb-8 border border-gray-700/50 shadow-2xl"
            >
              <div className="flex items-start space-x-4 mb-8">
                <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-blue-500 rounded-full flex items-center justify-center flex-shrink-0">
                  <span className="text-white font-bold text-lg">{currentQuestion + 1}</span>
                </div>
                <h2 className="text-2xl font-bold text-white leading-relaxed">{currentQ.question}</h2>
              </div>

              <div className="grid gap-4">
                {currentQ.options.map((option, index) => (
                  <motion.button
                    key={index}
                    whileHover={{ scale: 1.02, y: -2 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => handleAnswerSelect(index)}
                    className={`group p-6 rounded-xl text-left transition-all duration-300 border-2 ${
                      selectedAnswers[currentQuestion] === index
                        ? "bg-gradient-to-r from-yellow-400/20 via-orange-500/20 to-pink-500/20 border-yellow-400 shadow-lg shadow-yellow-400/25"
                        : "bg-gradient-to-r from-purple-800/30 to-purple-900/30 border-purple-600 hover:border-purple-500 hover:bg-gradient-to-r hover:from-purple-700/40 hover:to-purple-800/40"
                    }`}
                  >
                    <div className="flex items-center space-x-4">
                      <div
                        className={`w-8 h-8 rounded-full border-2 flex items-center justify-center transition-all duration-300 ${
                          selectedAnswers[currentQuestion] === index
                            ? "border-yellow-400 bg-gradient-to-r from-yellow-400 to-orange-500 shadow-lg"
                            : "border-gray-500 group-hover:border-gray-400"
                        }`}
                      >
                        {selectedAnswers[currentQuestion] === index && (
                          <motion.div 
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            className="w-4 h-4 bg-white rounded-full" 
                          />
                        )}
                      </div>
                      <span className="text-black text-lg font-medium group-hover:text-black transition-colors duration-200">
                        {option}
                      </span>
                    </div>
                  </motion.button>
                ))}
              </div>
            </motion.div>
          </AnimatePresence>

          {/* Enhanced Navigation */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="flex justify-between items-center"
          >
            <Button
              onClick={handlePrevious}
              disabled={currentQuestion === 0}
              className="bg-gradient-to-r from-gray-700 to-gray-800 text-white border border-gray-600 hover:from-gray-600 hover:to-gray-700 px-8 py-3 rounded-xl font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <ArrowLeft className="w-5 h-5 mr-2" />
              Previous
            </Button>

            <div className="flex items-center space-x-2 text-gray-400">
              {Array.from({ length: quiz.questions.length }, (_, i) => (
                <div
                  key={i}
                  className={`w-3 h-3 rounded-full transition-all duration-300 ${
                    i === currentQuestion
                      ? 'bg-gradient-to-r from-yellow-400 to-orange-500 scale-125'
                      : i < currentQuestion
                      ? 'bg-green-500'
                      : selectedAnswers[i] !== undefined
                      ? 'bg-blue-500'
                      : 'bg-gray-600'
                  }`}
                />
              ))}
            </div>

            <Button
              onClick={handleNext}
              disabled={!isAnswered}
              className="bg-gradient-to-r from-yellow-400 via-orange-500 to-pink-500 text-white hover:from-yellow-500 hover:via-orange-600 hover:to-pink-600 px-8 py-3 rounded-xl font-semibold disabled:opacity-50 disabled:cursor-not-allowed shadow-lg"
            >
              {isLastQuestion ? (
                <>
                  <Trophy className="w-5 h-5 mr-2" />
                  Finish Quiz
                </>
              ) : (
                <>
                  Next Question
                  <ArrowLeft className="w-5 h-5 ml-2 rotate-180" />
                </>
              )}
            </Button>
        </motion.div>
        </motion.div>
      </div>
    </div>
  )
}

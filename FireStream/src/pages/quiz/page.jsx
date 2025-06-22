"use client"

import { useState, useEffect } from "react"
import { useParams, useNavigate } from "react-router-dom"
import { motion, AnimatePresence } from "framer-motion"
import { Button } from "../../components/ui/button"
import { ArrowLeft, CheckCircle, XCircle, Trophy, Coins } from "lucide-react"
import { movieQuizzes, GamificationManager } from "../../lib/gamification"

export default function QuizPage() {
  const { movieId } = useParams()
  const navigate = useNavigate()
  const [currentQuestion, setCurrentQuestion] = useState(0)
  const [selectedAnswers, setSelectedAnswers] = useState([])
  const [showResults, setShowResults] = useState(false)
  const [score, setScore] = useState(0)
  const [quizSubmitted, setQuizSubmitted] = useState(false)

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

  const currentQ = quiz.questions[currentQuestion]
  const isAnswered = selectedAnswers[currentQuestion] !== undefined
  const isLastQuestion = currentQuestion === quiz.questions.length - 1

  if (showResults) {
    return (
      <div className="min-h-screen bg-black text-white">
        <div className="container mx-auto px-4 py-8">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="max-w-2xl mx-auto">
            <div className="text-center mb-8">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.2 }}
                className="w-24 h-24 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-full flex items-center justify-center mx-auto mb-6"
              >
                <Trophy className="w-12 h-12 text-black" />
              </motion.div>

              <h1 className="text-4xl font-bold mb-4 bg-gradient-to-r from-yellow-400 to-orange-500 bg-clip-text text-transparent">
                Quiz Complete!
              </h1>

              <p className="text-xl text-gray-300 mb-6">{quiz.movieTitle}</p>

              <div className="bg-gray-900/50 rounded-xl p-6 mb-6">
                <div className="text-6xl font-bold text-yellow-400 mb-2">
                  {score}/{quiz.questions.length}
                </div>
                <p className="text-gray-400">Correct Answers</p>
              </div>

              <div className="flex items-center justify-center space-x-2 mb-8">
                <Coins className="w-6 h-6 text-yellow-400" />
                <span className="text-2xl font-bold text-yellow-400">+{score} Points Earned</span>
              </div>
            </div>

            <div className="space-y-4 mb-8">
              {quiz.questions.map((question, index) => (
                <motion.div
                  key={question.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="bg-gray-900/50 rounded-lg p-4"
                >
                  <div className="flex items-start space-x-3">
                    {selectedAnswers[index] === question.correctAnswer ? (
                      <CheckCircle className="w-6 h-6 text-green-400 flex-shrink-0 mt-1" />
                    ) : (
                      <XCircle className="w-6 h-6 text-red-400 flex-shrink-0 mt-1" />
                    )}
                    <div className="flex-1">
                      <p className="font-medium mb-2">{question.question}</p>
                      <p className="text-sm text-gray-400">Your answer: {question.options[selectedAnswers[index]]}</p>
                      {selectedAnswers[index] !== question.correctAnswer && (
                        <p className="text-sm text-green-400">Correct: {question.options[question.correctAnswer]}</p>
                      )}
                      {question.explanation && (
                        <p className="text-sm text-gray-500 mt-2 italic">{question.explanation}</p>
                      )}
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>

            <div className="flex space-x-4">
              {!quizSubmitted ? (
                <Button
                  onClick={submitQuiz}
                  className="flex-1 bg-gradient-to-r from-yellow-400 to-orange-500 text-black hover:from-yellow-500 hover:to-orange-600 py-3"
                >
                  Claim Points
                </Button>
              ) : (
                <Button
                  onClick={() => navigate("/home")}
                  className="flex-1 bg-gradient-to-r from-yellow-400 to-orange-500 text-black hover:from-yellow-500 hover:to-orange-600 py-3"
                >
                  Back to Home
                </Button>
              )}
            </div>
          </motion.div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-black text-white">
      <div className="container mx-auto px-4 py-8">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="max-w-2xl mx-auto">
          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <Button onClick={() => navigate("/home")} variant="ghost" className="text-gray-400 hover:text-white">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Home
            </Button>

            <div className="text-center">
              <h1 className="text-2xl font-bold text-orange-400">{quiz.movieTitle}</h1>
              <p className="text-gray-400">Movie Quiz</p>
            </div>

            <div className="text-right">
              <p className="text-sm text-gray-400">Question</p>
              <p className="text-lg font-bold text-yellow-400">
                {currentQuestion + 1}/{quiz.questions.length}
              </p>
            </div>
          </div>

          {/* Progress Bar */}
          <div className="w-full bg-gray-800 rounded-full h-2 mb-8">
            <motion.div
              className="bg-gradient-to-r from-yellow-400 to-orange-500 h-2 rounded-full"
              initial={{ width: 0 }}
              animate={{ width: `${((currentQuestion + 1) / quiz.questions.length) * 100}%` }}
              transition={{ duration: 0.3 }}
            />
          </div>

          {/* Question */}
          <AnimatePresence mode="wait">
            <motion.div
              key={currentQuestion}
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -50 }}
              transition={{ duration: 0.3 }}
              className="bg-gray-900/50 rounded-xl p-8 mb-8"
            >
              <h2 className="text-xl font-bold mb-6 text-white">{currentQ.question}</h2>

              <div className="space-y-3">
                {currentQ.options.map((option, index) => (
                  <motion.button
                    key={index}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => handleAnswerSelect(index)}
                    className={`w-full p-4 rounded-lg text-left transition-all ${
                      selectedAnswers[currentQuestion] === index
                        ? "bg-gradient-to-r from-yellow-400/20 to-orange-500/20 border-2 border-yellow-400"
                        : "bg-gray-800/50 border-2 border-gray-700 hover:border-gray-600"
                    }`}
                  >
                    <div className="flex items-center space-x-3">
                      <div
                        className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${
                          selectedAnswers[currentQuestion] === index
                            ? "border-yellow-400 bg-yellow-400"
                            : "border-gray-500"
                        }`}
                      >
                        {selectedAnswers[currentQuestion] === index && (
                          <div className="w-3 h-3 bg-black rounded-full" />
                        )}
                      </div>
                      <span className="text-white">{option}</span>
                    </div>
                  </motion.button>
                ))}
              </div>
            </motion.div>
          </AnimatePresence>

          {/* Navigation */}
          <div className="flex justify-between">
            <Button
              onClick={handlePrevious}
              disabled={currentQuestion === 0}
              variant="outline"
              className="border-gray-600 text-white hover:bg-gray-800"
            >
              Previous
            </Button>

            <Button
              onClick={handleNext}
              disabled={!isAnswered}
              className="bg-gradient-to-r from-yellow-400 to-orange-500 text-black hover:from-yellow-500 hover:to-orange-600"
            >
              {isLastQuestion ? "Finish Quiz" : "Next Question"}
            </Button>
          </div>
        </motion.div>
      </div>
    </div>
  )
}

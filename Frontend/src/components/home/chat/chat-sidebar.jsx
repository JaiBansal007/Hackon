"use client"

import { useState, useRef } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Button } from "../../ui/button"
import { Input } from "../../ui/input"
import { X, MessageCircle, Users, Send, Plus, BarChart3, Users2, Eye } from "lucide-react"

const PollMessage = ({ poll, onVote, currentUser }) => {
  // Track userVotes as user names, not just option IDs
  const [userVotes, setUserVotes] = useState(() => {
    // Find which options the current user has already voted for
    return poll.options.filter((opt) => opt.votes.includes(currentUser)).map((opt) => opt.id)
  })
  const [showVoters, setShowVoters] = useState({})

  const handleVote = (optionId) => {
    let updatedUserVotes
    if (poll.allowMultiple) {
      if (userVotes.includes(optionId)) {
        updatedUserVotes = userVotes.filter((id) => id !== optionId)
      } else {
        updatedUserVotes = [...userVotes, optionId]
      }
    } else {
      updatedUserVotes = [optionId]
    }
    setUserVotes(updatedUserVotes)
    onVote(poll.id, optionId)
  }

  const toggleShowVoters = (optionId) => {
    setShowVoters((prev) => ({
      ...prev,
      [optionId]: !prev[optionId],
    }))
  }

  // Calculate local votes for instant feedback
  const getOptionVotes = (option) => {
    // If user has just voted for this option, include their name
    const isVoted = userVotes.includes(option.id)
    let votes = option.votes || []
    if (isVoted && !votes.includes(currentUser)) {
      votes = [...votes, currentUser]
    }
    // If user has just unvoted, remove their name
    if (!isVoted && votes.includes(currentUser)) {
      votes = votes.filter((name) => name !== currentUser)
    }
    return votes
  }

  const totalVotes = poll.options.reduce((sum, option) => sum + getOptionVotes(option).length, 0)

  return (
    <div className="relative bg-gradient-to-br from-blue-900/80 via-gray-900/90 to-blue-950/90 rounded-3xl p-6 my-6 border border-blue-600/30 shadow-2xl overflow-hidden">
      {/* Decorative background */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute -top-10 -left-10 w-40 h-40 bg-blue-500/20 rounded-full blur-3xl" />
        <div className="absolute -bottom-10 -right-10 w-40 h-40 bg-blue-400/20 rounded-full blur-3xl" />
        <div className="absolute top-1/2 left-1/2 w-1/2 h-1/2 bg-blue-700/10 rounded-full blur-2xl -translate-x-1/2 -translate-y-1/2" />
      </div>
      <div className="flex items-center space-x-3 mb-5 relative z-10">
        <BarChart3 className="w-7 h-7 text-blue-400 drop-shadow" />
        <span className="font-semibold text-blue-300 text-base tracking-wide">
          Poll by <span className="text-white font-bold">{poll.createdBy}</span>
        </span>
      </div>
      <h4 className="text-white font-extrabold text-xl mb-6 relative z-10 tracking-tight leading-snug drop-shadow-lg">
        {poll.question}
      </h4>
      <div className="space-y-4 relative z-10">
        {poll.options.map((option) => {
          const votes = getOptionVotes(option)
          const percentage = totalVotes > 0 ? (votes.length / totalVotes) * 100 : 0
          const hasVoted = userVotes.includes(option.id)

          return (
            <div key={option.id} className="space-y-1 group">
              <div
                className={`relative p-4 rounded-2xl cursor-pointer transition-all duration-200 border-2 flex flex-col justify-center shadow-lg
                  ${hasVoted
                    ? "bg-gradient-to-r from-blue-500/60 to-blue-400/40 border-blue-400/80 ring-2 ring-blue-400/40"
                    : "bg-gray-900/60 hover:bg-blue-900/40 border-gray-700/70 hover:border-blue-400/50"}
                `}
                onClick={() => handleVote(option.id)}
              >
                <div className="flex items-center justify-between">
                  <span className={`text-base font-semibold ${hasVoted ? "text-blue-100" : "text-gray-200"}`}>{option.text}</span>
                  <span className="flex items-center space-x-2">
                    <span className={`text-xs font-bold ${hasVoted ? "text-blue-200" : "text-gray-400"}`}>{votes.length} vote{votes.length !== 1 ? "s" : ""}</span>
                    {votes.length > 0 && (
                      <button
                        type="button"
                        onClick={e => { e.stopPropagation(); toggleShowVoters(option.id); }}
                        className={`ml-2 p-1 rounded-full hover:bg-blue-900/50 focus:outline-none transition-colors ${showVoters[option.id] ? "bg-blue-900/50" : ""}`}
                        title={showVoters[option.id] ? "Hide voters" : "View voters"}
                      >
                        <Eye className={`w-4 h-4 ${showVoters[option.id] ? "text-blue-400" : "text-blue-300"}`} />
                      </button>
                    )}
                  </span>
                </div>
                {/* Modern Progress bar */}
                <div className="relative w-full h-3 mt-4 bg-gradient-to-r from-blue-900/40 to-blue-800/40 rounded-full overflow-hidden shadow-inner">
                  <div
                    className={`absolute left-0 top-0 h-3 rounded-full transition-all duration-700 ${hasVoted ? "bg-gradient-to-r from-blue-400 via-blue-500 to-blue-600" : "bg-blue-900/60"}`}
                    style={{ width: `${percentage}%` }}
                  />
                  <div className="absolute left-0 top-0 h-3 w-full bg-gradient-to-r from-blue-400/10 to-blue-900/10 rounded-full" />
                </div>
              </div>
              <AnimatePresence>
                {showVoters[option.id] && (
                  <motion.div
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 8 }}
                    className="text-xs text-blue-200 ml-7 mt-2 bg-blue-900/40 rounded-lg px-3 py-2 shadow-lg border border-blue-700/30"
                  >
                    Voted by: {votes.join(", ")}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          )
        })}
      </div>
      <div className="text-xs text-gray-400 mt-7 flex items-center justify-between relative z-10">
        <span className="font-medium tracking-wide">{poll.allowMultiple ? "Multiple selections allowed" : "Single selection only"}</span>
        <span className="font-bold text-blue-300">Total votes: {totalVotes}</span>
      </div>
    </div>
  )
}

export function ChatSidebar({ show, onClose, messages, onSendMessage, roomStatus, roomMembers, user, polls }) {
  const [newMessage, setNewMessage] = useState("")
  const [showMentions, setShowMentions] = useState(false)
  const [mentionSuggestions, setMentionSuggestions] = useState([])
  const [cursorPosition, setCursorPosition] = useState(0)
  const inputRef = useRef(null)
  const [showPollOptions, setShowPollOptions] = useState(false)
  const [showCreatePoll, setShowCreatePoll] = useState(false)
  const [pollQuestion, setPollQuestion] = useState("")
  const [pollOptions, setPollOptions] = useState(["", ""])
  const [allowMultipleSelection, setAllowMultipleSelection] = useState(false)
  const [pollsEnabled, setPollsEnabled] = useState(true) // Host can toggle this

  const handleMessageChange = (e) => {
    const value = e.target.value
    const position = e.target.selectionStart || 0
    setNewMessage(value)
    setCursorPosition(position)

    const textBeforeCursor = value.substring(0, position)
    const lastAtIndex = textBeforeCursor.lastIndexOf("@")

    if (lastAtIndex !== -1 && (lastAtIndex === 0 || textBeforeCursor[lastAtIndex - 1] === " ")) {
      const textAfterAt = textBeforeCursor.substring(lastAtIndex + 1)
      if (!textAfterAt.includes(" ")) {
        const searchTerm = textAfterAt.toLowerCase()
        const allSuggestions = [
          { id: "tree", name: "Tree.io", isAI: true },
          ...roomMembers.filter((member) => member.userName.toLowerCase().includes(searchTerm)),
        ]
        setMentionSuggestions(allSuggestions)
        setShowMentions(true)
      } else {
        setShowMentions(false)
      }
    } else {
      setShowMentions(false)
    }
  }

  const insertMention = (mention) => {
    const lastAtIndex = newMessage.lastIndexOf("@", cursorPosition - 1)
    const beforeMention = newMessage.substring(0, lastAtIndex)
    const afterMention = newMessage.substring(cursorPosition)
    const mentionText = mention.isAI ? "@Tree.io" : `@${mention.userName}`

    setNewMessage(beforeMention + mentionText + " " + afterMention)
    setShowMentions(false)
    inputRef.current?.focus()
  }

  const addPollOption = () => {
    setPollOptions([...pollOptions, ""])
  }

  const updatePollOption = (index, value) => {
    const newOptions = [...pollOptions]
    newOptions[index] = value
    setPollOptions(newOptions)
  }

  const removePollOption = (index) => {
    if (pollOptions.length > 2) {
      const newOptions = pollOptions.filter((_, i) => i !== index)
      setPollOptions(newOptions)
    }
  }

  const createPoll = () => {
    if (pollQuestion.trim() && pollOptions.filter((opt) => opt.trim()).length >= 2) {
      const poll = {
        id: Date.now(),
        question: pollQuestion.trim(),
        options: pollOptions
          .filter((opt) => opt.trim())
          .map((option, index) => ({
            id: index,
            text: option.trim(),
            votes: [],
            count: 0,
          })),
        allowMultiple: allowMultipleSelection,
        createdBy: user?.name || "User",
        createdAt: Date.now(),
        isActive: true,
      }

      onSendMessage(`POLL:${JSON.stringify(poll)}`)

      // Reset form
      setPollQuestion("")
      setPollOptions(["", ""])
      setAllowMultipleSelection(false)
      setShowCreatePoll(false)
      setShowPollOptions(false)
    }
  }

  const votePoll = (pollId, optionId) => {
    onSendMessage(`POLL_VOTE:${JSON.stringify({ pollId, optionId, voter: user?.name || "User" })}`)
  }

  const togglePollsEnabled = () => {
    if (roomStatus === "host") {
      setPollsEnabled(!pollsEnabled)
      onSendMessage(`POLL_SETTINGS:${JSON.stringify({ pollsEnabled: !pollsEnabled })}`)
    }
  }

  const renderMessageWithMentions = (text) => {
    // Handle poll messages
    if (text.startsWith("POLL:")) {
      try {
        const poll = JSON.parse(text.substring(5))
        // Use the latest poll data from props.polls if available
        const latestPoll = polls && polls[poll.id] ? polls[poll.id] : poll
        return <PollMessage poll={latestPoll} onVote={votePoll} currentUser={user?.name} />
      } catch (e) {
        return text
      }
    }

    // Handle poll vote messages (don't display these)
    if (text.startsWith("POLL_VOTE:") || text.startsWith("POLL_SETTINGS:")) {
      return null
    }

    const parts = text.split(/(@\w+(?:\.\w+)?)/g)
    return parts.map((part, index) => {
      if (part.startsWith("@")) {
        const isTreeIO = part === "@Tree.io"
        return (
          <span key={index} className={`font-semibold ${isTreeIO ? "text-orange-400" : "text-blue-400"}`}>
            {part}
          </span>
        )
      }
      return part
    })
  }

  const sendMessage = async () => {
    if (newMessage.trim()) {
      const messageText = newMessage.trim()

      onSendMessage(messageText)

      if (messageText.includes("@Tree.io")) {
        try {
          setTimeout(() => {
            onSendMessage("Tree.io is thinking...")
          }, 500)

          const response = await fetch("http://localhost:8000/api/chat/tree-io", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              message: messageText.replace("@Tree.io", "").trim(),
              movie_title: "Current Movie",
              movie_context: "Movie context if available",
            }),
          })

          if (response.ok) {
            const data = await response.json()

            setTimeout(() => {
              onSendMessage(`Tree.io: ${data.response}`)
            }, 1500)
          } else {
            setTimeout(() => {
              onSendMessage(
                "Tree.io: Sorry, I'm having trouble processing your request right now. Please try again later.",
              )
            }, 1500)
          }
        } catch (error) {
          console.error("Error calling Tree.io API:", error)

          setTimeout(() => {
            onSendMessage("Tree.io: Sorry, I'm currently unavailable. Please try again later.")
          }, 1500)
        }
      }

      setNewMessage("")
    }
  }

  return (
    <AnimatePresence>
      {show && (
        <>
          {/* Overlay to close chat on outside click */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.01 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-40"
            onClick={onClose}
          />
          <motion.div
            initial={{ x: 320 }}
            animate={{ x: 0 }}
            exit={{ x: 320 }}
            className="fixed right-0 top-0 h-full w-80 bg-black/20 backdrop-blur-lg border-l border-gray-700/50 z-50 shadow-2xl"
          >
            <div className="flex flex-col h-full">
              <div className="p-4 border-b border-gray-700/50 bg-gradient-to-r from-gray-800/50 to-gray-900/50">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <div className="w-3 h-3 bg-green-400 rounded-full animate-pulse"></div>
                    <h3 className="text-lg font-semibold text-white">
                      {roomStatus !== "none" ? "Room Chat" : "AI Assistant"}
                    </h3>
                  </div>
                  <Button
                    onClick={onClose}
                    variant="ghost"
                    size="sm"
                    className="text-black hover:bg-gray-700/50 rounded-full"
                  >
                    <X className="w-4 h-4" />
                  </Button>
                </div>
                {roomStatus !== "none" && (
                  <div className="text-sm text-gray-400 mt-1 flex items-center space-x-1">
                    <Users className="w-3 h-3" />
                    <span>{roomMembers.length} members online</span>
                  </div>
                )}
              </div>

              <div className="flex-1 overflow-y-auto p-4 space-y-4 custom-scrollbar">
                {messages.length === 0 ? (
                  <div className="text-center text-gray-500 mt-8">
                    <div className="w-16 h-16 bg-gradient-to-r from-orange-400/20 to-yellow-400/20 rounded-full flex items-center justify-center mx-auto mb-4">
                      <MessageCircle className="w-8 h-8 text-orange-400" />
                    </div>
                    <p className="text-sm">
                      {roomStatus !== "none"
                        ? "No messages yet. Start the conversation!"
                        : "Chat with @Tree.io for AI assistance!"}
                    </p>
                  </div>
                ) : (
                  <AnimatePresence>
                    {messages.map((message) => (
                      <motion.div
                        key={message.id}
                        initial={{ opacity: 0, y: 20, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        transition={{ duration: 0.3 }}
                        className={`text-sm ${message.isSystem ? "text-center" : ""}`}
                      >
                        {message.isSystem ? (
                          <div className="text-gray-500 italic bg-gray-800/30 rounded-lg px-3 py-2 text-center">
                            {message.text}
                          </div>
                        ) : (
                          <div className="bg-gray-800/40 rounded-lg p-3 hover:bg-gray-800/60 transition-colors">
                            <div className="flex items-center space-x-2 mb-2">
                              <div
                                className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                                  message.user === "Tree.io" || message.text.startsWith("Tree.io:")
                                    ? "bg-gradient-to-r from-orange-400 to-yellow-400 text-black"
                                    : "bg-gradient-to-r from-orange-400 to-yellow-400 text-black"
                                }`}
                              >
                                {message.user === "Tree.io" || message.text.startsWith("Tree.io:")
                                  ? "AI"
                                  : message.user.charAt(0).toUpperCase()}
                              </div>
                              <span
                                className={`font-medium ${
                                  message.user === "Tree.io" || message.text.startsWith("Tree.io:")
                                    ? "text-orange-400"
                                    : "text-orange-400"
                                }`}
                              >
                                {message.user === "Tree.io" || message.text.startsWith("Tree.io:")
                                  ? "Tree.io"
                                  : message.user}
                              </span>
                              {(message.user === "Tree.io" || message.text.startsWith("Tree.io:")) && (
                                <span className="text-xs bg-orange-400/20 text-orange-400 px-2 py-1 rounded-full">
                                  AI Assistant
                                </span>
                              )}
                              <span className="text-xs text-gray-500">{message.timestamp}</span>
                            </div>
                            <p className="text-gray-300 leading-relaxed">
                              {renderMessageWithMentions(
                                message.text.startsWith("Tree.io:") ? message.text.substring(8) : message.text,
                              )}
                            </p>
                          </div>
                        )}
                      </motion.div>
                    ))}
                  </AnimatePresence>
                )}
              </div>

              <div className="p-4 border-t border-gray-700/50 bg-gradient-to-r from-gray-800/30 to-gray-900/30">
                {/* Host Settings */}
                {roomStatus === "host" && (
                  <div className="mb-3 p-2 bg-gray-800/50 rounded-lg">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-300">Allow members to create polls</span>
                      <button
                        onClick={togglePollsEnabled}
                        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                          pollsEnabled ? "bg-blue-600" : "bg-gray-600"
                        }`}
                      >
                        <span
                          className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                            pollsEnabled ? "translate-x-6" : "translate-x-1"
                          }`}
                        />
                      </button>
                    </div>
                  </div>
                )}

                {/* Create Poll Form */}
                {showCreatePoll && (roomStatus === "host" || pollsEnabled) && (
                  <div className="mb-4 p-4 bg-gray-800/70 rounded-lg border border-gray-600/50">
                    <h4 className="text-white font-medium mb-3">Create Poll</h4>

                    <div className="space-y-3">
                      <input
                        type="text"
                        placeholder="Enter your question..."
                        value={pollQuestion}
                        onChange={(e) => setPollQuestion(e.target.value)}
                        className="w-full p-2 bg-gray-700/50 border border-gray-600 rounded-lg text-white placeholder-gray-400"
                      />

                      <div className="space-y-2">
                        {pollOptions.map((option, index) => (
                          <div key={index} className="flex items-center space-x-2">
                            <input
                              type="text"
                              placeholder={`Option ${index + 1}`}
                              value={option}
                              onChange={(e) => updatePollOption(index, e.target.value)}
                              className="flex-1 p-2 bg-gray-700/50 border border-gray-600 rounded-lg text-white placeholder-gray-400"
                            />
                            {pollOptions.length > 2 && (
                              <button
                                onClick={() => removePollOption(index)}
                                className="p-2 text-red-400 hover:text-red-300"
                              >
                                <X className="w-4 h-4" />
                              </button>
                            )}
                          </div>
                        ))}
                      </div>

                      <button
                        onClick={addPollOption}
                        className="flex items-center space-x-2 text-blue-400 hover:text-blue-300 text-sm"
                      >
                        <Plus className="w-4 h-4" />
                        <span>Add option</span>
                      </button>

                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          <span className="text-sm text-gray-300">Allow multiple selections</span>
                          <button
                            onClick={() => setAllowMultipleSelection(!allowMultipleSelection)}
                            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                              allowMultipleSelection ? "bg-blue-600" : "bg-gray-600"
                            }`}
                          >
                            <span
                              className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                                allowMultipleSelection ? "translate-x-6" : "translate-x-1"
                              }`}
                            />
                          </button>
                        </div>
                      </div>

                      <div className="flex space-x-2">
                        <button
                          onClick={createPoll}
                          className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-lg transition-colors"
                        >
                          Create Poll
                        </button>
                        <button
                          onClick={() => {
                            setShowCreatePoll(false)
                            setShowPollOptions(false)
                            setPollQuestion("")
                            setPollOptions(["", ""])
                            setAllowMultipleSelection(false)
                          }}
                          className="flex-1 bg-gray-600 hover:bg-gray-700 text-white py-2 px-4 rounded-lg transition-colors"
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  </div>
                )}

                {/* Poll Options Menu */}
                {showPollOptions && (
                  <div className="mb-3 p-2 bg-gray-800/70 rounded-lg border border-gray-600/50">
                    <button
                      onClick={() => {
                        if (roomStatus === "host" || pollsEnabled) {
                          setShowCreatePoll(true)
                          setShowPollOptions(false)
                        }
                      }}
                      disabled={roomStatus !== "host" && !pollsEnabled}
                      className={`w-full text-left p-2 rounded-lg transition-colors ${
                        roomStatus === "host" || pollsEnabled
                          ? "hover:bg-gray-700/50 text-white"
                          : "text-gray-500 cursor-not-allowed"
                      }`}
                    >
                      <div className="flex items-center space-x-2">
                        <BarChart3 className="w-4 h-4" />
                        <span>Create Poll</span>
                      </div>
                    </button>
                  </div>
                )}

                <div className="relative">
                  <AnimatePresence>
                    {showMentions && mentionSuggestions.length > 0 && (
                      <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 10 }}
                        className="absolute bottom-full left-0 right-0 bg-gray-800/95 backdrop-blur-sm border border-gray-600/50 rounded-lg mb-2 max-h-40 overflow-y-auto custom-scrollbar shadow-xl"
                      >
                        {mentionSuggestions.map((suggestion) => (
                          <motion.div
                            key={suggestion.id}
                            whileHover={{ backgroundColor: "rgba(55, 65, 81, 0.8)" }}
                            onClick={() => insertMention(suggestion)}
                            className="p-3 cursor-pointer flex items-center space-x-3 hover:bg-gray-700/50 transition-colors"
                          >
                            <div
                              className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold ${
                                suggestion.isAI
                                  ? "bg-gradient-to-r from-orange-400 to-yellow-400 text-black"
                                  : "bg-gradient-to-r from-blue-400 to-blue-600 text-white"
                              }`}
                            >
                              {suggestion.isAI ? "AI" : suggestion.userName?.charAt(0).toUpperCase()}
                            </div>
                            <div>
                              <span className={`font-medium ${suggestion.isAI ? "text-orange-400" : "text-blue-400"}`}>
                                {suggestion.isAI ? "Tree.io" : suggestion.userName}
                              </span>
                              <p className="text-xs text-gray-500">
                                {suggestion.isAI ? "AI Assistant" : "Room Member"}
                              </p>
                            </div>
                          </motion.div>
                        ))}
                      </motion.div>
                    )}
                  </AnimatePresence>

                  <div className="flex space-x-3">
                    {/* Poll Button */}
                    {roomStatus !== "none" && (
                      <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                        <Button
                          onClick={() => setShowPollOptions(!showPollOptions)}
                          size="sm"
                          variant="outline"
                          className="border-gray-600/50 text-gray-400 hover:text-black hover:border-blue-500/50 rounded-xl px-3 py-3"
                        >
                          <Plus className="w-4 h-4" />
                        </Button>
                      </motion.div>
                    )}

                    <div className="flex-1 relative">
                      <Input
                        ref={inputRef}
                        value={newMessage}
                        onChange={handleMessageChange}
                        placeholder={roomStatus !== "none" ? "Type @Tree.io for AI help..." : "Chat with @Tree.io..."}
                        className="bg-gray-800/50 border-gray-600/50 text-white placeholder-gray-500 rounded-xl px-4 py-3 focus:border-orange-500/50 focus:ring-2 focus:ring-orange-500/20 transition-all"
                        onKeyPress={(e) => e.key === "Enter" && !showMentions && sendMessage()}
                      />
                      <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                        <div className="w-2 h-2 bg-orange-400 rounded-full animate-pulse"></div>
                      </div>
                    </div>
                    <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                      <Button
                        onClick={sendMessage}
                        size="sm"
                        className="bg-gradient-to-r from-yellow-400 to-orange-500 text-black hover:from-yellow-500 hover:to-orange-600 rounded-xl px-4 py-3 shadow-lg"
                      >
                        <Send className="w-4 h-4" />
                      </Button>
                    </motion.div>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}

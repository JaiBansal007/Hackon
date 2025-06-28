"use client"

import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "../../ui/button";
import { Input } from "../../ui/input";
import { X, MessageCircle, Users, Send, Plus, BarChart3, Check, Circle, Clock, TrendingUp, Eye, ChevronRight, Heart, Laugh, ThumbsUp, Angry, Frown, Smile, MessageSquare, List, Settings } from "lucide-react";
import pollsService from "../../../firebase/polls";

export function ChatSidebar({
  show,
  onClose,
  messages,
  onSendMessage,
  onTyping,
  typingUsers,
  roomStatus,
  roomMembers,
  user,
  polls,
  roomId,
  onReactionSend, // Add reaction callback
}) {
  const [newMessage, setNewMessage] = useState("");
  const [showMentions, setShowMentions] = useState(false);
  const [mentionSuggestions, setMentionSuggestions] = useState([]);
  const [cursorPosition, setCursorPosition] = useState(0);
  
  const [showCreatePoll, setShowCreatePoll] = useState(false);
  const [showPollOptions, setShowPollOptions] = useState(false);
  const [pollQuestion, setPollQuestion] = useState("");
  const [pollOptions, setPollOptions] = useState(["", ""]);
  const [allowMultipleSelection, setAllowMultipleSelection] = useState(false);
  const [showWhoVoted, setShowWhoVoted] = useState(false);
  const [allowPollClose, setAllowPollClose] = useState(true);
  const [pollsEnabled, setPollsEnabled] = useState(true);
  const [firebasePolls, setFirebasePolls] = useState({});
  const [isCreatingPoll, setIsCreatingPoll] = useState(false);
  const [showReactions, setShowReactions] = useState(false);
  const [reactionCooldown, setReactionCooldown] = useState(false);

  const inputRef = useRef(null);
  const messagesContainerRef = useRef(null);

  const scrollToBottom = (smooth = true) => {
    if (messagesContainerRef.current) {
      const scrollOptions = {
        top: messagesContainerRef.current.scrollHeight,
        behavior: smooth ? 'smooth' : 'auto'
      };
      messagesContainerRef.current.scrollTo(scrollOptions);
    }
  };

  useEffect(() => {
    if (!roomId || roomStatus === "none") return;
    setFirebasePolls({});
    const unsubscribe = pollsService.listenToPolls(roomId, (polls) => {
      setFirebasePolls(polls);
      if (Object.keys(polls).length > 0) {
        setTimeout(() => scrollToBottom(), 100);
      }
    });
    return () => {
      if (unsubscribe) {
        unsubscribe();
      }
    };
  }, [roomId, roomStatus]);

  useEffect(() => {
    if (messages.length > 0) {
      setTimeout(() => scrollToBottom(), 100);
    }
  }, [messages]);

  useEffect(() => {
    if (Object.keys(firebasePolls).length > 0) {
      setTimeout(() => scrollToBottom(), 100);
    }
  }, [firebasePolls]);

  useEffect(() => {
    return () => {
      pollsService.cleanup();
    };
  }, []);

  const PollMessage = ({ poll, onVote, currentUser }) => {
    const [votingFor, setVotingFor] = useState(null);
    const [showVoters, setShowVoters] = useState({});

    if (!poll || !poll.options) {
      return null;
    }

    const handleVote = async (optionId) => {
      if (votingFor) return;
      setVotingFor(optionId);
      try {
        await onVote(poll.id, optionId);
      } catch (error) {
        console.error("Error voting:", error);
      } finally {
        setTimeout(() => setVotingFor(null), 500);
      }
    };

    const totalVotes = poll.options.reduce((sum, option) => sum + (option.count || 0), 0);
    const currentUserVotes = poll.options.filter(option => 
      option.votes && option.votes.includes(currentUser)
    );

    const toggleVotersDisplay = (optionId) => {
      setShowVoters(prev => ({
        ...prev,
        [optionId]: !prev[optionId]
      }));
    };

    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="w-full max-w-sm mx-auto"
      >
        <div className="bg-gradient-to-br from-purple-500/10 via-blue-500/5 to-indigo-500/10 border border-purple-500/30 rounded-xl p-4 backdrop-blur-sm">
          <div className="flex items-start justify-between mb-3 min-h-[2.5rem]">
            <div className="flex items-center space-x-2 flex-1">
              <div className="w-8 h-8 bg-gradient-to-r from-purple-500 to-indigo-500 rounded-lg flex items-center justify-center flex-shrink-0">
                <BarChart3 className="w-4 h-4 text-white" />
              </div>
              <div className="flex-1 min-w-0">
                <h4 className="text-white font-semibold text-sm line-clamp-2 leading-tight">
                  {poll.question}
                </h4>
                <div className="flex items-center space-x-2 mt-1">
                  <span className="text-xs text-gray-400">
                    by {poll.createdBy}
                  </span>
                  {poll.isActive && (
                    <span className="inline-flex items-center px-1.5 py-0.5 rounded-full text-xs bg-green-500/20 text-green-400 border border-green-500/30">
                      <div className="w-1 h-1 bg-green-400 rounded-full mr-1 animate-pulse" />
                      Live
                    </span>
                  )}
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-2">
            {poll.options.map((option, index) => {
              const percentage = totalVotes > 0 ? Math.round((option.count / totalVotes) * 100) : 0;
              const hasVoted = currentUserVotes.some(vote => 
                vote.id === option.id || vote.id === index
              );
              const isVoting = votingFor === (option.id ?? index);

              return (
                <motion.div
                  key={option.id ?? index}
                  whileHover={{ scale: 1.01 }}
                  className="relative"
                >
                  <button
                    onClick={() => handleVote(option.id ?? index)}
                    disabled={isVoting || !poll.isActive}
                    className={`w-full p-3 rounded-lg border transition-all text-left relative overflow-hidden ${
                      hasVoted
                        ? "bg-blue-500/20 border-blue-400/50 text-blue-200"
                        : poll.isActive
                        ? "bg-gray-800/40 border-gray-600/50 hover:border-gray-500/70 text-gray-200 hover:bg-gray-700/30"
                        : "bg-gray-800/20 border-gray-600/30 text-gray-400 cursor-not-allowed"
                    }`}
                  >
                    {/* Progress Bar Background */}
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${percentage}%` }}
                      transition={{ duration: 0.6, ease: "easeOut" }}
                      className={`absolute inset-y-0 left-0 rounded-lg ${
                        hasVoted
                          ? "bg-gradient-to-r from-blue-500/30 to-purple-500/20"
                          : "bg-gradient-to-r from-gray-600/20 to-gray-700/10"
                      }`}
                    />

                    {/* Option Content */}
                    <div className="relative flex items-center justify-between">
                      <div className="flex items-center space-x-3 flex-1 min-w-0">
                        <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 ${
                          hasVoted
                            ? "bg-blue-500 text-white"
                            : "bg-gray-600 text-gray-300"
                        }`}>
                          {hasVoted ? (
                            <Check className="w-3 h-3" />
                          ) : (
                            String.fromCharCode(65 + index)
                          )}
                        </div>
                        <span className="text-sm font-medium truncate">
                          {option.text}
                        </span>
                        {isVoting && (
                          <div className="w-4 h-4 border border-white/30 border-t-white rounded-full animate-spin flex-shrink-0" />
                        )}
                      </div>
                      
                      <div className="flex items-center space-x-2 flex-shrink-0">
                        <span className="text-sm font-semibold">
                          {percentage}%
                        </span>
                        {option.count > 0 && poll.showWhoVoted && (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              toggleVotersDisplay(option.id ?? index);
                            }}
                            className="text-xs text-gray-400 hover:text-gray-300 underline"
                          >
                            {option.count} vote{option.count !== 1 ? 's' : ''}
                          </button>
                        )}
                      </div>
                    </div>

                    {/* Voters List */}
                    {poll.showWhoVoted && showVoters[option.id ?? index] && option.votes && option.votes.length > 0 && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        exit={{ opacity: 0, height: 0 }}
                        className="mt-2 pt-2 border-t border-gray-600/30"
                      >
                        <div className="flex flex-wrap gap-1">
                          {option.votes.map((voter, voterIndex) => (
                            <div
                              key={voterIndex}
                              className="inline-flex items-center space-x-1 bg-gray-700/50 rounded-full px-2 py-1"
                            >
                              <div className="w-4 h-4 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center">
                                <span className="text-xs text-white font-bold">
                                  {voter.charAt(0).toUpperCase()}
                                </span>
                              </div>
                              <span className="text-xs text-gray-300">{voter}</span>
                            </div>
                          ))}
                        </div>
                      </motion.div>
                    )}
                  </button>
                </motion.div>
              );
            })}
          </div>

          <div className="mt-3 pt-3 border-t border-gray-600/30 min-h-[1.5rem]">
            <div className="flex items-center justify-between text-xs text-gray-400">
              <div className="flex items-center space-x-4">
                <span>{totalVotes} vote{totalVotes !== 1 ? 's' : ''}</span>
                {poll.allowMultiple && (
                  <span className="text-blue-400">Multiple choice</span>
                )}
              </div>
              <div className="flex items-center space-x-2">
                {poll.createdAt && (
                  <span>{formatWhatsAppTime(poll.createdAt)}</span>
                )}
                {!poll.isActive && (
                  <span className="text-red-400">Closed</span>
                )}
              </div>
            </div>
          </div>
        </div>
      </motion.div>
    );
  };

  const handleMessageChange = (e) => {
    const value = e.target.value
    const position = e.target.selectionStart || 0
    setNewMessage(value)
    setCursorPosition(position)

    // Trigger typing indicator
    if (onTyping && value.trim() !== newMessage.trim()) {
      onTyping()
    }

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

  const formatWhatsAppTime = (timestamp) => {
    const now = new Date();
    let time;
    
    if (!timestamp) {
      time = now;
    } else if (typeof timestamp === 'string') {
      time = new Date(timestamp);
    } else if (timestamp.toDate) {
      time = timestamp.toDate();
    } else if (timestamp.seconds) {
      time = new Date(timestamp.seconds * 1000);
    } else {
      time = new Date(timestamp);
    }
    
    if (isNaN(time.getTime())) {
      return 'now';
    }
    
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const messageDate = new Date(time.getFullYear(), time.getMonth(), time.getDate());
    
    if (messageDate.getTime() === today.getTime()) {
      return time.toLocaleTimeString('en-US', { 
        hour: 'numeric', 
        minute: '2-digit',
        hour12: true 
      });
    } else if (messageDate.getTime() === today.getTime() - 86400000) {
      return 'Yesterday';
    } else if (now.getTime() - time.getTime() < 7 * 24 * 60 * 60 * 1000) {
      return time.toLocaleDateString('en-US', { weekday: 'short' });
    } else {
      return time.toLocaleDateString('en-US', { 
        month: 'short', 
        day: 'numeric' 
      });
    }
  };

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

  const createPoll = async () => {
    if (pollQuestion.trim() && pollOptions.filter((opt) => opt.trim()).length >= 2) {
      setIsCreatingPoll(true);
      
      try {
        const poll = {
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
          showWhoVoted: showWhoVoted,
          allowManualClose: allowPollClose,
          createdBy: user?.name || "User",
          createdAt: Date.now(),
          isActive: true,
        };

        // Save to Firebase if in a room
        if (roomId && roomStatus !== "none") {
          await pollsService.createPoll(roomId, poll, user?.uid, user?.name);
        }

        // Also send via WebSocket for immediate updates
        onSendMessage(`POLL:${JSON.stringify(poll)}`);

        // Auto-scroll after creating poll
        setTimeout(() => scrollToBottom(), 200);

        // Reset form
        setPollQuestion("");
        setPollOptions(["", ""]);
        setAllowMultipleSelection(false);
        setShowWhoVoted(false);
        setAllowPollClose(true);
        setShowCreatePoll(false);
        setShowPollOptions(false);
      } catch (error) {
        console.error("Error creating poll:", error);
        // Could add toast notification here
      } finally {
        setIsCreatingPoll(false);
      }
    }
  };

  const votePoll = async (pollId, optionId) => {
    // Handle both Firebase polls and legacy polls
    if (firebasePolls[pollId]) {
      // Firebase poll - handled by PollMessage component
      return;
    }
    
    // Legacy poll handling
    onSendMessage(`POLL_VOTE:${JSON.stringify({ pollId, optionId, voter: user?.name || "User" })}`);
  };

  const togglePollsEnabled = () => {
    if (roomStatus === "host") {
      setPollsEnabled(!pollsEnabled)
      onSendMessage(`POLL_SETTINGS:${JSON.stringify({ pollsEnabled: !pollsEnabled })}`)
    }
  }

  // Reaction functionality
  const reactions = [
    { emoji: "❤️", name: "love" },
    { emoji: "😂", name: "laugh" },
    { emoji: "👍", name: "like" },
    { emoji: "😊", name: "smile" },
    { emoji: "😢", name: "sad" },
    { emoji: "😠", name: "angry" },
  ];

  const handleReactionSend = (reaction) => {
    if (reactionCooldown) return;
    
    setReactionCooldown(true);
    setTimeout(() => setReactionCooldown(false), 1000); // 1 second cooldown
    
    // Send reaction through chat
    onSendMessage(`REACTION:${JSON.stringify({
      emoji: reaction.emoji,
      user: user?.name || "User",
      timestamp: Date.now()
    })}`);
    
    // Also call external reaction handler if provided (for video reactions)
    if (onReactionSend && roomStatus !== "none") {
      onReactionSend({
        emoji: reaction.emoji,
        user: user?.name || "User",
        id: Date.now()
      });
    }
    
    setShowReactions(false);
  };

  const renderMessageWithMentions = (text) => {
    // Handle poll messages
    if (text.startsWith("POLL:")) {
      try {
        const poll = JSON.parse(text.substring(5))
        // Use the latest poll data from props.polls if available, otherwise use Firebase polls
        const latestPoll = (polls && polls[poll.id]) ? polls[poll.id] : poll
        return <PollMessage poll={latestPoll} onVote={votePoll} currentUser={user?.name} />
      } catch (e) {
        return text
      }
    }

    // Handle reaction messages
    if (text.startsWith("REACTION:")) {
      try {
        const reaction = JSON.parse(text.substring(9))
        return (
          <div className="flex items-center space-x-2 bg-gradient-to-r from-orange-500/10 to-yellow-500/10 border border-orange-500/20 rounded-lg p-2">
            <span className="text-2xl">{reaction.emoji}</span>
            <div>
              <span className="text-orange-400 font-medium text-xs">
                {reaction.user} reacted
              </span>
              <p className="text-gray-400 text-xs">
                {formatWhatsAppTime(reaction.timestamp)}
              </p>
            </div>
          </div>
        )
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
      
      // Auto-scroll after sending message
      setTimeout(() => scrollToBottom(), 100);

      if (messageText.includes("@Tree.io")) {
        try {
          setTimeout(() => {
            onSendMessage("Tree.io is thinking...")
            // Auto-scroll for AI thinking message
            setTimeout(() => scrollToBottom(), 100);
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
              // Auto-scroll for AI response
              setTimeout(() => scrollToBottom(), 100);
            }, 1500)
          } else {
            setTimeout(() => {
              onSendMessage(
                "Tree.io: Sorry, I'm having trouble processing your request right now. Please try again later.",
              )
              // Auto-scroll for error message
              setTimeout(() => scrollToBottom(), 100);
            }, 1500)
          }
        } catch (error) {
          console.error("Error calling Tree.io API:", error)

          setTimeout(() => {
            onSendMessage("Tree.io: Sorry, I'm currently unavailable. Please try again later.")
            // Auto-scroll for error message
            setTimeout(() => scrollToBottom(), 100);
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
          />            <motion.div            initial={{ x: 320 }}
            animate={{ x: 0 }}
            exit={{ x: 320 }}
              className="fixed right-0 top-0 h-full w-80 bg-gradient-to-b from-gray-900/95 to-black/95 backdrop-blur-xl border-l border-gray-700/20 z-50 shadow-2xl"
            >
            <div className="flex flex-col h-full">                <div className="p-2 border-b border-gray-700/20 bg-gray-800/30">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-1.5">
                      <div className="w-1 h-1 bg-green-400 rounded-full"></div>
                      <h3 className="text-sm font-semibold text-white">
                        {roomStatus !== "none" ? "Room Chat" : "AI Assistant"}
                      </h3>
                    </div>
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={onClose}
                      className="text-gray-400 hover:text-white p-0.5 rounded-full transition-colors"
                    >
                      <X className="w-3 h-3" />
                    </motion.button>
                  </div>
                  {roomStatus !== "none" && (
                    <div className="text-xs text-gray-400 mt-0.5 flex items-center space-x-1">
                      <Users className="w-2 h-2" />
                      <span>{roomMembers.length} online</span>
                    </div>
                  )}
                </div>

              <div 
                ref={messagesContainerRef}
                className="flex-1 overflow-y-auto custom-scrollbar"
                style={{ scrollBehavior: 'smooth' }}
              >
                {/* Firebase Polls Section - Enhanced */}
                {Object.keys(firebasePolls).length > 0 && (
                  <motion.div 
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="p-2 border-b border-gray-700/20 bg-gradient-to-r from-blue-500/5 to-purple-500/5"
                  >
                    <div className="flex items-center space-x-1 mb-1.5">
                      <div className="w-3 h-3 bg-gradient-to-r from-blue-500 to-purple-500 rounded-lg flex items-center justify-center">
                        <TrendingUp className="w-2.5 h-2.5 text-white" />
                      </div>
                      <span className="text-xs font-semibold text-white">Live Polls</span>
                      <div className="flex items-center space-x-0.5">
                        <div className="w-1 h-1 bg-green-400 rounded-full animate-pulse" />
                        <span className="text-xs text-green-400 font-medium">Active</span>
                      </div>
                    </div>
                    <AnimatePresence mode="popLayout">
                      {Object.values(firebasePolls)
                        .filter(poll => poll.isActive)
                        .slice(0, 2) // Show up to 2 active polls
                        .map((poll) => (
                          <motion.div
                            key={poll.id}
                            layout
                            initial={{ opacity: 0, scale: 0.95, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95, y: -20 }}
                            transition={{ duration: 0.3, ease: "easeOut" }}
                            className="mb-1.5 last:mb-0"
                          >
                            <PollMessage 
                              poll={poll} 
                              onVote={votePoll} 
                              currentUser={user?.name} 
                            />
                          </motion.div>
                        ))}
                    </AnimatePresence>
                  </motion.div>
                )}

                {/* Messages Section - Enhanced */}
                <div className="p-3 space-y-3">
                  {messages.length === 0 ? (
                    <motion.div 
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="text-center text-gray-500 mt-4"
                    >
                      <div className="w-10 h-10 bg-gray-800/50 rounded-full flex items-center justify-center mx-auto mb-2">
                        <MessageCircle className="w-5 h-5 text-gray-400" />
                      </div>
                      <p className="text-sm font-medium">
                        {roomStatus !== "none"
                          ? "No messages yet"
                          : "Chat with @Tree.io"}
                      </p>
                      <p className="text-xs text-gray-600 mt-1">
                        {roomStatus !== "none"
                          ? "Start the conversation"
                          : "Your AI-powered movie assistant"}
                      </p>
                    </motion.div>
                  ) : (
                    <AnimatePresence mode="popLayout">
                      {messages.map((message, index) => (
                        <motion.div
                          key={message.id}
                          layout
                          initial={{ opacity: 0, y: 20, scale: 0.95 }}
                          animate={{ opacity: 1, y: 0, scale: 1 }}
                          transition={{ 
                            duration: 0.3, 
                            ease: "easeOut",
                            delay: index * 0.05 // Stagger animation
                          }}
                          className="text-sm"
                        >
                          {message.isSystem ? (
                            <div className="text-center">
                              <span className="text-xs text-gray-400 bg-gray-800/40 px-2 py-1 rounded-full border border-gray-700/30">
                                {message.text}
                              </span>
                            </div>
                          ) : (
                            <div className="space-y-1.5">
                              {/* Message Header - Enhanced */}
                              <div className="flex items-center space-x-2 mb-1">
                                <motion.div
                                  whileHover={{ scale: 1.05 }}
                                  className={`w-4 h-4 rounded-full flex items-center justify-center text-xs font-bold shadow-lg ${
                                    message.user === "Tree.io" || message.text.startsWith("Tree.io:")
                                      ? "bg-gradient-to-r from-orange-500 to-red-500 text-white"
                                      : "bg-gradient-to-r from-blue-500 to-purple-500 text-white"
                                  }`}
                                >
                                  {message.user === "Tree.io" || message.text.startsWith("Tree.io:")
                                    ? "AI"
                                    : message.user.charAt(0).toUpperCase()}
                                </motion.div>
                                <span
                                  className={`font-semibold text-xs ${
                                    message.user === "Tree.io" || message.text.startsWith("Tree.io:")
                                      ? "text-orange-300"
                                      : "text-blue-300"
                                  }`}
                                >
                                  {message.user === "Tree.io" || message.text.startsWith("Tree.io:")
                                    ? "Tree.io"
                                    : message.user}
                                </span>
                                <span className="text-xs text-gray-400 bg-gray-800/30 px-1 py-0.5 rounded-full">
                                  {formatWhatsAppTime(message.timestamp)}
                                </span>
                              </div>
                              
                              {/* Message Content - Enhanced */}
                              <div className="ml-5 text-gray-100 text-xs leading-relaxed bg-gray-800/20 rounded-lg p-2 border border-gray-700/20">
                                {renderMessageWithMentions(
                                  message.text.startsWith("Tree.io:") ? message.text.substring(8) : message.text,
                                )}
                              </div>
                            </div>
                          )}
                        </motion.div>
                      ))}
                    </AnimatePresence>
                  )}
                </div>
              </div>

              {/* Typing Indicator */}
              {typingUsers && typingUsers.length > 0 && (
                <div className="px-4 py-2 text-sm text-gray-500 italic">
                  {typingUsers.length === 1 
                    ? `Someone is typing...`
                    : `${typingUsers.length} people are typing...`}
                </div>
              )}

              {/* Live Reactions Summary */}
              {roomStatus !== "none" && (
                <motion.div 
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="px-3 py-2 border-t border-gray-700/20 bg-gradient-to-r from-orange-500/5 to-yellow-500/5"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-1">
                      <Heart className="w-3 h-3 text-orange-400" />
                      <span className="text-xs text-orange-400 font-medium">Live Reactions</span>
                    </div>
                    <div className="flex items-center space-x-0.5">
                      {reactions.slice(0, 4).map((reaction) => (
                        <div
                          key={reaction.name}
                          className="text-xs transition-transform"
                          title={`${reaction.emoji} reactions`}
                        >
                          {reaction.emoji}
                        </div>
                      ))}
                    </div>
                  </div>
                </motion.div>
              )}

              <div className="p-2 border-t border-gray-700/20 bg-gray-800/20">
                {/* Host Settings - Enhanced */}
                {roomStatus === "host" && (
                  <motion.div 
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    className="mb-2 p-2.5 bg-gradient-to-r from-purple-500/10 to-blue-500/10 rounded-lg border border-purple-500/20 backdrop-blur-sm"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <div className="w-6 h-6 bg-gradient-to-r from-purple-500 to-blue-500 rounded-lg flex items-center justify-center">
                          <BarChart3 className="w-3 h-3 text-white" />
                        </div>
                        <div>
                          <span className="text-xs font-medium text-white">Poll Permissions</span>
                          <p className="text-xs text-gray-400">Allow members to create polls</p>
                        </div>
                      </div>
                      <button
                        onClick={togglePollsEnabled}
                        className={`relative inline-flex h-5 w-9 items-center rounded-full transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-gray-800 ${
                          pollsEnabled ? "bg-blue-600 shadow-lg shadow-blue-500/25" : "bg-gray-600"
                        }`}
                      >
                        <span
                          className={`inline-block h-3 w-3 transform rounded-full bg-white transition-all duration-300 ${
                            pollsEnabled ? "translate-x-5 scale-110" : "translate-x-1"
                          }`}
                        />
                      </button>
                    </div>
                    {pollsEnabled && (
                      <motion.div 
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="mt-2 pt-2 border-t border-purple-500/20"
                      >
                        <div className="flex items-center space-x-1 text-xs text-green-400">
                          <div className="w-1 h-1 bg-green-400 rounded-full animate-pulse" />
                          <span>Polls enabled for all members</span>
                        </div>
                      </motion.div>
                    )}
                  </motion.div>
                )}

                {showCreatePoll && (roomStatus === "host" || pollsEnabled) && (
                  <motion.div 
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    className="mb-2 bg-gray-800/60 rounded-lg border border-gray-600/40 backdrop-blur-sm max-h-96 overflow-y-auto"
                  >
                    <div className="p-3 space-y-3">
                      <div className="flex items-center justify-between">
                        <h4 className="text-white font-semibold text-sm">Create Poll</h4>
                        <button
                          onClick={() => {
                            setShowCreatePoll(false)
                            setShowPollOptions(false)
                            setPollQuestion("")
                            setPollOptions(["", ""])
                            setAllowMultipleSelection(false)
                            setShowWhoVoted(false)
                            setAllowPollClose(true)
                          }}
                          className="text-gray-400 hover:text-white"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>

                      <div>
                        <input
                          type="text"
                          placeholder="What's your question?"
                          value={pollQuestion}
                          onChange={(e) => setPollQuestion(e.target.value)}
                          className="w-full p-2 bg-gray-700/50 border border-gray-600/50 rounded-lg text-white placeholder-gray-400 focus:border-blue-400/50 text-sm"
                        />
                        <div className="flex gap-1 mt-1">
                          {["Favorite genre?", "Rate this scene", "What's next?"].map((t, i) => (
                            <button
                              key={i}
                              onClick={() => setPollQuestion(t)}
                              className="text-xs bg-blue-500/20 text-blue-400 px-2 py-1 rounded hover:bg-blue-500/30"
                            >
                              {t}
                            </button>
                          ))}
                        </div>
                      </div>

                      <div>
                        {pollOptions.map((option, index) => (
                          <div key={index} className="flex items-center space-x-2 mb-2">
                            <div className="w-5 h-5 bg-gradient-to-r from-blue-500 to-purple-500 rounded text-xs text-white font-bold flex items-center justify-center">
                              {String.fromCharCode(65 + index)}
                            </div>
                            <input
                              type="text"
                              placeholder={`Option ${index + 1}`}
                              value={option}
                              onChange={(e) => updatePollOption(index, e.target.value)}
                              className="flex-1 p-1.5 bg-gray-700/50 border border-gray-600/50 rounded text-white placeholder-gray-400 text-sm"
                            />
                            {pollOptions.length > 2 && (
                              <button
                                onClick={() => removePollOption(index)}
                                className="text-red-400 hover:text-red-300 p-1"
                              >
                                <X className="w-3 h-3" />
                              </button>
                            )}
                          </div>
                        ))}
                        
                        {pollOptions.length < 6 && (
                          <button
                            onClick={addPollOption}
                            className="flex items-center space-x-1 text-blue-400 hover:text-blue-300 text-sm py-1 px-2 hover:bg-blue-400/10 rounded border border-dashed border-blue-400/30"
                          >
                            <Plus className="w-3 h-3" />
                            <span>Add Option</span>
                          </button>
                        )}
                      </div>

                      <div className="flex space-x-4 text-sm">
                        <label className="flex items-center space-x-2">
                          <input
                            type="checkbox"
                            checked={allowMultipleSelection}
                            onChange={(e) => setAllowMultipleSelection(e.target.checked)}
                            className="rounded bg-gray-700 border-gray-600"
                          />
                          <span className="text-gray-300">Multiple choice</span>
                        </label>
                        <label className="flex items-center space-x-2">
                          <input
                            type="checkbox"
                            checked={showWhoVoted}
                            onChange={(e) => setShowWhoVoted(e.target.checked)}
                            className="rounded bg-gray-700 border-gray-600"
                          />
                          <span className="text-gray-300">Show voters</span>
                        </label>
                      </div>

                      <div className="flex space-x-2">
                        <button
                          onClick={createPoll}
                          disabled={!pollQuestion.trim() || pollOptions.filter(opt => opt.trim()).length < 2 || isCreatingPoll}
                          className="flex-1 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 disabled:from-gray-600 disabled:to-gray-600 text-white py-2 px-3 rounded-lg font-medium text-sm flex items-center justify-center space-x-2"
                        >
                          {isCreatingPoll ? (
                            <>
                              <div className="w-3 h-3 border border-white/30 border-t-white rounded-full animate-spin" />
                              <span>Creating...</span>
                            </>
                          ) : (
                            <>
                              <BarChart3 className="w-3 h-3" />
                              <span>Create</span>
                            </>
                          )}
                        </button>
                      </div>
                    </div>
                  </motion.div>
                )}

                {/* Poll Options Menu - Enhanced */}
                {showPollOptions && (
                  <motion.div 
                    initial={{ opacity: 0, scale: 0.95, y: 10 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95, y: 10 }}
                    transition={{ duration: 0.2, ease: "easeOut" }}
                    className="mb-2 overflow-hidden"
                  >
                    <div className="bg-gradient-to-br from-blue-500/15 via-purple-500/10 to-indigo-500/15 rounded-2xl border border-blue-400/40 backdrop-blur-lg shadow-2xl">
                      {/* Header */}
                      <div className="bg-gradient-to-r from-blue-600/60 to-purple-600/60 p-3 border-b border-blue-400/20">
                        <div className="flex items-center space-x-2">
                          <motion.div 
                            whileHover={{ rotate: 15 }}
                            className="w-6 h-6 bg-white/20 rounded-lg flex items-center justify-center backdrop-blur-sm"
                          >
                            <BarChart3 className="w-3 h-3 text-white" />
                          </motion.div>
                          <span className="text-white font-semibold text-sm">Poll Options</span>
                        </div>
                      </div>
                      
                      {/* Create Poll Button */}
                      <div className="p-3">
                        <motion.button
                          whileHover={{ scale: 1.02, y: -1 }}
                          whileTap={{ scale: 0.98 }}
                          onClick={() => {
                            if (roomStatus === "host" || pollsEnabled) {
                              setShowCreatePoll(true)
                              setShowPollOptions(false)
                            }
                          }}
                          disabled={roomStatus !== "host" && !pollsEnabled}
                          className={`w-full p-4 rounded-xl transition-all ${
                            roomStatus === "host" || pollsEnabled
                              ? "bg-gradient-to-r from-blue-500/20 to-purple-500/20 hover:from-blue-500/30 hover:to-purple-500/30 text-white border-2 border-blue-400/30 hover:border-blue-400/50 shadow-lg hover:shadow-blue-500/20"
                              : "bg-gray-700/30 text-gray-500 cursor-not-allowed border-2 border-gray-600/20"
                          } backdrop-blur-sm`}
                        >
                          <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-3">
                              <motion.div 
                                whileHover={roomStatus === "host" || pollsEnabled ? { scale: 1.1, rotate: 5 } : {}}
                                className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                                  roomStatus === "host" || pollsEnabled
                                    ? "bg-gradient-to-r from-blue-500 to-purple-500 shadow-lg"
                                    : "bg-gray-600"
                                }`}
                              >
                                <BarChart3 className="w-6 h-6 text-white" />
                              </motion.div>
                              <div className="text-left">
                                <div className="font-semibold text-base">Create New Poll</div>
                                <p className="text-sm opacity-80 mt-0.5">
                                  {roomStatus === "host" || pollsEnabled 
                                    ? "Ask your audience an interactive question"
                                    : "Polls are currently disabled by the host"
                                  }
                                </p>
                              </div>
                            </div>
                            {(roomStatus === "host" || pollsEnabled) && (
                              <motion.div
                                whileHover={{ x: 3 }}
                                transition={{ duration: 0.2 }}
                              >
                                <ChevronRight className="w-5 h-5 text-blue-400" />
                              </motion.div>
                            )}
                          </div>
                        </motion.button>
                      </div>
                    </div>
                  </motion.div>
                )}

                <div className="relative">
                  {/* Mention suggestions */}
                  <AnimatePresence>
                    {showMentions && mentionSuggestions.length > 0 && (
                      <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 10 }}
                        className="absolute bottom-full left-0 right-0 bg-gray-800/95 border border-gray-600/50 rounded-lg mb-1 max-h-32 overflow-y-auto shadow-xl"
                      >
                        {mentionSuggestions.map((suggestion) => (
                          <div
                            key={`mention-${suggestion.id}`}
                            onClick={() => insertMention(suggestion)}
                            className="p-1.5 cursor-pointer flex items-center space-x-1.5 hover:bg-gray-700/50 transition-colors"
                          >
                            <div
                              className={`w-4 h-4 rounded-full flex items-center justify-center text-xs font-bold ${
                                suggestion.isAI
                                  ? "bg-orange-500 text-white"
                                  : "bg-blue-500 text-white"
                              }`}
                            >
                              {suggestion.isAI ? "AI" : suggestion.userName?.charAt(0).toUpperCase()}
                            </div>
                            <div>
                              <span className={`font-medium text-xs ${suggestion.isAI ? "text-orange-400" : "text-blue-400"}`}>
                                {suggestion.isAI ? "Tree.io" : suggestion.userName}
                              </span>
                              <p className="text-xs text-gray-500">
                                {suggestion.isAI ? "AI Assistant" : "Room Member"}
                              </p>
                            </div>
                          </div>
                        ))}
                      </motion.div>
                    )}
                  </AnimatePresence>

                  {/* Reaction Panel */}
                  <AnimatePresence>
                    {showReactions && roomStatus !== "none" && (
                      <motion.div
                        initial={{ opacity: 0, y: 10, scale: 0.9 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 10, scale: 0.9 }}
                        className="absolute bottom-full left-0 right-0 mb-2 bg-gray-900/95 border border-gray-600/50 rounded-xl p-3 shadow-2xl backdrop-blur-sm"
                      >
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-xs font-medium text-gray-300">Quick Reactions</span>
                          <button
                            onClick={() => setShowReactions(false)}
                            className="text-gray-400 hover:text-gray-300 p-0.5 rounded-full hover:bg-gray-700/50 transition-all"
                          >
                            <X className="w-3 h-3" />
                          </button>
                        </div>
                        <div className="grid grid-cols-6 gap-2">
                          {reactions.map((reaction, index) => (
                            <motion.button
                              key={reaction.name}
                              onClick={() => handleReactionSend(reaction)}
                              disabled={reactionCooldown}
                              whileHover={{ scale: 1.1 }}
                              whileTap={{ scale: 0.9 }}
                              initial={{ opacity: 0, scale: 0 }}
                              animate={{ opacity: 1, scale: 1 }}
                              transition={{ delay: index * 0.05 }}
                              className={`w-10 h-10 rounded-lg bg-gray-800/80 hover:bg-gray-700/80 text-2xl p-0 border border-transparent hover:border-orange-400/50 transition-all duration-200 ${
                                reactionCooldown ? 'opacity-50 cursor-not-allowed' : 'hover:shadow-lg hover:shadow-orange-400/25'
                              }`}
                            >
                              {reaction.emoji}
                            </motion.button>
                          ))}
                        </div>
                        <div className="mt-2 text-xs text-gray-400 text-center">
                          {reactionCooldown ? "Please wait..." : "React to the current moment"}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>

                  {/* Input area - Enhanced WhatsApp style */}
                  <div className="flex space-x-2">
                    {/* Poll Button - Enhanced */}
                    {roomStatus !== "none" && (
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => setShowPollOptions(!showPollOptions)}
                        className={`p-2 rounded-full transition-all shadow-lg ${
                          showPollOptions 
                            ? "bg-blue-500/30 text-blue-300 shadow-blue-500/20" 
                            : "text-gray-400 hover:text-blue-400 hover:bg-blue-500/10 hover:shadow-blue-500/10"
                        }`}
                      >
                        <BarChart3 className="w-4 h-4" />
                      </motion.button>
                    )}

                    {/* Reaction Button - New */}
                    {roomStatus !== "none" && (
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => setShowReactions(!showReactions)}
                        disabled={reactionCooldown}
                        className={`p-2 rounded-full transition-all shadow-lg ${
                          showReactions 
                            ? "bg-orange-500/30 text-orange-300 shadow-orange-500/20" 
                            : reactionCooldown
                            ? "text-gray-500 cursor-not-allowed"
                            : "text-gray-400 hover:text-orange-400 hover:bg-orange-500/10 hover:shadow-orange-500/10"
                        }`}
                      >
                        <Heart className="w-4 h-4" />
                      </motion.button>
                    )}

                    <div className="flex-1 relative">
                      <Input
                        ref={inputRef}
                        value={newMessage}
                        onChange={handleMessageChange}
                        placeholder={roomStatus !== "none" ? "Type @Tree.io for AI help..." : "Chat with @Tree.io..."}
                        className="bg-gray-800/60 border-gray-600/50 text-white placeholder-gray-500 rounded-xl px-3 py-2 pr-10 focus:border-blue-500/60 focus:ring-2 focus:ring-blue-500/20 transition-all text-sm shadow-lg backdrop-blur-sm"
                        onKeyPress={(e) => e.key === "Enter" && !showMentions && sendMessage()}
                      />
                    </div>
                    
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={sendMessage}
                      disabled={!newMessage.trim()}
                      className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 disabled:from-gray-600 disabled:to-gray-600 disabled:cursor-not-allowed text-white rounded-xl p-2 transition-all shadow-lg disabled:shadow-none"
                    >
                      <Send className="w-4 h-4" />
                    </motion.button>
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

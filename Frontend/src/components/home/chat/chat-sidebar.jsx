"use client"
import React from "react";
import { useState, useRef, useEffect, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "../../ui/button";
import { Input } from "../../ui/input";
import { X, MessageCircle, Users, Send, Plus, BarChart3, Check, Circle, Clock, TrendingUp, Eye, ChevronRight, Heart, Laugh, ThumbsUp, Angry, Frown, Smile, MessageSquare, List, Settings, Calendar, PartyPopper, ExternalLink, MoreVertical } from "lucide-react";
import pollsService from "../../../firebase/polls";
import { Dialog } from "@headlessui/react";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import ReactDOM from "react-dom";

export function ChatSidebar({
  show,
  onClose,
  messages,
  onSendMessage,
  onVote,
  onTyping,
  typingUsers,
  roomStatus,
  roomMembers,
  user,
  polls,
  roomId,
  onReactionSend, // Add reaction callback
  onJoinRoom, // Add room joining callback
  currentMovie, // Add current movie for party scheduling
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
  const [showPartyManager, setShowPartyManager] = useState(false);
  const [showTreeioPopup, setShowTreeioPopup] = useState(false);
  const [treeioStartTime, setTreeioStartTime] = useState(null);
  const [treeioEndTime, setTreeioEndTime] = useState(null);
  const [treeioPopupPosition, setTreeioPopupPosition] = useState({ left: 0, bottom: 0 });
  const [mentionDropdownPos, setMentionDropdownPos] = useState({ left: 0, bottom: 0, width: 0 });
  const [inputFocused, setInputFocused] = useState(false);
  const [showMoreActions, setShowMoreActions] = useState(false);

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

  const PollMessage = ({ poll, onVote, currentUser, currentUserId }) => {
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

    const totalVotes = poll.options.reduce((sum, option) => sum + (option.count || (option.votes ? option.votes.length : 0)), 0);
    // Use userId for vote tracking
    const currentUserVotes = poll.options.filter(option => 
      (option.votes && option.votes.includes(currentUserId))
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
        <div className="bg-gradient-to-br from-cyan-500/10 via-blue-500/5 to-teal-500/10 border border-cyan-500/30 rounded-xl p-4 backdrop-blur-sm">
          <div className="flex items-start justify-between mb-3 min-h-[2.5rem]">
            <div className="flex items-center space-x-2 flex-1">
              <div className="w-8 h-8 bg-gradient-to-r from-cyan-500 to-teal-500 rounded-lg flex items-center justify-center flex-shrink-0">
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
              const percentage = totalVotes > 0 ? Math.round(((option.count || (option.votes ? option.votes.length : 0)) / totalVotes) * 100) : 0;
              // Use userId for vote highlighting
              const hasVoted = option.votes && option.votes.includes(currentUserId);
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
                          ? "bg-gradient-to-r from-blue-500/30 to-cyan-500/20"
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
                        {(option.count > 0 || (option.votes && option.votes.length > 0)) && poll.showWhoVoted && (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              toggleVotersDisplay(option.id ?? index);
                            }}
                            className="text-xs text-gray-400 hover:text-gray-300 underline"
                          >
                            {(option.count || (option.votes ? option.votes.length : 0))} vote{(option.count || (option.votes ? option.votes.length : 0)) !== 1 ? 's' : ''}
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
                          {option.voterDetails && option.voterDetails.length > 0
                            ? option.voterDetails.map((voter, voterIndex) => (
                                <div
                                  key={voterIndex}
                                  className="inline-flex items-center space-x-1 bg-gray-700/50 rounded-full px-2 py-1"
                                >
                                  <div className="w-4 h-4 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center">
                                    <span className="text-xs text-white font-bold">
                                      {voter.userName?.charAt(0).toUpperCase()}
                                    </span>
                                  </div>
                                  <span className="text-xs text-gray-300">{voter.userName}</span>
                                </div>
                              ))
                            : option.votes.map((voter, voterIndex) => (
                                <div
                                  key={voterIndex}
                                  className="inline-flex items-center space-x-1 bg-gray-700/50 rounded-full px-2 py-1"
                                >
                                  <div className="w-4 h-4 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center">
                                    <span className="text-xs text-white font-bold">
                                      {typeof voter === 'string' ? voter.charAt(0).toUpperCase() : ''}
                                    </span>
                                  </div>
                                  <span className="text-xs text-gray-300">{typeof voter === 'string' ? voter : ''}</span>
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

  useEffect(() => {
    if (showMentions && inputRef.current) {
      const rect = inputRef.current.getBoundingClientRect();
      setMentionDropdownPos({
        left: rect.left,
        bottom: window.innerHeight - rect.top + 8,
        width: rect.width
      });
    }
  }, [showMentions, newMessage, inputFocused]);

  const handleMessageChange = (e) => {
    const value = e.target.value;
    const position = e.target.selectionStart || 0;
    setNewMessage(value);
    setCursorPosition(position)
    if (showTreeioPopup) setShowTreeioPopup(false);

    // Trigger typing indicator
    if (onTyping && value.trim() !== newMessage.trim()) {
      onTyping()
    }

    // Only show mentions if the last character typed is '@' or if the cursor is after an '@' with no space in between
    const textBeforeCursor = value.substring(0, position)
    const lastAtIndex = textBeforeCursor.lastIndexOf("@")
    const afterAt = textBeforeCursor.substring(lastAtIndex + 1)
    if (
      lastAtIndex !== -1 &&
      (lastAtIndex === 0 || textBeforeCursor[lastAtIndex - 1] === " ") &&
      !afterAt.includes(" ")
    ) {
      let allSuggestions = [
        { id: "tree", name: "Tree.io", isAI: true },
        ...roomMembers.map((member) => ({ id: member.uid || member.userName, name: member.name || member.userName, isAI: false }))
      ]
      if (afterAt.length > 0) {
        const searchTerm = afterAt.toLowerCase()
        allSuggestions = [
          { id: "tree", name: "Tree.io", isAI: true },
          ...roomMembers
            .filter((member) => (member.name || member.userName || "").toLowerCase().includes(searchTerm))
            .map((member) => ({ id: member.uid || member.userName, name: member.name || member.userName, isAI: false })),
        ]
      }
      setMentionSuggestions(allSuggestions)
      setShowMentions(true)
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
    if (mention.isAI) {
      setShowMentions(false);
      setShowTreeioPopup(true);
      // Insert @Tree.io in input field
      const lastAtIndex = newMessage.lastIndexOf("@", cursorPosition - 1);
      const beforeMention = newMessage.substring(0, lastAtIndex);
      const afterMention = newMessage.substring(cursorPosition);
      const mentionText = `@Tree.io`;
      setNewMessage(beforeMention + mentionText + " " + afterMention);
      setTimeout(() => inputRef.current?.focus(), 100);
      return;
    }
    const lastAtIndex = newMessage.lastIndexOf("@", cursorPosition - 1)
    const beforeMention = newMessage.substring(0, lastAtIndex)
    const afterMention = newMessage.substring(cursorPosition)
    const mentionText = `@${mention.name}`

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
    if (firebasePolls[pollId]) {
      // Firebase poll - call backend
      try {
        await pollsService.votePoll(roomId, pollId, optionId, user?.uid, user?.name, user?.photoURL)
      } catch (e) {
        console.error("Error voting on Firebase poll:", e)
      }
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
    // if (onReactionSend && roomStatus !== "none") {
    //   onReactionSend({
    //     emoji: reaction.emoji,
    //     user: user?.name || "User",
    //     id: Date.now()
    //   });
    // }
    
    setShowReactions(false);
  };

  const renderMessageWithMentions = (text, message) => {
    // Handle poll messages
    if (text.startsWith("POLL:")) {
      try {
        const poll = JSON.parse(text.substring(5));
        if (isPollInFirebasePolls(poll.id)) return null;
        const latestPoll = (polls && polls[poll.id]) ? polls[poll.id] : poll;
        return <MemoizedPollMessage poll={latestPoll} onVote={votePoll} currentUser={user?.name} currentUserId={user?.uid} />;
      } catch (e) {
        return text;
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
              <span className="text-cyan-400 font-medium text-xs">
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
    // Special handling for Tree.io hardcoded response with <b> tags
    if ((message.user === "Tree.io" || message.text.startsWith("Tree.io:")) && text.includes("<b>")) {
      // Replace \n with <br> for line breaks
      const html = text.replace(/\n/g, '<br>');
      return <span dangerouslySetInnerHTML={{ __html: html }} />;
    }
    const parts = text.split(/(@\w+(?:\.\w+)?)/g)
    return parts.map((part, index) => {
      if (part.startsWith("@")) {
        const isTreeIO = part === "@Tree.io"
        return (
          <span key={index} className={`font-semibold ${isTreeIO ? "text-cyan-400" : "text-blue-400"}`}>
            {part}
          </span>
        )
      }
      return part
    })
  }

  // Place these before your component return (inside ChatSidebar)
  const movieStartTime = useMemo(() => {
    const d = new Date();
    d.setHours(0, 0, 0, 0);
    return d;
  }, []);
  const movieEndTime = useMemo(() => {
    const d = new Date();
    d.setHours(0, 11, 0, 0); // 10 minutes, 56 seconds
    return d;
  }, []);

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

          // Hardcoded response after 9 seconds
          setTimeout(() => {
            const hardcodedResponse = `Alright, let's break down this intriguing scene from "Elephants Dream" – get ready for a wild ride! 

- **00:00-00:30**: We're thrown into a surreal world as the title card appears, followed by a character named Proog giving a slightly unhinged tour, emphasizing how "safe" everything is... right before things get chaotic! 

- **00:30-01:00**: Action! Emo is attacked, there's a bizarre machine gun, and Proog seems surprisingly unfazed, more concerned with whether Emo is hurt. "It's not safe here," he says, after just insisting everything was safe. 

- **01:00-01:30**: The duo is on the run, navigating a strange, icy platform filled with wires and bizarre technology. Proog urges Emo to follow, hinting at what's to come. 

- **01:30-02:00**: The chase intensifies, with robotic birds joining the fray! Proog and Emo are separated, emphasizing Emo's vulnerability and the dangers of this bizarre world.`;
            
            onSendMessage(`Tree.io: ${hardcodedResponse}`);
            // Auto-scroll for AI response
            setTimeout(() => scrollToBottom(), 100);
          }, 9000); // 9 seconds delay

          // Remove the incomplete response code
          // const response = 

          // Remove the response.ok check and replace with the hardcoded logic above
        } catch (error) {
          console.error("Error calling Tree.io API:", error)

          // setTimeout(() => {
          //   onSendMessage("Tree.io: Sorry, I'm currently unavailable. Please try again later.")
          //   // Auto-scroll for error message
          //   setTimeout(() => scrollToBottom(), 100);
          // }, 1500)
        }
      }

      setNewMessage("")
    }
  }

  // Memoize PollMessage to avoid unnecessary re-renders
  const MemoizedPollMessage = useMemo(() => React.memo(PollMessage), []);

  // Helper to check if a poll is already shown in firebasePolls (Live Polls)
  const isPollInFirebasePolls = (pollId) => {
    return firebasePolls && firebasePolls[pollId];
  };

  // Tree.io Summarize popup apply handler
  const handleTreeioApply = async () => {
    if (treeioStartTime && treeioEndTime) {
      const pad = (n) => n.toString().padStart(2, '0');
      const start = `${pad(treeioStartTime.getMinutes())}:${pad(treeioStartTime.getSeconds())}`;
      const end = `${pad(treeioEndTime.getMinutes())}:${pad(treeioEndTime.getSeconds())}`;
      setShowTreeioPopup(false);
      setNewMessage("");
      // 1. Send the summarize message
      const summarizeMsg = `@Tree.io Summarize this from ${start} to ${end}`;
      onSendMessage(summarizeMsg);
      setTimeout(() => scrollToBottom(), 100);
      // 2. Show 'Tree.io is thinking...'
      setTimeout(() => {
        onSendMessage("Tree.io is thinking...");
        setTimeout(() => scrollToBottom(), 100);
      }, 200);
      // 3. After 9 seconds, send the hardcoded response with <b> tags and timestamps on new lines
      setTimeout(() => {
        const hardcodedResponse = `Alright, let's break down this intriguing scene from \"Elephants Dream\" – get ready for a wild ride!\n\n<b>00:00-00:30</b>:\nWe enter a surreal world as the title appears. Proog gives a quick, quirky tour, insisting everything is "safe."\n\n<b>00:30-01:00</b>:\nSuddenly, Emo is attacked by a strange machine. Proog checks on him, but things feel tense.\n\n<b>01:00-01:30</b>:\nProog and Emo rush across an icy platform filled with wires and odd tech. Proog urges Emo to keep up.\n\n<b>01:30-02:00</b>:\nRobotic birds appear and the two are separated, showing just how unpredictable this world is.`;
        onSendMessage(`Tree.io: ${hardcodedResponse}`);
        setTimeout(() => scrollToBottom(), 100);
      }, 9000);
    } else {
      setShowTreeioPopup(false);
      setShowMentions(false);
    }
  };

  // Tree.io Summarize Popup as floating centered popup in chat window
  // Memoized Summarizer Popup to prevent rerendering and blinking
  const TreeioSummarizePopup = useMemo(() => {
    if (!showTreeioPopup) return null;
    // Render absolutely inside the sidebar, horizontally centered above the input
    return (
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 10 }}
        className="absolute left-1/2 bottom-16 transform -translate-x-1/2 z-50 bg-gradient-to-br from-blue-900/95 via-gray-900/95 to-blue-800/90 border border-blue-500/30 rounded-2xl shadow-2xl p-6 flex flex-col items-center max-w-xs w-[90%]"
        style={{ pointerEvents: 'auto' }}
      >
        <div className="flex items-center space-x-2 mb-4">
          <div className="w-7 h-7 bg-gradient-to-r from-blue-500 to-purple-500 rounded-lg flex items-center justify-center">
            <span className="text-white font-bold text-sm">AI</span>
          </div>
          <span className="text-blue-300 font-semibold text-base">@Tree.io Summarize this from</span>
        </div>
        <div className="w-full flex flex-col items-center mb-4">
          <div className="flex space-x-2 w-full">
            <div className="flex-1">
              <label className="block text-xs text-gray-400 mb-1">Start</label>
              <DatePicker
                selected={treeioStartTime}
                onChange={setTreeioStartTime}
                showTimeSelect
                showTimeSelectOnly
                timeFormat="mm:ss"
                timeIntervals={0.5}
                dateFormat="mm:ss"
                placeholderText="Start time"
                className="w-full p-2 bg-gray-800/80 border border-blue-700/50 rounded text-white text-xs"
                minTime={movieStartTime}
                maxTime={movieEndTime}
              />
            </div>
            <div className="flex-1">
              <label className="block text-xs text-gray-400 mb-1">End</label>
              <DatePicker
                selected={treeioEndTime}
                onChange={setTreeioEndTime}
                showTimeSelect
                showTimeSelectOnly
                timeFormat="mm:ss"
                timeIntervals={0.5}
                dateFormat="mm:ss"
                placeholderText="End time"
                className="w-full p-2 bg-gray-800/80 border border-blue-700/50 rounded text-white text-xs"
                minTime={treeioStartTime || movieStartTime}
                maxTime={movieEndTime}
                disabled={!treeioStartTime}
              />
            </div>
          </div>
        </div>
        <div className="flex w-full space-x-2 mt-2">
          <button
            onClick={() => setShowTreeioPopup(false)}
            className="flex-1 bg-gray-800/80 hover:bg-gray-700/90 text-gray-200 py-2 rounded-lg font-medium text-sm border border-blue-700"
          >
            Cancel
          </button>
          <button
            onClick={handleTreeioApply}
            disabled={!treeioStartTime || !treeioEndTime}
            className="flex-1 bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 text-white py-2 rounded-lg font-medium text-sm disabled:from-gray-600 disabled:to-gray-600 disabled:cursor-not-allowed"
          >
            Apply
          </button>
        </div>
      </motion.div>
    );
  }, [showTreeioPopup, treeioStartTime, treeioEndTime, handleTreeioApply, setShowTreeioPopup, setNewMessage, inputRef]);

  // Mention dropdown portal rendering
  // Memoized MentionDropdown to prevent double click issue
  const MentionDropdown = useMemo(() => {
    if (!showMentions || mentionSuggestions.length === 0) return null;
    return (
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 10 }}
        className="absolute left-0 right-0 bottom-14 z-50 bg-gray-900/95 border border-gray-600/50 rounded-lg max-h-40 overflow-y-auto shadow-2xl"
        style={{ minWidth: 220 }}
      >
        {mentionSuggestions.map((suggestion) => (
          <div
            key={`mention-${suggestion.id}`}
            onMouseDown={e => { e.preventDefault(); insertMention(suggestion); }}
            className="p-2 cursor-pointer flex items-center space-x-2 hover:bg-gray-700/60 transition-colors"
          >
            <div
              className={`w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold ${
                suggestion.isAI
                  ? "bg-orange-500 text-white"
                  : "bg-blue-500 text-white"
              }`}
            >
              {suggestion.isAI ? "AI" : suggestion.name?.charAt(0).toUpperCase()}
            </div>
            <div>
              <span className={`font-medium text-xs ${suggestion.isAI ? "text-cyan-400" : "text-blue-400"}`}>
                {suggestion.isAI ? "Tree.io" : suggestion.name}
              </span>
              {/* No description for room members, only for Tree.io */}
              {suggestion.isAI && (
                <p className="text-xs text-gray-500">AI Assistant</p>
              )}
            </div>
          </div>
        ))}
      </motion.div>
      );
    }, [showMentions, mentionSuggestions, insertMention]);

  // 1. Add TTS Speaker Button
  const speakText = (text) => {
    if ('speechSynthesis' in window) {
      const utterance = new window.SpeechSynthesisUtterance(text);
      utterance.rate = 1;
      utterance.pitch = 1;
      window.speechSynthesis.speak(utterance);
    }
  };

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
            className="fixed right-0 top-0 h-full w-80 bg-gradient-to-b from-gray-900/95 to-black/95 backdrop-blur-xl border-l border-gray-700/20 z-50 shadow-2xl"
          >
            <div className="flex flex-col h-full relative">
              {/* Summarizer Popup (centered above input) */}
              {TreeioSummarizePopup}
              <div className="p-2 border-b border-gray-700/20 bg-gray-800/30">
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
                            <MemoizedPollMessage 
                              poll={poll} 
                              onVote={votePoll} 
                              currentUser={user?.name} 
                              currentUserId={user?.uid}
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
                      {messages.map((message, index) => {
                        // If this is a poll message and poll is already shown in firebasePolls, skip rendering
                        if (message.text.startsWith("POLL:")) {
                          try {
                            const poll = JSON.parse(message.text.substring(5));
                            if (isPollInFirebasePolls(poll.id)) return null;
                          } catch (e) {}
                        }
                        return (
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
                                      : message?.user?.charAt(0).toUpperCase()}
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
                                <div className="ml-5 text-gray-100 text-xs leading-relaxed bg-gray-800/20 rounded-lg px-2 pt-2 pb-6 border border-gray-700/20 relative">
                                  {renderMessageWithMentions(
                                    message.text.startsWith("Tree.io:") ? message.text.substring(8) : message.text,
                                    message
                                  )}
                                  {/* Speaker button at bottom right */}
                                  <button
                                    onClick={() => speakText(message.text.startsWith("Tree.io:") ? message.text.substring(8) : message.text)}
                                    className="absolute bottom-1 right-1 bg-gray-700/80 hover:bg-blue-600/80 text-white rounded-full p-1 shadow-md focus:outline-none"
                                    title="Speak"
                                    style={{ zIndex: 2 }}
                                  >
                                    {/* Speaker icon */}
                                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4">
                                      <path strokeLinecap="round" strokeLinejoin="round" d="M9 9v6h4l5 5V4l-5 5H9z" />
                                    </svg>
                                  </button>
                                </div>
                              </div>
                            )}
                          </motion.div>
                        );
                      })}
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


              <div className="p-2 border-t border-gray-700/20 bg-gray-800/20 relative">
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
                          {["Favorite genre?", "Rate this scene", "Which Movie?"].map((t, i) => (
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
                          className="flex-1 bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 disabled:from-gray-600 disabled:to-gray-600 disabled:cursor-not-allowed text-white py-2 px-3 rounded-lg font-medium text-sm flex items-center justify-center space-x-2"
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
                    <div className="bg-gradient-to-br from-blue-500/15 via-purple-500/10 to-indigo-500/15 rounded-2xl border border-blue-400/40 backdrop-blur-lg shadow-2xl overflow-hidden">
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
                        {/* Close Button */}
                        <button
                          onClick={() => setShowPollOptions(false)}
                          className="absolute top-2 right-2 text-white/80 hover:text-white p-1 rounded-full transition-colors focus:outline-none"
                          aria-label="Close"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                      
                      {/* Create Poll Button - Minimalistic Design */}
                      <div className="p-3">
                        <motion.button
                          whileHover={{ scale: 1.01 }}
                          whileTap={{ scale: 0.99 }}
                          onClick={() => {
                            if (roomStatus === "host" || pollsEnabled) {
                              setShowCreatePoll(true)
                              setShowPollOptions(false)
                            }
                          }}
                          disabled={roomStatus !== "host" && !pollsEnabled}
                          className={`w-full p-3 rounded-lg transition-all text-sm font-medium ${
                            roomStatus === "host" || pollsEnabled
                              ? "bg-white/10 hover:bg-white/15 text-white border border-white/20 hover:border-white/30"
                              : "bg-gray-700/30 text-gray-500 cursor-not-allowed border border-gray-600/20"
                          }`}
                        >
                          <div className="flex items-center justify-center space-x-2">
                            <BarChart3 className="w-4 h-4" />
                            <span>Create Poll</span>
                          </div>
                        </motion.button>
                      </div>
                    </div>
                  </motion.div>
                )}

                {/* Mention suggestions dropdown - rendered in portal */}
                {/* {MentionDropdown} */}
                {TreeioSummarizePopup}

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
                <div className="flex space-x-1">
                  {/* More Actions (3-dot vertical) Button */}
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setShowMoreActions((prev) => !prev)}
                    className="p-2 rounded-full transition-all shadow-lg text-gray-400 hover:text-white hover:bg-gray-700/30"
                    title="More actions"
                  >
                    <MoreVertical className="w-5 h-5" />
                  </motion.button>

                  {/* Popover for 4 action icons with names and poll permission toggle */}
                  {showMoreActions && (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: 10 }}
                      className="absolute bottom-12 left-0 z-50 bg-gray-900/95 border border-gray-700/50 rounded-xl p-2 flex flex-col shadow-2xl min-w-[260px]"
                      onMouseLeave={() => setShowMoreActions(false)}
                    >
                      {/* Poll Button - Enhanced */}
                      <div
                        className="flex items-center justify-between hover:bg-blue-500/10 rounded-lg px-2 py-1 mb-1 transition-all cursor-pointer select-none"
                        onClick={e => {
                          // Prevent toggle click from triggering poll open
                          if (e.target.closest('.poll-toggle-btn')) return;
                          setShowPollOptions(!showPollOptions); setShowMoreActions(false);
                        }}
                      >
                        <motion.button
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          tabIndex={-1}
                          className={`p-2 rounded-full transition-all ${
                            showPollOptions 
                              ? "bg-blue-500/30 text-blue-300 shadow-blue-500/20" 
                              : "text-gray-400 hover:text-blue-400 hover:bg-blue-500/10 hover:shadow-blue-500/10"
                          }`}
                          title="Poll"
                          style={{ pointerEvents: 'none' }}
                        >
                          <BarChart3 className="w-4 h-4" />
                        </motion.button>
                        <div className="flex items-center space-x-2 flex-1 justify-between ml-3">
                          <span className="text-sm text-white font-medium">Poll</span>
                          {/* Poll Permission Toggle (only for host) */}
                          {roomStatus === "host" && (
                            <div className="flex items-center space-x-2 ml-2">
                              <span className="text-xs text-gray-300 whitespace-nowrap">Allow members to create polls</span>
                              <button
                                onClick={e => { e.stopPropagation(); togglePollsEnabled(); }}
                                className={`poll-toggle-btn relative inline-flex h-5 w-9 items-center rounded-full transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-gray-800 ${
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
                          )}
                        </div>
                      </div>

                      {/* Party Button - New */}
                      <div
                        className="flex items-center hover:bg-purple-500/10 rounded-lg px-2 py-1 mb-1 transition-all cursor-pointer select-none"
                        onClick={() => { window.open('/party', '_blank'); setShowMoreActions(false); }}
                      >
                        <motion.button
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          tabIndex={-1}
                          className="p-2 rounded-full transition-all shadow-lg text-gray-400 hover:text-purple-400 hover:bg-purple-500/10 hover:shadow-purple-500/10"
                          title="Watch Party"
                          style={{ pointerEvents: 'none' }}
                        >
                          <PartyPopper className="w-4 h-4" />
                        </motion.button>
                        <span className="ml-3 text-sm text-white font-medium">Watch Party</span>
                      </div>

                      {/* Reaction Button */}
                      <div
                        className="flex items-center hover:bg-orange-500/10 rounded-lg px-2 py-1 mb-1 transition-all cursor-pointer select-none"
                        onClick={() => { setShowReactions(!showReactions); setShowMoreActions(false); }}
                      >
                        <motion.button
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          tabIndex={-1}
                          disabled={reactionCooldown}
                          className={`p-2 rounded-full transition-all shadow-lg ${
                            showReactions 
                              ? "bg-orange-500/30 text-orange-300 shadow-orange-500/20" 
                              : reactionCooldown
                              ? "text-gray-500 cursor-not-allowed"
                              : "text-gray-400 hover:text-orange-400 hover:bg-orange-500/10 hover:shadow-orange-500/10"
                          }`}
                          title="React"
                          style={{ pointerEvents: 'none' }}
                        >
                          <Heart className="w-4 h-4" />
                        </motion.button>
                        <span className="ml-3 text-sm text-white font-medium">React</span>
                      </div>

                      {/* Record Button - New */}
                      <div
                        className="flex items-center hover:bg-red-500/10 rounded-lg px-2 py-1 transition-all cursor-pointer select-none"
                        onClick={() => { /* TODO: Add record functionality */ setShowMoreActions(false); }}
                      >
                        <motion.button
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          tabIndex={-1}
                          className="p-2 rounded-full transition-all shadow-lg text-gray-400 hover:text-red-400 hover:bg-red-500/10 hover:shadow-red-500/10"
                          title="Record"
                          style={{ pointerEvents: 'none' }}
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4">
                            <circle cx="12" cy="12" r="6" fill="currentColor" />
                          </svg>
                        </motion.button>
                        <span className="ml-3 text-sm text-white font-medium">Record</span>
                      </div>
                    </motion.div>
                  )}

                  <div className="flex-1 relative">
                    <Input
                      ref={inputRef}
                      value={newMessage}
                      onChange={handleMessageChange}
                      onFocus={() => setInputFocused(true)}
                      onBlur={() => setInputFocused(false)}
                      placeholder={roomStatus !== "none" ? "Type @Tree.io for AI help..." : "Chat with @Tree.io..."}
                      className="bg-gray-800/60 border-gray-600/50 text-white placeholder-gray-500 rounded-xl px-3 py-2 pr-10 focus:border-blue-500/60 focus:ring-2 focus:ring-blue-500/20 transition-all text-sm shadow-lg backdrop-blur-sm"
                      onKeyPress={(e) => {
                        if (e.key === "Enter" && !showMentions && !showTreeioPopup) sendMessage();
                      }}
                    />
                    {/* MentionDropdown rendered absolutely above input */}
                    {MentionDropdown}
                  </div>
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={sendMessage}
                    disabled={!newMessage.trim()}
                    className="bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 disabled:from-gray-600 disabled:to-gray-600 disabled:cursor-not-allowed text-white rounded-xl p-2 transition-all shadow-lg disabled:shadow-none"
                  >
                    <Send className="w-4 h-4" />
                  </motion.button>
                </div>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}
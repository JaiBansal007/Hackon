"use client";

import { useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "../../ui/button";
import { Input } from "../../ui/input";
import { X, MessageCircle, Users, Send } from "lucide-react";

export function ChatSidebar({
  show,
  onClose,
  messages,
  onSendMessage,
  roomStatus,
  roomMembers,
  user,
}) {
  const [newMessage, setNewMessage] = useState("");
  const [showMentions, setShowMentions] = useState(false);
  const [mentionSuggestions, setMentionSuggestions] = useState([]);
  const [cursorPosition, setCursorPosition] = useState(0);
  const inputRef = useRef(null);

  const handleMessageChange = (e) => {
    const value = e.target.value;
    const position = e.target.selectionStart || 0;
    setNewMessage(value);
    setCursorPosition(position);

    const textBeforeCursor = value.substring(0, position);
    const lastAtIndex = textBeforeCursor.lastIndexOf("@");

    if (lastAtIndex !== -1 && (lastAtIndex === 0 || textBeforeCursor[lastAtIndex - 1] === " ")) {
      const textAfterAt = textBeforeCursor.substring(lastAtIndex + 1);
      if (!textAfterAt.includes(" ")) {
        const searchTerm = textAfterAt.toLowerCase();
        const allSuggestions = [
          { id: "tree", name: "Tree.io", isAI: true },
          ...roomMembers.filter((member) =>
            member.userName.toLowerCase().includes(searchTerm)
          ),
        ];
        setMentionSuggestions(allSuggestions);
        setShowMentions(true);
      } else {
        setShowMentions(false);
      }
    } else {
      setShowMentions(false);
    }
  };

  const insertMention = (mention) => {
    const lastAtIndex = newMessage.lastIndexOf("@", cursorPosition - 1);
    const beforeMention = newMessage.substring(0, lastAtIndex);
    const afterMention = newMessage.substring(cursorPosition);
    const mentionText = mention.isAI ? "@Tree.io" : `@${mention.userName}`;

    setNewMessage(beforeMention + mentionText + " " + afterMention);
    setShowMentions(false);
    inputRef.current?.focus();
  };

  const renderMessageWithMentions = (text) => {
    const parts = text.split(/(@\w+(?:\.\w+)?)/g);
    return parts.map((part, index) => {
      if (part.startsWith("@")) {
        const isTreeIO = part === "@Tree.io";
        return (
          <span
            key={index}
            className={`font-semibold ${isTreeIO ? "text-orange-400" : "text-blue-400"}`}
          >
            {part}
          </span>
        );
      }
      return part;
    });
  };

  const sendMessage = async () => {
    if (newMessage.trim()) {
      const messageText = newMessage.trim();

      onSendMessage(messageText);

      if (messageText.includes("@Tree.io")) {
        try {
          setTimeout(() => {
            onSendMessage("Tree.io is thinking...");
          }, 500);

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
          });

          if (response.ok) {
            const data = await response.json();

            setTimeout(() => {
              onSendMessage(`Tree.io: ${data.response}`);
            }, 1500);
          } else {
            setTimeout(() => {
              onSendMessage(
                "Tree.io: Sorry, I'm having trouble processing your request right now. Please try again later."
              );
            }, 1500);
          }
        } catch (error) {
          console.error("Error calling Tree.io API:", error);

          setTimeout(() => {
            onSendMessage("Tree.io: Sorry, I'm currently unavailable. Please try again later.");
          }, 1500);
        }
      }

      setNewMessage("");
    }
  };

  return (
    <AnimatePresence>
      {show && (
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
                              message.text.startsWith("Tree.io:") ? message.text.substring(8) : message.text
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
                            <span
                              className={`font-medium ${
                                suggestion.isAI ? "text-orange-400" : "text-blue-400"
                              }`}
                            >
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
                  <div className="flex-1 relative">
                    <Input
                      ref={inputRef}
                      value={newMessage}
                      onChange={handleMessageChange}
                      placeholder={
                        roomStatus !== "none" ? "Type @Tree.io for AI help..." : "Chat with @Tree.io..."
                      }
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
      )}
    </AnimatePresence>
  );
}
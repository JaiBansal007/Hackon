"use client";

import { motion, AnimatePresence } from "framer-motion";
import { Heart, Laugh, ThumbsUp, Angry, Frown, Smile } from "lucide-react";

const reactions = [
  { icon: Heart, emoji: "❤️", color: "text-red-500" },
  { icon: Laugh, emoji: "😂", color: "text-yellow-500" },
  { icon: ThumbsUp, emoji: "👍", color: "text-blue-500" },
  { icon: Smile, emoji: "😊", color: "text-green-500" },
  { icon: Frown, emoji: "😢", color: "text-blue-400" },
  { icon: Angry, emoji: "😠", color: "text-red-600" },
];

export function ReactionsPanel({ show, onReactionSelect }) {
  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ opacity: 0, y: 50, scale: 0.8 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 50, scale: 0.8 }}
          transition={{ duration: 0.1 }}
          className="absolute bottom-24 left-1/2 transform -translate-x-1/2 bg-black/90 backdrop-blur-sm rounded-2xl p-4 flex items-center space-x-4 border border-gray-700/50 shadow-2xl"
        >
          {reactions.map((reaction, index) => (
            <button
              key={index}
              onClick={() => onReactionSelect(reaction)}
              className="w-14 h-14 rounded-full bg-gray-800/80 hover:bg-gray-700/80 text-3xl p-0 border-2 border-transparent hover:border-orange-400/50 transition-all duration-200 backdrop-blur-sm"
            >
              {reaction.emoji}
            </button>
          ))}
        </motion.div>
      )}
    </AnimatePresence>
  );
}
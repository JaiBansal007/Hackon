"use client";

import { motion, AnimatePresence } from "framer-motion";

export function FloatingReactions({ reactions }) {
  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden z-40">
      <AnimatePresence>
        {reactions.map((reaction) => (
          <motion.div
            key={reaction.id}
            initial={{
              opacity: 0,
              scale: 0.5,
              y: 0,
              x: Math.random() * 200 - 100, // Random horizontal start position
            }}
            animate={{
              opacity: [0, 1, 1, 0.8, 0],
              scale: [0.5, 1.2, 1, 1, 0.8],
              y: [0, -400, -800], // Move from bottom to top
              x: [
                Math.random() * 200 - 100,
                Math.random() * 150 - 75,
                Math.random() * 100 - 50,
              ], // Slight horizontal drift
            }}
            exit={{
              opacity: 0,
              scale: 0.5,
              y: -900,
            }}
            transition={{
              duration: 4,
              ease: "easeOut",
              times: [0, 0.15, 0.3, 0.8, 1],
            }}
            className="absolute pointer-events-none"
            style={{
              left: `${Math.random() * 60 + 20}%`, // Start somewhere in the middle 60% of screen
              bottom: "5%",
              zIndex: 50,
            }}
          >
            <div className="flex flex-col items-center">
              {/* Emoji */}
              <motion.div
                className="text-5xl mb-2 drop-shadow-2xl"
                animate={{
                  scale: [1, 1.05, 1],
                  rotate: [0, 3, -3, 0],
                }}
                transition={{
                  duration: 1,
                  repeat: 3,
                  repeatType: "reverse",
                }}
              >
                {reaction.emoji}
              </motion.div>

              {/* User name tag */}
              <motion.div
                className="text-xs text-white bg-black/80 px-2 py-1 rounded-full backdrop-blur-sm border border-white/30 whitespace-nowrap shadow-lg"
                initial={{ opacity: 0, y: 10, scale: 0.8 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                transition={{ delay: 0.2, duration: 0.3 }}
              >
                {reaction.user}
              </motion.div>
            </div>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}
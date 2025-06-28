"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useMemo } from "react";

export function FloatingReactions({ reactions }) {
  // Limit the number of visible reactions to prevent performance issues
  const limitedReactions = useMemo(() => {
    return reactions.slice(-15); // Show only last 15 reactions
  }, [reactions]);

  // Pre-calculate random values to avoid recalculation during animation
  const reactionData = useMemo(() => {
    return limitedReactions.map((reaction) => ({
      ...reaction,
      startX: Math.random() * 60 + 20, // 20-80% of screen width
      driftX: (Math.random() - 0.5) * 200, // Random drift amount
      startScale: 0.8 + Math.random() * 0.4, // 0.8-1.2 scale
      duration: 3 + Math.random() * 2, // 3-5 seconds
    }));
  }, [limitedReactions]);

  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden z-40">
      <AnimatePresence mode="popLayout">
        {reactionData.map((reaction) => (
          <motion.div
            key={reaction.id}
            layout
            initial={{
              opacity: 0,
              scale: 0.3,
              y: 50,
              x: 0,
            }}
            animate={{
              opacity: [0, 1, 1, 0.8, 0],
              scale: [0.3, reaction.startScale, reaction.startScale * 0.9, reaction.startScale * 0.7, 0.3],
              y: [50, -200, -400, -600, -800],
              x: [0, reaction.driftX * 0.3, reaction.driftX * 0.6, reaction.driftX, reaction.driftX * 1.2],
            }}
            exit={{
              opacity: 0,
              scale: 0.2,
              y: -900,
              transition: { duration: 0.3 }
            }}
            transition={{
              duration: reaction.duration,
              ease: [0.25, 0.46, 0.45, 0.94], // Custom easing for smooth animation
              times: [0, 0.2, 0.4, 0.7, 1],
            }}
            className="absolute pointer-events-none will-change-transform"
            style={{
              left: `${reaction.startX}%`,
              bottom: "10%",
              zIndex: 50,
            }}
          >
            <div className="flex flex-col items-center">
              {/* Emoji with improved performance */}
              <motion.div
                className="text-4xl md:text-5xl mb-2 drop-shadow-lg select-none"
                animate={{
                  scale: [1, 1.03, 1],
                  rotate: [0, 2, -2, 0],
                }}
                transition={{
                  duration: 0.8,
                  repeat: Math.floor(reaction.duration / 0.8),
                  repeatType: "reverse",
                  ease: "easeInOut"
                }}
                style={{ 
                  willChange: 'transform',
                  backfaceVisibility: 'hidden'
                }}
              >
                {reaction.emoji}
              </motion.div>

              {/* Optimized user name tag */}
              <motion.div
                className="text-xs text-white bg-black/70 px-2 py-1 rounded-full backdrop-blur-sm border border-white/20 whitespace-nowrap shadow-md max-w-20 truncate"
                initial={{ opacity: 0, y: 8, scale: 0.9 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                transition={{ 
                  delay: 0.15, 
                  duration: 0.25,
                  ease: "easeOut"
                }}
                style={{ 
                  willChange: 'transform',
                  backfaceVisibility: 'hidden'
                }}
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
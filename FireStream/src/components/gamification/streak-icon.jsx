"use client";

import { motion } from "framer-motion";
import { Flame } from "lucide-react";
import { GamificationManager } from "../../lib/gamification";
import { useState, useEffect } from "react";

export function StreakIcon() {
  const [stats, setStats] = useState(GamificationManager.getInstance().getUserStats());
  const [isCompleted, setIsCompleted] = useState(false);

  useEffect(() => {
    const gamification = GamificationManager.getInstance();
    const currentStats = gamification.getUserStats();
    setStats(currentStats);
    setIsCompleted(gamification.isDailyTaskCompleted());

    const interval = setInterval(() => {
      const updatedStats = gamification.getUserStats();
      setStats(updatedStats);
      setIsCompleted(gamification.isDailyTaskCompleted());
    }, 60000);

    return () => clearInterval(interval);
  }, []);

  return (
    <motion.div
      whileHover={{ scale: 1.05 }}
      className="flex items-center space-x-2 bg-gray-800/50 rounded-lg px-3 py-2 border border-gray-700/50"
    >
      <motion.div
        animate={isCompleted ? { scale: [1, 1.2, 1] } : {}}
        transition={{
          duration: 0.5,
          repeat: isCompleted ? Number.POSITIVE_INFINITY : 0,
          repeatDelay: 2,
        }}
      >
        <Flame
          className={`w-5 h-5 ${isCompleted ? "text-yellow-400 drop-shadow-lg" : "text-gray-500"}`}
        />
      </motion.div>
      <span className="text-white font-medium text-sm">{stats.currentStreak}</span>
      {isCompleted && (
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          className="w-2 h-2 bg-green-400 rounded-full"
        />
      )}
    </motion.div>
  );
}
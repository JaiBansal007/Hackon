"use client";

import { motion } from "framer-motion";
import { Coins } from "lucide-react";
import { GamificationManager } from "../../lib/gamification";
import { useState, useEffect } from "react";

export function PointsDisplay() {
  const [points, setPoints] = useState(0);

  useEffect(() => {
    const gamification = GamificationManager.getInstance();
    setPoints(gamification.getUserStats().totalPoints);

    const interval = setInterval(() => {
      setPoints(gamification.getUserStats().totalPoints);
    }, 60000);

    return () => clearInterval(interval);
  }, []);

  return (
    <motion.div
      whileHover={{ scale: 1.05 }}
      className="flex items-center space-x-2 bg-gradient-to-r from-yellow-400/20 to-orange-500/20 rounded-lg px-3 py-2 border border-yellow-400/30"
    >
      <Coins className="w-5 h-5 text-yellow-400" />
      <span className="text-white font-bold text-sm">{points.toLocaleString()}</span>
    </motion.div>
  );
}
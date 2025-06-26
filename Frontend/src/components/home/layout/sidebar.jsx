"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Play,
  Search,
  Home,
  Calendar,
  TrendingUp,
  Plus,
  Shuffle,
  Monitor,
} from "lucide-react";

const sidebarItems = [
  { icon: Search, label: "Search", path: "/search" },
  { icon: Home, label: "Home", path: "/home", active: true },
  { icon: Calendar, label: "My List", path: "/mylist" },
  { icon: Monitor, label: "TV Shows", path: "/tvshows" },
  { icon: TrendingUp, label: "Trending", path: "/trending" },
  { icon: Plus, label: "Browse", path: "/browse" },
  { icon: Shuffle, label: "Random", path: "/random" },
];

export function Sidebar({ isFullscreen, isWatching }) {
  const [sidebarExpanded, setSidebarExpanded] = useState(false);

  if (isFullscreen || isWatching) return null;

  return (
    <motion.div
      initial={{ x: -100 }}
      animate={{ x: 0 }}
      className={`fixed left-0 top-0 h-full bg-black/95 backdrop-blur-sm border-r border-gray-800 z-50 transition-all duration-300 ${
        sidebarExpanded ? "w-64" : "w-16"
      } sidebar-scrollbar`}
      onMouseEnter={() => setSidebarExpanded(true)}
      onMouseLeave={() => setSidebarExpanded(false)}
    >
      <div className="p-4 h-full overflow-y-auto">
        <div className="flex items-center space-x-2 mb-8">
          <div className="w-8 h-8 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-lg flex items-center justify-center">
            <Play className="w-4 h-4 text-black" />
          </div>
          <AnimatePresence>
            {sidebarExpanded && (
              <motion.span
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="text-xl font-bold"
              >
                Fire<span className="text-orange-400">Stream</span>
              </motion.span>
            )}
          </AnimatePresence>
        </div>

        <nav className="space-y-2">
          {sidebarItems.map((item, index) => (
            <motion.div
              key={index}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className={`flex items-center ${
                sidebarExpanded ? "justify-start" : "justify-center"
              } space-x-3 p-3 rounded-lg cursor-pointer transition-colors ${
                item.active
                  ? "bg-gradient-to-r from-yellow-400/20 to-orange-500/20 text-orange-400"
                  : "hover:bg-gray-800 text-gray-400 hover:text-white"
              }`}
            >
              <item.icon className="w-5 h-5 flex-shrink-0" />
              <AnimatePresence>
                {sidebarExpanded && (
                  <motion.span
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    className="font-medium"
                  >
                    {item.label}
                  </motion.span>
                )}
              </AnimatePresence>
            </motion.div>
          ))}
        </nav>
      </div>
    </motion.div>
  );
}
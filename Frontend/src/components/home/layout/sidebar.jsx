"use client"

import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Play, Search, Home, Calendar, TrendingUp, Plus, Shuffle, Monitor } from "lucide-react"

const sidebarItems = [
  { icon: Search, label: "Search", path: "/search" },
  { icon: Home, label: "Home", path: "/home", active: true },
  { icon: Calendar, label: "My List", path: "/mylist" },
  { icon: Monitor, label: "TV Shows", path: "/tvshows" },
  { icon: TrendingUp, label: "Trending", path: "/trending" },
  { icon: Plus, label: "Browse", path: "/browse" },
  { icon: Shuffle, label: "Random", path: "/random" },
]

export function Sidebar({ isFullscreen, isWatching }) {
  const [sidebarExpanded, setSidebarExpanded] = useState(false)

  if (isFullscreen || isWatching) return null

  return (
    <motion.div
      initial={{ x: -100, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      transition={{ duration: 0.4, ease: "easeOut" }}
      className={`fixed left-0 top-0 h-full bg-gradient-to-b backdrop-blur-xl border-r border-gradient-to-b from-orange-500/20 via-gray-800/50 to-orange-500/20 z-50 transition-all duration-500 ease-in-out ${
        sidebarExpanded ? "w-72" : "w-20"
      } shadow-2xl shadow-black/50`}
      onMouseEnter={() => setSidebarExpanded(true)}
      onMouseLeave={() => setSidebarExpanded(false)}
      style={{
        background: sidebarExpanded
          ? "linear-gradient(135deg, rgba(0,0,0,0.98) 0%, rgba(17,24,39,0.95) 50%, rgba(0,0,0,0.98) 100%)"
          : "linear-gradient(135deg, rgba(0,0,0,0.95) 0%, rgba(17,24,39,0.92) 50%, rgba(0,0,0,0.95) 100%)",
        borderRight: "1px solid transparent",
        borderImage: "linear-gradient(to bottom, rgba(251,146,60,0.3), rgba(107,114,128,0.5), rgba(251,146,60,0.3)) 1",
      }}
    >
      {/* Animated background glow */}
      <div className="absolute inset-0 bg-gradient-to-r from-orange-500/5 via-transparent to-yellow-400/5 opacity-50" />
      <div className="absolute top-1/4 left-0 w-1 h-32 bg-gradient-to-b from-transparent via-orange-400/60 to-transparent rounded-r-full" />

      <div className="relative p-6 h-full overflow-y-auto scrollbar-thin scrollbar-track-transparent scrollbar-thumb-orange-500/30 hover:scrollbar-thumb-orange-500/50">
        {/* Logo Section */}
        <motion.div
          className="flex items-center space-x-3 mb-12 pb-6 border-b border-gray-800/50"
          whileHover={{ scale: 1.02 }}
          transition={{ duration: 0.2 }}
        >
          <motion.div
            className="w-10 h-10 bg-gradient-to-br from-yellow-400 via-orange-500 to-orange-600 rounded-xl flex items-center justify-center shadow-lg shadow-orange-500/25"
            whileHover={{
              rotate: 360,
              boxShadow: "0 0 25px rgba(251,146,60,0.5)",
            }}
            transition={{ duration: 0.6 }}
          >
            <Play className="w-5 h-5 text-black" />
          </motion.div>
          <AnimatePresence>
            {sidebarExpanded && (
              <motion.span
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.3, ease: "easeOut" }}
                className="text-2xl font-bold bg-gradient-to-r from-white via-gray-100 to-orange-200 bg-clip-text text-transparent"
              >
                Fire
                <span className="bg-gradient-to-r from-orange-400 to-yellow-400 bg-clip-text text-transparent">
                  Stream
                </span>
              </motion.span>
            )}
          </AnimatePresence>
        </motion.div>

        {/* Navigation */}
        <nav className="space-y-3">
          {sidebarItems.map((item, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1, duration: 0.3 }}
              whileHover={{
                scale: 1.05,
                x: sidebarExpanded ? 8 : 0,
              }}
              whileTap={{ scale: 0.95 }}
              className={`relative flex items-center ${
                sidebarExpanded ? "justify-start px-4" : "justify-center px-3"
              } py-4 rounded-2xl cursor-pointer transition-all duration-300 group ${
                item.active
                  ? "bg-gradient-to-r from-orange-500/20 via-yellow-400/15 to-orange-500/20 text-orange-400 shadow-lg shadow-orange-500/10"
                  : "hover:bg-gradient-to-r hover:from-gray-800/60 hover:via-gray-700/40 hover:to-gray-800/60 text-gray-400 hover:text-white hover:shadow-lg hover:shadow-gray-900/20"
              }`}
            >
              {/* Active indicator */}
              {/* {item.active && (
                <motion.div
                  layoutId="activeIndicator"
                  className="absolute left-0 top-1/2 transform -translate-y-1/2 w-1 h-8 bg-gradient-to-b from-orange-400 to-yellow-400 rounded-r-full"
                  transition={{ type: "spring", stiffness: 300, damping: 30 }}
                />
              )} */}

              {/* Icon with enhanced styling */}
              <motion.div
                className={`relative ${sidebarExpanded ? "mr-4" : ""}`}
                whileHover={{ rotate: item.active ? 0 : 5 }}
                transition={{ duration: 0.2 }}
              >
                <item.icon
                  className={`w-6 h-6 flex-shrink-0 transition-all duration-300 ${
                    item.active ? "drop-shadow-lg" : "group-hover:drop-shadow-md"
                  }`}
                />
                {item.active && <div className="absolute inset-0 bg-orange-400/20 rounded-lg blur-sm -z-10" />}
              </motion.div>

              {/* Label with enhanced typography */}
              <AnimatePresence>
                {sidebarExpanded && (
                  <motion.span
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    transition={{ duration: 0.3, ease: "easeOut" }}
                    className={`font-semibold text-base tracking-wide transition-all duration-300 ${
                      item.active ? "text-orange-400 drop-shadow-sm" : "group-hover:text-white"
                    }`}
                  >
                    {item.label}
                  </motion.span>
                )}
              </AnimatePresence>

              {/* Hover glow effect */}
              <div
                className={`absolute inset-0 rounded-2xl transition-all duration-300 ${
                  item.active
                    ? "bg-gradient-to-r from-orange-500/10 via-yellow-400/5 to-orange-500/10"
                    : "group-hover:bg-gradient-to-r group-hover:from-white/5 group-hover:via-white/2 group-hover:to-white/5"
                }`}
              />
            </motion.div>
          ))}
        </nav>

        {/* Bottom gradient fade */}
        <div className="absolute bottom-0 left-0 right-0 h-20 bg-gradient-to-t from-black/80 to-transparent pointer-events-none" />
      </div>

      {/* Edge glow effect */}
      <div className="absolute top-0 right-0 w-px h-full bg-gradient-to-b from-orange-400/30 via-transparent to-orange-400/30" />
    </motion.div>
  )
}

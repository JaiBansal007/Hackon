"use client"

import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Play, Search, Home, Calendar, TrendingUp, Plus, Shuffle, Monitor, Tv, Film, Trophy, Star } from "lucide-react"

const sidebarItems = [
  { icon: Home, label: "Home", path: "/home", active: true },
  { icon: Search, label: "Search", path: "/search" },
  { icon: Film, label: "Movies", path: "/movies" },
  { icon: Tv, label: "TV", path: "/tv" },
  { icon: Trophy, label: "Sports", path: "/sports" },
  { icon: Star, label: "Premium", path: "/premium" },
  { icon: Calendar, label: "My List", path: "/mylist" },
]

export function Sidebar({ isFullscreen, isWatching }) {
  const [sidebarExpanded, setSidebarExpanded] = useState(false)

  if (isFullscreen || isWatching) return null

  return (
    <motion.div
      initial={{ x: -100, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      transition={{ duration: 0.4, ease: "easeOut" }}
      className={`fixed left-0 top-0 h-full z-50 transition-all duration-300 ease-in-out ${
        sidebarExpanded ? "w-60" : "w-20"
      }`}
      onMouseEnter={() => setSidebarExpanded(true)}
      onMouseLeave={() => setSidebarExpanded(false)}
    >
      {/* Enhanced black essence gradient background - only visible on hover/expand */}
      <div 
        className={`absolute inset-0 pointer-events-none transition-opacity duration-300 ${
          sidebarExpanded ? 'opacity-95' : 'opacity-0'
        }`}
        style={{
          background: 'linear-gradient(90deg, rgba(0,0,0,0.92) 0%, rgba(15,23,42,0.7) 60%, rgba(0,0,0,0.0) 100%)',
          backdropFilter: 'blur(12px)'
        }}
      />
      
      <div className="relative p-4 pl-2 pt-0 h-full overflow-y-auto">
        {/* Logo Section */}
        <div className="w-16 h-16 flex items-center justify-center mb-8">
          <motion.div
            className="w-8 h-8 bg-gradient-to-r from-amber-400 to-orange-500 rounded-lg flex items-center justify-center"
            whileHover={{ scale: 1.1 }}
            transition={{ duration: 0.3 }}
          >
            <Play className="w-4 h-4 text-white " />
          </motion.div>
          
          {/* Brand name - only visible when expanded */}
          {/* <AnimatePresence>
            {sidebarExpanded && (
              <motion.span
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.3, ease: "easeOut" }}
                className="text-lg font-bold text-white"
              >
                Fire Stream
              </motion.span>
            )}
          </AnimatePresence> */}
        </div>

        {/* Navigation */}
        <nav className="space-y-2">
          {sidebarItems.map((item, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05, duration: 0.3 }}
              className={`relative flex items-center cursor-pointer transition-all duration-200 group ${
                item.active
                  ? "text-white"
                  : "text-gray-400 hover:text-white"
              }`}
            >
              {/* Icon container - always fixed size */}
              <div className="w-16 h-12 flex items-center justify-center flex-shrink-0">
                {/* Active indicator line */}
                {/* {item.active && (
                  <div className="absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b from-blue-400 to-purple-500 rounded-r-full" />
                )} */}
                
                <motion.div
                  whileHover={{ scale: 1.1 }}
                  transition={{ duration: 0.2 }}
                  className={`p-2 rounded-lg ${
                    item.active ? "bg-blue-600/20" : "hover:bg-gray-800/50"
                  }`}
                >
                  <item.icon className="w-5 h-5 flex-shrink-0" />
                </motion.div>
              </div>

              {/* Text - only visible when expanded */}
              <AnimatePresence>
                {sidebarExpanded && (
                  <motion.span
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    transition={{ duration: 0.3, ease: "easeOut" }}
                    className="font-medium text-sm ml-2"
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
  )
}

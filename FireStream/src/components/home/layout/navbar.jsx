"use client"

import { motion } from "framer-motion"
import { Button } from "../../ui/button"
import { Input } from "../../ui/input"
import { Avatar, AvatarFallback } from "../../ui/avatar"
import { Search, Users, LogOut, Settings, User, Gift, Plus } from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "../../ui/dropdown-menu"
import { StreakIcon } from "../../gamification/streak-icon"
import { PointsDisplay } from "../../gamification/points-display"

export function Navbar({ user, roomStatus, roomId, isFullscreen, onCreateRoom, onJoinRoom, onLeaveRoom, onLogout }) {
  if (isFullscreen) return null

  return (
    <motion.nav
      initial={{ y: -50 }}
      animate={{ y: 0 }}
      className="fixed top-0 left-16 right-0 z-40 flex items-center justify-between p-4 bg-gradient-to-r from-black via-gray-900 to-black backdrop-blur-md border-b border-yellow-400/20 shadow-xl shadow-yellow-400/5"
    >
      <div className="flex items-center space-x-4 flex-1 min-w-0">
        <div className="flex items-center space-x-4 flex-shrink-0">
          {roomStatus === "none" ? (
            <>
              <motion.div 
                whileHover={{ scale: 1.05, y: -2 }} 
                whileTap={{ scale: 0.95 }}
                transition={{ type: "spring", stiffness: 300 }}
              >
                <Button
                  onClick={onCreateRoom}
                  className="bg-gradient-to-r from-yellow-400 via-yellow-500 to-orange-500 text-gray-900 font-semibold hover:from-yellow-300 hover:via-yellow-400 hover:to-orange-400 hover:text-gray-800 hover:shadow-lg hover:shadow-yellow-400/25 transition-all duration-300"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Create Room
                </Button>
              </motion.div>
              <motion.div 
                whileHover={{ scale: 1.05, y: -2 }} 
                whileTap={{ scale: 0.95 }}
                transition={{ type: "spring", stiffness: 300 }}
              >
                <Button
                  onClick={onJoinRoom}
                  variant="outline"
                  className="border-2 border-yellow-400/60 text-yellow-400 font-medium hover:border-yellow-300 hover:bg-yellow-400/10 hover:text-yellow-300 hover:shadow-lg hover:shadow-yellow-400/15 transition-all duration-300 backdrop-blur-sm"
                >
                  <Users className="w-4 h-4 mr-2" />
                  Join Room
                </Button>
              </motion.div>
            </>
          ) : (
            <div className="flex items-center space-x-4">
              <motion.div
                initial={{ scale: 0, rotate: -180 }}
                animate={{ scale: 1, rotate: 0 }}
                transition={{ type: "spring", stiffness: 200, damping: 15 }}
                className="bg-gradient-to-r from-yellow-500 via-orange-500 to-yellow-500 px-6 py-3 rounded-xl flex items-center space-x-3 shadow-lg shadow-yellow-400/20 border border-yellow-400/30"
              >
                <Users className="w-5 h-5 text-gray-900" />
                <span className="font-semibold text-gray-900 text-sm">
                  Room {roomId} {roomStatus === "host" && "(HOST)"}
                </span>
              </motion.div>
              <motion.div 
                whileHover={{ scale: 1.05, y: -2 }} 
                whileTap={{ scale: 0.95 }}
              >
                <Button
                  onClick={onLeaveRoom}
                  variant="outline"
                  className="border-2 border-red-400/60 text-red-400 font-medium hover:border-red-300 hover:bg-red-400/10 hover:text-red-300 hover:shadow-lg hover:shadow-red-400/15 transition-all duration-300"
                >
                  Leave Room
                </Button>
              </motion.div>
            </div>
          )}
        </div>
      </div>

      <div className="flex items-center space-x-6 flex-shrink-0">
        <motion.div 
          className="relative hidden md:block"
          whileHover={{ scale: 1.02 }}
          transition={{ type: "spring", stiffness: 300 }}
        >
          <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-yellow-400/70 w-5 h-5 transition-colors duration-300" />
          <Input
            placeholder="Want to have some chill mood tonight?"
            className="pl-12 w-60 lg:w-80 h-12 bg-gray-900/80 border-2 border-yellow-400/30 text-yellow-100 placeholder-yellow-400/50 focus:border-yellow-400 focus:bg-gray-900 focus:ring-2 focus:ring-yellow-400/20 transition-all duration-300 rounded-xl backdrop-blur-sm"
          />
        </motion.div>

        {/* Gamification Elements */}
        <motion.div
          whileHover={{ scale: 1.1, rotate: 5 }}
          transition={{ type: "spring", stiffness: 400 }}
        >
          <StreakIcon />
        </motion.div>
        <motion.div
          whileHover={{ scale: 1.05 }}
          transition={{ type: "spring", stiffness: 300 }}
        >
          <PointsDisplay />
        </motion.div>

        {/* Redeem Gifts Button */}
        <motion.div 
          whileHover={{ scale: 1.05, y: -2 }} 
          whileTap={{ scale: 0.95 }}
          transition={{ type: "spring", stiffness: 300 }}
        >
          <Button
            onClick={() => (window.location.href = "/redeem")}
            variant="outline"
            size="sm"
            className="border-2 border-yellow-400/60 text-yellow-400 font-medium hover:border-yellow-300 hover:bg-gradient-to-r hover:from-yellow-400/10 hover:to-orange-400/10 hover:text-yellow-300 hover:shadow-lg hover:shadow-yellow-400/20 transition-all duration-300 px-4 py-2 rounded-lg"
          >
            <Gift className="w-4 h-4 mr-2" />
            Redeem
          </Button>
        </motion.div>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <motion.div
              whileHover={{ scale: 1.1, rotate: 5 }}
              whileTap={{ scale: 0.95 }}
              transition={{ type: "spring", stiffness: 400 }}
            >
              <Button variant="ghost" className="relative h-12 w-12 rounded-full hover:bg-yellow-400/10 transition-all duration-300">
                <Avatar className="h-12 w-12 ring-2 ring-yellow-400/50 hover:ring-yellow-400 transition-all duration-300">
                  <AvatarFallback className="bg-gradient-to-br from-yellow-400 via-orange-500 to-yellow-600 text-gray-900 font-bold text-lg">
                    {user.name?.charAt(0).toUpperCase() || "U"}
                  </AvatarFallback>
                </Avatar>
              </Button>
            </motion.div>
          </DropdownMenuTrigger>
          <DropdownMenuContent 
            className="w-64 bg-gradient-to-b from-gray-900 to-black border-2 border-yellow-400/30 overflow-hidden shadow-2xl shadow-yellow-400/10 backdrop-blur-md" 
            align="end"
          >
            <motion.div 
              className="flex items-center justify-start gap-3 p-4 bg-gradient-to-r from-yellow-400/10 to-orange-400/10"
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
            >
              <Avatar className="h-10 w-10">
                <AvatarFallback className="bg-gradient-to-br from-yellow-400 to-orange-500 text-gray-900 font-semibold">
                  {user.name?.charAt(0).toUpperCase() || "U"}
                </AvatarFallback>
              </Avatar>
              <div className="flex flex-col space-y-1 leading-none">
                <p className="font-semibold text-yellow-100">{user.name}</p>
                <p className="w-[180px] truncate text-sm text-yellow-400/70">{user.email}</p>
              </div>
            </motion.div>
            <DropdownMenuSeparator className="bg-yellow-400/20" />
            <DropdownMenuItem
              onClick={() => (window.location.href = "/profile")}
              className="text-yellow-100 hover:bg-yellow-400/10 hover:text-yellow-300 transition-all duration-200 cursor-pointer py-3 px-4"
            >
              <User className="mr-3 h-4 w-4" />
              Profile
            </DropdownMenuItem>
            <DropdownMenuItem className="text-yellow-100 hover:bg-yellow-400/10 hover:text-yellow-300 transition-all duration-200 cursor-pointer py-3 px-4">
              <Settings className="mr-3 h-4 w-4" />
              Settings
            </DropdownMenuItem>
            <DropdownMenuSeparator className="bg-yellow-400/20" />
            <DropdownMenuItem 
              onClick={onLogout} 
              className="text-red-400 hover:bg-red-400/10 hover:text-red-300 transition-all duration-200 cursor-pointer py-3 px-4"
            >
              <LogOut className="mr-3 h-4 w-4" />
              Log out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </motion.nav>
  )
}
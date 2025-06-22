"use client"

import { motion } from "framer-motion"
import { Button } from "../../ui/button"
import { Input } from "../../ui/input"
import { Avatar, AvatarFallback } from "../../ui/avatar"
import {
  Search,
  Users,
  LogOut,
  Settings,
  User,
  Gift,
  Plus,
  Menu,
} from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "../../ui/dropdown-menu"
import { StreakIcon } from "../../gamification/streak-icon"
import { PointsDisplay } from "../../gamification/points-display"

function UserInitialAvatar({ name }) {
  const initial = name?.charAt(0).toUpperCase() || "U"
  return (
    <AvatarFallback className="bg-gradient-to-br from-yellow-400 via-orange-500 to-yellow-600 text-gray-900 font-bold text-lg">
      {initial}
    </AvatarFallback>
  )
}

export function Navbar({
  user,
  roomStatus,
  roomId,
  isFullscreen,
  onCreateRoom,
  onJoinRoom,
  onLeaveRoom,
  onLogout,
}) {
  if (isFullscreen) return null

  return (
    <motion.nav
      initial={{ y: -30 }}
      animate={{ y: 0 }}
      className="fixed top-0 left-16 right-0 z-50 bg-black/90 backdrop-blur-md border-b border-yellow-500/10 px-4 py-3 flex justify-between items-center shadow-md"
    >
      {/* Left: Room Controls or Status */}
      <div className="flex items-center gap-4">
        {roomStatus === "none" ? (
          <>
            <motion.div whileHover={{ scale: 1.05 }}>
              <Button
                onClick={onCreateRoom}
                className="bg-yellow-400 text-gray-900 hover:bg-yellow-300 font-semibold shadow-md"
              >
                <Plus className="w-4 h-4 mr-2" />
                Create Room
              </Button>
            </motion.div>
            <motion.div whileHover={{ scale: 1.05 }}>
              <Button
                onClick={onJoinRoom}
                variant="outline"
                className="border-yellow-400 text-yellow-300 hover:text-yellow-200 hover:border-yellow-300"
              >
                <Users className="w-4 h-4 mr-2" />
                Join Room
              </Button>
            </motion.div>
          </>
        ) : (
          <>
            <motion.div
              initial={{ scale: 0.9 }}
              animate={{ scale: 1 }}
              transition={{ type: "spring", stiffness: 100 }}
              className="bg-gradient-to-r from-yellow-400 via-orange-400 to-yellow-500 px-5 py-2 rounded-lg text-gray-900 font-semibold flex items-center gap-2"
            >
              <Users className="w-5 h-5" />
              Room {roomId} {roomStatus === "host" && "(Host)"}
            </motion.div>
            <Button
              onClick={onLeaveRoom}
              variant="outline"
              className="border-red-500 text-red-400 hover:bg-red-500/10 hover:text-red-300"
            >
              Leave Room
            </Button>
          </>
        )}
      </div>

      {/* Center: Search */}
      <div className="hidden md:flex items-center relative w-64">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-yellow-400 w-4 h-4" />
        <Input
          placeholder="Search for a vibe..."
          className="pl-10 pr-4 h-10 bg-gray-900 border border-yellow-400/30 text-yellow-100 placeholder-yellow-500/60 focus:ring-yellow-400 rounded-lg"
        />
      </div>

      {/* Right: User, Gamification & Dropdown */}
      <div className="flex items-center gap-4">
        <div className="hidden md:flex items-center gap-3 border-l pl-4 border-yellow-500/20">
          <motion.div whileHover={{ scale: 1.1 }}>
            <StreakIcon />
          </motion.div>
          <motion.div whileHover={{ scale: 1.05 }}>
            <PointsDisplay />
          </motion.div>
        </div>

        <motion.div whileHover={{ scale: 1.05 }}>
          <Button
            onClick={() => (window.location.href = "/redeem")}
            variant="outline"
            className="border-yellow-400 text-yellow-300 hover:text-yellow-200 hover:border-yellow-300"
          >
            <Gift className="w-4 h-4 mr-2" />
            Redeem
          </Button>
        </motion.div>

        {/* Dropdown */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.95 }}>
              <Button variant="ghost" className="p-0 h-12 w-12 rounded-full">
                <Avatar className="h-12 w-12 ring-2 ring-yellow-400/50">
                  <UserInitialAvatar name={user.name} />
                </Avatar>
              </Button>
            </motion.div>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            className="w-64 bg-black border border-yellow-400/20 shadow-lg"
            align="end"
          >
            <div className="flex items-center gap-3 p-4">
              <Avatar className="h-10 w-10">
                <UserInitialAvatar name={user.name} />
              </Avatar>
              <div>
                <p className="text-yellow-100 font-semibold">{user.name}</p>
                <p className="text-yellow-400 text-sm truncate">{user.email}</p>
              </div>
            </div>
            <DropdownMenuSeparator className="bg-yellow-400/20" />
            <DropdownMenuItem
              onClick={() => (window.location.href = "/profile")}
              className="text-yellow-200 hover:bg-yellow-400/10"
            >
              <User className="mr-2 h-4 w-4" /> Profile
            </DropdownMenuItem>
            <DropdownMenuItem className="text-yellow-200 hover:bg-yellow-400/10">
              <Settings className="mr-2 h-4 w-4" /> Settings
            </DropdownMenuItem>
            <DropdownMenuSeparator className="bg-yellow-400/20" />
            <DropdownMenuItem
              onClick={onLogout}
              className="text-red-400 hover:bg-red-400/10"
            >
              <LogOut className="mr-2 h-4 w-4" /> Log Out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* Mobile Menu Button */}
      <div className="md:hidden">
        <Button size="icon" variant="ghost">
          <Menu className="text-yellow-400" />
        </Button>
      </div>
    </motion.nav>
  )
}

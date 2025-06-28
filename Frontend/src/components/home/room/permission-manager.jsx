"use client"

import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { 
  Settings, 
  Users, 
  Check, 
  X, 
  Crown, 
  Play, 
  Lock, 
  Unlock,
  Shield,
  UserCheck,
  UserX
} from "lucide-react"
import { Button } from "../../ui/button"

export function PermissionManager({ 
  isOpen, 
  onClose, 
  roomMembers, 
  roomPermissions, 
  currentUser,
  isHost,
  onGrantPermission,
  onRevokePermission,
  onToggleAnyoneCanControl
}) {
  const [isUpdating, setIsUpdating] = useState(false)

  const handleGrantPermission = async (userId) => {
    setIsUpdating(true)
    try {
      await onGrantPermission(userId)
    } catch (error) {
      console.error("Failed to grant permission:", error)
    }
    setIsUpdating(false)
  }

  const handleRevokePermission = async (userId) => {
    setIsUpdating(true)
    try {
      await onRevokePermission(userId)
    } catch (error) {
      console.error("Failed to revoke permission:", error)
    }
    setIsUpdating(false)
  }

  const handleToggleGlobalPermission = async () => {
    setIsUpdating(true)
    try {
      await onToggleAnyoneCanControl()
    } catch (error) {
      console.error("Failed to toggle global permission:", error)
    }
    setIsUpdating(false)
  }

  const hasVideoPermission = (member) => {
    if (member.uid === roomPermissions?.host) return true
    if (roomPermissions?.settings?.anyoneCanControl) return true
    return roomPermissions?.allowedUsers?.[member.uid]?.canControl || false
  }

  if (!isOpen) return null

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4"
        onClick={onClose}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: 20 }}
          className="bg-gray-900/95 backdrop-blur-md rounded-2xl border border-gray-700/50 w-full max-w-md overflow-hidden shadow-2xl"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="bg-gradient-to-r from-purple-600/20 to-blue-600/20 p-6 border-b border-gray-700/50">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-purple-600/20 rounded-lg">
                  <Shield className="w-5 h-5 text-purple-400" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-white">Room Permissions</h3>
                  <p className="text-sm text-gray-400">Manage video control access</p>
                </div>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={onClose}
                className="text-gray-400 hover:text-white hover:bg-gray-700/50"
              >
                <X className="w-4 h-4" />
              </Button>
            </div>
          </div>

          {/* Content */}
          <div className="p-6 space-y-6 max-h-96 overflow-y-auto">
            {/* Global Permission Toggle */}
            {isHost && (
              <div className="p-4 bg-gray-800/50 rounded-xl border border-gray-700/30">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    {roomPermissions?.settings?.anyoneCanControl ? (
                      <Unlock className="w-5 h-5 text-green-400" />
                    ) : (
                      <Lock className="w-5 h-5 text-orange-400" />
                    )}
                    <div>
                      <h4 className="font-semibold text-white">Anyone Can Control</h4>
                      <p className="text-sm text-gray-400">
                        {roomPermissions?.settings?.anyoneCanControl 
                          ? "All members can control video"
                          : "Only permitted members can control video"
                        }
                      </p>
                    </div>
                  </div>
                  <Button
                    variant={roomPermissions?.settings?.anyoneCanControl ? "destructive" : "default"}
                    size="sm"
                    onClick={handleToggleGlobalPermission}
                    disabled={isUpdating}
                    className="min-w-[80px]"
                  >
                    {isUpdating ? (
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    ) : roomPermissions?.settings?.anyoneCanControl ? (
                      "Disable"
                    ) : (
                      "Enable"
                    )}
                  </Button>
                </div>
              </div>
            )}

            {/* Members List */}
            <div className="space-y-3">
              <h4 className="font-semibold text-white flex items-center space-x-2">
                <Users className="w-4 h-4" />
                <span>Room Members ({roomMembers.length})</span>
              </h4>
              
              <div className="space-y-2">
                {roomMembers.map((member) => {
                  const isCurrentUser = member.uid === currentUser?.uid
                  const isMemberHost = member.uid === roomPermissions?.host
                  const hasPermission = hasVideoPermission(member)
                  
                  return (
                    <motion.div
                      key={member.uid}
                      layout
                      className="flex items-center justify-between p-3 bg-gray-800/30 rounded-lg border border-gray-700/20 hover:bg-gray-800/50 transition-colors"
                    >
                      <div className="flex items-center space-x-3">
                        <div className="relative">
                          <img
                            src={member.photoURL || `https://ui-avatars.com/api/?name=${encodeURIComponent(member.name)}&background=6366f1&color=ffffff`}
                            alt={member.name}
                            className="w-8 h-8 rounded-full"
                          />
                          {isMemberHost && (
                            <div className="absolute -top-1 -right-1 w-4 h-4 bg-yellow-500 rounded-full flex items-center justify-center">
                              <Crown className="w-2.5 h-2.5 text-black" />
                            </div>
                          )}
                        </div>
                        <div>
                          <p className="font-medium text-white">
                            {member.name} {isCurrentUser && "(You)"}
                          </p>
                          <div className="flex items-center space-x-2 text-xs">
                            {hasPermission ? (
                              <span className="flex items-center space-x-1 text-green-400">
                                <UserCheck className="w-3 h-3" />
                                <span>Can control video</span>
                              </span>
                            ) : (
                              <span className="flex items-center space-x-1 text-gray-400">
                                <UserX className="w-3 h-3" />
                                <span>View only</span>
                              </span>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Permission Controls */}
                      {isHost && !isMemberHost && !isCurrentUser && (
                        <div className="flex items-center space-x-2">
                          {hasPermission && !roomPermissions?.settings?.anyoneCanControl ? (
                            <Button
                              variant="destructive"
                              size="sm"
                              onClick={() => handleRevokePermission(member.uid)}
                              disabled={isUpdating}
                              className="h-8 px-3"
                            >
                              {isUpdating ? (
                                <div className="w-3 h-3 border border-white border-t-transparent rounded-full animate-spin" />
                              ) : (
                                <UserX className="w-3 h-3" />
                              )}
                            </Button>
                          ) : !roomPermissions?.settings?.anyoneCanControl ? (
                            <Button
                              variant="default"
                              size="sm"
                              onClick={() => handleGrantPermission(member.uid)}
                              disabled={isUpdating}
                              className="h-8 px-3 bg-green-600 hover:bg-green-700"
                            >
                              {isUpdating ? (
                                <div className="w-3 h-3 border border-white border-t-transparent rounded-full animate-spin" />
                              ) : (
                                <UserCheck className="w-3 h-3" />
                              )}
                            </Button>
                          ) : (
                            <span className="text-xs text-gray-500 px-3 py-1 bg-gray-700/50 rounded">
                              Auto-granted
                            </span>
                          )}
                        </div>
                      )}

                      {isMemberHost && (
                        <div className="flex items-center space-x-1 text-xs text-yellow-400 bg-yellow-400/10 px-2 py-1 rounded">
                          <Crown className="w-3 h-3" />
                          <span>Host</span>
                        </div>
                      )}
                    </motion.div>
                  )
                })}
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="p-6 border-t border-gray-700/50 bg-gray-900/30">
            <p className="text-xs text-gray-400 text-center">
              {isHost 
                ? "As the host, you can manage who has video control permissions"
                : "Only the host can manage video control permissions"
              }
            </p>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  )
}

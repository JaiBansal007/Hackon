"use client";

import { motion, AnimatePresence } from "framer-motion";
import { Button } from "../../ui/button";
import { Avatar, AvatarFallback } from "../../ui/avatar";
import { X, Users, Crown, Play, Pause, Settings, UserCheck, UserX } from "lucide-react";

export function RoomMembersSidebar({ 
  show, 
  onClose, 
  members, 
  currentUser, 
  roomStatus,
  isHost,
  roomPermissions,
  onGrantVideoControl,
  onRevokeVideoControl,
  onOpenPermissionManager
}) {
  const hasVideoPermission = (member) => {
    if (member.uid === roomPermissions?.host) return true;
    if (roomPermissions?.settings?.anyoneCanControl) return true;
    return roomPermissions?.allowedUsers?.[member.uid]?.canControl || false;
  };

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ x: 320 }}
          animate={{ x: 0 }}
          exit={{ x: 320 }}
          className="fixed right-0 top-0 h-full w-80 bg-black/20 backdrop-blur-lg border-l border-gray-700/50 z-50 shadow-2xl"
        >
          <div className="flex flex-col h-full">
            <div className="p-4 border-b border-gray-700/50 bg-gradient-to-r from-gray-800/50 to-gray-900/50">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-white">Room Members</h3>
                <Button
                  onClick={onClose}
                  variant="ghost"
                  size="sm"
                  className="text-gray-400 hover:text-white hover:bg-gray-700/50 rounded-full"
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>
              <div className="text-sm text-gray-400 mt-1">
                {members.length} members online
                {isHost && (
                  <div className="flex items-center justify-between mt-2">
                    <span className="text-yellow-400 text-xs">
                      <Crown className="w-3 h-3 inline mr-1" />
                      You are the host
                    </span>
                    <Button
                      onClick={onOpenPermissionManager}
                      variant="ghost"
                      size="sm"
                      className="h-6 px-2 text-xs text-blue-400 hover:text-blue-300 hover:bg-blue-500/10"
                    >
                      <Settings className="w-3 h-3 mr-1" />
                      Manage
                    </Button>
                  </div>
                )}
              </div>
            </div>

            <div className="flex-1 overflow-y-auto p-4">
              <div className="space-y-3">
                {members.map((member) => {
                  const isCurrentUser = member.uid === currentUser?.uid;
                  const isMemberHost = member.uid === roomPermissions?.host;
                  const hasPermission = hasVideoPermission(member);
                  
                  return (
                    <motion.div
                      key={member.uid}
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      className="flex items-center justify-between p-3 rounded-lg bg-gray-800/30 hover:bg-gray-800/50 transition-colors"
                    >
                      <div className="flex items-center space-x-3">
                        <div className="relative">
                          <Avatar className="w-10 h-10">
                            <img 
                              src={member.photoURL || `https://ui-avatars.com/api/?name=${encodeURIComponent(member.name)}&background=6366f1&color=ffffff`}
                              alt={member.name}
                              className="w-full h-full object-cover"
                            />
                            <AvatarFallback className="bg-blue-600 text-white text-sm">
                              {member.name?.charAt(0)?.toUpperCase() || "?"}
                            </AvatarFallback>
                          </Avatar>
                          {isMemberHost && (
                            <div className="absolute -top-1 -right-1 w-4 h-4 bg-yellow-500 rounded-full flex items-center justify-center">
                              <Crown className="w-2.5 h-2.5 text-black" />
                            </div>
                          )}
                        </div>
                        <div className="flex-1">
                          <p className="text-white font-medium">
                            {member.name} {isCurrentUser && "(You)"}
                          </p>
                          <div className="flex items-center space-x-2 text-xs">
                            {hasPermission ? (
                              <span className="flex items-center space-x-1 text-green-400">
                                <UserCheck className="w-3 h-3" />
                                <span>Can control</span>
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

                      {/* Quick permission controls for host */}
                      {isHost && !isMemberHost && !isCurrentUser && (
                        <div className="flex space-x-1">
                          {hasPermission && !roomPermissions?.settings?.anyoneCanControl ? (
                            <Button
                              onClick={() => onRevokeVideoControl(member.uid)}
                              variant="ghost"
                              size="sm"
                              className="h-8 w-8 p-0 text-red-400 hover:text-red-300 hover:bg-red-500/10"
                            >
                              <UserX className="w-3 h-3" />
                            </Button>
                          ) : !roomPermissions?.settings?.anyoneCanControl ? (
                            <Button
                              onClick={() => onGrantVideoControl(member.uid)}
                              variant="ghost"
                              size="sm"
                              className="h-8 w-8 p-0 text-green-400 hover:text-green-300 hover:bg-green-500/10"
                            >
                              <UserCheck className="w-3 h-3" />
                            </Button>
                          ) : null}
                        </div>
                      )}
                    </motion.div>
                  );
                })}
              </div>
            </div>

            {/* Footer */}
            <div className="p-4 border-t border-gray-700/50 bg-gray-900/30">
              <div className="text-xs text-gray-400 text-center">
                {roomStatus === "host" ? (
                  <p>You are hosting this room</p>
                ) : roomStatus === "joined" ? (
                  <p>Connected to room</p>
                ) : (
                  <p>Room status: {roomStatus}</p>
                )}
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
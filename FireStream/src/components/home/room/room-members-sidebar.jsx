"use client";

import { motion, AnimatePresence } from "framer-motion";
import { Button } from "../../ui/button";
import { Avatar, AvatarFallback } from "../../ui/avatar";
import { X, Users } from "lucide-react";

export function RoomMembersSidebar({ show, onClose, roomMembers, user, roomStatus }) {
  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ x: 320 }}
          animate={{ x: 0 }}
          exit={{ x: 320 }}
          className="fixed right-0 top-0 h-full w-80 bg-gradient-to-b from-black/95 to-gray-900/98 backdrop-blur-md border-l border-gray-700/50 z-50 shadow-2xl"
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
              <div className="text-sm text-gray-400 mt-1">{roomMembers.length + 1} members online</div>
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-3 custom-scrollbar">
              {/* Current user */}
              <div className="flex items-center space-x-3 p-2 rounded-lg bg-gradient-to-r from-yellow-400/20 to-orange-500/20">
                <Avatar className="h-8 w-8">
                  <AvatarFallback className="bg-gradient-to-r from-yellow-400 to-orange-500 text-black text-sm">
                    {user.name?.charAt(0).toUpperCase() || "U"}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <p className="text-white text-sm font-medium">{user.name} (You)</p>
                  <p className="text-orange-400 text-xs">{roomStatus === "host" ? "Host" : "Member"}</p>
                </div>
              </div>

              {/* Other room members */}
              {roomMembers
                .filter((member) => member.userId !== user.email)
                .map((member) => (
                  <div key={member.userId} className="flex items-center space-x-3 p-2 rounded-lg bg-gray-800/50">
                    <Avatar className="h-8 w-8">
                      <AvatarFallback className="bg-gradient-to-r from-blue-400 to-blue-600 text-white text-sm">
                        {member.userName?.charAt(0).toUpperCase() || "U"}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <p className="text-white text-sm font-medium">{member.userName}</p>
                      <p className="text-gray-400 text-xs">Online</p>
                    </div>
                  </div>
                ))}

              {roomMembers.filter((member) => member.userId !== user.email).length === 0 && (
                <div className="text-center text-gray-300 mt-8">
                  <Users className="w-8 h-8 mx-auto mb-2 opacity-50" />
                  <p>No other members in the room</p>
                </div>
              )}
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
import { 
    ref, 
    push, 
    onValue, 
    off, 
    set, 
    serverTimestamp, 
    query, 
    orderByChild, 
    limitToLast,
    get
} from "firebase/database";
import { realtimeDb } from "./config";

class ChatService {
    constructor() {
        this.activeListeners = new Map();
    }

    // Send a message to a room
    async sendMessage(roomId, message, user) {
        try {
            if (!realtimeDb) {
                throw new Error("Firebase Realtime Database not initialized");
            }

            const messagesRef = ref(realtimeDb, `rooms/${roomId}/messages`);
            const messageData = {
                text: message,
                userId: user.uid,
                userName: user.name,
                userPhoto: user.photoURL || null,
                timestamp: serverTimestamp(),
                createdAt: Date.now() // Fallback timestamp
            };

            await push(messagesRef, messageData);
            console.log("📨 Message sent successfully");
            return { success: true };
        } catch (error) {
            console.error("❌ Failed to send message:", error);
            return { success: false, error: error.message };
        }
    }

    // Listen to messages in a room
    listenToMessages(roomId, callback) {
        try {
            if (!realtimeDb) {
                console.warn("Firebase Realtime Database not initialized");
                return () => {};
            }

            const messagesRef = query(
                ref(realtimeDb, `rooms/${roomId}/messages`),
                orderByChild('createdAt'),
                limitToLast(100) // Last 100 messages
            );

            const unsubscribe = onValue(messagesRef, (snapshot) => {
                const messages = [];
                snapshot.forEach((childSnapshot) => {
                    const messageData = childSnapshot.val();
                    messages.push({
                        id: childSnapshot.key,
                        ...messageData
                    });
                });
                callback(messages);
            });

            // Store the listener for cleanup
            this.activeListeners.set(`messages_${roomId}`, unsubscribe);

            console.log(`👂 Listening to messages in room: ${roomId}`);

            // Return unsubscribe function
            return () => {
                off(messagesRef);
                this.activeListeners.delete(`messages_${roomId}`);
                console.log(`🔇 Stopped listening to messages in room: ${roomId}`);
            };
        } catch (error) {
            console.error("❌ Failed to listen to messages:", error);
            return () => {};
        }
    }

    // Update room members
    async updateRoomMember(roomId, user, isJoining = true) {
        try {
            if (!realtimeDb) {
                throw new Error("Firebase Realtime Database not initialized");
            }

            const memberRef = ref(realtimeDb, `rooms/${roomId}/members/${user.uid}`);
            
            if (isJoining) {
                await set(memberRef, {
                    name: user.name,
                    email: user.email,
                    photoURL: user.photoURL || null,
                    joinedAt: serverTimestamp(),
                    lastSeen: serverTimestamp()
                });
                console.log(`👥 User ${user.name} joined room ${roomId}`);
            } else {
                await set(memberRef, null); // Remove member
                console.log(`👋 User ${user.name} left room ${roomId}`);
            }

            return { success: true };
        } catch (error) {
            console.error("❌ Failed to update room member:", error);
            return { success: false, error: error.message };
        }
    }

    // Listen to room members
    listenToRoomMembers(roomId, callback) {
        try {
            if (!realtimeDb) {
                console.warn("Firebase Realtime Database not initialized");
                return () => {};
            }

            const membersRef = ref(realtimeDb, `rooms/${roomId}/members`);

            const unsubscribe = onValue(membersRef, (snapshot) => {
                const members = [];
                snapshot.forEach((childSnapshot) => {
                    const memberData = childSnapshot.val();
                    if (memberData) {
                        members.push({
                            uid: childSnapshot.key,
                            ...memberData
                        });
                    }
                });
                callback(members);
            });

            this.activeListeners.set(`members_${roomId}`, unsubscribe);

            return () => {
                off(membersRef);
                this.activeListeners.delete(`members_${roomId}`);
            };
        } catch (error) {
            console.error("❌ Failed to listen to room members:", error);
            return () => {};
        }
    }

    // Alias for listenToRoomMembers (for backward compatibility)
    listenToMembers(roomId, callback) {
        return this.listenToRoomMembers(roomId, callback);
    }

    // Send typing indicator
    async setTyping(roomId, user, isTyping) {
        try {
            if (!realtimeDb) return;

            const typingRef = ref(realtimeDb, `rooms/${roomId}/typing/${user.uid}`);
            
            if (isTyping) {
                await set(typingRef, {
                    name: user.name,
                    timestamp: serverTimestamp()
                });
            } else {
                await set(typingRef, null);
            }
        } catch (error) {
            console.error("❌ Failed to set typing indicator:", error);
        }
    }

    // Listen to typing indicators
    listenToTyping(roomId, callback) {
        try {
            if (!realtimeDb) return () => {};

            const typingRef = ref(realtimeDb, `rooms/${roomId}/typing`);

            const unsubscribe = onValue(typingRef, (snapshot) => {
                const typingUsers = [];
                snapshot.forEach((childSnapshot) => {
                    const typingData = childSnapshot.val();
                    if (typingData) {
                        typingUsers.push({
                            uid: childSnapshot.key,
                            ...typingData
                        });
                    }
                });
                callback(typingUsers);
            });

            this.activeListeners.set(`typing_${roomId}`, unsubscribe);

            return () => {
                off(typingRef);
                this.activeListeners.delete(`typing_${roomId}`);
            };
        } catch (error) {
            console.error("❌ Failed to listen to typing indicators:", error);
            return () => {};
        }
    }

    // Alias for listenToTyping (for backward compatibility)
    listenToTypingUsers(roomId, callback) {
        return this.listenToTyping(roomId, callback);
    }

    // Create a new room
    async createRoom(roomId, host) {
        try {
            if (!realtimeDb) {
                throw new Error("Firebase Realtime Database not initialized");
            }

            const roomRef = ref(realtimeDb, `rooms/${roomId}`);
            const roomData = {
                host: {
                    uid: host.uid,
                    name: host.name,
                    email: host.email
                },
                createdAt: Date.now(),
                members: {},
                messages: {},
                video: {
                    isPlaying: false,
                    currentTime: 0,
                    videoUrl: null
                },
                permissions: {}
            };

            await set(roomRef, roomData);
            console.log("🏠 Room created successfully:", roomId);
            return { success: true };
        } catch (error) {
            console.error("❌ Failed to create room:", error);
            return { success: false, error: error.message };
        }
    }

    // Join a room
    async joinRoom(roomId, user) {
        try {
            if (!realtimeDb) {
                throw new Error("Firebase Realtime Database not initialized");
            }

            // Check if room exists
            const roomRef = ref(realtimeDb, `rooms/${roomId}`);
            const roomSnapshot = await get(roomRef);
            
            if (!roomSnapshot.exists()) {
                throw new Error("Room does not exist");
            }

            // Add user to room members
            await this.updateRoomMember(roomId, user, true);
            
            console.log("🚪 Joined room successfully:", roomId);
            return { success: true };
        } catch (error) {
            console.error("❌ Failed to join room:", error);
            return { success: false, error: error.message };
        }
    }

    // Leave a room
    async leaveRoom(roomId, user) {
        try {
            if (!realtimeDb) {
                throw new Error("Firebase Realtime Database not initialized");
            }

            await this.updateRoomMember(roomId, user, false);
            
            console.log("🚪 Left room successfully:", roomId);
            return { success: true };
        } catch (error) {
            console.error("❌ Failed to leave room:", error);
            return { success: false, error: error.message };
        }
    }

    // Cleanup all listeners
    cleanup() {
        this.activeListeners.forEach((unsubscribe, key) => {
            try {
                unsubscribe();
            } catch (error) {
                console.error(`Error cleaning up listener ${key}:`, error);
            }
        });
        this.activeListeners.clear();
        console.log("🧹 Chat service cleaned up");
    }
}

// Create singleton instance
const chatService = new ChatService();

export default chatService;

import { 
    ref, 
    set, 
    onValue, 
    off, 
    serverTimestamp,
    get
} from "firebase/database";
import { realtimeDb } from "./config";

class VideoSyncService {
    constructor() {
        this.activeListeners = new Map();
        this.lastUpdate = {};
        this.updateThrottle = 100; // Minimum time between updates (1 second)
    }

    // Throttle video updates to prevent spam
    shouldThrottleUpdate(roomId, action) {
        const now = Date.now();
        const lastUpdateTime = this.lastUpdate[roomId] || 0;
        
        // Always allow play/pause/seek actions immediately
        if (['play', 'pause', 'seek'].includes(action)) {
            this.lastUpdate[roomId] = now;
            return false;
        }
        
        // Throttle sync/broadcast actions
        if (now - lastUpdateTime < this.updateThrottle) {
            return true;
        }
        
        this.lastUpdate[roomId] = now;
        return false;
    }

    // Update video state with improved sync handling and throttling
    async updateVideoState(roomId, videoState, user, isHost = false) {
        try {
            if (!realtimeDb) {
                throw new Error("Firebase Realtime Database not initialized");
            }

            // Check throttling (but allow important actions)
            if (this.shouldThrottleUpdate(roomId, videoState.action)) {
                console.log("🔄 Video update throttled for action:", videoState.action);
                return { success: true, throttled: true };
            }

            // Check if user has permission to control video
            const hasPermission = await this.checkVideoPermission(roomId, user.uid, isHost);
            
            if (!hasPermission) {
                console.warn("🚫 User doesn't have permission to control video");
                return { success: false, error: "No permission to control video" };
            }

            const videoRef = ref(realtimeDb, `rooms/${roomId}/video`);
            const now = Date.now();
            
            // Enhanced video state with better sync data
            const updateData = {
                ...videoState,
                lastUpdatedBy: user.uid,
                lastUpdatedByName: user.name,
                timestamp: serverTimestamp(),
                updatedAt: now,
                clientTimestamp: now,
                syncId: `${user.uid}_${now}`, // Unique sync ID to prevent echo
                version: (videoState.version || 0) + 1 // Version for conflict resolution
            };

            await set(videoRef, updateData);
            console.log("🎬 Video state updated:", {
                action: videoState.action,
                isPlaying: videoState.isPlaying,
                currentTime: videoState.currentTime,
                syncId: updateData.syncId
            });
            return { success: true, syncId: updateData.syncId };
        } catch (error) {
            console.error("❌ Failed to update video state:", error);
            return { success: false, error: error.message };
        }
    }

    // Enhanced video state listener with better sync handling
    listenToVideoState(roomId, callback) {
        try {
            if (!realtimeDb) {
                console.warn("Firebase Realtime Database not initialized");
                return () => {};
            }

            const videoRef = ref(realtimeDb, `rooms/${roomId}/video`);
            let lastProcessedSyncId = null;

            const unsubscribe = onValue(videoRef, (snapshot) => {
                const videoState = snapshot.val();
                if (videoState) {
                    // Prevent processing the same sync event multiple times
                    if (videoState.syncId && videoState.syncId === lastProcessedSyncId) {
                        return;
                    }
                    lastProcessedSyncId = videoState.syncId;

                    // Add network latency compensation for better sync
                    const networkDelay = Date.now() - (videoState.clientTimestamp || Date.now());
                    const compensatedState = {
                        ...videoState,
                        networkDelay,
                        // Compensate for network delay in current time (only for play actions)
                        currentTime: videoState.action === 'play' && videoState.isPlaying ? 
                            videoState.currentTime + (networkDelay / 1000) : videoState.currentTime
                    };

                    console.log("🔄 Video sync received:", {
                        action: videoState.action,
                        isPlaying: videoState.isPlaying,
                        currentTime: compensatedState.currentTime,
                        networkDelay: networkDelay + "ms",
                        from: videoState.lastUpdatedByName
                    });

                    callback(compensatedState);
                }
            });

            this.activeListeners.set(`video_${roomId}`, unsubscribe);

            return () => {
                off(videoRef);
                this.activeListeners.delete(`video_${roomId}`);
            };
        } catch (error) {
            console.error("❌ Failed to listen to video state:", error);
            return () => {};
        }
    }

    // Set room host and permissions
    async setRoomPermissions(roomId, hostUid, permissions = {}) {
        try {
            if (!realtimeDb) {
                throw new Error("Firebase Realtime Database not initialized");
            }

            const permissionsRef = ref(realtimeDb, `rooms/${roomId}/permissions`);
            const permissionData = {
                host: hostUid,
                allowedUsers: permissions.allowedUsers || {},
                settings: {
                    anyoneCanControl: permissions.anyoneCanControl || false,
                    requirePermission: permissions.requirePermission !== false,
                    ...permissions.settings
                },
                updatedAt: serverTimestamp()
            };

            await set(permissionsRef, permissionData);
            console.log("🔐 Room permissions set:", permissionData);
            return { success: true };
        } catch (error) {
            console.error("❌ Failed to set room permissions:", error);
            return { success: false, error: error.message };
        }
    }

    // Grant video control permission to a user
    async grantVideoPermission(roomId, targetUserId, grantedByUid, isHost = false) {
        try {
            if (!realtimeDb) {
                throw new Error("Firebase Realtime Database not initialized");
            }

            // Check if the granter has permission to grant permissions
            const hasPermission = await this.checkVideoPermission(roomId, grantedByUid, isHost);
            if (!hasPermission) {
                return { success: false, error: "No permission to grant access" };
            }

            const permissionRef = ref(realtimeDb, `rooms/${roomId}/permissions/allowedUsers/${targetUserId}`);
            await set(permissionRef, {
                grantedBy: grantedByUid,
                grantedAt: serverTimestamp(),
                canControl: true
            });

            console.log(`✅ Video permission granted to user ${targetUserId}`);
            return { success: true };
        } catch (error) {
            console.error("❌ Failed to grant video permission:", error);
            return { success: false, error: error.message };
        }
    }

    // Revoke video control permission from a user
    async revokeVideoPermission(roomId, targetUserId, revokedByUid, isHost = false) {
        try {
            if (!realtimeDb) {
                throw new Error("Firebase Realtime Database not initialized");
            }

            // Check if the revoker has permission to revoke permissions
            const hasPermission = await this.checkVideoPermission(roomId, revokedByUid, isHost);
            if (!hasPermission) {
                return { success: false, error: "No permission to revoke access" };
            }

            const permissionRef = ref(realtimeDb, `rooms/${roomId}/permissions/allowedUsers/${targetUserId}`);
            await set(permissionRef, null);

            console.log(`❌ Video permission revoked from user ${targetUserId}`);
            return { success: true };
        } catch (error) {
            console.error("❌ Failed to revoke video permission:", error);
            return { success: false, error: error.message };
        }
    }

    // Check if user has video control permission
    async checkVideoPermission(roomId, userId, isHost = false) {
        try {
            if (!realtimeDb) return false;

            // Host always has permission
            if (isHost) return true;

            const permissionsRef = ref(realtimeDb, `rooms/${roomId}/permissions`);
            const snapshot = await get(permissionsRef);
            const permissions = snapshot.val();

            if (!permissions) return false;

            // Check if user is the host
            if (permissions.host === userId) return true;

            // Check if anyone can control
            if (permissions.settings?.anyoneCanControl) return true;

            // Check if user has explicit permission
            if (permissions.allowedUsers?.[userId]?.canControl) return true;

            return false;
        } catch (error) {
            console.error("❌ Failed to check video permission:", error);
            return false;
        }
    }

    // Listen to room permissions
    listenToPermissions(roomId, callback) {
        try {
            if (!realtimeDb) {
                console.warn("Firebase Realtime Database not initialized");
                return () => {};
            }

            const permissionsRef = ref(realtimeDb, `rooms/${roomId}/permissions`);

            const unsubscribe = onValue(permissionsRef, (snapshot) => {
                const permissions = snapshot.val();
                callback(permissions);
            });

            this.activeListeners.set(`permissions_${roomId}`, unsubscribe);

            return () => {
                off(permissionsRef);
                this.activeListeners.delete(`permissions_${roomId}`);
            };
        } catch (error) {
            console.error("❌ Failed to listen to permissions:", error);
            return () => {};
        }
    }

    // Convenience methods for common video actions
    async playVideo(roomId, currentTime, videoUrl, user, isHost = false) {
        return this.updateVideoState(roomId, {
            action: 'play',
            currentTime,
            videoUrl,
            isPlaying: true
        }, user, isHost);
    }

    async pauseVideo(roomId, currentTime, videoUrl, user, isHost = false) {
        return this.updateVideoState(roomId, {
            action: 'pause',
            currentTime,
            videoUrl,
            isPlaying: false
        }, user, isHost);
    }

    async seekVideo(roomId, currentTime, videoUrl, user, isHost = false) {
        return this.updateVideoState(roomId, {
            action: 'seek',
            currentTime,
            videoUrl,
            isPlaying: true // Usually seeking happens during play
        }, user, isHost);
    }

    async changeVideo(roomId, newVideoUrl, user, isHost = false) {
        return this.updateVideoState(roomId, {
            action: 'change',
            currentTime: 0,
            videoUrl: newVideoUrl,
            isPlaying: false
        }, user, isHost);
    }

    // Periodic sync to keep all clients in sync (called by host periodically)
    async broadcastCurrentState(roomId, currentTime, isPlaying, videoUrl, user, isHost = false) {
        try {
            // Only broadcast if this user is the host or has permission
            const hasPermission = await this.checkVideoPermission(roomId, user.uid, isHost);
            if (!hasPermission || !isHost) return { success: false };

            // Throttle the update to prevent spamming
            if (this.shouldThrottleUpdate(roomId, 'broadcast')) {
                console.log("⏳ Update throttled");
                return { success: true }; // Throttled, return success
            }

            return this.updateVideoState(roomId, {
                action: 'sync',
                currentTime,
                videoUrl,
                isPlaying,
                isBroadcast: true // Flag to indicate this is a periodic sync
            }, user, isHost);
        } catch (error) {
            console.error("❌ Failed to broadcast video state:", error);
            return { success: false, error: error.message };
        }
    }

    // Get current video state (for initial sync when joining)
    async getCurrentVideoState(roomId) {
        try {
            if (!realtimeDb) {
                throw new Error("Firebase Realtime Database not initialized");
            }

            const videoRef = ref(realtimeDb, `rooms/${roomId}/video`);
            const snapshot = await get(videoRef);
            
            if (snapshot.exists()) {
                return { success: true, state: snapshot.val() };
            } else {
                return { success: true, state: null };
            }
        } catch (error) {
            console.error("❌ Failed to get current video state:", error);
            return { success: false, error: error.message };
        }
    }

    // Sync movie change across room members
    async syncMovieChange(roomId, movie, user) {
        try {
            if (!realtimeDb) {
                throw new Error("Firebase Realtime Database not initialized");
            }

            const videoState = {
                videoUrl: movie.videoUrl,
                movieTitle: movie.title,
                movieId: movie.movieId,
                currentTime: 0,
                isPlaying: false,
                updatedBy: user.uid,
                updatedByName: user.name,
                timestamp: serverTimestamp(),
                action: 'movie_change'
            };

            const roomVideoRef = ref(realtimeDb, `rooms/${roomId}/videoState`);
            await set(roomVideoRef, videoState);

            console.log("🎬 Movie change synced to room:", {
                roomId,
                movie: movie.title,
                user: user.name
            });

            return { success: true };
        } catch (error) {
            console.error("❌ Error syncing movie change:", error);
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
        console.log("🧹 Video sync service cleaned up");
    }
}

// Create singleton instance
const videoSyncService = new VideoSyncService();

export default videoSyncService;

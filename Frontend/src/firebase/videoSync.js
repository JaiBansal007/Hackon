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
        this.updateThrottle = 25; // Ultra-fast 25ms for super sync
        this.syncBuffer = new Map(); // Add buffer for batch updates
        this.syncHistory = new Map(); // Track sync performance per room
        this.networkQuality = this.detectNetworkQuality();
        
        // WebRTC Integration
        this.peerConnections = new Map(); // roomId -> Map<userId, RTCPeerConnection>
        this.dataChannels = new Map(); // roomId -> Map<userId, RTCDataChannel>
        this.webrtcEnabled = true;
        this.currentRoomId = null;
        this.currentUserId = null;
        this.isHost = false;
        this.webrtcCallbacks = new Map(); // Store callbacks for WebRTC sync
        this.syncMode = 'hybrid'; // 'firebase', 'webrtc', or 'hybrid'
        
        console.log("🚀 Super-fast video sync with WebRTC initialized:", this.networkQuality);
    }

    // Detect network quality for adaptive sync (enhanced for WebRTC)
    detectNetworkQuality() {
        const connection = navigator.connection || navigator.mozConnection || navigator.webkitConnection;
        if (connection) {
            const effectiveType = connection.effectiveType;
            const downlink = connection.downlink || 10;
            
            switch (effectiveType) {
                case 'slow-2g':
                case '2g':
                    return { 
                        throttle: 100, compensation: 0.3, precision: 3, interval: 1000,
                        webrtc: false, method: 'firebase' // Disable WebRTC for slow connections
                    };
                case '3g':
                    return { 
                        throttle: 50, compensation: 0.2, precision: 4, interval: 750,
                        webrtc: true, method: 'hybrid'
                    };
                case '4g':
                    if (downlink >= 10) {
                        return { 
                            throttle: 25, compensation: 0.05, precision: 6, interval: 250,
                            webrtc: true, method: 'webrtc' // Prefer WebRTC for high-speed
                        };
                    } else {
                        return { 
                            throttle: 35, compensation: 0.1, precision: 5, interval: 500,
                            webrtc: true, method: 'hybrid'
                        };
                    }
                default:
                    return { 
                        throttle: 25, compensation: 0.05, precision: 6, interval: 250,
                        webrtc: true, method: 'webrtc'
                    };
            }
        }
        return { 
            throttle: 25, compensation: 0.05, precision: 6, interval: 250,
            webrtc: true, method: 'hybrid'
        };
    }

    // Initialize WebRTC for a room (called internally when needed)
    async initWebRTC(roomId, userId, isHost) {
        if (!this.networkQuality.webrtc || !this.webrtcEnabled) {
            console.log("🔄 WebRTC disabled, using Firebase only");
            return false;
        }

        this.currentRoomId = roomId;
        this.currentUserId = userId;
        this.isHost = isHost;

        if (!this.peerConnections.has(roomId)) {
            this.peerConnections.set(roomId, new Map());
            this.dataChannels.set(roomId, new Map());
        }

        // Listen for WebRTC signaling through Firebase
        this.listenForWebRTCSignaling(roomId);

        console.log("🚀 WebRTC initialized for room:", roomId);
        return true;
    }

    // Create WebRTC peer connection
    createWebRTCPeerConnection(roomId, targetUserId) {
        const config = {
            iceServers: [
                { urls: 'stun:stun.l.google.com:19302' },
                { urls: 'stun:stun1.l.google.com:19302' }
            ],
            iceTransportPolicy: 'all',
            iceCandidatePoolSize: 10,
            bundlePolicy: 'max-bundle',
            rtcpMuxPolicy: 'require'
        };

        const peerConnection = new RTCPeerConnection(config);
        const roomConnections = this.peerConnections.get(roomId);
        roomConnections.set(targetUserId, peerConnection);

        // Create data channel for ultra-fast video sync
        const dataChannel = peerConnection.createDataChannel('videoSync', {
            ordered: false, // Speed over reliability for real-time sync
            maxRetransmits: 0,
            protocol: 'raw'
        });

        this.setupWebRTCDataChannel(roomId, targetUserId, dataChannel);
        this.setupWebRTCPeerEvents(roomId, targetUserId, peerConnection);

        return peerConnection;
    }

    // Setup WebRTC data channel for ultra-fast sync
    setupWebRTCDataChannel(roomId, targetUserId, dataChannel) {
        const roomChannels = this.dataChannels.get(roomId);
        
        dataChannel.onopen = () => {
            console.log(`⚡ WebRTC data channel opened with ${targetUserId}`);
            roomChannels.set(targetUserId, dataChannel);
        };

        dataChannel.onmessage = (event) => {
            this.handleWebRTCSync(roomId, targetUserId, event.data);
        };

        dataChannel.onclose = () => {
            console.log(`❌ WebRTC data channel closed with ${targetUserId}`);
            roomChannels.delete(targetUserId);
        };

        dataChannel.onerror = (error) => {
            console.error(`❌ WebRTC data channel error with ${targetUserId}:`, error);
        };
    }

    // Setup WebRTC peer connection events
    setupWebRTCPeerEvents(roomId, targetUserId, peerConnection) {
        peerConnection.onicecandidate = (event) => {
            if (event.candidate) {
                this.sendWebRTCSignaling(roomId, targetUserId, 'ice-candidate', event.candidate);
            }
        };

        peerConnection.ondatachannel = (event) => {
            const dataChannel = event.channel;
            this.setupWebRTCDataChannel(roomId, targetUserId, dataChannel);
        };

        peerConnection.onconnectionstatechange = () => {
            console.log(`WebRTC connection state with ${targetUserId}:`, peerConnection.connectionState);
        };
    }

    // Handle WebRTC sync messages with ultra-low latency
    handleWebRTCSync(roomId, fromUserId, data) {
        try {
            const receiveTime = performance.now();
            const syncData = JSON.parse(data);
            
            // Calculate WebRTC latency (typically 5-20ms)
            const webrtcLatency = receiveTime - syncData.sentTime;
            
            // Minimal compensation for WebRTC (much lower than Firebase)
            const compensation = webrtcLatency > 50 ? webrtcLatency / 1000 : 0.005; // 5ms default
            
            const compensatedState = {
                ...syncData,
                currentTime: syncData.currentTime + compensation,
                webrtcLatency,
                compensation,
                syncMethod: 'webrtc',
                fromUser: fromUserId,
                receivedAt: receiveTime
            };

            console.log("⚡ WebRTC ultra-sync received:", {
                action: syncData.action,
                latency: webrtcLatency.toFixed(1) + "ms",
                compensation: (compensation * 1000).toFixed(1) + "ms",
                from: fromUserId
            });

            // Call the callback registered by listenToVideoState
            const callback = this.webrtcCallbacks.get(roomId);
            if (callback) {
                callback(compensatedState);
            }
            
        } catch (error) {
            console.error("❌ Failed to handle WebRTC sync:", error);
        }
    }

    // Send WebRTC signaling through Firebase
    async sendWebRTCSignaling(roomId, targetUserId, type, data) {
        try {
            const signalId = `${this.currentUserId}_${targetUserId}_${Date.now()}`;
            const signalRef = ref(realtimeDb, `rooms/${roomId}/webrtc_signaling/${signalId}`);
            
            await set(signalRef, {
                type,
                fromUser: this.currentUserId,
                targetUser: targetUserId,
                data,
                timestamp: serverTimestamp(),
                processed: false
            });
        } catch (error) {
            console.error("❌ Failed to send WebRTC signaling:", error);
        }
    }

    // Listen for WebRTC signaling
    listenForWebRTCSignaling(roomId) {
        const signalingRef = ref(realtimeDb, `rooms/${roomId}/webrtc_signaling`);
        
        const unsubscribe = onValue(signalingRef, async (snapshot) => {
            const signals = snapshot.val();
            if (!signals) return;

            for (const [signalId, signal] of Object.entries(signals)) {
                if (signal.targetUser === this.currentUserId && !signal.processed) {
                    await this.handleWebRTCSignaling(roomId, signal);
                    
                    // Mark as processed
                    const processedRef = ref(realtimeDb, `rooms/${roomId}/webrtc_signaling/${signalId}/processed`);
                    await set(processedRef, true);
                }
            }
        });

        this.activeListeners.set(`webrtc_signaling_${roomId}`, unsubscribe);
    }

    // Handle WebRTC signaling messages
    async handleWebRTCSignaling(roomId, signal) {
        const { type, fromUser, data } = signal;
        const roomConnections = this.peerConnections.get(roomId);
        
        switch (type) {
            case 'offer':
                await this.handleWebRTCOffer(roomId, fromUser, data);
                break;
            case 'answer':
                await this.handleWebRTCAnswer(roomId, fromUser, data);
                break;
            case 'ice-candidate':
                await this.handleWebRTCIceCandidate(roomId, fromUser, data);
                break;
        }
    }

    // Handle WebRTC offer
    async handleWebRTCOffer(roomId, fromUser, offer) {
        try {
            const peerConnection = this.createWebRTCPeerConnection(roomId, fromUser);
            await peerConnection.setRemoteDescription(offer);
            
            const answer = await peerConnection.createAnswer();
            await peerConnection.setLocalDescription(answer);
            
            await this.sendWebRTCSignaling(roomId, fromUser, 'answer', answer);
        } catch (error) {
            console.error("❌ Failed to handle WebRTC offer:", error);
        }
    }

    // Handle WebRTC answer
    async handleWebRTCAnswer(roomId, fromUser, answer) {
        try {
            const roomConnections = this.peerConnections.get(roomId);
            const peerConnection = roomConnections.get(fromUser);
            
            if (peerConnection) {
                await peerConnection.setRemoteDescription(answer);
            }
        } catch (error) {
            console.error("❌ Failed to handle WebRTC answer:", error);
        }
    }

    // Handle WebRTC ICE candidate
    async handleWebRTCIceCandidate(roomId, fromUser, candidate) {
        try {
            const roomConnections = this.peerConnections.get(roomId);
            const peerConnection = roomConnections.get(fromUser);
            
            if (peerConnection) {
                await peerConnection.addIceCandidate(candidate);
            }
        } catch (error) {
            console.error("❌ Failed to handle WebRTC ICE candidate:", error);
        }
    }

    // Connect to peer via WebRTC
    async connectToWebRTCPeer(roomId, targetUserId) {
        try {
            const peerConnection = this.createWebRTCPeerConnection(roomId, targetUserId);
            
            const offer = await peerConnection.createOffer({
                offerToReceiveAudio: false,
                offerToReceiveVideo: false
            });
            
            await peerConnection.setLocalDescription(offer);
            await this.sendWebRTCSignaling(roomId, targetUserId, 'offer', offer);
            
            console.log(`🤝 WebRTC offer sent to ${targetUserId}`);
            return { success: true };
            
        } catch (error) {
            console.error(`❌ Failed to connect to WebRTC peer ${targetUserId}:`, error);
            return { success: false, error: error.message };
        }
    }

    // Enhanced throttling with action prioritization
    shouldThrottleUpdate(roomId, action) {
        const now = Date.now();
        const lastUpdateTime = this.lastUpdate[roomId] || 0;
        
        // ZERO throttling for critical sync actions
        if (['play', 'pause', 'seek', 'change'].includes(action)) {
            this.lastUpdate[roomId] = now;
            return false;
        }
        
        // Ultra-minimal throttling for broadcast/sync (25ms for super sync)
        if (now - lastUpdateTime < this.networkQuality.throttle) {
            return true;
        }
        
        this.lastUpdate[roomId] = now;
        return false;
    }

    // Update video state with WebRTC integration (keeping same function name)
    async updateVideoState(roomId, videoState, user, isHost = false) {
        try {
            // Initialize WebRTC if not already done
            if (this.webrtcEnabled && !this.currentRoomId) {
                await this.initWebRTC(roomId, user.uid, isHost);
            }

            // Try WebRTC first for ultra-low latency
            if (this.networkQuality.method === 'webrtc' || this.networkQuality.method === 'hybrid') {
                const webrtcResult = await this.sendWebRTCSync(roomId, videoState, user);
                if (webrtcResult.success && webrtcResult.peersSynced > 0) {
                    console.log("⚡ WebRTC sync successful, skipping Firebase");
                    return webrtcResult;
                }
            }

            // Firebase fallback or primary method
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
            const preciseTime = performance.now(); // Microsecond precision
            
            // Ultra-precise video state with performance timing
            const updateData = {
                ...videoState,
                lastUpdatedBy: user.uid,
                lastUpdatedByName: user.name,
                timestamp: serverTimestamp(),
                updatedAt: now,
                clientTimestamp: now,
                preciseTimestamp: preciseTime, // Add microsecond precision
                syncId: `${user.uid}_${now}_${Math.random().toString(36).substr(2, 9)}`, // More unique ID
                version: (videoState.version || 0) + 1, // Version for conflict resolution
                syncMethod: 'firebase', // Mark as Firebase sync
                // Add video element state for better sync
                videoElementState: {
                    paused: videoState.action === 'pause',
                    currentTime: parseFloat(videoState.currentTime.toFixed(this.networkQuality.precision)),
                    readyState: 4, // HAVE_ENOUGH_DATA
                    networkState: 1 // NETWORK_LOADING
                }
            };

            await set(videoRef, updateData);
            console.log("🎬 Firebase sync video state updated:", {
                action: videoState.action,
                isPlaying: videoState.isPlaying,
                currentTime: videoState.currentTime.toFixed(this.networkQuality.precision),
                syncId: updateData.syncId,
                preciseTime: preciseTime.toFixed(3) + "ms",
                method: "firebase"
            });
            return { success: true, syncId: updateData.syncId, method: 'firebase' };
        } catch (error) {
            console.error("❌ Failed to update video state:", error);
            return { success: false, error: error.message };
        }
    }

    // Send WebRTC sync message
    async sendWebRTCSync(roomId, videoState, user) {
        try {
            const roomChannels = this.dataChannels.get(roomId);
            if (!roomChannels || roomChannels.size === 0) {
                return { success: false, reason: "No WebRTC connections" };
            }

            const syncMessage = {
                ...videoState,
                lastUpdatedBy: user.uid,
                lastUpdatedByName: user.name,
                sentTime: performance.now(), // Microsecond precision
                syncId: `webrtc_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
                syncMethod: 'webrtc'
            };

            const messageData = JSON.stringify(syncMessage);
            let successCount = 0;

            // Send to all connected peers via WebRTC
            for (const [userId, dataChannel] of roomChannels.entries()) {
                if (dataChannel.readyState === 'open') {
                    try {
                        dataChannel.send(messageData);
                        successCount++;
                    } catch (error) {
                        console.warn(`Failed to send WebRTC sync to ${userId}:`, error);
                    }
                }
            }

            return { 
                success: true, 
                method: 'webrtc', 
                peersSynced: successCount,
                latency: '<20ms'
            };
            
        } catch (error) {
            console.error("❌ WebRTC sync failed:", error);
            return { success: false, error: error.message };
        }
    }

    // Enhanced listener with WebRTC integration (keeping same function name)
    listenToVideoState(roomId, callback) {
        try {
            // Store callback for WebRTC
            this.webrtcCallbacks.set(roomId, callback);

            // Firebase listener (always available as fallback)
            if (!realtimeDb) {
                console.warn("Firebase Realtime Database not initialized");
                return () => {};
            }

            const videoRef = ref(realtimeDb, `rooms/${roomId}/video`);
            let lastProcessedSyncId = null;

            const firebaseUnsubscribe = onValue(videoRef, (snapshot) => {
                const receiveTime = performance.now();
                const videoState = snapshot.val();
                
                if (videoState) {
                    // Prevent duplicate processing
                    if (videoState.syncId && videoState.syncId === lastProcessedSyncId) {
                        return;
                    }
                    lastProcessedSyncId = videoState.syncId;

                    // Skip if this is our own WebRTC sync (prevent echo)
                    if (videoState.syncMethod === 'webrtc' && videoState.lastUpdatedBy === this.currentUserId) {
                        return;
                    }

                    // Ultra-precise network compensation with adaptive settings
                    const networkDelay = Date.now() - (videoState.clientTimestamp || Date.now());
                    const preciseDelay = receiveTime - (videoState.preciseTimestamp || receiveTime);
                    
                    // Adaptive time compensation based on action and network quality
                    let timeCompensation = 0;
                    if (videoState.action === 'play' && videoState.isPlaying) {
                        timeCompensation = Math.max(
                            networkDelay / 1000, 
                            preciseDelay / 1000
                        ) + this.networkQuality.compensation;
                    } else if (videoState.action === 'sync' && videoState.isPlaying) {
                        timeCompensation = Math.max(networkDelay / 1000, 0) + (this.networkQuality.compensation / 2);
                    } else if (videoState.action === 'seek') {
                        timeCompensation = Math.max(networkDelay / 1000, 0) + 0.01;
                    }

                    const compensatedState = {
                        ...videoState,
                        networkDelay,
                        preciseDelay,
                        timeCompensation,
                        currentTime: parseFloat((videoState.currentTime + timeCompensation).toFixed(this.networkQuality.precision)),
                        originalTime: videoState.currentTime,
                        syncMethod: videoState.syncMethod || 'firebase',
                        syncQuality: {
                            networkDelay: networkDelay,
                            preciseDelay: preciseDelay,
                            compensation: timeCompensation,
                            action: videoState.action,
                            quality: this.networkQuality
                        }
                    };

                    // Track sync performance
                    if (!this.syncHistory.has(roomId)) {
                        this.syncHistory.set(roomId, []);
                    }
                    const roomHistory = this.syncHistory.get(roomId);
                    roomHistory.push({
                        action: videoState.action,
                        networkDelay,
                        preciseDelay,
                        compensation: timeCompensation,
                        timestamp: Date.now(),
                        method: videoState.syncMethod || 'firebase',
                        quality: this.networkQuality.throttle
                    });
                    
                    if (roomHistory.length > 20) {
                        roomHistory.splice(0, roomHistory.length - 20);
                    }

                    console.log("🔄 Firebase sync received:", {
                        action: videoState.action,
                        method: videoState.syncMethod || 'firebase',
                        networkDelay: networkDelay + "ms",
                        compensation: (timeCompensation * 1000).toFixed(1) + "ms",
                        from: videoState.lastUpdatedByName
                    });

                    callback(compensatedState);
                }
            });

            this.activeListeners.set(`video_${roomId}`, firebaseUnsubscribe);

            return () => {
                off(videoRef);
                this.activeListeners.delete(`video_${roomId}`);
                this.webrtcCallbacks.delete(roomId);
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

            if (isHost) return true;

            const permissionsRef = ref(realtimeDb, `rooms/${roomId}/permissions`);
            const snapshot = await get(permissionsRef);
            const permissions = snapshot.val();

            if (!permissions) return false;

            if (permissions.host === userId) return true;
            if (permissions.settings?.anyoneCanControl) return true;
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

    // Ultra-fast broadcast with WebRTC integration
    async broadcastCurrentState(roomId, currentTime, isPlaying, videoUrl, user, isHost = false) {
        try {
            const hasPermission = await this.checkVideoPermission(roomId, user.uid, isHost);
            if (!hasPermission || !isHost) return { success: false };

            const now = Date.now();
            const lastBroadcast = this.lastUpdate[`${roomId}_broadcast`] || 0;
            
            if (now - lastBroadcast < this.networkQuality.interval) {
                return { success: true, throttled: true };
            }
            this.lastUpdate[`${roomId}_broadcast`] = now;

            return this.updateVideoState(roomId, {
                action: 'sync',
                currentTime: parseFloat(currentTime.toFixed(this.networkQuality.precision)),
                videoUrl,
                isPlaying,
                isBroadcast: true,
                broadcastQuality: 'ultra',
                networkSettings: this.networkQuality,
                videoMetadata: {
                    buffered: true,
                    readyState: 4,
                    networkState: 1,
                    precision: this.networkQuality.precision
                }
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

    // Cleanup with WebRTC cleanup
    cleanup() {
        // Cleanup WebRTC connections
        this.peerConnections.forEach((roomConnections, roomId) => {
            roomConnections.forEach((peerConnection, userId) => {
                peerConnection.close();
            });
        });
        this.peerConnections.clear();
        this.dataChannels.clear();
        this.webrtcCallbacks.clear();

        // Cleanup Firebase listeners
        this.activeListeners.forEach((unsubscribe, key) => {
            try {
                unsubscribe();
            } catch (error) {
                console.error(`Error cleaning up listener ${key}:`, error);
            }
        });
        this.activeListeners.clear();
        
        // Log final performance
        this.syncHistory.forEach((history, roomId) => {
            if (history.length > 0) {
                console.log(`📊 Final sync stats for room ${roomId}:`, this.getSyncMetrics(roomId));
            }
        });
        
        this.syncHistory.clear();
        console.log("🧹 WebRTC + Firebase video service cleaned up");
    }

    // Get enhanced sync performance metrics
    getSyncMetrics(roomId) {
        const history = this.syncHistory.get(roomId) || [];
        if (history.length === 0) return null;

        const webrtcSyncs = history.filter(h => h.method === 'webrtc');
        const firebaseSyncs = history.filter(h => h.method === 'firebase');

        const avgNetworkDelay = history.reduce((sum, h) => sum + h.networkDelay, 0) / history.length;
        const avgPreciseDelay = history.reduce((sum, h) => sum + h.preciseDelay, 0) / history.length;
        const avgCompensation = history.reduce((sum, h) => sum + h.compensation, 0) / history.length;

        return {
            avgNetworkDelay: avgNetworkDelay.toFixed(2) + "ms",
            avgPreciseDelay: avgPreciseDelay.toFixed(3) + "ms",
            avgCompensation: (avgCompensation * 1000).toFixed(1) + "ms",
            totalSyncs: history.length,
            webrtcSyncs: webrtcSyncs.length,
            firebaseSyncs: firebaseSyncs.length,
            webrtcPercentage: ((webrtcSyncs.length / history.length) * 100).toFixed(1) + "%",
            currentQuality: this.networkQuality,
            lastSync: new Date(history[history.length - 1].timestamp).toLocaleTimeString()
        };
    }

    // Auto-optimize sync settings based on performance
    optimizeSyncSettings(roomId) {
        const history = this.syncHistory.get(roomId) || [];
        if (history.length < 5) return;

        const recentHistory = history.slice(-10);
        const avgNetworkDelay = recentHistory.reduce((sum, h) => sum + h.networkDelay, 0) / recentHistory.length;
        const webrtcSuccess = recentHistory.filter(h => h.method === 'webrtc').length;
        const webrtcSuccessRate = webrtcSuccess / recentHistory.length;

        // Optimize based on WebRTC success rate and network delay
        if (webrtcSuccessRate > 0.8 && avgNetworkDelay < 100) {
            // High WebRTC success - prefer WebRTC
            this.networkQuality = {
                ...this.networkQuality,
                method: 'webrtc',
                throttle: 15, // Even faster for WebRTC
                interval: 200
            };
        } else if (avgNetworkDelay > 500) {
            // High latency - use Firebase only
            this.networkQuality = {
                throttle: 100,
                compensation: 0.3,
                precision: 3,
                interval: 1000,
                method: 'firebase',
                webrtc: false
            };
        } else {
            // Balanced hybrid approach
            this.networkQuality = {
                ...this.networkQuality,
                method: 'hybrid',
                throttle: 25,
                interval: 250
            };
        }

        console.log("🔧 Auto-optimized sync settings:", this.networkQuality, 
            `WebRTC success: ${(webrtcSuccessRate * 100).toFixed(1)}%, Avg delay: ${avgNetworkDelay.toFixed(0)}ms`);
    }

    // Enhanced preload with WebRTC peer discovery
    async preloadVideoSync(roomId, videoUrl) {
        try {
            // Preload Firebase metadata
            const videoMetaRef = ref(realtimeDb, `rooms/${roomId}/videoMeta`);
            await set(videoMetaRef, {
                videoUrl,
                preloaded: true,
                timestamp: serverTimestamp(),
                networkQuality: this.networkQuality,
                webrtcEnabled: this.webrtcEnabled
            });

            // Preload WebRTC peer connections if enabled
            if( this.webrtcEnabled && this.networkQuality.webrtc) {
                // Get room members for WebRTC peer discovery
                const membersRef = ref(realtimeDb, `rooms/${roomId}/members`);
                const membersSnapshot = await get(membersRef);
                const members = membersSnapshot.val();

                if (members) {
                    for (const [userId, member] of Object.entries(members)) {
                        if (userId !== this.currentUserId) {
                            // Initiate WebRTC connections to existing members
                            await this.connectToWebRTCPeer(roomId, userId);
                        }
                    }
                }
            }
            
            console.log("⚡ Video sync preloaded with WebRTC peer discovery");
            return { success: true };
        } catch (error) {
            console.error("❌ Failed to preload video sync:", error);
            return { success: false };
        }
    }
}

// Create singleton instance
const videoSyncService = new VideoSyncService();

export default videoSyncService;

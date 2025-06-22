import { db } from "@/firebase/db"
import { doc, setDoc, getDoc, updateDoc, arrayUnion, onSnapshot, collection, addDoc, deleteDoc } from "firebase/firestore"

export class WebSocketManager {
  roomId = null
  userId
  userName
  callbacks = {}
  isConnected = false
  eventListener = null

  // Video sync variables
  videoSyncSocket = null
  clientUid = null
  correction = 0
  overEstimates = []
  underEstimates = []
  overEstimate = 0
  underEstimate = 0
  numTimeSyncCycles = 10
  playingThresh = 1
  pausedThresh = 0.01
  threshIgnorance = 250
  lastUpdated = 0
  videoPlaying = false

  constructor(userId, userName) {
    this.userId = userId
    this.userName = userName
    this.callbacks = {}
    this.unsubscribeRoom = null
    this.unsubscribeVideo = null
  }

  async connect(roomId) {
    this.roomId = roomId
    this.isConnected = true

    const roomRef = doc(db, "rooms", roomId)
    const roomSnap = await getDoc(roomRef)
    if (!roomSnap.exists()) {
      await setDoc(roomRef, { members: [], messages: [], videoState: null })
    }
    // Use setDoc with merge to ensure the arrayUnion works even if the doc is new
    await setDoc(
      roomRef,
      {
        members: arrayUnion({
          userId: this.userId,
          userName: this.userName,
          joinedAt: Date.now(),
        }),
      },
      { merge: true }
    )

    // Listen for room changes (chat, members, etc.)
    this.unsubscribeRoom = onSnapshot(roomRef, (docSnap) => {
      const data = docSnap.data()
      if (data) {
        this.emit("room_members_update", { members: data.members })
        // Handle chat messages, etc. as needed
      }
    })

    // Listen for video sync changes
    const videoRef = doc(db, "rooms", roomId, "sync", "video")
    this.unsubscribeVideo = onSnapshot(videoRef, (docSnap) => {
      const data = docSnap.data()
      if (data && data.userId !== this.userId) {
        this.handleVideoSyncMessage(data.message)
      }
    })

    // Notify others about joining
    this.sendMessage("user_joined", { userId: this.userId, userName: this.userName })

    this.emit("connected", { roomId, userId: this.userId, userName: this.userName })
  }

  async disconnect() {
    if (this.roomId && this.isConnected) {
      // Remove user from room members
      const roomRef = doc(db, "rooms", this.roomId)
      const roomSnap = await getDoc(roomRef)
      if (roomSnap.exists()) {
        const data = roomSnap.data()
        const newMembers = (data.members || []).filter((m) => m.userId !== this.userId)
        await updateDoc(roomRef, { members: newMembers })
      }

      // Notify others about leaving
      this.sendMessage("user_left", { userId: this.userId, userName: this.userName })

      // Unsubscribe listeners
      if (this.unsubscribeRoom) this.unsubscribeRoom()
      if (this.unsubscribeVideo) this.unsubscribeVideo()
    }
    this.isConnected = false
    this.roomId = null
    this.emit("disconnected", {})
  }

  async sendMessage(type, payload) {
    if (this.isConnected && this.roomId) {
      const messagesRef = collection(db, "rooms", this.roomId, "messages")
      await addDoc(messagesRef, {
        type,
        payload: { ...payload, userId: this.userId, userName: this.userName },
        timestamp: Date.now(),
      })
    }
  }

  // Add sendChatMessage for chat
  async sendChatMessage(message) {
    if (this.isConnected && this.roomId) {
      const messagesRef = collection(db, "rooms", this.roomId, "messages")
      await addDoc(messagesRef, {
        type: "chat_message",
        payload: {
          userId: this.userId,
          userName: this.userName,
          message,
          timestamp: Date.now(),
        },
        timestamp: Date.now(),
      })
    }
  }

  // Add sendReaction for reactions
  async sendReaction(emoji) {
    if (this.isConnected && this.roomId) {
      const messagesRef = collection(db, "rooms", this.roomId, "messages")
      await addDoc(messagesRef, {
        type: "reaction",
        payload: {
          userId: this.userId,
          userName: this.userName,
          emoji,
          timestamp: Date.now(),
        },
        timestamp: Date.now(),
      })
    }
  }

  listenForMessages(callback) {
    if (this.roomId) {
      const messagesRef = collection(db, "rooms", this.roomId, "messages")
      return onSnapshot(messagesRef, (snapshot) => {
        const messages = []
        snapshot.forEach((doc) => messages.push({ id: doc.id, ...doc.data() }))
        callback(messages)
      })
    }
    return null
  }

  // Video sync methods
  async stateChangeHandler(eventType, currentTime) {
    const videoRef = doc(db, "rooms", this.roomId, "sync", "video")
    const stateImage = {
      video_timestamp: currentTime,
      last_updated: Date.now(),
      playing: this.videoPlaying,
      global_timestamp: Date.now(),
      client_uid: this.clientUid,
      userId: this.userId,
      message: `state_update_from_server ${JSON.stringify({
        video_timestamp: currentTime,
        last_updated: Date.now(),
        playing: this.videoPlaying,
        global_timestamp: Date.now(),
        client_uid: this.clientUid,
      })}`,
    }
    await setDoc(videoRef, stateImage)
  }

  handleVideoSyncMessage(message) {
    // Time syncing backward server-response
    if (message.startsWith("time_sync_response_backward")) {
      const timeAtServer = Number(message.slice("time_sync_response_backward".length + 1))
      const underEstimateLatest = timeAtServer - this.getGlobalTime(0)

      this.underEstimates.push(underEstimateLatest)
      this.underEstimate = this.median(this.underEstimates)
      this.correction = (this.underEstimate + this.overEstimate) / 2

      console.log(`Updated val for under_estimate is ${this.underEstimate}`)
      console.log(`New correction time is ${this.correction} milliseconds`)
    }

    // Time syncing forward server-response
    if (message.startsWith("time_sync_response_forward")) {
      const calculatedDiff = Number(message.slice("time_sync_response_forward".length + 1))
      this.overEstimates.push(calculatedDiff)
      this.overEstimate = this.median(this.overEstimates)
      this.correction = (this.underEstimate + this.overEstimate) / 2

      console.log(`Updated val for over_estimate is ${this.overEstimate}`)
      console.log(`New correction time is ${this.correction} milliseconds`)
    }

    // Video state update from server
    if (message.startsWith("state_update_from_server")) {
      const state = JSON.parse(message.slice("state_update_from_server".length + 1))

      // Whenever the client connects or reconnects
      if (this.clientUid == null) {
        this.clientUid = state.client_uid
      }

      // Emit video sync state to the video player
      this.emit("video_sync_state", state)
    }
  }

  on(event, callback) {
    if (!this.callbacks[event]) {
      this.callbacks[event] = []
    }
    this.callbacks[event].push(callback)
  }

  off(event, callback) {
    if (this.callbacks[event]) {
      this.callbacks[event] = this.callbacks[event].filter((cb) => cb !== callback)
    }
  }

  emit(event, data) {
    if (this.callbacks[event]) {
      this.callbacks[event].forEach((callback) => callback(data))
    }
  }

  // Video control methods with sync
  play(currentTime) {
    this.videoPlaying = true
    this.stateChangeHandler("play", currentTime)
    this.sendMessage("video_play", { currentTime })
  }

  pause(currentTime) {
    this.videoPlaying = false
    this.stateChangeHandler("pause", currentTime)
    this.sendMessage("video_pause", { currentTime })
  }

  seek(currentTime) {
    this.stateChangeHandler("seeking", currentTime)
    this.sendMessage("video_seek", { currentTime })
  }

  // Helper functions for video sync
  getGlobalTime(delta = 0) {
    const d = new Date()
    return d.getTime() + delta
  }

  median(values) {
    if (values.length === 0) {
      return 0
    }
    values.sort((x, y) => x - y)
    const half = Math.floor(values.length / 2)
    if (values.length % 2) {
      return values[half]
    }
    return (values[half - 1] + values[half]) / 2.0
  }

  timeout(ms) {
    return new Promise((resolve) => setTimeout(resolve, ms))
  }

  doTimeSyncOneCycleBackward() {
    if (this.videoSyncSocket) {
      this.videoSyncSocket.send("time_sync_request_backward")
      // Mock server response
      setTimeout(() => {
        this.handleVideoSyncMessage(`time_sync_response_backward ${this.getGlobalTime()}`)
      }, 50)
    }
  }

  doTimeSyncOneCycleForward() {
    if (this.videoSyncSocket) {
      const currentTime = this.getGlobalTime()
      this.videoSyncSocket.send(`time_sync_request_forward ${currentTime}`)
      // Mock server response
      setTimeout(() => {
        const serverTime = this.getGlobalTime()
        this.handleVideoSyncMessage(`time_sync_response_forward ${serverTime - currentTime}`)
      }, 50)
    }
  }

  async doTimeSync() {
    for (let i = 0; i < this.numTimeSyncCycles; i++) {
      await this.timeout(500)
      this.doTimeSyncOneCycleBackward()
      await this.timeout(500)
      this.doTimeSyncOneCycleForward()
    }
  }
}

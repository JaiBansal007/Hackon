import { initializeApp } from "firebase/app"
import { getDatabase, ref, onValue, set, push, remove, off, get } from "firebase/database"

const firebaseConfig = {
  apiKey: "AIzaSyBfU99fHdfCGsmO0uXTnQKLVX-2f5IrRd0",
  authDomain: "firestream-e8465.firebaseapp.com",
  databaseURL: "https://firestream-e8465-default-rtdb.firebaseio.com",
  projectId: "firestream-e8465",
  storageBucket: "firestream-e8465.firebasestorage.app",
  messagingSenderId: "869857658241",
  appId: "1:869857658241:web:6bbffa799a37f54e9e9480",
  measurementId: "G-6RXNYL8D6H"
}

const app = initializeApp(firebaseConfig)
const db = getDatabase(app)

export class WebSocketManager {
  constructor(userId, userName) {
    this.userId = userId
    this.userName = userName
    this.roomId = null
    this.callbacks = {}
    this.listeners = []
    this.memberRef = null
  }

  async connect(roomId) {
    this.roomId = roomId

    // 1. Create the room node with metadata if it doesn't exist
    const roomMetaRef = ref(db, `rooms/${roomId}/meta`)
    await set(roomMetaRef, {
      createdAt: Date.now(),
      hostId: this.userId,
      hostName: this.userName,
    })

    // 2. Add user to room members
    this.memberRef = ref(db, `rooms/${roomId}/members/${this.userId}`)
    try {
      await set(this.memberRef, {
        userId: this.userId,
        userName: this.userName,
        joinedAt: Date.now(),
      })
      console.log("Member set in Firebase")
    } catch (e) {
      console.error("Failed to set member:", e)
    }

    // 3. Set up listeners (room members, chat, video, reactions)
    const membersRef = ref(db, `rooms/${roomId}/members`)
    const membersListener = onValue(membersRef, (snapshot) => {
      const members = snapshot.val() ? Object.values(snapshot.val()) : []
      this.emit("room_members_update", { members })
    })
    this.listeners.push({ ref: membersRef, listener: membersListener })

    const chatRef = ref(db, `rooms/${roomId}/messages`)
    const chatListener = onValue(chatRef, (snapshot) => {
      const messages = snapshot.val() ? Object.values(snapshot.val()) : []
      if (messages.length > 0) {
        this.emit("chat_message", messages[messages.length - 1])
      }
    })
    this.listeners.push({ ref: chatRef, listener: chatListener })

    const videoRef = ref(db, `rooms/${roomId}/videoState`)
    const videoListener = onValue(videoRef, (snapshot) => {
      const state = snapshot.val()
      if (state) this.emit("video_sync", state)
    })
    this.listeners.push({ ref: videoRef, listener: videoListener })

    const reactionsRef = ref(db, `rooms/${roomId}/reactions`)
    const reactionsListener = onValue(reactionsRef, (snapshot) => {
      const reactions = snapshot.val() ? Object.values(snapshot.val()) : []
      if (reactions.length > 0) {
        this.emit("reaction", reactions[reactions.length - 1])
      }
    })
    this.listeners.push({ ref: reactionsRef, listener: reactionsListener })

    this.emit("connected", { roomId, userId: this.userId, userName: this.userName })
  }

  async disconnect() {
    if (this.roomId && this.memberRef) {
      await remove(this.memberRef)
      this.emit("user_left", { userId: this.userId, userName: this.userName })
    }
    this.listeners.forEach(({ ref: r, listener: l }) => off(r, "value", l))
    this.listeners = []
    this.roomId = null
    this.memberRef = null
    this.emit("disconnected", {})
  }

  async sendChatMessage(message) {
    if (!this.roomId) return
    const chatRef = ref(db, `rooms/${this.roomId}/messages`)
    await push(chatRef, {
      userId: this.userId,
      userName: this.userName,
      message,
      timestamp: Date.now(),
    })
  }

  async sendReaction(emoji) {
    if (!this.roomId) return
    const reactionsRef = ref(db, `rooms/${this.roomId}/reactions`)
    await push(reactionsRef, {
      emoji,
      userId: this.userId,
      userName: this.userName,
      timestamp: Date.now(),
    })
  }

  async play(currentTime) {
    await this.updateVideoState({ playing: true, currentTime, timestamp: Date.now(), action: "play" })
  }

  async pause(currentTime) {
    await this.updateVideoState({ playing: false, currentTime, timestamp: Date.now(), action: "pause" })
  }

  async seek(currentTime) {
    await this.updateVideoState({ playing: false, currentTime, timestamp: Date.now(), action: "seek" })
  }

  async updateVideoState(state) {
    if (!this.roomId) return
    const videoRef = ref(db, `rooms/${this.roomId}/videoState`)
    await set(videoRef, state)
  }

  on(event, callback) {
    if (!this.callbacks[event]) this.callbacks[event] = []
    this.callbacks[event].push(callback)
  }

  off(event, callback) {
    if (this.callbacks[event]) {
      this.callbacks[event] = this.callbacks[event].filter((cb) => cb !== callback)
    }
  }

  emit(event, data) {
    if (this.callbacks[event]) {
      this.callbacks[event].forEach((cb) => cb(data))
    }
  }

  async getRoomMembers() {
    if (!this.roomId) return []
    const membersRef = ref(db, `rooms/${this.roomId}/members`)
    const snapshot = await get(membersRef)
    return snapshot.val() ? Object.values(snapshot.val()) : []
  }

  async getRoomData(roomId) {
    const roomRef = ref(db, `rooms/${roomId}`)
    const snapshot = await get(roomRef)
    return snapshot.val() || {}
  }

  async roomExists(roomId) {
    const membersRef = ref(db, `rooms/${roomId}/members`)
    const snapshot = await get(membersRef)
    return !!snapshot.val()
  }
}
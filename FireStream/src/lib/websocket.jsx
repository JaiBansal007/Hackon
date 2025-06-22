export class WebSocketManager {
  roomId = null
  userId
  userName
  callbacks = {}
  isConnected = false
  eventListener = null
  videoState = null

  constructor(userId, userName) {
    this.userId = userId
    this.userName = userName
  }

  connect(roomId) {
    if (this.isConnected) {
      this.disconnect()
    }

    this.roomId = roomId
    this.isConnected = true

    this.eventListener = (event) => {
      if (event.key === `firestream_room_${roomId}` && event.newValue) {
        try {
          const data = JSON.parse(event.newValue)
          if (data.userId !== this.userId) {
            this.emit(data.type, data.payload)
          }
        } catch (error) {
          console.error("Error parsing room message:", error)
        }
      }
    }

    window.addEventListener("storage", this.eventListener)

    const roomData = this.getRoomData(roomId)
    const userExists = roomData.members.some((member) => member.userId === this.userId)

    if (!userExists) {
      roomData.members.push({
        userId: this.userId,
        userName: this.userName,
        joinedAt: Date.now(),
      })
      this.setRoomData(roomId, roomData)

      this.sendMessage("user_joined", {
        userId: this.userId,
        userName: this.userName,
        notification: `${this.userName} has joined the room`,
      })
    }

    this.emit("connected", { roomId, userId: this.userId, userName: this.userName })

    setTimeout(() => {
      this.emit("room_members_update", { members: roomData.members })

      if (roomData.videoState) {
        this.emit("video_sync", roomData.videoState)
      }
    }, 100)

    console.log(`Connected to room ${roomId}`)
  }

  disconnect() {
    if (this.roomId && this.isConnected) {
      const roomData = this.getRoomData(this.roomId)
      roomData.members = roomData.members.filter((member) => member.userId !== this.userId)
      this.setRoomData(this.roomId, roomData)

      this.sendMessage("user_left", {
        userId: this.userId,
        userName: this.userName,
        notification: `${this.userName} has left the room`,
      })

      if (this.eventListener) {
        window.removeEventListener("storage", this.eventListener)
        this.eventListener = null
      }

      console.log(`Disconnected from room ${this.roomId}`)
    }

    this.isConnected = false
    this.roomId = null
    this.emit("disconnected", {})
  }

  getRoomData(roomId) {
    const data = localStorage.getItem(`firestream_room_data_${roomId}`)
    return data ? JSON.parse(data) : { members: [], messages: [], videoState: null }
  }

  setRoomData(roomId, data) {
    localStorage.setItem(`firestream_room_data_${roomId}`, JSON.stringify(data))
  }

  sendMessage(type, payload) {
    if (this.isConnected && this.roomId) {
      const message = {
        type,
        payload: { ...payload, userId: this.userId, userName: this.userName },
        timestamp: Date.now(),
        userId: this.userId,
      }

      localStorage.setItem(`firestream_room_${this.roomId}`, JSON.stringify(message))

      setTimeout(() => {
        localStorage.removeItem(`firestream_room_${this.roomId}`)
      }, 10)
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

  play(currentTime) {
    const videoState = {
      playing: true,
      currentTime,
      timestamp: Date.now(),
      action: "play",
    }

    this.updateVideoState(videoState)
    this.sendMessage("video_play", videoState)
  }

  pause(currentTime) {
    const videoState = {
      playing: false,
      currentTime,
      timestamp: Date.now(),
      action: "pause",
    }

    this.updateVideoState(videoState)
    this.sendMessage("video_pause", videoState)
  }

  seek(currentTime) {
    const videoState = {
      playing: this.videoState?.playing || false,
      currentTime,
      timestamp: Date.now(),
      action: "seek",
    }

    this.updateVideoState(videoState)
    this.sendMessage("video_seek", videoState)
  }

  updateVideoState(state) {
    this.videoState = state
    if (this.roomId) {
      const roomData = this.getRoomData(this.roomId)
      roomData.videoState = state
      this.setRoomData(this.roomId, roomData)
    }
  }

  sendChatMessage(message) {
    this.sendMessage("chat_message", { message, timestamp: new Date().toISOString() })
  }

  sendReaction(emoji) {
    this.sendMessage("reaction", { emoji, timestamp: Date.now() })
  }

  getRoomMembers() {
    if (!this.roomId) return []
    const roomData = this.getRoomData(this.roomId)
    return roomData.members || []
  }

  roomExists(roomId) {
    const roomData = this.getRoomData(roomId)
    return roomData.members && roomData.members.length > 0
  }
}
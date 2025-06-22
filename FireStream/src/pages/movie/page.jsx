"use client"

import { useState, useRef, useEffect } from "react"

const MoviePage = () => {
  const [roomId, setRoomId] = useState("")
  const [joinRoomId, setJoinRoomId] = useState("")
  const [roomStatus, setRoomStatus] = useState("none")
  const [showJoinDialog, setShowJoinDialog] = useState(false)
  const [chatMessages, setChatMessages] = useState([])
  const [messageText, setMessageText] = useState("")
  const [isWatching, setIsWatching] = useState(false)
  const wsRef = useRef(null)

  const createRoom = () => {
    const newRoomId = Math.random().toString(36).substring(2, 15)
    setRoomId(newRoomId)
    setRoomStatus("owner")
    setIsWatching(true)

    wsRef.current = new WebSocket(`ws://localhost:8080?roomId=${newRoomId}`)

    wsRef.current.onopen = () => {
      console.log("WebSocket connected")
    }

    wsRef.current.onmessage = (event) => {
      const data = JSON.parse(event.data)

      if (data.type === "chat") {
        setChatMessages((prev) => [
          ...prev,
          {
            id: Date.now(),
            user: data.userName,
            text: data.message,
            timestamp: new Date().toLocaleTimeString(),
          },
        ])
      }
    }

    wsRef.current.onclose = () => {
      console.log("WebSocket disconnected")
    }
  }

  const joinRoom = () => {
    if (joinRoomId.trim()) {
      setRoomId(joinRoomId)
      setRoomStatus("member")
      setShowJoinDialog(false)
      setJoinRoomId("")

      wsRef.current = new WebSocket(`ws://localhost:8080?roomId=${joinRoomId}`)

      wsRef.current.onopen = () => {
        console.log("WebSocket connected")
      }

      wsRef.current.onmessage = (event) => {
        const data = JSON.parse(event.data)

        if (data.type === "chat") {
          setChatMessages((prev) => [
            ...prev,
            {
              id: Date.now(),
              user: data.userName,
              text: data.message,
              timestamp: new Date().toLocaleTimeString(),
            },
          ])
        }
      }

      wsRef.current.onclose = () => {
        console.log("WebSocket disconnected")
      }

      setIsWatching(true)
    }
  }

  const sendMessage = () => {
    if (messageText.trim() && wsRef.current) {
      wsRef.current.send(
        JSON.stringify({
          type: "chat",
          message: messageText,
          userName: "User",
        })
      )
      setMessageText("")
    }
  }

  useEffect(() => {
    return () => {
      if (wsRef.current) {
        wsRef.current.close()
      }
    }
  }, [])

  useEffect(() => {
    if (wsRef.current) {
      wsRef.current.onmessage = (event) => {
        const data = JSON.parse(event.data)

        if (data.type === "chat") {
          setChatMessages((prev) => [
            ...prev,
            {
              id: Date.now(),
              user: data.userName,
              text: data.message,
              timestamp: new Date().toLocaleTimeString(),
            },
          ])
        }

        if (data.type === "user_joined") {
          if (data.notification) {
            const notification = document.createElement("div")
            notification.className = "fixed top-4 right-4 bg-green-600 text-white px-4 py-2 rounded-lg shadow-lg z-50"
            notification.textContent = data.notification
            document.body.appendChild(notification)

            setTimeout(() => {
              document.body.removeChild(notification)
            }, 3000)
          }

          setChatMessages((prev) => [
            ...prev,
            {
              id: Date.now(),
              user: "System",
              text: `${data.userName} joined the room`,
              timestamp: new Date().toLocaleTimeString(),
              isSystem: true,
            },
          ])
        }
      }
    }
  }, [])

  return (
    <div className="min-h-screen bg-gray-100 py-6 flex flex-col justify-center sm:py-12">
      <div className="relative py-3 sm:max-w-xl sm:mx-auto">
        <div className="absolute inset-0 bg-gradient-to-r from-blue-300 to-blue-600 shadow-lg transform -skew-y-6 sm:skew-y-0 sm:-rotate-6 sm:rounded-3xl"></div>
        <div className="relative px-4 py-10 bg-white shadow-lg sm:rounded-3xl sm:p-20">
          <div className="max-w-md mx-auto">
            <div>
              <h1 className="text-2xl font-semibold">Movie Watch Party</h1>
            </div>
            <div className="divide-y divide-gray-200">
              {roomStatus === "none" && (
                <div className="py-8 text-base leading-6 space-y-4 text-gray-700 sm:text-lg sm:leading-7">
                  <button
                    onClick={createRoom}
                    className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
                  >
                    Create Room
                  </button>
                  <button
                    onClick={() => setShowJoinDialog(true)}
                    className="bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline ml-4"
                  >
                    Join Room
                  </button>
                </div>
              )}

              {roomStatus !== "none" && (
                <div className="py-8 text-base leading-6 space-y-4 text-gray-700 sm:text-lg sm:leading-7">
                  <p>
                    Room ID: <span className="font-bold">{roomId}</span>
                  </p>
                  <p>Status: {roomStatus}</p>
                </div>
              )}

              {isWatching && (
                <div className="py-8 text-base leading-6 space-y-4 text-gray-700 sm:text-lg sm:leading-7">
                  <div className="flex flex-col">
                    <div className="h-64 bg-gray-200 rounded-md">Video Player Here</div>
                    <div className="mt-4">
                      <div className="h-48 overflow-y-auto border rounded-md p-2">
                        {chatMessages.map((message) => (
                          <div
                            key={message.id}
                            className={`mb-2 ${message.isSystem ? "text-sm italic text-gray-500" : ""}`}
                          >
                            <span className="font-semibold">{message.user}:</span> {message.text}
                            <span className="text-xs text-gray-500 ml-2">{message.timestamp}</span>
                          </div>
                        ))}
                      </div>
                      <div className="flex mt-2">
                        <input
                          type="text"
                          className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                          placeholder="Enter your message..."
                          value={messageText}
                          onChange={(e) => setMessageText(e.target.value)}
                        />
                        <button
                          onClick={sendMessage}
                          className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline ml-2"
                        >
                          Send
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {showJoinDialog && (
        <div className="fixed z-10 inset-0 overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
            <div className="fixed inset-0 transition-opacity" aria-hidden="true">
              <div className="absolute inset-0 bg-gray-500 opacity-75"></div>
            </div>

            <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">
              &#8203;
            </span>

            <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
              <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                <label htmlFor="roomId" className="block text-sm font-medium text-gray-700">
                  Room ID:
                </label>
                <input
                  type="text"
                  name="roomId"
                  id="roomId"
                  className="mt-1 focus:ring-blue-500 focus:border-blue-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md"
                  value={joinRoomId}
                  onChange={(e) => setJoinRoomId(e.target.value)}
                />
              </div>
              <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
                <button
                  type="button"
                  className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-blue-600 text-base font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:ml-3 sm:w-auto sm:text-sm"
                  onClick={joinRoom}
                >
                  Join
                </button>
                <button
                  type="button"
                  className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm"
                  onClick={() => setShowJoinDialog(false)}
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default MoviePage
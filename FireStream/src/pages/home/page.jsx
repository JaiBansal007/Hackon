"use client"

import { useState } from "react"
import { FeaturedSection } from "@/components/home/content/featured-section"
import { MovieCategories } from "@/components/home/content/movie-categories"
import { ChatSidebar } from "@/components/home/chat/chat-sidebar"
import { Button } from "@/components/ui/button"
import { MessageSquareIcon } from "lucide-react"
import { Navbar } from "../../components/home/layout/navbar"
import { Sidebar } from "@/components/home/layout/sidebar"

const HomePage = () => {
  const [isWatching, setIsWatching] = useState(false)
  const [chatMessages, setChatMessages] = useState([])
  const [showChat, setShowChat] = useState(false)

  const featuredMovies = [
    {
      movieId: "the-dark-knight",
      title: "The Dark Knight",
      description:
        "When the menace known as the Joker wreaks havoc and chaos on the people of Gotham...",
      rating: "9.0/10",
      year: "2008",
      genre: "Action, Crime, Drama",
      mood: ["intense", "dark", "thrilling"],
      image: "https://image.tmdb.org/t/p/w1280/qJ2tW6WMUDux911r6m7haRef0WH.jpg",
    },
    {
      movieId: "inception",
      title: "Inception",
      description:
        "A thief who steals corporate secrets through dream-sharing technology...",
      rating: "8.8/10",
      year: "2010",
      genre: "Action, Sci-Fi, Thriller",
      mood: ["mind-bending", "complex", "thrilling"],
      image: "https://image.tmdb.org/t/p/w1280/edv5CZvWj09upOsy2Y6mWp9AHt6.jpg",
    },
    {
      movieId: "interstellar",
      title: "Interstellar",
      description:
        "A team of explorers travel through a wormhole in space to ensure humanity's survival.",
      rating: "8.6/10",
      year: "2014",
      genre: "Adventure, Drama, Sci-Fi",
      mood: ["thought-provoking", "epic", "emotional"],
      image: "https://image.tmdb.org/t/p/w1280/gEU2QniE6E77NI6lCU6mWp9AHt6.jpg",
    },
  ]

  const currentFeatured = featuredMovies[Math.floor(Math.random() * featuredMovies.length)]

  const sendMessage = async (message) => {
    const newMessage = {
      id: Date.now(),
      user: "User",
      text: message,
      timestamp: new Date().toLocaleTimeString(),
    }
    setChatMessages((prev) => [...prev, newMessage])

    if (message.includes("@Tree.io")) {
      const typingMsg = {
        id: Date.now() + Math.random(),
        user: "Tree.io",
        text: "Tree.io is thinking...",
        timestamp: new Date().toLocaleTimeString(),
        isTyping: true,
      }
      setChatMessages((prev) => [...prev, typingMsg])

      try {
        const response = await fetch("http://localhost:8000/api/chat/tree-io", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            message: message.replace("@Tree.io", "").trim(),
            movie_title: currentFeatured?.title || "Current Movie",
            movie_context: currentFeatured?.description || "",
          }),
        })

        setChatMessages((prev) => prev.filter((msg) => !msg.isTyping))

        const data = await response.json()
        setChatMessages((prev) => [
          ...prev,
          {
            id: Date.now() + Math.random(),
            user: "Tree.io",
            text: data.response,
            timestamp: new Date().toLocaleTimeString(),
            isAI: true,
          },
        ])
      } catch {
        setChatMessages((prev) => prev.filter((msg) => !msg.isTyping))
        setChatMessages((prev) => [
          ...prev,
          {
            id: Date.now() + Math.random(),
            user: "Tree.io",
            text: "Sorry, I'm currently unavailable. Please try again later.",
            timestamp: new Date().toLocaleTimeString(),
            isAI: true,
          },
        ])
      }
    }
  }

  const roomStatus = "none"
  const roomMembers = []
  const user = { name: "User" }

  return (
    <>
      <Navbar user={user} roomStatus={roomStatus} roomMembers={roomMembers} />
      <div className="relative w-full h-full min-h-screen bg-gray-950 text-white overflow-x-hidden flex">
        {/* Sidebar */}
        <Sidebar user={user} roomStatus={roomStatus} roomMembers={roomMembers} />

        {/* Main content */}
        <div className="flex-1">
          {/* Chat toggle button */}
          <Button
            onClick={() => setShowChat(!showChat)}
            variant="secondary"
            className="fixed bottom-4 right-4 z-50 rounded-full p-3 shadow-lg"
          >
            <MessageSquareIcon className="w-5 h-5" />
          </Button>

          {/* Chat sidebar */}
          <ChatSidebar
            show={showChat}
            onClose={() => setShowChat(false)}
            messages={chatMessages}
            onSendMessage={sendMessage}
            roomStatus={roomStatus}
            roomMembers={roomMembers}
            user={user}
          />

          {!isWatching && (
            <div className="grid grid-cols-1 gap-10 px-4 py-8 md:px-12 lg:px-24">
              <FeaturedSection movie={currentFeatured} />
              <MovieCategories onStartWatching={() => setIsWatching(true)} />
            </div>
          )}
        </div>
      </div>
    </>
  )
}

export default HomePage

"use client"

import { useState, useEffect } from "react"
import { Link, useNavigate } from "react-router-dom"
import { motion, AnimatePresence } from "framer-motion"
import { Button } from "../../components/ui/button"
import { ArrowLeft, Coins, Gift, Check, Sparkles, Star, Crown, Zap, TrendingUp, ShoppingBag } from "lucide-react"
import { redemptionOffers, GamificationManager } from "../../lib/gamification"

export default function RedeemPage() {
  const navigate = useNavigate()
  const [userPoints, setUserPoints] = useState(0)
  const [selectedCategory, setSelectedCategory] = useState("all")
  const [redeemedOffers, setRedeemedOffers] = useState([])
  const [hoveredOffer, setHoveredOffer] = useState(null)

  useEffect(() => {
    const gamification = GamificationManager.getInstance()
    setUserPoints(gamification.getUserStats().totalPoints)
  }, [])

  const categories = [
    { id: "all", name: "All", icon: Gift },
    { id: "prime", name: "Prime", icon: Crown },
    { id: "products", name: "Products", icon: ShoppingBag },
    { id: "services", name: "Services", icon: Star },
  ]

  const filteredOffers =
    selectedCategory === "all"
      ? redemptionOffers
      : redemptionOffers.filter((offer) => offer.category === selectedCategory)

  const handleRedeem = (offer) => {
    const gamification = GamificationManager.getInstance()
    const success = gamification.redeemOffer(offer)

    if (success) {
      setUserPoints(gamification.getUserStats().totalPoints)
      setRedeemedOffers([...redeemedOffers, offer.id])
      setTimeout(() => {
        setRedeemedOffers(redeemedOffers.filter((id) => id !== offer.id))
      }, 3000)
    }
  }

  const canRedeem = (offer) => {
    return userPoints >= offer.points && offer.available
  }

  return (
    <div className="min-h-screen bg-[#141414] text-white relative overflow-hidden">
      {/* Netflix-style Background */}
      <div className="absolute inset-0">
        {/* Blurred background elements */}
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-red-600/10 rounded-full blur-3xl" />
        <div className="absolute top-1/3 right-1/4 w-80 h-80 bg-blue-600/8 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 left-1/3 w-72 h-72 bg-yellow-500/6 rounded-full blur-3xl" />
        
        {/* Subtle grid overlay */}
        <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.01)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.01)_1px,transparent_1px)] bg-[size:60px_60px]" />
      </div>

      {/* Netflix-style Header */}
      <div className="relative bg-gradient-to-b from-black/80 to-transparent backdrop-blur-sm">
        <div className="container mx-auto px-4 py-8 max-w-7xl relative z-10">
          {/* Top Navigation */}
          <div className="flex items-center justify-between mb-12">
            <Link
              to="/home"
              className="flex items-center space-x-2 text-gray-300 hover:text-white transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
              <span className="text-sm font-medium">Back</span>
            </Link>
            
            <div className="flex items-center space-x-4 bg-black/50 backdrop-blur rounded-lg px-4 py-2">
              <Coins className="w-5 h-5 text-yellow-500" />
              <span className="text-yellow-500 font-semibold">{userPoints.toLocaleString()}</span>
              <span className="text-gray-400 text-sm">points</span>
            </div>
          </div>

          {/* Hero Section */}
          <div className="mb-12">
            <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
              Redeem Rewards
            </h1>
            <p className="text-gray-400 text-lg max-w-2xl">
              Exchange your points for exclusive rewards and benefits
            </p>
          </div>

          {/* Categories */}
          <div className="flex space-x-2 mb-8 overflow-x-auto">
            {categories.map((category) => {
              const IconComponent = category.icon
              const isActive = selectedCategory === category.id

              return (
                <button
                  key={category.id}
                  onClick={() => setSelectedCategory(category.id)}
                  className={`flex items-center space-x-2 px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-all ${
                    isActive
                      ? "bg-blue-500 text-white"
                      : "bg-gray-800/60 text-gray-300 hover:bg-gray-700/60 hover:text-white"
                  }`}
                >
                  <IconComponent className="w-4 h-4" />
                  <span>{category.name}</span>
                </button>
              )
            })}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="container mx-auto px-4 pb-12 max-w-7xl relative z-10">
        {/* Offers Grid */}
        <div className="grid grid-cols-3 md:grid-cols-4 lg:grid-cols-6 xl:grid-cols-7 gap-3">
          {filteredOffers.map((offer) => (
            <motion.div
              key={offer.id}
              whileHover={{ scale: 1.08 }}
              className="group cursor-pointer"
            >
              <div className="relative bg-gray-900/80 backdrop-blur-sm rounded-md overflow-hidden aspect-[2/3] mb-2">
                <img
                  src={offer.image || "/placeholder.svg"}
                  alt={offer.title}
                  className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
                />
                
                {/* Overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                
                {/* Points Badge */}
                <div className="absolute top-1.5 right-1.5 bg-black/90 backdrop-blur rounded px-1.5 py-0.5">
                  <span className="text-yellow-500 text-xs font-bold">{offer.points}</span>
                </div>

                {/* Premium Badge */}
                {offer.category === "prime" && (
                  <div className="absolute top-1.5 left-1.5 bg-yellow-500 text-black rounded px-1.5 py-0.5">
                    <span className="text-[10px] font-black">PRIME</span>
                  </div>
                )}

                {/* Redeem Button */}
                <div className="absolute bottom-2 left-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  <Button
                    onClick={() => handleRedeem(offer)}
                    disabled={!canRedeem(offer) || redeemedOffers.includes(offer.id)}
                    className={`w-full py-1.5 text-xs font-semibold rounded transition-all ${
                      canRedeem(offer) && !redeemedOffers.includes(offer.id)
                        ? "bg-white text-black hover:bg-gray-200"
                        : "bg-gray-600 text-gray-400 cursor-not-allowed"
                    }`}
                  >
                    {redeemedOffers.includes(offer.id) ? (
                      <span className="flex items-center justify-center space-x-1">
                        <Check className="w-3 h-3" />
                        <span>Done</span>
                      </span>
                    ) : canRedeem(offer) ? (
                      "Redeem"
                    ) : (
                      `+${(offer.points - userPoints).toLocaleString()}`
                    )}
                  </Button>
                </div>

                {/* Success Overlay */}
                <AnimatePresence>
                  {redeemedOffers.includes(offer.id) && (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className="absolute inset-0 bg-green-600/95 flex items-center justify-center backdrop-blur-sm"
                    >
                      <div className="text-center">
                        <Check className="w-8 h-8 text-white mx-auto mb-1" />
                        <p className="text-white font-semibold text-xs">Redeemed!</p>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* Title */}
              <h3 className="text-white font-medium text-xs line-clamp-2 mb-0.5 group-hover:text-gray-300 transition-colors leading-tight">
                {offer.title}
              </h3>
              
              {/* Category */}
              <p className="text-gray-500 text-[10px] capitalize">{offer.category}</p>
            </motion.div>
          ))}
        </div>

        {/* Empty State */}
        {filteredOffers.length === 0 && (
          <div className="text-center py-16 relative z-10">
            <div className="bg-gray-900/50 backdrop-blur-sm rounded-2xl p-12 max-w-md mx-auto">
              <Gift className="w-16 h-16 text-gray-600 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-400 mb-2">No rewards available</h3>
              <p className="text-gray-500 mb-6">Check back later for new offers</p>
              <Button
                onClick={() => setSelectedCategory("all")}
                className="bg-white text-black px-6 py-2 rounded font-semibold hover:bg-gray-200 transition-colors"
              >
                View All Offers
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

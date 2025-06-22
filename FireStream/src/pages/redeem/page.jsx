"use client"

import { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import { motion } from "framer-motion"
import { Button } from "../../components/ui/button"
import { ArrowLeft, Coins, Gift, Check } from "lucide-react"
import { redemptionOffers, GamificationManager } from "../../lib/gamification"

export default function RedeemPage() {
  const navigate = useNavigate()
  const [userPoints, setUserPoints] = useState(0)
  const [selectedCategory, setSelectedCategory] = useState("all")
  const [redeemedOffers, setRedeemedOffers] = useState([])

  useEffect(() => {
    const gamification = GamificationManager.getInstance()
    setUserPoints(gamification.getUserStats().totalPoints)
  }, [])

  const categories = [
    { id: "all", name: "All Offers" },
    { id: "prime", name: "Prime Benefits" },
    { id: "products", name: "Products" },
    { id: "services", name: "Services" },
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

      // Show success message
      setTimeout(() => {
        setRedeemedOffers(redeemedOffers.filter((id) => id !== offer.id))
      }, 3000)
    }
  }

  const canRedeem = (offer) => {
    return userPoints >= offer.points && offer.available
  }

  return (
    <div className="min-h-screen bg-black text-white">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <Button onClick={() => navigate("/home")} variant="ghost" className="text-gray-400 hover:text-white">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Home
          </Button>

          <div className="text-center">
            <h1 className="text-3xl font-bold bg-gradient-to-r from-yellow-400 to-orange-500 bg-clip-text text-transparent">
              Redeem Rewards
            </h1>
            <p className="text-gray-400">Exchange your points for amazing offers</p>
          </div>

          <div className="flex items-center space-x-2 bg-gradient-to-r from-yellow-400/20 to-orange-500/20 rounded-lg px-4 py-2 border border-yellow-400/30">
            <Coins className="w-5 h-5 text-yellow-400" />
            <span className="text-white font-bold">{userPoints.toLocaleString()} Points</span>
          </div>
        </div>

        {/* Category Filter */}
        <div className="flex space-x-2 mb-8 overflow-x-auto">
          {categories.map((category) => (
            <Button
              key={category.id}
              onClick={() => setSelectedCategory(category.id)}
              variant={selectedCategory === category.id ? "default" : "outline"}
              className={`whitespace-nowrap ${
                selectedCategory === category.id
                  ? "bg-gradient-to-r from-yellow-400 to-orange-500 text-black"
                  : "border-gray-600 text-white hover:bg-gray-800"
              }`}
            >
              {category.name}
            </Button>
          ))}
        </div>

        {/* Offers Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredOffers.map((offer, index) => (
            <motion.div
              key={offer.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="bg-gray-900/50 rounded-xl overflow-hidden border border-gray-700/50 hover:border-orange-400/50 transition-all"
            >
              <div className="relative">
                <img src={offer.image || "/placeholder.svg"} alt={offer.title} className="w-full h-48 object-cover" />
                <div className="absolute top-4 right-4 bg-black/80 rounded-lg px-3 py-1">
                  <div className="flex items-center space-x-1">
                    <Coins className="w-4 h-4 text-yellow-400" />
                    <span className="text-yellow-400 font-bold text-sm">{offer.points}</span>
                  </div>
                </div>
                {redeemedOffers.includes(offer.id) && (
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="absolute inset-0 bg-green-500/90 flex items-center justify-center"
                  >
                    <div className="text-center">
                      <Check className="w-12 h-12 text-white mx-auto mb-2" />
                      <p className="text-white font-bold">Redeemed!</p>
                    </div>
                  </motion.div>
                )}
              </div>

              <div className="p-6">
                <h3 className="text-xl font-bold text-white mb-2">{offer.title}</h3>
                <p className="text-gray-400 text-sm mb-4 line-clamp-3">{offer.description}</p>

                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Gift className="w-4 h-4 text-orange-400" />
                    <span className="text-orange-400 text-sm font-medium capitalize">{offer.category}</span>
                  </div>

                  <Button
                    onClick={() => handleRedeem(offer)}
                    disabled={!canRedeem(offer) || redeemedOffers.includes(offer.id)}
                    className={`${
                      canRedeem(offer) && !redeemedOffers.includes(offer.id)
                        ? "bg-gradient-to-r from-yellow-400 to-orange-500 text-black hover:from-yellow-500 hover:to-orange-600"
                        : "bg-gray-700 text-gray-400 cursor-not-allowed"
                    }`}
                  >
                    {redeemedOffers.includes(offer.id) ? "Redeemed" : canRedeem(offer) ? "Redeem" : "Not Enough Points"}
                  </Button>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {filteredOffers.length === 0 && (
          <div className="text-center py-12">
            <Gift className="w-16 h-16 text-gray-600 mx-auto mb-4" />
            <h3 className="text-xl font-bold text-gray-400 mb-2">No offers available</h3>
            <p className="text-gray-500">Check back later for new redemption opportunities</p>
          </div>
        )}
      </div>
    </div>
  )
}

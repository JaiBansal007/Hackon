"use client"

import { useState, useEffect } from "react"
import { Link,useNavigate } from "react-router-dom"
import { motion, AnimatePresence } from "framer-motion"
import { Button } from "../../components/ui/button"
import { ArrowLeft, Coins, Gift, Check, Sparkles, Star, Crown, Zap, TrendingUp, Award, ShoppingBag, Timer } from "lucide-react"
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
    { id: "all", name: "All Offers", icon: Gift, color: "from-purple-400 to-pink-400" },
    { id: "prime", name: "Prime Benefits", icon: Crown, color: "from-yellow-400 to-orange-500" },
    { id: "products", name: "Products", icon: ShoppingBag, color: "from-blue-400 to-cyan-400" },
    { id: "services", name: "Services", icon: Star, color: "from-green-400 to-emerald-500" },
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

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  }

  const cardVariants = {
    hidden: { opacity: 0, y: 30, scale: 0.95 },
    visible: { 
      opacity: 1, 
      y: 0, 
      scale: 1,
      transition: {
        type: "spring",
        stiffness: 300,
        damping: 20
      }
    }
  }

  return (
    <div className="min-h-screen w-[98.8vw] bg-gradient-to-br from-slate-950 via-gray-900 to-black text-white relative overflow-hidden">
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-10 left-10 w-72 h-72 bg-yellow-400/10 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-10 right-10 w-96 h-96 bg-orange-500/10 rounded-full blur-3xl animate-pulse delay-1000" />
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-purple-500/5 rounded-full blur-3xl animate-pulse delay-500" />
      </div>

      <div className="container mx-auto px-4 sm:px-6 py-6 sm:py-10 relative z-10">
        {/* Enhanced Header */}
        <motion.div 
          initial={{ opacity: 0, y: -30 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6 lg:gap-4 mb-8 sm:mb-12"
        >
          <motion.div
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="order-1 lg:order-1"
          >
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
            <Link
              to="/home"
              className="flex items-center space-x-3 group bg-gray-800/50 backdrop-blur-sm px-6 py-3 rounded-xl border border-amber-500/20 hover:border-amber-500/40 transition-all duration-300"
            >
              <ArrowLeft className="w-5 h-5 text-amber-400 group-hover:text-amber-300 transition-colors" />
              <span className="text-amber-400 group-hover:text-amber-300 font-medium transition-colors">
                Back to Home
              </span>
            </Link>
          </motion.div>
          </motion.div>

          <div className="text-center order-3 lg:order-2 w-full lg:w-auto">
            <motion.h1 
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.2 }}
              className="text-3xl sm:text-4xl lg:text-5xl font-black bg-gradient-to-r from-yellow-400 via-orange-500 to-pink-500 bg-clip-text text-transparent mb-2"
            >
              Reward Store
            </motion.h1>
            <motion.p 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4 }}
              className="text-gray-400 text-sm sm:text-base lg:text-lg px-4 lg:px-0"
            >
              Transform your achievements into amazing rewards
            </motion.p>
          </div>

          <motion.div 
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="relative group order-2 lg:order-3 w-full sm:w-auto"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-yellow-400/30 to-orange-500/30 rounded-2xl blur-xl group-hover:blur-2xl transition-all duration-500" />
            <div className="relative flex items-center justify-center sm:justify-start space-x-3 bg-gradient-to-r from-yellow-400/20 to-orange-500/20 rounded-2xl px-4 sm:px-6 py-3 sm:py-4 border border-yellow-400/30 backdrop-blur-md">
              <div className="relative">
                <Coins className="w-5 h-5 sm:w-6 sm:h-6 text-yellow-400" />
                <Sparkles className="absolute -top-1 -right-1 w-3 h-3 text-yellow-300 animate-pulse" />
              </div>
              <div className="text-right flex gap-5 items-center">
                <div className="text-yellow-400 text-xs sm:text-sm font-medium">Your Points</div>
                <div className="text-white font-bold text-lg sm:text-xl">{userPoints.toLocaleString()}</div>
              </div>
            </div>
          </motion.div>
        </motion.div>

        {/* Enhanced Category Filter */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="flex flex-wrap gap-2 sm:gap-4 mb-8 sm:mb-12 justify-center px-2 sm:px-0"
        >
          {categories.map((category) => {
            const IconComponent = category.icon
            return (
              <motion.div
                key={category.id}
                whileHover={{ scale: 1.05, y: -2 }}
                whileTap={{ scale: 0.95 }}
                className="flex-shrink-0"
              >
                <Button
                  onClick={() => setSelectedCategory(category.id)}
                  variant={selectedCategory === category.id ? "default" : "outline"}
                  className={`relative overflow-hidden px-3 sm:px-6 lg:px-8 py-2 sm:py-3 lg:py-4 rounded-xl sm:rounded-2xl font-bold text-sm sm:text-base lg:text-lg transition-all duration-500 group ${
                    selectedCategory === category.id
                      ? `bg-gradient-to-r ${category.color} text-black shadow-xl shadow-current/25`
                      : "border-2 border-gray-600/50 text-black hover:bg-white/10 hover:border-white/30 backdrop-blur-sm"
                  }`}
                >
                  {selectedCategory === category.id && (
                    <div className="absolute inset-0 bg-gradient-to-r from-white/20 via-transparent to-white/20 animate-pulse" />
                  )}
                  <IconComponent className="w-4 h-4 sm:w-5 sm:h-5 mr-1 sm:mr-2 lg:mr-3 group-hover:scale-110 transition-transform duration-200" />
                  <span className="relative">{category.name}</span>
                  {selectedCategory === category.id && (
                    <Sparkles className="w-3 h-3 sm:w-4 sm:h-4 ml-1 sm:ml-2 animate-spin" />
                  )}
                </Button>
              </motion.div>
            )
          })}
        </motion.div>

        {/* Enhanced Offers Grid */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6 lg:gap-8 px-2 sm:px-0"
        >
          <AnimatePresence mode="wait">
            {filteredOffers.map((offer, index) => (
              <motion.div
                key={offer.id}
                variants={cardVariants}
                layout
                whileHover={{ 
                  scale: 1.03, 
                  y: -8,
                  transition: { type: "spring", stiffness: 400, damping: 25 } 
                }}
                onHoverStart={() => setHoveredOffer(offer.id)}
                onHoverEnd={() => setHoveredOffer(null)}
                className="relative group"
              >
                {/* Card glow effect */}
                <div className="absolute inset-0 bg-gradient-to-r from-yellow-400/20 via-orange-500/20 to-pink-500/20 rounded-3xl blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                
                <div className="relative bg-gradient-to-b from-gray-900/80 to-black/80 rounded-2xl sm:rounded-3xl overflow-hidden border border-gray-700/50 group-hover:border-orange-400/50 transition-all duration-500 backdrop-blur-md">
                  <div className="relative overflow-hidden">
                    <img 
                      src={offer.image || "/placeholder.svg"} 
                      alt={offer.title} 
                      className="w-full h-40 sm:h-48 lg:h-56 object-cover transition-transform duration-700 group-hover:scale-110" 
                    />
                    
                    {/* Overlay gradient */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                    
                    {/* Points badge */}
                    <motion.div 
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ delay: index * 0.1 + 0.3 }}
                      className="absolute top-2 sm:top-4 right-2 sm:right-4 bg-black/90 backdrop-blur-md rounded-xl sm:rounded-2xl px-2 sm:px-4 py-1 sm:py-2 border border-yellow-400/30"
                    >
                      <div className="flex items-center space-x-1 sm:space-x-2">
                        <Coins className="w-4 h-4 sm:w-5 sm:h-5 text-yellow-400" />
                        <span className="text-yellow-400 font-black text-sm sm:text-lg">{offer.points.toLocaleString()}</span>
                      </div>
                    </motion.div>

                    {/* Premium badge */}
                    {offer.category === 'prime' && (
                      <div className="absolute top-2 sm:top-4 left-2 sm:left-4 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-lg sm:rounded-xl px-2 sm:px-3 py-1">
                        <div className="flex items-center space-x-1">
                          <Crown className="w-3 h-3 sm:w-4 sm:h-4 text-black" />
                          <span className="text-black font-bold text-xs">PREMIUM</span>
                        </div>
                      </div>
                    )}

                    {/* Redeemed overlay */}
                    <AnimatePresence>
                      {redeemedOffers.includes(offer.id) && (
                        <motion.div
                          initial={{ scale: 0, opacity: 0 }}
                          animate={{ scale: 1, opacity: 1 }}
                          exit={{ scale: 0, opacity: 0 }}
                          className="absolute inset-0 bg-gradient-to-br from-green-500/95 to-emerald-600/95 flex items-center justify-center backdrop-blur-sm"
                        >
                          <div className="text-center">
                            <motion.div
                              initial={{ scale: 0, rotate: -180 }}
                              animate={{ scale: 1, rotate: 0 }}
                              transition={{ type: "spring", stiffness: 300, delay: 0.2 }}
                            >
                              <Check className="w-16 h-16 text-white mx-auto mb-3" />
                            </motion.div>
                            <motion.p 
                              initial={{ opacity: 0, y: 10 }}
                              animate={{ opacity: 1, y: 0 }}
                              transition={{ delay: 0.4 }}
                              className="text-white font-black text-xl"
                            >
                              Redeemed!
                            </motion.p>
                            <motion.div
                              initial={{ scale: 0 }}
                              animate={{ scale: 1 }}
                              transition={{ delay: 0.6 }}
                              className="flex justify-center mt-2"
                            >
                              <Sparkles className="w-6 h-6 text-white animate-pulse" />
                            </motion.div>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>

                  <div className="p-4 sm:p-6">
                    <div className="flex items-start justify-between mb-2 sm:mb-3">
                      <h3 className="text-lg sm:text-xl font-black text-white group-hover:text-yellow-400 transition-colors duration-300 line-clamp-2 pr-2">
                        {offer.title}
                      </h3>
                      {hoveredOffer === offer.id && (
                        <motion.div
                          initial={{ scale: 0, rotate: -90 }}
                          animate={{ scale: 1, rotate: 0 }}
                          className="flex-shrink-0 ml-2 hidden sm:block"
                        >
                          <Star className="w-5 h-5 text-yellow-400 fill-current" />
                        </motion.div>
                      )}
                    </div>
                    
                    <p className="text-gray-400 text-xs sm:text-sm mb-4 sm:mb-6 line-clamp-2 sm:line-clamp-3 leading-relaxed">
                      {offer.description}
                    </p>

                    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-0">
                      <div className="flex items-center space-x-2">
                        <div className={`p-1.5 sm:p-2 rounded-lg sm:rounded-xl bg-gradient-to-r ${categories.find(c => c.id === offer.category)?.color || 'from-gray-400 to-gray-500'} bg-opacity-20`}>
                          <Gift className="w-3 h-3 sm:w-4 sm:h-4 text-white" />
                        </div>
                        <span className="text-gray-300 text-xs sm:text-sm font-semibold capitalize">
                          {offer.category}
                        </span>
                      </div>

                      <motion.div
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        className="w-full sm:w-auto"
                      >
                        <Button
                          onClick={() => handleRedeem(offer)}
                          disabled={!canRedeem(offer) || redeemedOffers.includes(offer.id)}
                          className={`font-bold px-3 sm:px-6 py-2 sm:py-3 rounded-lg sm:rounded-xl transition-all duration-300 w-full sm:w-auto text-xs sm:text-sm ${
                            canRedeem(offer) && !redeemedOffers.includes(offer.id)
                              ? "bg-gradient-to-r from-yellow-400 to-orange-500 text-black hover:from-yellow-300 hover:to-orange-400 hover:shadow-xl hover:shadow-orange-400/25 group"
                              : "bg-gray-700/50 text-gray-400 cursor-not-allowed border border-gray-600/30"
                          }`}
                        >
                          {redeemedOffers.includes(offer.id) ? (
                            <span className="flex items-center justify-center space-x-1 sm:space-x-2">
                              <Check className="w-3 h-3 sm:w-4 sm:h-4" />
                              <span>Redeemed</span>
                            </span>
                          ) : canRedeem(offer) ? (
                            <span className="flex items-center justify-center space-x-1 sm:space-x-2">
                              <span>Redeem Now</span>
                            </span>
                          ) : (
                            <span className="flex items-center justify-center space-x-1 sm:space-x-2">
                              <span className="text-xs">Need {(offer.points - userPoints).toLocaleString()} more</span>
                            </span>
                          )}
                        </Button>
                      </motion.div>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </motion.div>

        {/* Enhanced Empty State */}
        {filteredOffers.length === 0 && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.3 }}
            className="text-center py-20"
          >
            <div className="relative inline-block mb-6">
              <div className="absolute inset-0 bg-gradient-to-r from-yellow-400/20 to-orange-500/20 rounded-full blur-2xl" />
              <Gift className="relative w-24 h-24 text-gray-600 mx-auto" />
            </div>
            <h3 className="text-3xl font-black text-gray-400 mb-4">No rewards available</h3>
            <p className="text-gray-500 text-lg mb-8">New exciting offers are coming soon!</p>
            <motion.div
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Button
                onClick={() => setSelectedCategory("all")}
                className="bg-gradient-to-r from-yellow-400 to-orange-500 text-black font-bold px-8 py-3 rounded-xl"
              >
                <TrendingUp className="w-5 h-5 mr-2" />
                View All Offers
              </Button>
            </motion.div>
          </motion.div>
        )}
      </div>
    </div>
  )
}
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
    { id: "all", name: "All Offers", icon: Gift, color: "from-purple-500 to-pink-500" },
    { id: "prime", name: "Prime Benefits", icon: Crown, color: "from-yellow-400 to-orange-500" },
    { id: "products", name: "Products", icon: ShoppingBag, color: "from-blue-500 to-cyan-500" },
    { id: "services", name: "Services", icon: Star, color: "from-green-500 to-emerald-500" },
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
        staggerChildren: 0.08,
      },
    },
  }

  const cardVariants = {
    hidden: { opacity: 0, y: 40, scale: 0.95 },
    visible: {
      opacity: 1,
      y: 0,
      scale: 1,
      transition: {
        type: "spring",
        stiffness: 300,
        damping: 25,
      },
    },
  }

  return (
    <div className="min-h-screen w-full bg-gradient-to-br from-gray-950 via-black to-gray-900 text-white relative overflow-hidden">
      {/* Enhanced Background Elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-20 left-20 w-96 h-96 bg-gradient-to-r from-yellow-400/8 to-orange-500/8 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-20 right-20 w-[500px] h-[500px] bg-gradient-to-r from-purple-500/6 to-pink-500/6 rounded-full blur-3xl animate-pulse delay-1000" />
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-80 h-80 bg-gradient-to-r from-blue-500/4 to-cyan-500/4 rounded-full blur-3xl animate-pulse delay-500" />

        {/* Grid pattern overlay */}
        <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:50px_50px]" />
      </div>

      <div className="container mx-auto px-6 py-12 relative z-10 max-w-7xl">
        {/* Professional Header */}
        <motion.div
          initial={{ opacity: 0, y: -40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-8 mb-16"
        >
          <motion.div whileHover={{ scale: 1.02, y: -2 }} whileTap={{ scale: 0.98 }} className="order-1 lg:order-1">
            <Link
              to="/home"
              className="flex items-center space-x-3 group bg-gradient-to-r from-gray-800/60 to-gray-900/60 backdrop-blur-xl px-8 py-4 rounded-2xl border border-amber-500/30 hover:border-amber-500/60 transition-all duration-400 shadow-xl hover:shadow-amber-500/20"
            >
              <ArrowLeft className="w-5 h-5 text-amber-400 group-hover:text-amber-300 transition-all duration-300 group-hover:-translate-x-1" />
              <span className="text-amber-400 group-hover:text-amber-300 font-semibold transition-colors">
                Back to Home
              </span>
            </Link>
          </motion.div>

          <div className="text-center order-3 lg:order-2 w-full lg:w-auto">
            <motion.h1
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.2, duration: 0.6 }}
              className="text-5xl lg:text-6xl font-black bg-gradient-to-r from-yellow-400 via-orange-500 to-pink-500 bg-clip-text text-transparent mb-4 leading-tight"
            >
              Reward Store
            </motion.h1>
            <motion.p
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4, duration: 0.6 }}
              className="text-gray-400 text-lg font-medium max-w-md mx-auto leading-relaxed"
            >
              Transform your achievements into premium rewards and exclusive benefits
            </motion.p>
          </div>

          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.3, duration: 0.6 }}
            className="relative group order-2 lg:order-3 w-full sm:w-auto"
          >
            <div className="absolute -inset-1 bg-gradient-to-r from-yellow-400/30 via-orange-500/30 to-yellow-400/30 rounded-3xl blur-xl group-hover:blur-2xl transition-all duration-500" />
            <div className="relative flex items-center justify-between bg-gradient-to-r from-gray-900/90 to-black/90 backdrop-blur-xl rounded-2xl px-8 py-6 border border-yellow-400/40 shadow-2xl min-w-[280px]">
              <div className="flex items-center space-x-4">
                <div className="relative">
                  <div className="absolute -inset-2 bg-gradient-to-r from-yellow-400/20 to-orange-500/20 rounded-full blur-lg" />
                  <Coins className="relative w-8 h-8 text-yellow-400" />
                  <Sparkles className="absolute -top-1 -right-1 w-4 h-4 text-yellow-300 animate-pulse" />
                </div>
                <div>
                  <div className="text-yellow-400 text-sm font-semibold tracking-wide">Available Points</div>
                  <div className="text-white font-black text-2xl">{userPoints.toLocaleString()}</div>
                </div>
              </div>
            </div>
          </motion.div>
        </motion.div>

        {/* Professional Category Filter */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5, duration: 0.6 }}
          className="flex flex-wrap gap-4 mb-16 justify-center"
        >
          {categories.map((category) => {
            const IconComponent = category.icon
            const isActive = selectedCategory === category.id

            return (
              <motion.div
                key={category.id}
                whileHover={{ scale: 1.05, y: -3 }}
                whileTap={{ scale: 0.95 }}
                className="flex-shrink-0"
              >
                <Button
                  onClick={() => setSelectedCategory(category.id)}
                  className={`relative overflow-hidden px-8 py-4 rounded-2xl font-bold text-base transition-all duration-500 group border-2 ${
                    isActive
                      ? `bg-gradient-to-r ${category.color} text-white shadow-2xl border-transparent`
                      : "border-gray-600/40 text-gray-300 hover:text-white hover:border-gray-500/60 bg-gray-800/40 backdrop-blur-sm hover:bg-gray-700/60"
                  }`}
                >
                  {isActive && (
                    <div className="absolute inset-0 bg-gradient-to-r from-white/20 via-transparent to-white/20 animate-pulse" />
                  )}

                  <div className="relative flex items-center space-x-3">
                    <IconComponent
                      className={`w-5 h-5 transition-transform duration-300 ${isActive ? "scale-110" : "group-hover:scale-110"}`}
                    />
                    <span>{category.name}</span>
                    {isActive && (
                      <motion.div
                        initial={{ scale: 0, rotate: -180 }}
                        animate={{ scale: 1, rotate: 0 }}
                        transition={{ type: "spring", stiffness: 300 }}
                      >
                        <Sparkles className="w-4 h-4 animate-spin" />
                      </motion.div>
                    )}
                  </div>
                </Button>
              </motion.div>
            )
          })}
        </motion.div>

        {/* Professional Offers Grid */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8"
        >
          <AnimatePresence mode="wait">
            {filteredOffers.map((offer, index) => (
              <motion.div
                key={offer.id}
                variants={cardVariants}
                layout
                whileHover={{
                  scale: 1.02,
                  y: -12,
                  transition: { type: "spring", stiffness: 400, damping: 25 },
                }}
                onHoverStart={() => setHoveredOffer(offer.id)}
                onHoverEnd={() => setHoveredOffer(null)}
                className="relative group"
              >
                {/* Enhanced Card Glow */}
                <div className="absolute -inset-1 bg-gradient-to-r from-yellow-400/20 via-orange-500/20 to-pink-500/20 rounded-3xl blur-xl opacity-0 group-hover:opacity-100 transition-all duration-500" />

                <div className="relative bg-gradient-to-b from-gray-900/95 to-black/95 rounded-3xl overflow-hidden border border-gray-700/50 group-hover:border-orange-400/60 transition-all duration-500 backdrop-blur-xl shadow-2xl">
                  <div className="relative overflow-hidden">
                    <img
                      src={offer.image || "/placeholder.svg"}
                      alt={offer.title}
                      className="w-full h-56 object-cover transition-all duration-700 group-hover:scale-110"
                    />

                    {/* Enhanced Overlay */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />

                    {/* Professional Points Badge */}
                    <motion.div
                      initial={{ scale: 0, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      transition={{ delay: index * 0.1 + 0.3, type: "spring", stiffness: 300 }}
                      className="absolute top-4 right-4 bg-black/90 backdrop-blur-xl rounded-2xl px-4 py-3 border border-yellow-400/40 shadow-xl"
                    >
                      <div className="flex items-center space-x-2">
                        <Coins className="w-5 h-5 text-yellow-400" />
                        <span className="text-yellow-400 font-black text-lg">{offer.points.toLocaleString()}</span>
                      </div>
                    </motion.div>

                    {/* Premium Badge */}
                    {offer.category === "prime" && (
                      <motion.div
                        initial={{ scale: 0, x: -20 }}
                        animate={{ scale: 1, x: 0 }}
                        transition={{ delay: index * 0.1 + 0.4, type: "spring", stiffness: 300 }}
                        className="absolute top-4 left-4 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-xl px-4 py-2 shadow-lg"
                      >
                        <div className="flex items-center space-x-2">
                          <Crown className="w-4 h-4 text-black" />
                          <span className="text-black font-bold text-sm tracking-wide">PREMIUM</span>
                        </div>
                      </motion.div>
                    )}

                    {/* Success Overlay */}
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
                              <Check className="w-20 h-20 text-white mx-auto mb-4" />
                            </motion.div>
                            <motion.p
                              initial={{ opacity: 0, y: 10 }}
                              animate={{ opacity: 1, y: 0 }}
                              transition={{ delay: 0.4 }}
                              className="text-white font-black text-2xl"
                            >
                              Redeemed!
                            </motion.p>
                            <motion.div
                              initial={{ scale: 0 }}
                              animate={{ scale: 1 }}
                              transition={{ delay: 0.6 }}
                              className="flex justify-center mt-3"
                            >
                              <Sparkles className="w-8 h-8 text-white animate-pulse" />
                            </motion.div>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>

                  <div className="p-8">
                    <div className="flex items-start justify-between mb-4">
                      <h3 className="text-xl font-black text-white group-hover:text-yellow-400 transition-colors duration-300 line-clamp-2 pr-4 leading-tight">
                        {offer.title}
                      </h3>
                      {hoveredOffer === offer.id && (
                        <motion.div
                          initial={{ scale: 0, rotate: -90 }}
                          animate={{ scale: 1, rotate: 0 }}
                          className="flex-shrink-0"
                        >
                          <Star className="w-6 h-6 text-yellow-400 fill-current" />
                        </motion.div>
                      )}
                    </div>

                    <p className="text-gray-400 text-sm mb-8 line-clamp-3 leading-relaxed">{offer.description}</p>

                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <div
                          className={`p-3 rounded-xl bg-gradient-to-r ${categories.find((c) => c.id === offer.category)?.color || "from-gray-400 to-gray-500"} bg-opacity-20 backdrop-blur-sm`}
                        >
                          <Gift className="w-4 h-4 text-white" />
                        </div>
                        <span className="text-gray-300 text-sm font-semibold capitalize tracking-wide">
                          {offer.category}
                        </span>
                      </div>

                      <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                        <Button
                          onClick={() => handleRedeem(offer)}
                          disabled={!canRedeem(offer) || redeemedOffers.includes(offer.id)}
                          className={`font-bold px-2 py-2 rounded-xl transition-all duration-400 ${
                            canRedeem(offer) && !redeemedOffers.includes(offer.id)
                              ? "bg-gradient-to-r from-yellow-400 to-orange-500 text-black hover:from-yellow-300 hover:to-orange-400 hover:shadow-2xl hover:shadow-orange-400/30 border-0"
                              : "bg-gray-700/60 text-gray-400 cursor-not-allowed border border-gray-600/40 backdrop-blur-sm"
                          }`}
                        >
                          {redeemedOffers.includes(offer.id) ? (
                            <span className="flex items-center space-x-2">
                              <Check className="w-4 h-4" />
                              <span>Redeemed</span>
                            </span>
                          ) : canRedeem(offer) ? (
                            <span className="flex items-center space-x-2">
                              <span>Redeem Now</span>
                              <Zap className="w-4 h-4" />
                            </span>
                          ) : (
                            <span className="text-xs">Need {(offer.points - userPoints).toLocaleString()} more</span>
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

        {/* Professional Empty State */}
        {filteredOffers.length === 0 && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.3, duration: 0.6 }}
            className="text-center py-24"
          >
            <div className="relative inline-block mb-8">
              <div className="absolute inset-0 bg-gradient-to-r from-yellow-400/20 to-orange-500/20 rounded-full blur-3xl" />
              <Gift className="relative w-32 h-32 text-gray-600 mx-auto" />
            </div>
            <h3 className="text-4xl font-black text-gray-400 mb-6">No rewards available</h3>
            <p className="text-gray-500 text-xl mb-12 max-w-md mx-auto leading-relaxed">
              New exciting offers are coming soon! Check back later for amazing rewards.
            </p>
            <motion.div whileHover={{ scale: 1.05, y: -2 }} whileTap={{ scale: 0.95 }}>
              <Button
                onClick={() => setSelectedCategory("all")}
                className="bg-gradient-to-r from-yellow-400 to-orange-500 text-black font-bold px-10 py-4 rounded-2xl shadow-xl hover:shadow-orange-500/30 transition-all duration-400"
              >
                <TrendingUp className="w-6 h-6 mr-3" />
                View All Offers
              </Button>
            </motion.div>
          </motion.div>
        )}
      </div>
    </div>
  )
}

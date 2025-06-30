"use client"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { CheckCircle, XCircle, Info, AlertCircle, X } from "lucide-react"

let showToastFunction = null

export function useToast() {
  return {
    showToast: (message, type = "info", duration = 3000) => {
      if (showToastFunction) {
        showToastFunction(message, type, duration)
      }
    }
  }
}

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([])

  useEffect(() => {
    showToastFunction = (message, type, duration) => {
      const id = Date.now() + Math.random()
      const newToast = { id, message, type, duration }
      
      setToasts(prev => [...prev, newToast])
      
      setTimeout(() => {
        setToasts(prev => prev.filter(toast => toast.id !== id))
      }, duration)
    }
    
    return () => {
      showToastFunction = null
    }
  }, [])

  const removeToast = (id) => {
    setToasts(prev => prev.filter(toast => toast.id !== id))
  }

  const getIcon = (type) => {
    switch (type) {
      case "success":
        return <CheckCircle className="w-5 h-5" />
      case "error":
        return <XCircle className="w-5 h-5" />
      case "warning":
        return <AlertCircle className="w-5 h-5" />
      default:
        return <Info className="w-5 h-5" />
    }
  }

  const getColors = (type) => {
    switch (type) {
      case "success":
        return "from-green-600/90 to-emerald-600/90 border-green-500/30 text-green-100"
      case "error":
        return "from-red-600/90 to-rose-600/90 border-red-500/30 text-red-100"
      case "warning":
        return "from-amber-600/90 to-orange-600/90 border-amber-500/30 text-amber-100"
      default:
        return "from-blue-600/90 to-purple-600/90 border-blue-500/30 text-blue-100"
    }
  }

  return (
    <>
      {children}
      
      {/* Toast Container */}
      <div className="fixed top-4 right-4 z-50 space-y-2">
        <AnimatePresence>
          {toasts.map((toast) => (
            <motion.div
              key={toast.id}
              initial={{ opacity: 0, x: 100, scale: 0.95 }}
              animate={{ opacity: 1, x: 0, scale: 1 }}
              exit={{ opacity: 0, x: 100, scale: 0.95 }}
              className={`flex items-center space-x-3 p-4 rounded-xl backdrop-blur-xl border shadow-lg max-w-sm bg-gradient-to-r ${getColors(toast.type)}`}
            >
              <div className="flex-shrink-0">
                {getIcon(toast.type)}
              </div>
              
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium">{toast.message}</p>
              </div>
              
              <button
                onClick={() => removeToast(toast.id)}
                className="flex-shrink-0 text-white/70 hover:text-white transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </>
  )
}

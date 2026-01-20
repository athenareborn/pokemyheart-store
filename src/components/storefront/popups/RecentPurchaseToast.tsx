'use client'

import { useState, useEffect, useCallback } from 'react'
import { X, ShoppingBag } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'

// Realistic fake data
const NAMES = ['Sarah', 'Mike', 'Emma', 'James', 'Olivia', 'David', 'Sophia', 'Chris', 'Ava', 'Josh']
const LOCATIONS = ['New York, NY', 'Los Angeles, CA', 'Chicago, IL', 'Houston, TX', 'Phoenix, AZ',
                   'San Diego, CA', 'Dallas, TX', 'Austin, TX', 'Denver, CO', 'Seattle, WA']
const PRODUCTS = ['Love Pack', 'Card Only', 'Deluxe Love']
const TIME_AGO = ['just now', '2 minutes ago', '5 minutes ago', '8 minutes ago']

function getRandomPurchase() {
  return {
    name: NAMES[Math.floor(Math.random() * NAMES.length)],
    location: LOCATIONS[Math.floor(Math.random() * LOCATIONS.length)],
    product: PRODUCTS[Math.floor(Math.random() * PRODUCTS.length)],
    timeAgo: TIME_AGO[Math.floor(Math.random() * TIME_AGO.length)],
  }
}

export function RecentPurchaseToast() {
  const [isVisible, setIsVisible] = useState(false)
  const [purchase, setPurchase] = useState(getRandomPurchase())

  const showToast = useCallback(() => {
    setPurchase(getRandomPurchase())
    setIsVisible(true)

    // Auto-hide after 5 seconds
    setTimeout(() => setIsVisible(false), 5000)
  }, [])

  useEffect(() => {
    // Initial delay before first toast (10-20 seconds)
    const initialDelay = 10000 + Math.random() * 10000

    const initialTimer = setTimeout(() => {
      showToast()

      // Then show every 20-40 seconds
      const interval = setInterval(() => {
        showToast()
      }, 20000 + Math.random() * 20000)

      return () => clearInterval(interval)
    }, initialDelay)

    return () => clearTimeout(initialTimer)
  }, [showToast])

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0, x: -100, y: 20 }}
          animate={{ opacity: 1, x: 0, y: 0 }}
          exit={{ opacity: 0, x: -100 }}
          className="fixed bottom-4 left-4 z-40 bg-white rounded-lg shadow-lg border border-gray-200
                     p-4 max-w-sm flex items-start gap-3"
        >
          <div className="w-10 h-10 bg-pink-100 rounded-full flex items-center justify-center flex-shrink-0">
            <ShoppingBag className="h-5 w-5 text-pink-500" />
          </div>

          <div className="flex-1 min-w-0">
            <p className="text-sm text-gray-900">
              <span className="font-semibold">{purchase.name}</span> from {purchase.location}
            </p>
            <p className="text-sm text-gray-600">
              purchased <span className="font-medium">{purchase.product}</span>
            </p>
            <p className="text-xs text-gray-400 mt-1">{purchase.timeAgo}</p>
          </div>

          <button
            onClick={() => setIsVisible(false)}
            className="text-gray-400 hover:text-gray-600 flex-shrink-0"
          >
            <X className="h-4 w-4" />
          </button>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

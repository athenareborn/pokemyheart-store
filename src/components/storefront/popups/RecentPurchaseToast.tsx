'use client'

import { useState, useEffect, useCallback } from 'react'
import { X, CheckCircle, Flame } from 'lucide-react'
import Image from 'next/image'
import Link from 'next/link'
import { motion, AnimatePresence } from 'framer-motion'
import { useCartStore } from '@/lib/store/cart'
import { BUNDLES } from '@/data/bundles'
import { PRODUCT } from '@/data/product'

// Diverse, realistic first names
const FIRST_NAMES = [
  'Sarah', 'Michael', 'Emma', 'James', 'Olivia', 'David', 'Sophia', 'Chris',
  'Ava', 'Josh', 'Mia', 'Daniel', 'Isabella', 'Matthew', 'Emily', 'Andrew',
  'Chloe', 'Ryan', 'Abigail', 'Brandon', 'Madison', 'Tyler', 'Hannah', 'Kevin',
  'Ashley', 'Justin', 'Samantha', 'Alex', 'Grace', 'Taylor', 'Jessica', 'Nicole'
]

// Major US cities with state abbreviations
const LOCATIONS = [
  'New York, NY', 'Los Angeles, CA', 'Chicago, IL', 'Houston, TX',
  'Phoenix, AZ', 'San Diego, CA', 'Dallas, TX', 'Austin, TX',
  'Denver, CO', 'Seattle, WA', 'Miami, FL', 'Atlanta, GA',
  'Boston, MA', 'San Francisco, CA', 'Portland, OR', 'Nashville, TN',
  'Las Vegas, NV', 'San Antonio, TX', 'Orlando, FL', 'Charlotte, NC'
]

// Actual products linked to real bundles (single source of truth)
const PRODUCTS = BUNDLES.map(bundle => ({
  name: bundle.name,
  badge: bundle.badge || null,
}))

// Realistic time stamps (avoid "just now" - too suspicious)
const TIME_AGO = [
  '2 min ago', '3 min ago', '5 min ago', '7 min ago',
  '9 min ago', '12 min ago', '15 min ago'
]

// Weighted random - Valentine's Pack (Most Popular) appears more often
function getWeightedProduct() {
  const rand = Math.random()
  // Find the "Most Popular" bundle (usually love-pack)
  const popularIndex = PRODUCTS.findIndex(p => p.badge === 'Most Popular')

  if (rand < 0.55) return PRODUCTS[popularIndex !== -1 ? popularIndex : 0] // 55% Most Popular
  if (rand < 0.80) return PRODUCTS[PRODUCTS.length - 1] // 25% Premium/Deluxe
  return PRODUCTS[0] // 20% Basic
}

function getRandomElement<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)]
}

function getRandomPurchase() {
  const product = getWeightedProduct()
  const showQuantity = Math.random() < 0.15 // 15% chance to show "bought 2x"
  // Get a random design image from actual card designs
  const randomDesign = getRandomElement(PRODUCT.designs)

  return {
    name: getRandomElement(FIRST_NAMES),
    location: getRandomElement(LOCATIONS),
    product: product.name,
    badge: product.badge,
    timeAgo: getRandomElement(TIME_AGO),
    quantity: showQuantity ? 2 : 1,
    designImage: randomDesign.thumbnail,
    designName: randomDesign.name,
  }
}

export function RecentPurchaseToast() {
  const [isVisible, setIsVisible] = useState(false)
  const [purchase, setPurchase] = useState(getRandomPurchase)
  const { isOpen: isCartOpen } = useCartStore()

  const showToast = useCallback(() => {
    // Don't show when cart drawer is open - avoid distraction during checkout
    if (isCartOpen) return

    setPurchase(getRandomPurchase())
    setIsVisible(true)
  }, [isCartOpen])

  // Hide toast when cart opens
  useEffect(() => {
    if (isCartOpen && isVisible) {
      setIsVisible(false)
    }
  }, [isCartOpen, isVisible])

  // Auto-hide after 6 seconds
  useEffect(() => {
    if (!isVisible) return
    const timer = setTimeout(() => setIsVisible(false), 6000)
    return () => clearTimeout(timer)
  }, [isVisible, purchase])

  useEffect(() => {
    // Initial delay: 8-15 seconds (quick enough to catch attention)
    const initialDelay = 8000 + Math.random() * 7000

    let intervalId: NodeJS.Timeout

    const initialTimer = setTimeout(() => {
      showToast()

      // Show every 25-45 seconds (not too spammy)
      intervalId = setInterval(() => {
        showToast()
      }, 25000 + Math.random() * 20000)
    }, initialDelay)

    return () => {
      clearTimeout(initialTimer)
      if (intervalId) clearInterval(intervalId)
    }
  }, [showToast])

  const handleDragEnd = (_event: MouseEvent | TouchEvent | PointerEvent, info: { offset: { x: number } }) => {
    // Swipe left to dismiss on mobile
    if (Math.abs(info.offset.x) > 100) {
      setIsVisible(false)
    }
  }

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0, x: -100, y: 20 }}
          animate={{ opacity: 1, x: 0, y: 0 }}
          exit={{ opacity: 0, x: -100 }}
          transition={{ type: 'spring', damping: 25, stiffness: 350 }}
          drag="x"
          dragConstraints={{ left: 0, right: 0 }}
          dragElastic={0.3}
          onDragEnd={handleDragEnd}
          className="fixed z-40 bottom-24 left-2 right-2 sm:bottom-4 sm:left-4 sm:right-auto"
        >
          <Link
            href="/products/i-choose-you-the-ultimate-valentines-gift"
            onClick={() => setIsVisible(false)}
            className="block bg-white rounded-xl shadow-lg border border-gray-100
                       p-3 sm:p-4 max-w-full sm:max-w-[320px] mx-auto sm:mx-0 hover:shadow-xl transition-shadow cursor-pointer"
          >
            {/* Header with verified badge */}
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-1.5 text-green-600">
                <CheckCircle className="h-4 w-4 fill-green-100" />
                <span className="text-xs font-medium">Verified Purchase</span>
              </div>
              <button
                onClick={(e) => {
                  e.preventDefault()
                  e.stopPropagation()
                  setIsVisible(false)
                }}
                className="text-gray-400 hover:text-gray-600 -mr-1"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* Main content */}
            <div className="flex items-start gap-3">
              {/* Actual card design thumbnail */}
              <div className="w-14 h-14 rounded-lg bg-gray-50 flex-shrink-0 overflow-hidden border border-gray-100">
                <Image
                  src={purchase.designImage}
                  alt={purchase.designName}
                  width={56}
                  height={56}
                  className="w-full h-full object-cover"
                />
              </div>

              <div className="flex-1 min-w-0">
                <p className="text-sm text-gray-900 leading-tight">
                  <span className="font-semibold">{purchase.name}</span>
                  <span className="text-gray-500"> from </span>
                  <span className="font-medium">{purchase.location}</span>
                </p>

                <p className="text-sm text-gray-700 mt-0.5">
                  purchased{' '}
                  {purchase.quantity > 1 && (
                    <span className="font-medium">{purchase.quantity}x </span>
                  )}
                  <span className="font-semibold text-gray-900">{purchase.product}</span>
                </p>

                {/* Footer with time and badge */}
                <div className="flex items-center gap-2 mt-1.5">
                  <span className="text-xs text-gray-400">{purchase.timeAgo}</span>

                  {purchase.badge && (
                    <span className="inline-flex items-center gap-1 text-xs font-medium
                                     text-orange-600 bg-orange-50 px-1.5 py-0.5 rounded">
                      <Flame className="h-3 w-3" />
                      {purchase.badge}
                    </span>
                  )}
                </div>
              </div>
            </div>
          </Link>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

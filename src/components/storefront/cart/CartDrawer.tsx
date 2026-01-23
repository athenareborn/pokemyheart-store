'use client'

import { useEffect } from 'react'
import Link from 'next/link'
import { ShoppingBag, X, ArrowRight } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { useCartStore, SHIPPING_INSURANCE_PRICE } from '@/lib/store/cart'
import { BUNDLES } from '@/data/bundles'
import { formatPrice } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { CartItem } from './CartItem'
import { CountdownTimer } from './CountdownTimer'
import { FreeShippingBar } from './FreeShippingBar'
import { CartExpressCheckout } from './CartExpressCheckout'

export function CartDrawer() {

  const {
    items,
    isOpen,
    closeCart,
    reservationExpiry,
    getSubtotal,
    getShippingCost,
    getTotal,
    isFreeShipping,
    getAmountToFreeShipping,
    isCartEmpty,
    hasBundle,
    upgradeToBundle,
    shippingInsurance,
    setShippingInsurance,
    getInsuranceCost,
  } = useCartStore()

  // Check if cart has card-only bundle (upgradeable)
  const hasCardOnly = hasBundle('card-only')
  const cardOnlyBundle = BUNDLES.find(b => b.id === 'card-only')
  const lovePack = BUNDLES.find(b => b.id === 'love-pack')
  const upgradeCost = lovePack && cardOnlyBundle ? lovePack.price - cardOnlyBundle.price : 0

  // Lock body scroll when cart is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
    }
    return () => {
      document.body.style.overflow = ''
    }
  }, [isOpen])

  const handleExpire = () => {
    // Optionally clear cart on expiry
  }

  const handleCheckout = () => {
    if (items.length === 0) return
    closeCart()
    // Navigate to custom checkout page
    window.location.href = '/checkout'
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 z-50"
            onClick={closeCart}
          />

          {/* Drawer */}
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className="fixed right-0 top-0 bottom-0 w-full max-w-md bg-white z-50 flex flex-col shadow-2xl"
          >
            {/* Header */}
            <div className="flex items-center justify-between px-4 py-4 border-b border-gray-100">
              <div className="flex items-center gap-2">
                <ShoppingBag className="h-5 w-5 text-brand-500" />
                <h2 className="text-lg font-semibold">Your Cart</h2>
                <span className="text-sm text-gray-500">({items.length} items)</span>
              </div>
              <Button variant="ghost" size="icon" onClick={closeCart}>
                <X className="h-5 w-5" />
              </Button>
            </div>

            {/* Countdown Timer */}
            {!isCartEmpty() && (
              <div className="px-4 py-3 border-b border-gray-100">
                <CountdownTimer expiryTime={reservationExpiry} onExpire={handleExpire} />
              </div>
            )}

            {/* Free Shipping Bar */}
            {!isCartEmpty() && (
              <div className="px-4 py-3 border-b border-gray-100">
                <FreeShippingBar
                  amountToFreeShipping={getAmountToFreeShipping()}
                  isFreeShipping={isFreeShipping()}
                />
              </div>
            )}

            {/* Cart Items */}
            <div className="flex-1 overflow-y-auto px-4">
              {isCartEmpty() ? (
                <div className="flex flex-col items-center justify-center h-full text-center">
                  <ShoppingBag className="h-16 w-16 text-gray-300 mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">Your cart is empty</h3>
                  <p className="text-gray-500 mb-6">Add some items to get started!</p>
                  <Button onClick={closeCart} asChild>
                    <Link href="/products/i-choose-you-the-ultimate-valentines-gift">
                      Start Shopping
                    </Link>
                  </Button>
                </div>
              ) : (
                <div className="py-2">
                  {items.map((item) => (
                    <CartItem key={item.id} item={item} />
                  ))}
                </div>
              )}
            </div>

            {/* Footer */}
            {!isCartEmpty() && (
              <div className="border-t border-gray-100 px-4 py-4 space-y-4 bg-gray-50">
                {/* Subtotal */}
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Subtotal</span>
                    <span className="font-medium">{formatPrice(getSubtotal())}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Shipping</span>
                    <span className="font-medium">
                      {isFreeShipping() ? (
                        <span className="text-green-600">FREE</span>
                      ) : (
                        formatPrice(getShippingCost())
                      )}
                    </span>
                  </div>
                  {/* Shipping Insurance Toggle - Professional styling matching checkout */}
                  <label className="flex items-start gap-2.5 p-3 border border-gray-200 rounded-lg cursor-pointer hover:border-brand-400 transition-colors has-[:checked]:border-brand-500 has-[:checked]:bg-brand-50/50 -mx-1">
                    <input
                      type="checkbox"
                      checked={shippingInsurance}
                      onChange={(e) => setShippingInsurance(e.target.checked)}
                      className="w-4 h-4 mt-0.5 text-brand-500 rounded focus:ring-brand-500 focus:ring-offset-0"
                    />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        {/* Package with Shield Icon */}
                        <svg
                          className="w-4 h-4 text-gray-700 flex-shrink-0"
                          viewBox="0 0 24 24"
                          fill="currentColor"
                        >
                          <path d="M3 8.5V19a2 2 0 002 2h8.5a6.5 6.5 0 01-1.04-2H5V9.41l6 3V14h2v-1.59l1-.5V19a4.5 4.5 0 009 0v-6.38l-9-4.5-9 4.5V8.5H3zM12 3L4 6.5V8h16V6.5L12 3z" />
                          <path d="M18 11c-2.76 0-5 2.24-5 5 0 2.21 1.44 4.08 3.43 4.74.22.07.45.11.68.14.29.04.59.06.89.06.3 0 .6-.02.89-.06.23-.03.46-.07.68-.14C21.56 20.08 23 18.21 23 16c0-2.76-2.24-5-5-5zm2.12 4.12l-2.83 2.83a.996.996 0 01-1.41 0l-1.41-1.41a.996.996 0 111.41-1.41l.71.71 2.12-2.12a.996.996 0 111.41 1.4z" />
                        </svg>
                        <span className="font-medium text-gray-900 text-xs">Shipping Insurance</span>
                        <span className="font-semibold text-gray-900 text-xs ml-auto">{formatPrice(SHIPPING_INSURANCE_PRICE)}</span>
                      </div>
                      <p className="text-[10px] text-gray-500 mt-0.5 leading-tight">
                        Protect against loss, theft, or damage
                      </p>
                    </div>
                  </label>
                  <div className="flex justify-between text-base font-semibold pt-2 border-t border-gray-200">
                    <span>Total</span>
                    <span>{formatPrice(getTotal())}</span>
                  </div>
                </div>

                {/* Upgrade Prompt - Show if cart has card-only bundle */}
                {hasCardOnly && lovePack && (
                  <div className="bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200 rounded-xl p-4">
                    <div className="flex items-start gap-3">
                      <span className="text-xl flex-shrink-0">💡</span>
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-gray-900 text-sm">Upgrade & Save</p>
                        <p className="text-xs text-gray-600 mt-1">
                          Add display case + stand for just {formatPrice(upgradeCost)} more
                        </p>
                        <div className="mt-2 space-y-1">
                          <div className="flex items-center gap-1.5 text-xs text-gray-700">
                            <svg className="w-3.5 h-3.5 text-green-600 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                            </svg>
                            <span>Looks 10x more impressive as a gift</span>
                          </div>
                          <div className="flex items-center gap-1.5 text-xs text-gray-700">
                            <svg className="w-3.5 h-3.5 text-green-600 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                            </svg>
                            <span>Unlocks FREE shipping ($4.95 value)</span>
                          </div>
                        </div>
                        <button
                          onClick={() => upgradeToBundle('card-only', 'love-pack')}
                          className="mt-3 w-full py-2 px-4 bg-amber-500 hover:bg-amber-600 text-white text-sm font-semibold rounded-lg transition-colors"
                        >
                          Upgrade to Valentine&apos;s Pack - {formatPrice(lovePack.price)}
                        </button>
                      </div>
                    </div>
                  </div>
                )}

                {/* Express Checkout (Apple Pay / Google Pay) */}
                <CartExpressCheckout />

                {/* Regular Checkout */}
                <Button
                  className="w-full bg-brand-500 hover:bg-brand-600 text-white"
                  size="lg"
                  onClick={handleCheckout}
                >
                  Checkout
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>

                {/* Trust badges */}
                <div className="flex items-center justify-center gap-4 text-xs text-gray-500 pt-2">
                  <span>🔒 Secure Checkout</span>
                  <span>💳 All Cards Accepted</span>
                </div>
              </div>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}

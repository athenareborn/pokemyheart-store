'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { ShoppingBag, X, ArrowRight, Loader2 } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { useCartStore } from '@/lib/store/cart'
import { formatPrice } from '@/lib/utils'
import { BUNDLES } from '@/data/bundles'
import { PRODUCT } from '@/data/product'
import { Button } from '@/components/ui/button'
import { CartItem } from './CartItem'
import { CountdownTimer } from './CountdownTimer'
import { FreeShippingBar } from './FreeShippingBar'
import { fbPixel } from '@/lib/analytics/fpixel'
import { generateEventId } from '@/lib/analytics/facebook-capi'

export function CartDrawer() {
  const [isCheckingOut, setIsCheckingOut] = useState(false)
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
    clearCart,
  } = useCartStore()

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
    // clearCart()
  }

  const handleCheckout = async () => {
    setIsCheckingOut(true)

    // Track FB InitiateCheckout event
    const eventId = generateEventId('ic')
    const contentIds = items.map(item => `${item.designId}-${item.bundleId}`)
    fbPixel.initiateCheckout(
      getTotal() / 100,
      items.length,
      contentIds,
      'USD',
      eventId
    )

    try {
      const checkoutItems = items.map(item => {
        const bundle = BUNDLES.find(b => b.id === item.bundleId)
        const design = PRODUCT.designs.find(d => d.id === item.designId)
        return {
          name: `${PRODUCT.name} - ${design?.name || 'Design'}`,
          description: bundle?.name || 'Card',
          price: item.price,
          quantity: item.quantity,
          // Pass design/bundle IDs for order tracking
          designId: item.designId,
          designName: design?.name || 'Unknown Design',
          bundleId: item.bundleId,
          bundleName: bundle?.name || 'Unknown Bundle',
          bundleSku: bundle?.sku || 'PMH-CARD',
        }
      })

      // Get Facebook cookies for attribution
      const getCookie = (name: string) => {
        const match = document.cookie.match(new RegExp('(^| )' + name + '=([^;]+)'))
        return match ? match[2] : undefined
      }

      const response = await fetch('/api/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          items: checkoutItems,
          fbData: {
            fbc: getCookie('_fbc'),
            fbp: getCookie('_fbp'),
            eventId: generateEventId('purchase'), // Same ID for client + server dedup
          }
        }),
      })

      const data = await response.json()
      if (data.url) {
        // Store checkout data for FB Purchase tracking on success page
        // Use same eventId we sent to checkout for deduplication
        sessionStorage.setItem('fb_purchase_data', JSON.stringify({
          eventId: data.fbEventId, // Server returns the eventId we sent
          value: getTotal() / 100,
          numItems: items.length,
          contentIds: contentIds,
          currency: 'USD',
        }))
        window.location.href = data.url
      } else {
        console.error('No checkout URL returned')
        setIsCheckingOut(false)
      }
    } catch (error) {
      console.error('Checkout error:', error)
      setIsCheckingOut(false)
    }
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
                <ShoppingBag className="h-5 w-5 text-pink-500" />
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
                  <div className="flex justify-between text-base font-semibold pt-2 border-t border-gray-200">
                    <span>Total</span>
                    <span>{formatPrice(getTotal())}</span>
                  </div>
                </div>

                {/* Actions */}
                <div className="space-y-2">
                  <Button
                    className="w-full bg-pink-500 hover:bg-pink-600 text-white"
                    size="lg"
                    onClick={handleCheckout}
                    disabled={isCheckingOut}
                  >
                    {isCheckingOut ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Processing...
                      </>
                    ) : (
                      <>
                        Checkout
                        <ArrowRight className="ml-2 h-4 w-4" />
                      </>
                    )}
                  </Button>
                  <Button
                    variant="outline"
                    className="w-full"
                    onClick={closeCart}
                  >
                    Continue Shopping
                  </Button>
                </div>

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

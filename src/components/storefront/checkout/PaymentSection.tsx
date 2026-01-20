'use client'

import { useState } from 'react'
import { PaymentElement, useStripe, useElements } from '@stripe/react-stripe-js'
import { Lock, Loader2, AlertCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useCheckoutStore } from '@/lib/store/checkout'
import { useCartStore } from '@/lib/store/cart'
import { formatPrice } from '@/lib/utils'
import { PRODUCT } from '@/data/product'
import { PaymentIcons } from './TrustBadges'

interface PaymentSectionProps {
  onSuccess: () => void
}

export function PaymentSection({ onSuccess }: PaymentSectionProps) {
  const stripe = useStripe()
  const elements = useElements()
  const [error, setError] = useState<string | null>(null)
  const [isProcessing, setIsProcessing] = useState(false)

  const { setIsProcessing: setCheckoutProcessing } = useCheckoutStore()
  const { selectedShippingMethod, discountAmount, discountValid } = useCheckoutStore()
  const { getSubtotal, isFreeShipping, clearCart } = useCartStore()

  const subtotal = getSubtotal()
  const qualifiesForFree = isFreeShipping()

  // Calculate shipping cost
  let shippingCost = 0
  if (selectedShippingMethod === 'express') {
    shippingCost = qualifiesForFree
      ? PRODUCT.shipping.standard
      : PRODUCT.shipping.express
  } else {
    shippingCost = qualifiesForFree ? 0 : PRODUCT.shipping.standard
  }

  const total = subtotal + shippingCost - (discountValid ? discountAmount : 0)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!stripe || !elements) {
      return
    }

    setIsProcessing(true)
    setCheckoutProcessing(true)
    setError(null)

    try {
      const { error: submitError } = await elements.submit()
      if (submitError) {
        setError(submitError.message || 'Payment failed')
        setIsProcessing(false)
        setCheckoutProcessing(false)
        return
      }

      const { error: confirmError } = await stripe.confirmPayment({
        elements,
        confirmParams: {
          return_url: `${window.location.origin}/checkout/success`,
        },
      })

      if (confirmError) {
        setError(confirmError.message || 'Payment failed')
        setIsProcessing(false)
        setCheckoutProcessing(false)
      } else {
        // Payment succeeded - clear cart and redirect handled by Stripe
        clearCart()
        onSuccess()
      }
    } catch (err) {
      setError('An unexpected error occurred')
      setIsProcessing(false)
      setCheckoutProcessing(false)
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold text-gray-900">Payment</h2>
        <span className="flex items-center gap-1 text-xs text-gray-500">
          <Lock className="h-3 w-3" />
          Secure
        </span>
      </div>

      <p className="text-sm text-gray-600">
        All transactions are secure and encrypted.
      </p>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="bg-white border border-gray-200 rounded-lg p-4">
          <PaymentElement
            options={{
              layout: 'tabs',
            }}
          />
        </div>

        {error && (
          <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-lg">
            <AlertCircle className="w-4 h-4 text-red-500 flex-shrink-0" />
            <p className="text-sm text-red-600">{error}</p>
          </div>
        )}

        <Button
          type="submit"
          disabled={!stripe || isProcessing}
          className="w-full bg-pink-500 hover:bg-pink-600 text-white py-6 text-lg font-semibold"
        >
          {isProcessing ? (
            <>
              <Loader2 className="mr-2 h-5 w-5 animate-spin" />
              Processing...
            </>
          ) : (
            <>
              <Lock className="mr-2 h-4 w-4" />
              Pay {formatPrice(total)} Securely
            </>
          )}
        </Button>

        <PaymentIcons />

        <p className="text-center text-xs text-gray-500">
          Secured by{' '}
          <span className="font-semibold text-gray-700">Stripe</span>
        </p>
      </form>
    </div>
  )
}

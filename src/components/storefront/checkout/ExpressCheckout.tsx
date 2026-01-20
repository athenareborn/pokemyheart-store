'use client'

import { ExpressCheckoutElement, useStripe, useElements } from '@stripe/react-stripe-js'
import { useCartStore } from '@/lib/store/cart'

interface ExpressCheckoutProps {
  onSuccess: () => void
}

export function ExpressCheckout({ onSuccess }: ExpressCheckoutProps) {
  const stripe = useStripe()
  const elements = useElements()
  const { clearCart } = useCartStore()

  const handleConfirm = async () => {
    if (!stripe || !elements) {
      return
    }

    const { error } = await stripe.confirmPayment({
      elements,
      confirmParams: {
        return_url: `${window.location.origin}/checkout/success`,
      },
    })

    if (!error) {
      clearCart()
      onSuccess()
    }
  }

  return (
    <div className="space-y-4">
      <div className="relative">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-gray-200" />
        </div>
        <div className="relative flex justify-center">
          <span className="bg-white px-4 text-sm text-gray-500">
            Express checkout
          </span>
        </div>
      </div>

      <ExpressCheckoutElement
        onConfirm={handleConfirm}
        options={{
          buttonType: {
            applePay: 'buy',
            googlePay: 'buy',
          },
        }}
      />

      <div className="relative">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-gray-200" />
        </div>
        <div className="relative flex justify-center">
          <span className="bg-white px-4 text-sm text-gray-500">
            Or continue with
          </span>
        </div>
      </div>
    </div>
  )
}

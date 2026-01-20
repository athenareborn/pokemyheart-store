'use client'

import { useState } from 'react'
import { Tag, Loader2, Check, X } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { useCheckoutStore } from '@/lib/store/checkout'
import { useCartStore } from '@/lib/store/cart'
import { cn } from '@/lib/utils'

export function DiscountCodeInput() {
  const [inputCode, setInputCode] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)

  const {
    discountCode,
    discountValid,
    discountAmount,
    setDiscountCode,
    setDiscountAmount,
    setDiscountValid,
  } = useCheckoutStore()
  const { getSubtotal } = useCartStore()

  const handleApply = async () => {
    if (!inputCode.trim()) {
      setMessage({ type: 'error', text: 'Please enter a discount code' })
      return
    }

    setIsLoading(true)
    setMessage(null)

    try {
      const response = await fetch('/api/discount/validate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          code: inputCode.trim(),
          subtotal: getSubtotal(),
        }),
      })

      const data = await response.json()

      if (data.valid) {
        setDiscountCode(inputCode.trim().toUpperCase())
        setDiscountAmount(data.discountAmount)
        setDiscountValid(true)
        setMessage({ type: 'success', text: data.message })
      } else {
        setDiscountCode('')
        setDiscountAmount(0)
        setDiscountValid(false)
        setMessage({ type: 'error', text: data.message })
      }
    } catch {
      setMessage({ type: 'error', text: 'Failed to validate code' })
    } finally {
      setIsLoading(false)
    }
  }

  const handleRemove = () => {
    setInputCode('')
    setDiscountCode('')
    setDiscountAmount(0)
    setDiscountValid(false)
    setMessage(null)
  }

  if (discountValid && discountCode) {
    return (
      <div className="space-y-2">
        <div className="flex items-center justify-between p-3 bg-green-50 border border-green-200 rounded-lg">
          <div className="flex items-center gap-2">
            <Tag className="w-4 h-4 text-green-600" />
            <span className="font-medium text-green-800">{discountCode}</span>
          </div>
          <button
            type="button"
            onClick={handleRemove}
            className="p-1 text-green-600 hover:text-green-800 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
        {message && message.type === 'success' && (
          <p className="text-sm text-green-600 flex items-center gap-1">
            <Check className="w-3 h-3" />
            {message.text}
          </p>
        )}
      </div>
    )
  }

  return (
    <div className="space-y-2">
      <div className="flex gap-2">
        <div className="relative flex-1">
          <Tag className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <Input
            type="text"
            placeholder="Discount code"
            value={inputCode}
            onChange={(e) => setInputCode(e.target.value.toUpperCase())}
            onKeyDown={(e) => e.key === 'Enter' && handleApply()}
            className={cn(
              'pl-9',
              message?.type === 'error' && 'border-red-500'
            )}
          />
        </div>
        <Button
          type="button"
          variant="outline"
          onClick={handleApply}
          disabled={isLoading}
          className="px-4"
        >
          {isLoading ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            'Apply'
          )}
        </Button>
      </div>
      {message && message.type === 'error' && (
        <p className="text-sm text-red-500">{message.text}</p>
      )}
    </div>
  )
}

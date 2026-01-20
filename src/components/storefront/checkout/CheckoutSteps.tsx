'use client'

import { Check } from 'lucide-react'
import { cn } from '@/lib/utils'

interface CheckoutStepsProps {
  currentStep: 'contact' | 'shipping' | 'payment'
}

const steps = [
  { id: 'contact', label: 'Information' },
  { id: 'shipping', label: 'Shipping' },
  { id: 'payment', label: 'Payment' },
] as const

export function CheckoutSteps({ currentStep }: CheckoutStepsProps) {
  const currentIndex = steps.findIndex((s) => s.id === currentStep)

  return (
    <nav aria-label="Checkout progress" className="mb-8">
      <ol className="flex items-center justify-center">
        {steps.map((step, index) => {
          const isCompleted = index < currentIndex
          const isCurrent = index === currentIndex

          return (
            <li key={step.id} className="flex items-center">
              <div className="flex items-center">
                <div
                  className={cn(
                    'flex items-center justify-center w-8 h-8 rounded-full border-2 transition-all',
                    isCompleted && 'bg-pink-500 border-pink-500',
                    isCurrent && 'border-pink-500 text-pink-500',
                    !isCompleted && !isCurrent && 'border-gray-300 text-gray-400'
                  )}
                >
                  {isCompleted ? (
                    <Check className="w-4 h-4 text-white" />
                  ) : (
                    <span className="text-sm font-medium">{index + 1}</span>
                  )}
                </div>
                <span
                  className={cn(
                    'ml-2 text-sm font-medium hidden sm:block',
                    isCurrent && 'text-pink-500',
                    isCompleted && 'text-gray-900',
                    !isCompleted && !isCurrent && 'text-gray-400'
                  )}
                >
                  {step.label}
                </span>
              </div>
              {index < steps.length - 1 && (
                <div
                  className={cn(
                    'w-8 sm:w-16 h-0.5 mx-2 sm:mx-4',
                    index < currentIndex ? 'bg-pink-500' : 'bg-gray-300'
                  )}
                />
              )}
            </li>
          )
        })}
      </ol>
    </nav>
  )
}

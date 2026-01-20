'use client'

import { Shield, Truck, RefreshCw, Lock } from 'lucide-react'

interface TrustBadgesProps {
  variant?: 'default' | 'compact' | 'inline'
}

export function TrustBadges({ variant = 'default' }: TrustBadgesProps) {
  if (variant === 'inline') {
    return (
      <div className="flex items-center justify-center gap-4 text-xs text-gray-500">
        <span className="flex items-center gap-1">
          <Lock className="h-3 w-3" />
          Secure
        </span>
        <span className="flex items-center gap-1">
          <Shield className="h-3 w-3" />
          SSL
        </span>
      </div>
    )
  }

  if (variant === 'compact') {
    return (
      <div className="space-y-2 text-sm text-gray-600">
        <div className="flex items-center gap-2">
          <Shield className="h-4 w-4 text-green-600" />
          <span>30-Day Money-Back Guarantee</span>
        </div>
        <div className="flex items-center gap-2">
          <Truck className="h-4 w-4 text-green-600" />
          <span>Free Returns</span>
        </div>
        <div className="flex items-center gap-2">
          <Lock className="h-4 w-4 text-green-600" />
          <span>256-bit SSL Encryption</span>
        </div>
      </div>
    )
  }

  return (
    <div className="border-t border-gray-200 pt-4 mt-4 space-y-3">
      <div className="flex items-center gap-3 text-sm text-gray-600">
        <div className="flex items-center justify-center w-8 h-8 bg-green-50 rounded-full">
          <Shield className="h-4 w-4 text-green-600" />
        </div>
        <span>30-Day Money-Back Guarantee</span>
      </div>
      <div className="flex items-center gap-3 text-sm text-gray-600">
        <div className="flex items-center justify-center w-8 h-8 bg-green-50 rounded-full">
          <RefreshCw className="h-4 w-4 text-green-600" />
        </div>
        <span>Free Returns</span>
      </div>
      <div className="flex items-center gap-3 text-sm text-gray-600">
        <div className="flex items-center justify-center w-8 h-8 bg-green-50 rounded-full">
          <Lock className="h-4 w-4 text-green-600" />
        </div>
        <span>256-bit SSL Encryption</span>
      </div>
    </div>
  )
}

export function PaymentIcons() {
  return (
    <div className="flex items-center justify-center gap-2 mt-3">
      {/* Visa */}
      <div className="w-10 h-6 bg-white border border-gray-200 rounded flex items-center justify-center">
        <span className="text-[10px] font-bold text-blue-700">VISA</span>
      </div>
      {/* Mastercard */}
      <div className="w-10 h-6 bg-white border border-gray-200 rounded flex items-center justify-center">
        <div className="flex -space-x-1">
          <div className="w-3 h-3 rounded-full bg-red-500" />
          <div className="w-3 h-3 rounded-full bg-yellow-500" />
        </div>
      </div>
      {/* Amex */}
      <div className="w-10 h-6 bg-blue-600 rounded flex items-center justify-center">
        <span className="text-[8px] font-bold text-white">AMEX</span>
      </div>
      {/* Discover */}
      <div className="w-10 h-6 bg-orange-500 rounded flex items-center justify-center">
        <span className="text-[7px] font-bold text-white">DISCOVER</span>
      </div>
    </div>
  )
}

'use client'

import { useState, useEffect } from 'react'
import { X, Gift } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { Button } from '@/components/ui/button'

const STORAGE_KEY = 'exit-popup-shown'
const DISCOUNT_CODE = 'WELCOME10'

export function ExitIntentPopup() {
  const [isOpen, setIsOpen] = useState(false)
  const [copied, setCopied] = useState(false)

  useEffect(() => {
    // Skip if already shown/dismissed
    if (localStorage.getItem(STORAGE_KEY)) return
    if (sessionStorage.getItem(STORAGE_KEY)) return

    const handleMouseLeave = (e: MouseEvent) => {
      if (e.clientY <= 0) {
        setIsOpen(true)
        sessionStorage.setItem(STORAGE_KEY, 'shown')
      }
    }

    document.addEventListener('mouseleave', handleMouseLeave)
    return () => document.removeEventListener('mouseleave', handleMouseLeave)
  }, [])

  const handleClose = () => {
    setIsOpen(false)
  }

  const handleCopy = () => {
    navigator.clipboard.writeText(DISCOUNT_CODE)
    setCopied(true)
    localStorage.setItem(STORAGE_KEY, 'used')
    setTimeout(() => setIsOpen(false), 1500)
  }

  const handleDismissForever = () => {
    localStorage.setItem(STORAGE_KEY, 'dismissed')
    setIsOpen(false)
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
            className="fixed inset-0 bg-black/60 z-50"
            onClick={handleClose}
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2
                       w-full max-w-md bg-white rounded-2xl shadow-2xl z-50 overflow-hidden mx-4"
          >
            {/* Close button */}
            <button
              onClick={handleClose}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"
            >
              <X className="h-6 w-6" />
            </button>

            {/* Content */}
            <div className="p-8 text-center">
              <div className="w-16 h-16 bg-brand-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Gift className="h-8 w-8 text-brand-500" />
              </div>

              <h2 className="text-2xl font-bold text-gray-900 mb-2">
                Wait! Here&apos;s 10% Off
              </h2>
              <p className="text-gray-600 mb-6">
                Don&apos;t leave empty-handed! Use this code for 10% off your first order.
              </p>

              {/* Discount code box */}
              <div className="bg-gray-100 border-2 border-dashed border-gray-300 rounded-lg p-4 mb-6">
                <span className="text-2xl font-mono font-bold text-brand-600">
                  {DISCOUNT_CODE}
                </span>
              </div>

              <Button
                onClick={handleCopy}
                className="w-full bg-brand-500 hover:bg-brand-600 text-white mb-3"
                size="lg"
              >
                {copied ? '✓ Copied!' : 'Copy Code'}
              </Button>

              <button
                onClick={handleDismissForever}
                className="text-sm text-gray-500 hover:text-gray-700"
              >
                No thanks, I&apos;ll pay full price
              </button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}

'use client'

import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export interface ShippingAddress {
  firstName: string
  lastName: string
  address1: string
  address2: string
  city: string
  state: string
  postalCode: string
  country: string
  phone: string
}

export type ShippingMethod = 'standard' | 'express'

interface CheckoutState {
  // Contact
  email: string
  newsletterOptIn: boolean

  // Shipping
  shippingAddress: ShippingAddress
  selectedShippingMethod: ShippingMethod

  // Payment
  paymentIntentId: string | null
  clientSecret: string | null

  // Discount
  discountCode: string
  discountAmount: number
  discountValid: boolean

  // UI State
  currentStep: 'contact' | 'shipping' | 'payment'
  isProcessing: boolean
  errors: Record<string, string>

  // Actions
  setEmail: (email: string) => void
  setNewsletterOptIn: (optIn: boolean) => void
  setShippingAddress: (address: Partial<ShippingAddress>) => void
  setShippingMethod: (method: ShippingMethod) => void
  setDiscountCode: (code: string) => void
  setDiscountAmount: (amount: number) => void
  setDiscountValid: (valid: boolean) => void
  setCurrentStep: (step: 'contact' | 'shipping' | 'payment') => void
  setIsProcessing: (processing: boolean) => void
  setPaymentIntent: (id: string | null, secret: string | null) => void
  setError: (field: string, message: string) => void
  clearError: (field: string) => void
  clearErrors: () => void
  resetCheckout: () => void
}

const initialShippingAddress: ShippingAddress = {
  firstName: '',
  lastName: '',
  address1: '',
  address2: '',
  city: '',
  state: '',
  postalCode: '',
  country: 'US',
  phone: '',
}

export const useCheckoutStore = create<CheckoutState>()(
  persist(
    (set) => ({
      // Initial state
      email: '',
      newsletterOptIn: true,
      shippingAddress: initialShippingAddress,
      selectedShippingMethod: 'standard',
      paymentIntentId: null,
      clientSecret: null,
      discountCode: '',
      discountAmount: 0,
      discountValid: false,
      currentStep: 'contact',
      isProcessing: false,
      errors: {},

      // Actions
      setEmail: (email) => set({ email }),

      setNewsletterOptIn: (optIn) => set({ newsletterOptIn: optIn }),

      setShippingAddress: (address) =>
        set((state) => ({
          shippingAddress: { ...state.shippingAddress, ...address },
        })),

      setShippingMethod: (method) => set({ selectedShippingMethod: method }),

      setDiscountCode: (code) => set({ discountCode: code }),

      setDiscountAmount: (amount) => set({ discountAmount: amount }),

      setDiscountValid: (valid) => set({ discountValid: valid }),

      setCurrentStep: (step) => set({ currentStep: step }),

      setIsProcessing: (processing) => set({ isProcessing: processing }),

      setPaymentIntent: (id, secret) =>
        set({ paymentIntentId: id, clientSecret: secret }),

      setError: (field, message) =>
        set((state) => ({
          errors: { ...state.errors, [field]: message },
        })),

      clearError: (field) =>
        set((state) => {
          const newErrors = { ...state.errors }
          delete newErrors[field]
          return { errors: newErrors }
        }),

      clearErrors: () => set({ errors: {} }),

      resetCheckout: () =>
        set({
          email: '',
          newsletterOptIn: true,
          shippingAddress: initialShippingAddress,
          selectedShippingMethod: 'standard',
          paymentIntentId: null,
          clientSecret: null,
          discountCode: '',
          discountAmount: 0,
          discountValid: false,
          currentStep: 'contact',
          isProcessing: false,
          errors: {},
        }),
    }),
    {
      name: 'pokemyheart-checkout',
      partialize: (state) => ({
        email: state.email,
        shippingAddress: state.shippingAddress,
        selectedShippingMethod: state.selectedShippingMethod,
        discountCode: state.discountCode,
      }),
    }
  )
)

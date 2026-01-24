'use client'

import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { BUNDLES, type BundleId } from '@/data/bundles'
import { PRODUCT } from '@/data/product'

export interface CartItem {
  id: string
  productId: string
  designId: string
  bundleId: BundleId
  quantity: number
  price: number // in cents
}

// Shipping insurance price in cents
export const SHIPPING_INSURANCE_PRICE = 0 // $0.00 (temporary live test)

interface CartState {
  items: CartItem[]
  isOpen: boolean
  reservationExpiry: number | null // timestamp
  shippingInsurance: boolean // Pre-selected by default

  // Actions
  addItem: (designId: string, bundleId: BundleId) => void
  removeItem: (id: string) => void
  updateQuantity: (id: string, quantity: number) => void
  clearCart: () => void
  openCart: () => void
  closeCart: () => void
  toggleCart: () => void
  resetReservation: () => void
  setShippingInsurance: (enabled: boolean) => void
  upgradeToBundle: (fromBundleId: BundleId, toBundleId: BundleId) => void

  // Computed
  getSubtotal: () => number
  getItemCount: () => number
  isCartEmpty: () => boolean
  getShippingCost: () => number
  getTotal: () => number
  isFreeShipping: () => boolean
  getAmountToFreeShipping: () => number
  getInsuranceCost: () => number
  hasBundle: (bundleId: BundleId) => boolean
}

const RESERVATION_DURATION = 5 * 60 * 1000 // 5 minutes in ms

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],
      isOpen: false,
      reservationExpiry: null,
      shippingInsurance: true, // Pre-selected by default

      addItem: (designId: string, bundleId: BundleId) => {
        const bundle = BUNDLES.find(b => b.id === bundleId)
        if (!bundle) return

        const itemId = `${PRODUCT.id}-${designId}-${bundleId}`

        set(state => {
          const existingItem = state.items.find(item => item.id === itemId)

          if (existingItem) {
            return {
              items: state.items.map(item =>
                item.id === itemId
                  ? { ...item, quantity: item.quantity + 1 }
                  : item
              ),
              isOpen: true,
              reservationExpiry: Date.now() + RESERVATION_DURATION,
            }
          }

          return {
            items: [
              ...state.items,
              {
                id: itemId,
                productId: PRODUCT.id,
                designId,
                bundleId,
                quantity: 1,
                price: bundle.price,
              },
            ],
            isOpen: true,
            reservationExpiry: Date.now() + RESERVATION_DURATION,
          }
        })
      },

      removeItem: (id: string) => {
        set(state => ({
          items: state.items.filter(item => item.id !== id),
        }))
      },

      updateQuantity: (id: string, quantity: number) => {
        // Validate quantity - reject invalid values
        if (!Number.isFinite(quantity) || quantity < 1 || quantity > 99) {
          if (quantity < 1) {
            get().removeItem(id)
          }
          return // Reject NaN, Infinity, negative, or excessive quantities
        }

        // Ensure integer
        const safeQuantity = Math.floor(quantity)

        set(state => ({
          items: state.items.map(item =>
            item.id === id ? { ...item, quantity: safeQuantity } : item
          ),
        }))
      },

      clearCart: () => {
        set({ items: [], reservationExpiry: null })
      },

      openCart: () => set({ isOpen: true }),
      closeCart: () => set({ isOpen: false }),
      toggleCart: () => set(state => ({ isOpen: !state.isOpen })),

      resetReservation: () => {
        set({ reservationExpiry: Date.now() + RESERVATION_DURATION })
      },

      setShippingInsurance: (enabled: boolean) => {
        set({ shippingInsurance: enabled })
      },

      upgradeToBundle: (fromBundleId: BundleId, toBundleId: BundleId) => {
        const toBundle = BUNDLES.find(b => b.id === toBundleId)
        if (!toBundle) return

        set(state => ({
          items: state.items.map(item => {
            if (item.bundleId === fromBundleId) {
              // Create new item ID with new bundle
              const newItemId = `${item.productId}-${item.designId}-${toBundleId}`
              return {
                ...item,
                id: newItemId,
                bundleId: toBundleId,
                price: toBundle.price,
              }
            }
            return item
          }),
        }))
      },

      getSubtotal: () => {
        return get().items.reduce(
          (total, item) => total + item.price * item.quantity,
          0
        )
      },

      getItemCount: () => {
        return get().items.reduce((total, item) => total + item.quantity, 0)
      },

      isCartEmpty: () => get().items.length === 0,

      isFreeShipping: () => {
        return get().getSubtotal() >= PRODUCT.freeShippingThreshold
      },

      getAmountToFreeShipping: () => {
        const subtotal = get().getSubtotal()
        return Math.max(0, PRODUCT.freeShippingThreshold - subtotal)
      },

      getShippingCost: () => {
        return get().isFreeShipping() ? 0 : PRODUCT.shipping.standard
      },

      getInsuranceCost: () => {
        return get().shippingInsurance ? SHIPPING_INSURANCE_PRICE : 0
      },

      getTotal: () => {
        return get().getSubtotal() + get().getShippingCost() + get().getInsuranceCost()
      },

      hasBundle: (bundleId: BundleId) => {
        return get().items.some(item => item.bundleId === bundleId)
      },
    }),
    {
      name: 'ultrararelove-cart',
      partialize: (state) => ({
        items: state.items,
        reservationExpiry: state.reservationExpiry,
        shippingInsurance: state.shippingInsurance,
      }),
    }
  )
)

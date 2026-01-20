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

interface CartState {
  items: CartItem[]
  isOpen: boolean
  reservationExpiry: number | null // timestamp

  // Actions
  addItem: (designId: string, bundleId: BundleId) => void
  removeItem: (id: string) => void
  updateQuantity: (id: string, quantity: number) => void
  clearCart: () => void
  openCart: () => void
  closeCart: () => void
  toggleCart: () => void
  resetReservation: () => void

  // Computed
  getSubtotal: () => number
  getItemCount: () => number
  isCartEmpty: () => boolean
  getShippingCost: () => number
  getTotal: () => number
  isFreeShipping: () => boolean
  getAmountToFreeShipping: () => number
}

const RESERVATION_DURATION = 5 * 60 * 1000 // 5 minutes in ms

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],
      isOpen: false,
      reservationExpiry: null,

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
        if (quantity < 1) {
          get().removeItem(id)
          return
        }

        set(state => ({
          items: state.items.map(item =>
            item.id === id ? { ...item, quantity } : item
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

      getTotal: () => {
        return get().getSubtotal() + get().getShippingCost()
      },
    }),
    {
      name: 'ultrararelove-cart',
      partialize: (state) => ({
        items: state.items,
        reservationExpiry: state.reservationExpiry,
      }),
    }
  )
)

'use client'

import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export type ThemeMode = 'pink' | 'red'

interface ThemeState {
  themeMode: ThemeMode
  setThemeMode: (mode: ThemeMode) => void
}

export const useThemeStore = create<ThemeState>()(
  persist(
    (set) => ({
      themeMode: 'pink',
      setThemeMode: (mode) => set({ themeMode: mode }),
    }),
    {
      name: 'pokemyheart-theme',
    }
  )
)

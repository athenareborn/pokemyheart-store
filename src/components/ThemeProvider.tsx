'use client'

import { useEffect, useState } from 'react'
import { useThemeStore } from '@/lib/store/theme'

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const { themeMode } = useThemeStore()
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    if (!mounted) return

    if (themeMode === 'red') {
      document.documentElement.classList.add('theme-red')
    } else {
      document.documentElement.classList.remove('theme-red')
    }
  }, [themeMode, mounted])

  return <>{children}</>
}

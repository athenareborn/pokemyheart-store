'use client'

import Link from 'next/link'
import Image from 'next/image'
import { ShoppingBag, Menu } from 'lucide-react'
import { useState, useEffect } from 'react'
import { useCartStore } from '@/lib/store/cart'
import { Button } from '@/components/ui/button'
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet'

const NAV_LINKS = [
  { href: '/products/i-choose-you-the-ultimate-valentines-gift', label: 'Buy Now' },
  { href: '/about', label: 'About us' },
  { href: '/faq', label: 'FAQ' },
  { href: '/contact', label: 'Contact' },
]

export function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [mounted, setMounted] = useState(false)
  const { openCart, getItemCount } = useCartStore()
  const itemCount = getItemCount()

  // Avoid hydration mismatch - cart count comes from localStorage
  useEffect(() => {
    setMounted(true)
  }, [])

  return (
    <header className="sticky top-0 z-50 bg-white border-b border-gray-100 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="relative flex items-center justify-between h-16">
          {/* Mobile: Hamburger left | Desktop: Logo + Nav */}
          <div className="flex items-center gap-6">
            {/* Mobile menu button - only on mobile */}
            <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
              <SheetTrigger asChild className="lg:hidden">
                <Button variant="ghost" size="icon">
                  <Menu className="h-6 w-6" />
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="w-[280px] p-0">
                <div className="flex flex-col h-full">
                  {/* Header */}
                  <div className="p-6 pb-4 border-b border-gray-100">
                    <Link href="/" onClick={() => setMobileMenuOpen(false)}>
                      <Image
                        src="/images/logo.png"
                        alt="UltraRareLove"
                        width={130}
                        height={32}
                        className="h-8 w-auto"
                      />
                    </Link>
                  </div>

                  {/* Navigation */}
                  <nav className="flex-1 py-4">
                    {NAV_LINKS.map((link, index) => (
                      <Link
                        key={link.href}
                        href={link.href}
                        className={`block px-6 py-3.5 text-base font-medium transition-colors ${
                          index === 0
                            ? 'text-brand-600 bg-brand-50 border-l-2 border-brand-500'
                            : 'text-gray-700 hover:bg-gray-50 hover:text-brand-600 border-l-2 border-transparent'
                        }`}
                        onClick={() => setMobileMenuOpen(false)}
                      >
                        {link.label}
                      </Link>
                    ))}
                  </nav>

                  {/* Footer */}
                  <div className="p-6 pt-4 border-t border-gray-100 bg-gray-50">
                    <p className="text-xs text-gray-500 text-center">
                      Made with love for collectors
                    </p>
                  </div>
                </div>
              </SheetContent>
            </Sheet>

            {/* Logo - hidden on mobile (shown centered below) */}
            <Link href="/" className="hidden lg:flex items-center">
              <Image
                src="/images/logo.png"
                alt="UltraRareLove"
                width={160}
                height={40}
                className="h-10 w-auto"
                priority
              />
            </Link>

            {/* Desktop Navigation - right after logo */}
            <nav className="hidden lg:flex items-center gap-6">
              {NAV_LINKS.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className="text-sm font-medium text-gray-700 hover:text-brand-500 transition-colors"
                >
                  {link.label}
                </Link>
              ))}
            </nav>
          </div>

          {/* Mobile: Centered logo */}
          <Link href="/" className="lg:hidden absolute left-1/2 -translate-x-1/2">
            <Image
              src="/images/logo.png"
              alt="UltraRareLove"
              width={140}
              height={35}
              className="h-9 w-auto"
              priority
            />
          </Link>

          {/* Right actions */}
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="icon"
              className="relative"
              onClick={openCart}
            >
              <ShoppingBag className="h-5 w-5" />
              {mounted && itemCount > 0 && (
                <span className="absolute -top-1 -right-1 h-5 w-5 rounded-full bg-brand-500 text-white text-xs font-bold flex items-center justify-center">
                  {itemCount}
                </span>
              )}
            </Button>
          </div>
        </div>
      </div>
    </header>
  )
}

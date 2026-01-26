import Link from 'next/link'
import Image from 'next/image'
import { Mail, Instagram, Facebook, Twitter } from 'lucide-react'

const FOOTER_LINKS = {
  shop: [
    { href: '/products/i-choose-you-the-ultimate-valentines-gift', label: 'Shop All' },
    { href: '/about', label: 'About Us' },
    { href: '/contact', label: 'Contact' },
  ],
  support: [
    { href: '/faq', label: 'FAQ' },
    { href: '/shipping', label: 'Shipping Policy' },
    { href: '/refunds', label: 'Refund Policy' },
  ],
  legal: [
    { href: '/privacy', label: 'Privacy Policy' },
    { href: '/terms', label: 'Terms of Service' },
  ],
}

export function Footer() {
  return (
    <footer className="bg-gray-900 text-gray-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="space-y-4">
            <Link href="/" className="flex items-center">
              <Image
                src="/images/logo.png"
                alt="UltraRareLove"
                width={91}
                height={36}
                className="h-9 w-auto"
              />
            </Link>
            <p className="text-sm text-gray-400">
              Premium holographic cards that say &quot;I Choose You&quot; - the perfect Valentine&apos;s gift.
            </p>
            <div className="flex gap-4">
              <a href="#" className="hover:text-brand-500 transition-colors" aria-label="Follow us on Instagram">
                <Instagram className="h-5 w-5" />
              </a>
              <a href="#" className="hover:text-brand-500 transition-colors" aria-label="Follow us on Facebook">
                <Facebook className="h-5 w-5" />
              </a>
              <a href="#" className="hover:text-brand-500 transition-colors" aria-label="Follow us on Twitter">
                <Twitter className="h-5 w-5" />
              </a>
            </div>
          </div>

          {/* Shop */}
          <div>
            <h3 className="text-white font-semibold mb-4">Shop</h3>
            <ul className="space-y-2">
              {FOOTER_LINKS.shop.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-sm hover:text-brand-500 transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Support */}
          <div>
            <h3 className="text-white font-semibold mb-4">Support</h3>
            <ul className="space-y-2">
              {FOOTER_LINKS.support.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-sm hover:text-brand-500 transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Newsletter */}
          <div>
            <h3 className="text-white font-semibold mb-4">Stay Updated</h3>
            <p className="text-sm text-gray-400 mb-4">
              Subscribe for exclusive offers and updates.
            </p>
            <form className="flex gap-2">
              <input
                type="email"
                placeholder="Enter your email"
                className="flex-1 px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-sm focus:outline-none focus:border-brand-500"
              />
              <button
                type="submit"
                className="px-4 py-2 bg-brand-500 text-white rounded-lg text-sm font-medium hover:bg-brand-600 transition-colors"
              >
                <Mail className="h-4 w-4" />
              </button>
            </form>
          </div>
        </div>

        {/* Bottom */}
        <div className="border-t border-gray-800 mt-12 pt-8">
          <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
            <p className="text-sm text-gray-400">
              &copy; {new Date().getFullYear()} UltraRareLove. All rights reserved.
            </p>
            <div className="flex gap-4">
              {FOOTER_LINKS.legal.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className="text-sm text-gray-400 hover:text-brand-500 transition-colors"
                >
                  {link.label}
                </Link>
              ))}
            </div>
          </div>
          <p className="mt-4 text-xs text-gray-500 text-center sm:text-left">
            UltraRareLove is an independent brand and is not affiliated with, endorsed by, or sponsored by Nintendo, The Pokemon Company, or any of their affiliates.
          </p>
        </div>
      </div>
    </footer>
  )
}

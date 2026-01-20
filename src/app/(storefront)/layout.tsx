import { AnnouncementBar } from '@/components/storefront/layout/AnnouncementBar'
import { Header } from '@/components/storefront/layout/Header'
import { Footer } from '@/components/storefront/layout/Footer'
import { CartDrawer } from '@/components/storefront/cart/CartDrawer'
import { ExitIntentPopup } from '@/components/storefront/popups/ExitIntentPopup'
import { RecentPurchaseToast } from '@/components/storefront/popups/RecentPurchaseToast'

export default function StorefrontLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="min-h-screen flex flex-col">
      <AnnouncementBar />
      <Header />
      <main className="flex-1">{children}</main>
      <Footer />
      <CartDrawer />
      <ExitIntentPopup />
      <RecentPurchaseToast />
    </div>
  )
}

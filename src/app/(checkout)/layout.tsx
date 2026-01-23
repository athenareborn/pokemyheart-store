/**
 * Clean checkout layout - Shopify style
 * NO navigation, NO distractions, just focused checkout
 *
 * Note: CheckoutPage component has its own header with "← Back to shop" and logo
 * This layout just provides the wrapper without the storefront nav/footer
 */
export default function CheckoutLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <>
      {children}
    </>
  )
}

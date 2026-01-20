import { Metadata } from 'next'
import Link from 'next/link'

export const metadata: Metadata = {
  title: 'Privacy Policy - UltraRareLove',
  description: 'Privacy Policy for UltraRareLove. Learn how we collect, use, and protect your personal information.',
}

export default function PrivacyPolicyPage() {
  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <section className="bg-gradient-to-br from-brand-50 via-white to-brand-50 py-12 sm:py-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-900 mb-4">
            Privacy Policy
          </h1>
          <p className="text-gray-600">
            Last updated: January 20, 2025
          </p>
        </div>
      </section>

      {/* Content */}
      <section className="py-12 sm:py-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="prose prose-gray max-w-none">
            <p className="text-lg text-gray-600 mb-8">
              At UltraRareLove (&quot;we&quot;, &quot;us&quot;, or &quot;our&quot;), we are committed to protecting your privacy.
              This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you
              visit our website ultrararelove.com and make purchases from our store.
            </p>

            <h2 className="text-2xl font-bold text-gray-900 mt-10 mb-4">1. Information We Collect</h2>

            <h3 className="text-xl font-semibold text-gray-900 mt-6 mb-3">Personal Information</h3>
            <p className="text-gray-600 mb-4">
              When you make a purchase or create an account, we collect:
            </p>
            <ul className="list-disc pl-6 text-gray-600 space-y-2 mb-6">
              <li>Name and contact information (email address, phone number)</li>
              <li>Billing and shipping addresses</li>
              <li>Payment information (processed securely through Stripe - we do not store full card details)</li>
              <li>Order history and transaction details</li>
            </ul>

            <h3 className="text-xl font-semibold text-gray-900 mt-6 mb-3">Automatically Collected Information</h3>
            <p className="text-gray-600 mb-4">
              When you browse our website, we automatically collect:
            </p>
            <ul className="list-disc pl-6 text-gray-600 space-y-2 mb-6">
              <li>IP address and browser type</li>
              <li>Device information and operating system</li>
              <li>Pages visited and time spent on our site</li>
              <li>Referring website addresses</li>
            </ul>

            <h2 className="text-2xl font-bold text-gray-900 mt-10 mb-4">2. How We Use Your Information</h2>
            <p className="text-gray-600 mb-4">We use the information we collect to:</p>
            <ul className="list-disc pl-6 text-gray-600 space-y-2 mb-6">
              <li>Process and fulfill your orders</li>
              <li>Send order confirmations, shipping updates, and tracking information</li>
              <li>Respond to your inquiries and provide customer support</li>
              <li>Send marketing communications (only if you opt-in)</li>
              <li>Improve our website, products, and services</li>
              <li>Prevent fraud and maintain security</li>
              <li>Comply with legal obligations</li>
            </ul>

            <h2 className="text-2xl font-bold text-gray-900 mt-10 mb-4">3. Information Sharing</h2>
            <p className="text-gray-600 mb-4">
              We do not sell, trade, or rent your personal information to third parties. We may share your
              information with:
            </p>
            <ul className="list-disc pl-6 text-gray-600 space-y-2 mb-6">
              <li><strong>Service Providers:</strong> Companies that help us operate our business (payment processors like Stripe, shipping carriers, email services)</li>
              <li><strong>Legal Requirements:</strong> When required by law, subpoena, or legal process</li>
              <li><strong>Business Transfers:</strong> In connection with a merger, acquisition, or sale of assets</li>
            </ul>

            <h2 className="text-2xl font-bold text-gray-900 mt-10 mb-4">4. Payment Security</h2>
            <p className="text-gray-600 mb-6">
              All payment transactions are processed through Stripe, a PCI DSS Level 1 compliant payment processor.
              We never store your full credit card number, CVV, or other sensitive payment data on our servers.
              All data is transmitted using SSL/TLS encryption.
            </p>

            <h2 className="text-2xl font-bold text-gray-900 mt-10 mb-4">5. Cookies and Tracking</h2>
            <p className="text-gray-600 mb-4">
              We use cookies and similar technologies to:
            </p>
            <ul className="list-disc pl-6 text-gray-600 space-y-2 mb-6">
              <li>Remember your preferences and cart contents</li>
              <li>Analyze website traffic and usage patterns</li>
              <li>Provide personalized content and recommendations</li>
            </ul>
            <p className="text-gray-600 mb-6">
              You can control cookies through your browser settings. Disabling cookies may affect some website functionality.
            </p>

            <h2 className="text-2xl font-bold text-gray-900 mt-10 mb-4">6. Your Rights</h2>
            <p className="text-gray-600 mb-4">You have the right to:</p>
            <ul className="list-disc pl-6 text-gray-600 space-y-2 mb-6">
              <li>Access the personal information we hold about you</li>
              <li>Request correction of inaccurate information</li>
              <li>Request deletion of your personal information</li>
              <li>Opt-out of marketing communications at any time</li>
              <li>Lodge a complaint with a data protection authority</li>
            </ul>

            <h2 className="text-2xl font-bold text-gray-900 mt-10 mb-4">7. Data Retention</h2>
            <p className="text-gray-600 mb-6">
              We retain your personal information for as long as necessary to fulfill the purposes outlined in this
              policy, unless a longer retention period is required by law. Order records are typically retained for
              7 years for accounting and legal purposes.
            </p>

            <h2 className="text-2xl font-bold text-gray-900 mt-10 mb-4">8. Children&apos;s Privacy</h2>
            <p className="text-gray-600 mb-6">
              Our website is not intended for children under 13 years of age. We do not knowingly collect personal
              information from children under 13. If you believe we have collected information from a child under 13,
              please contact us immediately.
            </p>

            <h2 className="text-2xl font-bold text-gray-900 mt-10 mb-4">9. Changes to This Policy</h2>
            <p className="text-gray-600 mb-6">
              We may update this Privacy Policy from time to time. We will notify you of any changes by posting the
              new policy on this page and updating the &quot;Last updated&quot; date. We encourage you to review this policy
              periodically.
            </p>

            <h2 className="text-2xl font-bold text-gray-900 mt-10 mb-4">10. Contact Us</h2>
            <p className="text-gray-600 mb-4">
              If you have questions about this Privacy Policy or wish to exercise your rights, please contact us:
            </p>
            <div className="bg-gray-50 p-6 rounded-xl mb-6">
              <p className="text-gray-900 font-semibold mb-2">UltraRareLove</p>
              <p className="text-gray-600">Email: privacy@ultrararelove.com</p>
              <p className="text-gray-600">General Inquiries: hello@ultrararelove.com</p>
            </div>

            <div className="mt-10 pt-8 border-t border-gray-200">
              <p className="text-gray-600">
                For questions about orders or products, please visit our{' '}
                <Link href="/contact" className="text-brand-500 hover:text-brand-600">
                  Contact page
                </Link>{' '}
                or{' '}
                <Link href="/faq" className="text-brand-500 hover:text-brand-600">
                  FAQ
                </Link>.
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}

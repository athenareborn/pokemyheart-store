import { Metadata } from 'next'
import Link from 'next/link'

export const metadata: Metadata = {
  title: 'Terms of Service - UltraRareLove',
  description: 'Terms of Service for UltraRareLove. Read our terms and conditions for using our website and purchasing products.',
}

export default function TermsOfServicePage() {
  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <section className="bg-gradient-to-br from-brand-50 via-white to-brand-50 py-12 sm:py-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-900 mb-4">
            Terms of Service
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
              Welcome to UltraRareLove. By accessing our website at ultrararelove.com and/or making a purchase,
              you agree to be bound by these Terms of Service. Please read them carefully before using our services.
            </p>

            <h2 className="text-2xl font-bold text-gray-900 mt-10 mb-4">1. Acceptance of Terms</h2>
            <p className="text-gray-600 mb-6">
              By accessing or using our website, you acknowledge that you have read, understood, and agree to be
              bound by these Terms of Service and our Privacy Policy. If you do not agree to these terms, please
              do not use our website or services.
            </p>

            <h2 className="text-2xl font-bold text-gray-900 mt-10 mb-4">2. Eligibility</h2>
            <p className="text-gray-600 mb-6">
              You must be at least 18 years old or have parental/guardian consent to make purchases on our website.
              By placing an order, you represent that you meet this requirement.
            </p>

            <h2 className="text-2xl font-bold text-gray-900 mt-10 mb-4">3. Products and Pricing</h2>
            <ul className="list-disc pl-6 text-gray-600 space-y-2 mb-6">
              <li>All products are subject to availability. We reserve the right to limit quantities.</li>
              <li>Prices are listed in USD and may be subject to change without notice.</li>
              <li>We make every effort to display accurate product images and descriptions, but actual products may vary slightly.</li>
              <li>We reserve the right to correct any pricing errors and cancel orders placed at incorrect prices.</li>
            </ul>

            <h2 className="text-2xl font-bold text-gray-900 mt-10 mb-4">4. Orders and Payment</h2>
            <ul className="list-disc pl-6 text-gray-600 space-y-2 mb-6">
              <li>Placing an order constitutes an offer to purchase. We reserve the right to accept or decline orders.</li>
              <li>Payment is required at the time of order. We accept major credit cards, PayPal, Apple Pay, and Google Pay.</li>
              <li>All payments are processed securely through Stripe.</li>
              <li>You will receive an order confirmation email upon successful payment.</li>
            </ul>

            <h2 className="text-2xl font-bold text-gray-900 mt-10 mb-4">5. Shipping and Delivery</h2>
            <p className="text-gray-600 mb-4">
              Please refer to our <Link href="/shipping" className="text-brand-500 hover:text-brand-600">Shipping Policy</Link> for
              detailed information on shipping methods, costs, and delivery times. Key points:
            </p>
            <ul className="list-disc pl-6 text-gray-600 space-y-2 mb-6">
              <li>Shipping times are estimates and not guaranteed.</li>
              <li>Risk of loss passes to you upon delivery to the carrier.</li>
              <li>International orders may be subject to customs duties and taxes.</li>
            </ul>

            <h2 className="text-2xl font-bold text-gray-900 mt-10 mb-4">6. Returns and Refunds</h2>
            <p className="text-gray-600 mb-6">
              Please refer to our <Link href="/refunds" className="text-brand-500 hover:text-brand-600">Refund Policy</Link> for
              complete details on returns, exchanges, and refunds. We offer a 30-day return policy for unused items
              in original packaging.
            </p>

            <h2 className="text-2xl font-bold text-gray-900 mt-10 mb-4">7. Intellectual Property</h2>
            <p className="text-gray-600 mb-6">
              All content on this website, including but not limited to text, graphics, logos, images, product designs,
              and software, is the property of UltraRareLove or its content suppliers and is protected by copyright,
              trademark, and other intellectual property laws. You may not reproduce, distribute, modify, or create
              derivative works without our written permission.
            </p>

            <h2 className="text-2xl font-bold text-gray-900 mt-10 mb-4">8. User Conduct</h2>
            <p className="text-gray-600 mb-4">You agree not to:</p>
            <ul className="list-disc pl-6 text-gray-600 space-y-2 mb-6">
              <li>Use our website for any unlawful purpose</li>
              <li>Attempt to gain unauthorized access to our systems</li>
              <li>Interfere with the proper functioning of the website</li>
              <li>Submit false or misleading information</li>
              <li>Engage in any activity that could harm our business or reputation</li>
            </ul>

            <h2 className="text-2xl font-bold text-gray-900 mt-10 mb-4">9. Disclaimer of Warranties</h2>
            <p className="text-gray-600 mb-6">
              Our website and products are provided &quot;as is&quot; without warranties of any kind, either express or implied.
              We do not warrant that the website will be uninterrupted, error-free, or free of viruses. We make no
              warranties regarding the accuracy or completeness of content on the website.
            </p>

            <h2 className="text-2xl font-bold text-gray-900 mt-10 mb-4">10. Limitation of Liability</h2>
            <p className="text-gray-600 mb-6">
              To the fullest extent permitted by law, UltraRareLove shall not be liable for any indirect, incidental,
              special, consequential, or punitive damages arising from your use of our website or products. Our total
              liability shall not exceed the amount you paid for the product(s) in question.
            </p>

            <h2 className="text-2xl font-bold text-gray-900 mt-10 mb-4">11. Indemnification</h2>
            <p className="text-gray-600 mb-6">
              You agree to indemnify and hold harmless UltraRareLove, its officers, directors, employees, and agents
              from any claims, damages, losses, or expenses arising from your violation of these Terms or your use
              of our website.
            </p>

            <h2 className="text-2xl font-bold text-gray-900 mt-10 mb-4">12. Governing Law</h2>
            <p className="text-gray-600 mb-6">
              These Terms shall be governed by and construed in accordance with the laws of the United States. Any
              disputes arising from these Terms shall be resolved in the appropriate courts.
            </p>

            <h2 className="text-2xl font-bold text-gray-900 mt-10 mb-4">13. Changes to Terms</h2>
            <p className="text-gray-600 mb-6">
              We reserve the right to modify these Terms at any time. Changes will be effective immediately upon
              posting to the website. Your continued use of the website after changes constitutes acceptance of the
              modified Terms.
            </p>

            <h2 className="text-2xl font-bold text-gray-900 mt-10 mb-4">14. Severability</h2>
            <p className="text-gray-600 mb-6">
              If any provision of these Terms is found to be unenforceable, the remaining provisions shall continue
              in full force and effect.
            </p>

            <h2 className="text-2xl font-bold text-gray-900 mt-10 mb-4">15. Contact Information</h2>
            <p className="text-gray-600 mb-4">
              For questions about these Terms of Service, please contact us:
            </p>
            <div className="bg-gray-50 p-6 rounded-xl mb-6">
              <p className="text-gray-900 font-semibold mb-2">UltraRareLove</p>
              <p className="text-gray-600">Email: legal@ultrararelove.com</p>
              <p className="text-gray-600">General Inquiries: hello@ultrararelove.com</p>
            </div>

            <div className="mt-10 pt-8 border-t border-gray-200">
              <p className="text-gray-600">
                See also:{' '}
                <Link href="/privacy" className="text-brand-500 hover:text-brand-600">
                  Privacy Policy
                </Link>{' '}
                |{' '}
                <Link href="/refunds" className="text-brand-500 hover:text-brand-600">
                  Refund Policy
                </Link>{' '}
                |{' '}
                <Link href="/shipping" className="text-brand-500 hover:text-brand-600">
                  Shipping Policy
                </Link>
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}

import { Metadata } from 'next'
import Link from 'next/link'
import { Truck, Globe, Clock, Package, MapPin } from 'lucide-react'

export const metadata: Metadata = {
  title: 'Shipping Policy - UltraRareLove',
  description: 'Shipping Policy for UltraRareLove. Learn about shipping rates, delivery times, and international shipping.',
}

export default function ShippingPolicyPage() {
  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <section className="bg-gradient-to-br from-brand-50 via-white to-brand-50 py-12 sm:py-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-brand-100 rounded-full mb-6">
            <Truck className="w-8 h-8 text-brand-500" />
          </div>
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-900 mb-4">
            Shipping Policy
          </h1>
          <p className="text-gray-600">
            Last updated: January 20, 2025
          </p>
        </div>
      </section>

      {/* Shipping Rates Table */}
      <section className="py-8 sm:py-12 bg-brand-50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-xl font-bold text-gray-900 text-center mb-6">Shipping Rates - United States</h2>
          <div className="bg-white rounded-xl overflow-hidden shadow-sm">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900">Shipping Method</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900">Delivery Time</th>
                  <th className="px-4 py-3 text-right text-sm font-semibold text-gray-900">Cost</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                <tr>
                  <td className="px-4 py-3 text-gray-900">Standard Shipping</td>
                  <td className="px-4 py-3 text-gray-600">5-7 business days</td>
                  <td className="px-4 py-3 text-right text-gray-900">$4.99</td>
                </tr>
                <tr className="bg-brand-50">
                  <td className="px-4 py-3 text-gray-900">
                    <span className="font-medium">FREE Standard Shipping</span>
                    <span className="text-sm text-brand-600 block">Orders over $35</span>
                  </td>
                  <td className="px-4 py-3 text-gray-600">5-7 business days</td>
                  <td className="px-4 py-3 text-right text-brand-600 font-semibold">FREE</td>
                </tr>
                <tr>
                  <td className="px-4 py-3 text-gray-900">Expedited Shipping</td>
                  <td className="px-4 py-3 text-gray-600">2-3 business days</td>
                  <td className="px-4 py-3 text-right text-gray-900">$9.99</td>
                </tr>
                <tr>
                  <td className="px-4 py-3 text-gray-900">Express Shipping</td>
                  <td className="px-4 py-3 text-gray-600">1-2 business days</td>
                  <td className="px-4 py-3 text-right text-gray-900">$14.99</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* Content */}
      <section className="py-12 sm:py-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="prose prose-gray max-w-none">

            <h2 className="text-2xl font-bold text-gray-900 mt-10 mb-4 flex items-center gap-3">
              <Clock className="w-6 h-6 text-brand-500" />
              Processing Time
            </h2>
            <p className="text-gray-600 mb-6">
              All orders are processed within 1-2 business days (Monday-Friday, excluding holidays).
              During peak seasons such as Valentine&apos;s Day and Christmas, processing may take 2-3 business days.
              You will receive an email with tracking information once your order ships.
            </p>

            <h2 className="text-2xl font-bold text-gray-900 mt-10 mb-4 flex items-center gap-3">
              <Package className="w-6 h-6 text-brand-500" />
              Domestic Shipping (United States)
            </h2>
            <p className="text-gray-600 mb-4">
              We ship to all 50 states, Puerto Rico, and U.S. territories. Delivery times are estimates
              and begin after your order has been processed and shipped.
            </p>
            <ul className="list-disc pl-6 text-gray-600 space-y-2 mb-6">
              <li><strong>Standard Shipping:</strong> 5-7 business days - $4.99 (FREE on orders over $35)</li>
              <li><strong>Expedited Shipping:</strong> 2-3 business days - $9.99</li>
              <li><strong>Express Shipping:</strong> 1-2 business days - $14.99</li>
            </ul>
            <p className="text-gray-600 mb-6">
              Note: Delivery to Alaska, Hawaii, and U.S. territories may take additional time.
            </p>

            <h2 className="text-2xl font-bold text-gray-900 mt-10 mb-4 flex items-center gap-3">
              <Globe className="w-6 h-6 text-brand-500" />
              International Shipping
            </h2>
            <p className="text-gray-600 mb-4">
              We ship to most countries worldwide! International shipping rates and delivery times vary
              by destination.
            </p>

            <div className="bg-gray-50 p-6 rounded-xl mb-6">
              <h3 className="font-semibold text-gray-900 mb-3">Estimated International Shipping Times:</h3>
              <ul className="list-disc pl-6 text-gray-600 space-y-2">
                <li><strong>Canada:</strong> 7-14 business days</li>
                <li><strong>Europe (UK, EU):</strong> 10-20 business days</li>
                <li><strong>Australia/New Zealand:</strong> 14-25 business days</li>
                <li><strong>Asia:</strong> 14-25 business days</li>
                <li><strong>Rest of World:</strong> 14-30 business days</li>
              </ul>
            </div>

            <div className="bg-amber-50 border border-amber-200 p-6 rounded-xl mb-6">
              <h3 className="font-semibold text-amber-900 mb-2">Important: Customs & Duties</h3>
              <p className="text-amber-800">
                International orders may be subject to import duties, taxes, and customs fees imposed by the
                destination country. These charges are the responsibility of the recipient and are not included
                in our shipping rates or product prices. Please check with your local customs office for more
                information.
              </p>
            </div>

            <h2 className="text-2xl font-bold text-gray-900 mt-10 mb-4 flex items-center gap-3">
              <MapPin className="w-6 h-6 text-brand-500" />
              Order Tracking
            </h2>
            <p className="text-gray-600 mb-6">
              Once your order ships, you will receive an email with your tracking number and a link to track
              your package. You can also track your order by:
            </p>
            <ul className="list-disc pl-6 text-gray-600 space-y-2 mb-6">
              <li>Clicking the tracking link in your shipping confirmation email</li>
              <li>Visiting the carrier&apos;s website and entering your tracking number</li>
              <li>Contacting us at support@ultrararelove.com with your order number</li>
            </ul>

            <h2 className="text-2xl font-bold text-gray-900 mt-10 mb-4">Shipping Address</h2>
            <p className="text-gray-600 mb-6">
              Please ensure your shipping address is complete and accurate when placing your order. We are not
              responsible for packages delivered to incorrect addresses provided by the customer. If you need to
              change your shipping address after placing an order, please contact us immediately at
              support@ultrararelove.com before your order ships.
            </p>

            <h2 className="text-2xl font-bold text-gray-900 mt-10 mb-4">Lost or Stolen Packages</h2>
            <p className="text-gray-600 mb-6">
              Once a package is marked as delivered by the carrier, it is considered delivered. If you believe
              your package was lost or stolen:
            </p>
            <ul className="list-disc pl-6 text-gray-600 space-y-2 mb-6">
              <li>Check with neighbors and household members</li>
              <li>Look around your delivery area (porch, mailroom, etc.)</li>
              <li>Contact the carrier directly with your tracking number</li>
              <li>If still not found, contact us within 7 days of the delivery date</li>
            </ul>

            <h2 className="text-2xl font-bold text-gray-900 mt-10 mb-4">Shipping Delays</h2>
            <p className="text-gray-600 mb-6">
              While we strive to meet all estimated delivery times, delays may occur due to:
            </p>
            <ul className="list-disc pl-6 text-gray-600 space-y-2 mb-6">
              <li>High order volumes during peak seasons</li>
              <li>Carrier delays or weather conditions</li>
              <li>Customs processing for international orders</li>
              <li>Incorrect or incomplete shipping information</li>
            </ul>
            <p className="text-gray-600 mb-6">
              We appreciate your patience and understanding. If your order is significantly delayed, please
              contact us for assistance.
            </p>

            <h2 className="text-2xl font-bold text-gray-900 mt-10 mb-4">Questions?</h2>
            <p className="text-gray-600 mb-4">
              If you have any questions about shipping, please contact us:
            </p>
            <div className="bg-brand-50 p-6 rounded-xl mb-6">
              <p className="text-gray-900 font-semibold mb-1">Email Us</p>
              <a href="mailto:support@ultrararelove.com" className="text-brand-500 hover:text-brand-600">
                support@ultrararelove.com
              </a>
            </div>

            <div className="mt-10 pt-8 border-t border-gray-200">
              <p className="text-gray-600">
                See also:{' '}
                <Link href="/refunds" className="text-brand-500 hover:text-brand-600">
                  Refund Policy
                </Link>{' '}
                |{' '}
                <Link href="/faq" className="text-brand-500 hover:text-brand-600">
                  FAQ
                </Link>{' '}
                |{' '}
                <Link href="/contact" className="text-brand-500 hover:text-brand-600">
                  Contact Us
                </Link>
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}

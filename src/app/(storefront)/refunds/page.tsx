import { Metadata } from 'next'
import Link from 'next/link'
import { RefreshCw, Package, Clock, Mail } from 'lucide-react'

export const metadata: Metadata = {
  title: 'Refund Policy - PokeMyHeart',
  description: 'Refund and Return Policy for PokeMyHeart. Learn about our 30-day return policy, refund process, and how to return items.',
}

export default function RefundPolicyPage() {
  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <section className="bg-gradient-to-br from-pink-50 via-white to-pink-50 py-12 sm:py-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-pink-100 rounded-full mb-6">
            <RefreshCw className="w-8 h-8 text-pink-500" />
          </div>
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-900 mb-4">
            Refund Policy
          </h1>
          <p className="text-gray-600">
            Last updated: January 20, 2025
          </p>
        </div>
      </section>

      {/* Quick Summary */}
      <section className="py-8 sm:py-12 bg-pink-50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-3">
            <div className="bg-white p-6 rounded-xl text-center">
              <Clock className="w-8 h-8 text-pink-500 mx-auto mb-3" />
              <h3 className="font-semibold text-gray-900 mb-1">30 Days</h3>
              <p className="text-sm text-gray-600">Return window</p>
            </div>
            <div className="bg-white p-6 rounded-xl text-center">
              <Package className="w-8 h-8 text-pink-500 mx-auto mb-3" />
              <h3 className="font-semibold text-gray-900 mb-1">Original Packaging</h3>
              <p className="text-sm text-gray-600">Items must be unused</p>
            </div>
            <div className="bg-white p-6 rounded-xl text-center">
              <RefreshCw className="w-8 h-8 text-pink-500 mx-auto mb-3" />
              <h3 className="font-semibold text-gray-900 mb-1">Full Refund</h3>
              <p className="text-sm text-gray-600">To original payment</p>
            </div>
          </div>
        </div>
      </section>

      {/* Content */}
      <section className="py-12 sm:py-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="prose prose-gray max-w-none">
            <p className="text-lg text-gray-600 mb-8">
              We want you to be completely satisfied with your PokeMyHeart purchase. If you&apos;re not happy with your
              order for any reason, we&apos;re here to help.
            </p>

            <h2 className="text-2xl font-bold text-gray-900 mt-10 mb-4">Return Eligibility</h2>
            <p className="text-gray-600 mb-4">To be eligible for a return, items must:</p>
            <ul className="list-disc pl-6 text-gray-600 space-y-2 mb-6">
              <li>Be returned within 30 days of delivery</li>
              <li>Be unused and in original condition</li>
              <li>Be in original packaging with all accessories included</li>
              <li>Include proof of purchase (order confirmation email or receipt)</li>
            </ul>

            <h2 className="text-2xl font-bold text-gray-900 mt-10 mb-4">Non-Returnable Items</h2>
            <p className="text-gray-600 mb-4">The following items cannot be returned:</p>
            <ul className="list-disc pl-6 text-gray-600 space-y-2 mb-6">
              <li>Items that have been opened, used, or removed from original packaging</li>
              <li>Items damaged due to misuse or negligence</li>
              <li>Customized or personalized products (when available)</li>
              <li>Items purchased during final sale promotions</li>
            </ul>

            <h2 className="text-2xl font-bold text-gray-900 mt-10 mb-4">How to Return an Item</h2>
            <div className="bg-gray-50 p-6 rounded-xl mb-6">
              <ol className="list-decimal pl-6 text-gray-600 space-y-4">
                <li>
                  <strong>Contact Us:</strong> Email support@pokemyheart.com with your order number and reason for return.
                  We&apos;ll respond within 24-48 hours with return instructions.
                </li>
                <li>
                  <strong>Pack Your Item:</strong> Securely pack the item in its original packaging. Include your order
                  number inside the package.
                </li>
                <li>
                  <strong>Ship It Back:</strong> Send the package to the return address provided in our email. We recommend
                  using a trackable shipping method.
                </li>
                <li>
                  <strong>Receive Your Refund:</strong> Once we receive and inspect your return, we&apos;ll process your refund
                  within 3-5 business days.
                </li>
              </ol>
            </div>

            <h2 className="text-2xl font-bold text-gray-900 mt-10 mb-4">Refund Processing</h2>
            <ul className="list-disc pl-6 text-gray-600 space-y-2 mb-6">
              <li>Refunds are issued to the original payment method</li>
              <li>Refunds are processed within 3-5 business days after we receive your return</li>
              <li>Your bank may take an additional 5-10 business days to reflect the refund</li>
              <li>You will receive an email confirmation when your refund is processed</li>
            </ul>

            <h2 className="text-2xl font-bold text-gray-900 mt-10 mb-4">Return Shipping Costs</h2>
            <ul className="list-disc pl-6 text-gray-600 space-y-2 mb-6">
              <li><strong>Defective/Damaged Items:</strong> We provide free return shipping</li>
              <li><strong>Wrong Item Sent:</strong> We provide free return shipping</li>
              <li><strong>Change of Mind:</strong> $4.99 flat rate deducted from refund</li>
            </ul>

            <h2 className="text-2xl font-bold text-gray-900 mt-10 mb-4">Damaged or Defective Items</h2>
            <p className="text-gray-600 mb-6">
              If your item arrives damaged or defective, please contact us within 48 hours of delivery.
              Email support@pokemyheart.com with:
            </p>
            <ul className="list-disc pl-6 text-gray-600 space-y-2 mb-6">
              <li>Your order number</li>
              <li>Photos of the damaged/defective item</li>
              <li>Photos of the packaging (if damaged in transit)</li>
            </ul>
            <p className="text-gray-600 mb-6">
              We&apos;ll send a replacement immediately at no additional cost, or issue a full refund if you prefer.
            </p>

            <h2 className="text-2xl font-bold text-gray-900 mt-10 mb-4">Wrong Item Received</h2>
            <p className="text-gray-600 mb-6">
              If you received the wrong item, please contact us immediately at support@pokemyheart.com. We&apos;ll ship
              the correct item right away and provide a prepaid return label for the incorrect item.
            </p>

            <h2 className="text-2xl font-bold text-gray-900 mt-10 mb-4">Exchanges</h2>
            <p className="text-gray-600 mb-6">
              We currently do not offer direct exchanges. If you&apos;d like a different item, please return the original
              item for a refund and place a new order for the desired item.
            </p>

            <h2 className="text-2xl font-bold text-gray-900 mt-10 mb-4">Order Cancellations</h2>
            <p className="text-gray-600 mb-6">
              If you need to cancel an order, please contact us as soon as possible. Orders can only be cancelled
              before they ship. Once an order has shipped, you&apos;ll need to follow our return process.
            </p>

            <h2 className="text-2xl font-bold text-gray-900 mt-10 mb-4">Contact Us</h2>
            <p className="text-gray-600 mb-4">
              For return requests or questions about our refund policy:
            </p>
            <div className="bg-pink-50 p-6 rounded-xl mb-6 flex items-start gap-4">
              <Mail className="w-6 h-6 text-pink-500 flex-shrink-0 mt-1" />
              <div>
                <p className="text-gray-900 font-semibold">Email Us</p>
                <a href="mailto:support@pokemyheart.com" className="text-pink-500 hover:text-pink-600">
                  support@pokemyheart.com
                </a>
                <p className="text-sm text-gray-600 mt-1">We respond within 24-48 hours</p>
              </div>
            </div>

            <div className="mt-10 pt-8 border-t border-gray-200">
              <p className="text-gray-600">
                See also:{' '}
                <Link href="/shipping" className="text-pink-500 hover:text-pink-600">
                  Shipping Policy
                </Link>{' '}
                |{' '}
                <Link href="/faq" className="text-pink-500 hover:text-pink-600">
                  FAQ
                </Link>{' '}
                |{' '}
                <Link href="/contact" className="text-pink-500 hover:text-pink-600">
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

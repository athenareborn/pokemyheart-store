import { Metadata } from 'next'
import Link from 'next/link'
import { HelpCircle, Package, CreditCard, RefreshCw, Truck, ArrowRight } from 'lucide-react'
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion'
import { Button } from '@/components/ui/button'

export const metadata: Metadata = {
  title: 'FAQ - UltraRareLove',
  description: 'Frequently asked questions about UltraRareLove products, shipping, returns, and more.',
}

const faqCategories = [
  {
    id: 'ordering-shipping',
    title: 'Ordering & Shipping',
    icon: Truck,
    questions: [
      {
        question: 'How long does it take to process my order?',
        answer:
          'Orders are typically processed within 1-2 business days. During peak seasons (like Valentine\'s Day), processing may take 2-3 business days. You\'ll receive an email confirmation once your order ships.',
      },
      {
        question: 'What are the shipping costs?',
        answer:
          'We offer FREE standard shipping on orders over $35! For orders under $35, standard shipping is $5.95. Express shipping (1-3 business days) is available at checkout for $9.95.',
      },
      {
        question: 'How can I track my order?',
        answer:
          'Once your order ships, you\'ll receive a tracking number via email. You can use this number to track your package on our website or directly through the carrier\'s website.',
      },
      {
        question: 'Do you ship internationally?',
        answer:
          'We ship to the U.S. and select international destinations. International shipping rates and delivery times vary by destination and are shown at checkout. Please note that international orders may be subject to customs duties and taxes, which are the responsibility of the recipient.',
      },
      {
        question: 'Can I change my shipping address after placing an order?',
        answer:
          'If your order hasn\'t shipped yet, please contact us immediately at support@ultrararelove.com. We\'ll do our best to update your shipping address. Once an order has shipped, address changes are not possible.',
      },
    ],
  },
  {
    id: 'product-info',
    title: 'Product Info',
    icon: Package,
    questions: [
      {
        question: 'What materials are the cards made of?',
        answer:
          'Our cards are crafted from premium 400gsm card stock with a smooth, luxurious finish. The material is designed to be durable while maintaining the perfect weight and feel of a high-quality collectible card.',
      },
      {
        question: 'What are the card dimensions?',
        answer:
          'Our cards follow the standard trading card size: 2.5" x 3.5" (63mm x 88mm). This makes them compatible with standard card sleeves and display cases.',
      },
      {
        question: 'Tell me more about the holographic finish.',
        answer:
          'Our cards feature a stunning holographic layer that creates a rainbow shimmer effect when viewed from different angles. The holographic pattern is carefully designed to enhance the artwork without overwhelming it, creating a mesmerizing visual experience that\'s perfect for display.',
      },
      {
        question: 'Can I customize my card with a personal message?',
        answer:
          'Currently, our cards come with pre-designed artwork and text. However, we\'re working on a customization feature! Sign up for our newsletter to be the first to know when personalized options become available.',
      },
      {
        question: 'Is the display case included?',
        answer:
          'The display case is included with the Valentine\'s Pack and Deluxe Valentine bundles. The Card Only bundle includes the card and envelope.',
      },
    ],
  },
  {
    id: 'returns-refunds',
    title: 'Returns & Refunds',
    icon: RefreshCw,
    questions: [
      {
        question: 'What is your return policy?',
        answer:
          'We want you to love your purchase! If you\'re not completely satisfied, you can return unused items in their original packaging within 30 days of delivery for a full refund. Please note that personalized items cannot be returned unless defective.',
      },
      {
        question: 'What if my item arrives damaged?',
        answer:
          'We\'re so sorry if your item arrived damaged! Please contact us within 48 hours of delivery with photos of the damage, and we\'ll send a replacement right away at no cost to you. Email support@ultrararelove.com with your order number and photos.',
      },
      {
        question: 'I received the wrong item. What should I do?',
        answer:
          'We apologize for the mix-up! Please contact us at support@ultrararelove.com with your order number and a photo of what you received. We\'ll ship the correct item immediately and provide a prepaid return label for the incorrect item.',
      },
      {
        question: 'How long does it take to process a refund?',
        answer:
          'Once we receive your return, refunds are processed within 3-5 business days. The refund will be credited to your original payment method. Please note that your bank may take an additional 5-10 business days to reflect the refund in your account.',
      },
      {
        question: 'Do I have to pay for return shipping?',
        answer:
          'For returns due to damage, defects, or our error, we provide free return shipping. For change-of-mind returns, a flat rate of $4.99 will be deducted from your refund to cover return shipping costs.',
      },
    ],
  },
  {
    id: 'payment',
    title: 'Payment',
    icon: CreditCard,
    questions: [
      {
        question: 'What payment methods do you accept?',
        answer:
          'We accept all major credit cards (Visa, Mastercard, American Express, Discover), PayPal, Apple Pay, and Google Pay. All payments are processed securely through Stripe.',
      },
      {
        question: 'Is my payment information secure?',
        answer:
          'Absolutely! We use Stripe for payment processing, which is PCI DSS Level 1 compliant (the highest level of security certification). We never store your full credit card details on our servers. All transactions are encrypted using SSL/TLS technology.',
      },
      {
        question: 'How do I apply a promo code?',
        answer:
          'You can enter your promo code at checkout. Look for the "Promo Code" or "Discount Code" field and enter your code there. The discount will be applied to your order total before payment.',
      },
      {
        question: 'Why was my payment declined?',
        answer:
          'Payment can be declined for several reasons: insufficient funds, incorrect card details, or your bank flagging the transaction. Please double-check your information and try again. If the issue persists, contact your bank or try a different payment method.',
      },
      {
        question: 'Can I get an invoice for my order?',
        answer:
          'Yes! An invoice is automatically sent to your email after purchase. If you need a duplicate or a specific format for business purposes, please contact support@ultrararelove.com with your order number.',
      },
    ],
  },
]

export default function FAQPage() {
  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-brand-50 via-white to-brand-50 py-12 sm:py-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-brand-100 rounded-full mb-6">
            <HelpCircle className="w-8 h-8 text-brand-500" />
          </div>
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-900 mb-4">
            Frequently Asked Questions
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Find answers to common questions about our products, shipping, returns, and more.
            Can&apos;t find what you&apos;re looking for? Contact our support team!
          </p>
        </div>
      </section>

      {/* FAQ Content */}
      <section className="py-12 sm:py-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="space-y-8 sm:space-y-12">
            {faqCategories.map((category) => (
              <div key={category.id} className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                {/* Category Header */}
                <div className="bg-brand-50 px-4 sm:px-6 py-4 border-b border-brand-100">
                  <div className="flex items-center gap-3">
                    <div className="flex items-center justify-center w-10 h-10 bg-brand-500 rounded-lg">
                      <category.icon className="w-5 h-5 text-white" />
                    </div>
                    <h2 className="text-xl sm:text-2xl font-semibold text-gray-900">
                      {category.title}
                    </h2>
                  </div>
                </div>

                {/* Accordion */}
                <div className="px-4 sm:px-6">
                  <Accordion type="single" collapsible className="w-full">
                    {category.questions.map((item, index) => (
                      <AccordionItem
                        key={index}
                        value={`${category.id}-${index}`}
                        className="border-b border-gray-100 last:border-b-0"
                      >
                        <AccordionTrigger className="text-left text-gray-900 hover:text-brand-500 hover:no-underline py-4 sm:py-5">
                          <span className="text-sm sm:text-base font-medium pr-4">
                            {item.question}
                          </span>
                        </AccordionTrigger>
                        <AccordionContent className="text-gray-600 text-sm sm:text-base leading-relaxed pb-4 sm:pb-5">
                          {item.answer}
                        </AccordionContent>
                      </AccordionItem>
                    ))}
                  </Accordion>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Contact CTA Section */}
      <section className="py-12 sm:py-16 bg-gray-50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-4">
            Still Have Questions?
          </h2>
          <p className="text-gray-600 mb-8 max-w-xl mx-auto">
            Our friendly support team is here to help! Reach out and we&apos;ll get back to you within 24 hours.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button
              size="lg"
              className="bg-brand-500 hover:bg-brand-600 text-white"
              asChild
            >
              <Link href="mailto:support@ultrararelove.com">
                Contact Support
                <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
            </Button>
            <Button
              size="lg"
              variant="outline"
              asChild
            >
              <Link href="/products/i-choose-you-the-ultimate-valentines-gift">
                Browse Products
              </Link>
            </Button>
          </div>
        </div>
      </section>
    </div>
  )
}

'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Mail, Clock, MessageCircle, Send, ArrowRight } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'

const SUBJECT_OPTIONS = [
  { value: '', label: 'Select a subject' },
  { value: 'order', label: 'Order Inquiry' },
  { value: 'shipping', label: 'Shipping & Delivery' },
  { value: 'returns', label: 'Returns & Refunds' },
  { value: 'product', label: 'Product Question' },
  { value: 'wholesale', label: 'Wholesale Inquiry' },
  { value: 'other', label: 'Other' },
]

export default function ContactPage() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: '',
  })
  const [isSubmitted, setIsSubmitted] = useState(false)

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    // UI only - no backend submission
    setIsSubmitted(true)
  }

  return (
    <div>
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-brand-50 via-white to-brand-50 py-16 sm:py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <span className="inline-block bg-brand-100 text-brand-600 px-4 py-2 rounded-full text-sm font-medium mb-6">
            We&apos;re Here to Help
          </span>
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-gray-900 leading-tight mb-6">
            Get in Touch
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Have a question about your order, our products, or just want to say hello?
            We&apos;d love to hear from you!
          </p>
        </div>
      </section>

      {/* Main Content */}
      <section className="py-16 sm:py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 gap-12 lg:grid-cols-2 lg:gap-16">
            {/* Contact Form */}
            <div className="order-2 lg:order-1">
              <div className="bg-white p-6 sm:p-8 rounded-2xl shadow-sm border border-gray-100">
                <h2 className="text-2xl font-bold text-gray-900 mb-6">
                  Send Us a Message
                </h2>

                {isSubmitted ? (
                  <div className="text-center py-12">
                    <div className="w-16 h-16 bg-brand-100 rounded-full flex items-center justify-center mx-auto mb-4">
                      <Send className="w-8 h-8 text-brand-500" />
                    </div>
                    <h3 className="text-xl font-semibold text-gray-900 mb-2">
                      Message Sent!
                    </h3>
                    <p className="text-gray-600 mb-6">
                      Thank you for reaching out. We&apos;ll get back to you within 24-48 hours.
                    </p>
                    <Button
                      onClick={() => {
                        setIsSubmitted(false)
                        setFormData({ name: '', email: '', subject: '', message: '' })
                      }}
                      className="bg-brand-500 hover:bg-brand-600 text-white"
                    >
                      Send Another Message
                    </Button>
                  </div>
                ) : (
                  <form onSubmit={handleSubmit} className="space-y-6">
                    <div>
                      <label
                        htmlFor="name"
                        className="block text-sm font-medium text-gray-700 mb-2"
                      >
                        Your Name
                      </label>
                      <Input
                        type="text"
                        id="name"
                        name="name"
                        value={formData.name}
                        onChange={handleChange}
                        placeholder="Enter your name"
                        required
                        className="focus-visible:border-brand-500 focus-visible:ring-brand-500/50"
                      />
                    </div>

                    <div>
                      <label
                        htmlFor="email"
                        className="block text-sm font-medium text-gray-700 mb-2"
                      >
                        Email Address
                      </label>
                      <Input
                        type="email"
                        id="email"
                        name="email"
                        value={formData.email}
                        onChange={handleChange}
                        placeholder="you@example.com"
                        required
                        className="focus-visible:border-brand-500 focus-visible:ring-brand-500/50"
                      />
                    </div>

                    <div>
                      <label
                        htmlFor="subject"
                        className="block text-sm font-medium text-gray-700 mb-2"
                      >
                        Subject
                      </label>
                      <select
                        id="subject"
                        name="subject"
                        value={formData.subject}
                        onChange={handleChange}
                        required
                        className="h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-base shadow-xs transition-[color,box-shadow] outline-none focus-visible:border-brand-500 focus-visible:ring-brand-500/50 focus-visible:ring-[3px] md:text-sm"
                      >
                        {SUBJECT_OPTIONS.map((option) => (
                          <option key={option.value} value={option.value}>
                            {option.label}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label
                        htmlFor="message"
                        className="block text-sm font-medium text-gray-700 mb-2"
                      >
                        Message
                      </label>
                      <Textarea
                        id="message"
                        name="message"
                        value={formData.message}
                        onChange={handleChange}
                        placeholder="How can we help you?"
                        rows={5}
                        required
                        className="focus-visible:border-brand-500 focus-visible:ring-brand-500/50"
                      />
                    </div>

                    <Button
                      type="submit"
                      size="lg"
                      className="w-full bg-brand-500 hover:bg-brand-600 text-white"
                    >
                      Send Message
                      <Send className="ml-2 h-5 w-5" />
                    </Button>
                  </form>
                )}
              </div>
            </div>

            {/* Contact Info */}
            <div className="order-1 lg:order-2 space-y-8">
              <div>
                <h2 className="text-2xl font-bold text-gray-900 mb-6">
                  Contact Information
                </h2>
                <div className="space-y-6">
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 bg-brand-100 rounded-full flex items-center justify-center flex-shrink-0">
                      <Mail className="w-6 h-6 text-brand-500" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900 mb-1">Email Us</h3>
                      <a
                        href="mailto:hello@ultrararelove.com"
                        className="text-brand-500 hover:text-brand-600 transition-colors"
                      >
                        hello@ultrararelove.com
                      </a>
                      <p className="text-sm text-gray-500 mt-1">
                        For general inquiries
                      </p>
                      <a
                        href="mailto:support@ultrararelove.com"
                        className="text-brand-500 hover:text-brand-600 transition-colors text-sm"
                      >
                        support@ultrararelove.com
                      </a>
                      <p className="text-sm text-gray-500">
                        For order-related questions
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 bg-brand-100 rounded-full flex items-center justify-center flex-shrink-0">
                      <Clock className="w-6 h-6 text-brand-500" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900 mb-1">Response Time</h3>
                      <p className="text-gray-600">
                        We typically respond within 24-48 hours
                      </p>
                      <p className="text-sm text-gray-500 mt-1">
                        Monday - Friday, 9am - 5pm EST
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Business Info */}
              <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                <h3 className="font-semibold text-gray-900 mb-3">
                  Business Information
                </h3>
                <div className="text-sm text-gray-600 space-y-1">
                  <p className="font-medium text-gray-900">UltraRareLove</p>
                  <p>United States</p>
                  <p className="pt-2 text-xs text-gray-500">
                    Online retailer of premium collectible cards and gifts.
                  </p>
                </div>
              </div>

              {/* FAQ Suggestion */}
              <div className="bg-gradient-to-br from-brand-50 to-brand-100 p-6 sm:p-8 rounded-2xl">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center flex-shrink-0">
                    <MessageCircle className="w-6 h-6 text-brand-500" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-2">
                      Looking for Quick Answers?
                    </h3>
                    <p className="text-gray-600 mb-4">
                      Check out our FAQ page for instant answers to common questions about
                      orders, shipping, returns, and more.
                    </p>
                    <Button
                      variant="outline"
                      className="border-brand-500 text-brand-500 hover:bg-brand-50"
                      asChild
                    >
                      <Link href="/faq">
                        Visit FAQ
                        <ArrowRight className="ml-2 h-4 w-4" />
                      </Link>
                    </Button>
                  </div>
                </div>
              </div>

              {/* Additional Note */}
              <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                <h3 className="font-semibold text-gray-900 mb-2">
                  Before You Reach Out
                </h3>
                <p className="text-gray-600 text-sm">
                  For order-related inquiries, please have your order number ready.
                  You can find it in your order confirmation email.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}

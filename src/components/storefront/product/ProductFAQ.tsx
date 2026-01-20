'use client'

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion'

const FAQ_ITEMS = [
  {
    question: 'What makes this card special?',
    answer: 'Our cards feature premium holographic finishes that shimmer and shift in the light, creating a stunning visual effect. Each card is printed on high-quality card stock and comes with a protective sleeve to preserve its condition.',
  },
  {
    question: 'How long does shipping take?',
    answer: 'Standard shipping takes 5-7 business days within the US. Express shipping (1-3 business days) is also available at checkout. International shipping typically takes 10-14 business days.',
  },
  {
    question: 'What comes in each bundle?',
    answer: 'Card Only: Premium holographic card + envelope. Love Pack: Card + premium display case + stand + envelope. Deluxe Love: Card + premium case + stand + luxury gift box + tissue paper + envelope.',
  },
  {
    question: 'Can I return or exchange my order?',
    answer: 'We accept returns within 30 days of delivery for items in original condition. If your card arrives damaged, contact us immediately and we\'ll send a replacement at no cost.',
  },
  {
    question: 'Is this a real collectible card?',
    answer: 'Yes! Our cards are designed to look and feel like authentic collectible trading cards. They feature the same premium materials and printing techniques used in professional card production.',
  },
  {
    question: 'Do you offer gift wrapping?',
    answer: 'The Deluxe Love bundle comes in a premium gift box, ready for gifting. For other bundles, we include beautiful packaging that\'s gift-ready.',
  },
]

export function ProductFAQ() {
  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold text-gray-900">Frequently Asked Questions</h3>
      <Accordion type="single" collapsible className="w-full">
        {FAQ_ITEMS.map((item, index) => (
          <AccordionItem key={index} value={`item-${index}`}>
            <AccordionTrigger className="text-left text-gray-900 hover:text-pink-500">
              {item.question}
            </AccordionTrigger>
            <AccordionContent className="text-gray-600">
              {item.answer}
            </AccordionContent>
          </AccordionItem>
        ))}
      </Accordion>
    </div>
  )
}

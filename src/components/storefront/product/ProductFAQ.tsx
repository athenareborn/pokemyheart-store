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
    answer: 'Our cards feature premium holographic finishes that shimmer and shift in the light, creating a stunning visual effect. Each card is printed on high-quality card stock and packaged to protect it in transit.',
  },
  {
    question: 'How long does shipping take?',
    answer: 'Standard shipping takes 5-7 business days within the US. Express shipping (1-3 business days) is available at checkout. International delivery typically takes 10-20 business days depending on destination.',
  },
  {
    question: 'What comes in each bundle?',
    answer: "Card Only: Premium holographic card + envelope. Valentine's Pack: Card + premium display case + stand + envelope. Deluxe Valentine: Card + premium case + stand + luxury gift box + tissue paper + envelope.",
  },
  {
    question: 'Can I return or exchange my order?',
    answer: 'We accept returns within 30 days of delivery for items in original condition. If your card arrives damaged, contact us immediately and we\'ll send a replacement at no cost.',
  },
  {
    question: 'Is this a real collectible card?',
    answer: 'Our cards are original designs inspired by classic trading card aesthetics. They\'re made with premium materials and printing techniques for a true collectible feel.',
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
            <AccordionTrigger className="text-left text-gray-900 hover:text-brand-500">
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

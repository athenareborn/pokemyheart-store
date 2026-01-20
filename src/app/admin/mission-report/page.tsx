'use client'

import { useState } from 'react'
import { CheckCircle2, Circle, ExternalLink, Rocket } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

interface Task {
  id: string
  label: string
  done: boolean
}

export default function MissionReportPage() {
  const [tasks, setTasks] = useState<Task[]>([
    { id: '1', label: 'Verify Meta Business Manager setup', done: false },
    { id: '2', label: 'Connect Pixel to Ad Account', done: false },
    { id: '3', label: 'Verify domain in Business Settings', done: false },
    { id: '4', label: 'Check Events Manager for live events', done: false },
    { id: '5', label: 'Define target audience', done: false },
    { id: '6', label: 'Create ad creatives', done: false },
    { id: '7', label: 'Set budget and launch campaign', done: false },
  ])

  const toggle = (id: string) => {
    setTasks(prev => prev.map(t => t.id === id ? { ...t, done: !t.done } : t))
  }

  const completed = {
    'Checkout': [
      'Mobile-first checkout redesign',
      'Discount code support',
      'Free shipping threshold fix',
      'Stripe API optimization',
    ],
    'Storefront': [
      'Product page redesign',
      'Image gallery improvements',
      'Social proof features',
      'Cookie consent banner',
    ],
    'Admin': [
      'Dashboard redesign (Shopify-style)',
      'Inventory management',
      'Order fulfillment flow',
    ],
    'Backend': [
      'Supabase auth & webhooks',
      'Newsletter subscriptions',
      'RLS bypass for admin',
    ],
    'Analytics': [
      'Facebook Pixel configured',
      'PostHog integration',
      'Server-side CAPI ready',
    ],
    'Legal': [
      'Privacy, Terms, Refund, Shipping pages',
    ],
  }

  const links = [
    { label: 'Events Manager', url: 'https://business.facebook.com/events_manager' },
    { label: 'Ads Manager', url: 'https://www.facebook.com/adsmanager' },
  ]

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight flex items-center gap-2">
          <Rocket className="h-5 w-5" />
          Mission Report
        </h1>
        <p className="text-sm text-muted-foreground">Jan 20, 2026</p>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Completed Today */}
        <Card className="border-green-200 bg-green-50/50">
          <CardHeader className="py-3">
            <CardTitle className="text-base font-medium text-green-800">Completed</CardTitle>
          </CardHeader>
          <CardContent className="pt-0 pb-4 space-y-4">
            {Object.entries(completed).map(([category, items]) => (
              <div key={category}>
                <p className="text-xs font-medium text-green-700 mb-1">{category}</p>
                <ul className="space-y-0.5">
                  {items.map((item, i) => (
                    <li key={i} className="flex items-center gap-2 text-sm text-green-900">
                      <CheckCircle2 className="h-3 w-3 text-green-600 flex-shrink-0" />
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Tomorrow */}
        <Card>
          <CardHeader className="py-3">
            <CardTitle className="text-base font-medium">Next: Launch Facebook Ads</CardTitle>
          </CardHeader>
          <CardContent className="pt-0 pb-4">
            <ul className="space-y-1">
              {tasks.map((task) => (
                <li key={task.id}>
                  <button
                    onClick={() => toggle(task.id)}
                    className={cn(
                      'w-full flex items-center gap-2 text-sm py-1 text-left transition-colors',
                      task.done ? 'text-muted-foreground line-through' : 'text-foreground'
                    )}
                  >
                    {task.done ? (
                      <CheckCircle2 className="h-3.5 w-3.5 text-green-600 flex-shrink-0" />
                    ) : (
                      <Circle className="h-3.5 w-3.5 text-muted-foreground flex-shrink-0" />
                    )}
                    {task.label}
                  </button>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      </div>

      <div className="flex gap-2">
        {links.map((link) => (
          <Button key={link.label} variant="outline" size="sm" asChild>
            <a href={link.url} target="_blank" rel="noopener noreferrer">
              {link.label}
              <ExternalLink className="h-3 w-3 ml-1.5" />
            </a>
          </Button>
        ))}
      </div>
    </div>
  )
}

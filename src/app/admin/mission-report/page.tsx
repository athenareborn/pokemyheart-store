'use client'

import { useState } from 'react'
import { CheckCircle2, Circle, ExternalLink, Rocket, AlertCircle } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

interface Task {
  id: string
  label: string
  done: boolean
  critical?: boolean
}

export default function MissionReportPage() {
  const [tasks, setTasks] = useState<Task[]>([
    { id: '1', label: 'Switch Stripe to live mode', done: false, critical: true },
    { id: '2', label: 'Add RESEND_API_KEY to Vercel', done: false, critical: true },
    { id: '3', label: 'Verify email domain in Resend', done: false, critical: true },
    { id: '4', label: 'Test real purchase end-to-end', done: false, critical: true },
    { id: '5', label: 'Add Google Analytics 4', done: false },
    { id: '6', label: 'Run Lighthouse audit', done: false },
    { id: '7', label: 'Test order confirmation email', done: false },
  ])

  const toggle = (id: string) => {
    setTasks(prev => prev.map(t => t.id === id ? { ...t, done: !t.done } : t))
  }

  const completed = {
    'Checkout': [
      'Mobile-first checkout redesign',
      'Discount code support',
      'Free shipping threshold',
    ],
    'Storefront': [
      'Product page redesign',
      'Image gallery',
      'Social proof',
    ],
    'Admin': [
      'Dashboard redesign',
      'Order fulfillment',
      'Inventory management',
    ],
    'Analytics': [
      'Facebook Pixel + CAPI',
      'PostHog integration',
      'FB Ads configured',
    ],
    'Legal': [
      'Privacy, Terms, Refund, Shipping pages',
    ],
  }

  const links = [
    { label: 'Stripe Dashboard', url: 'https://dashboard.stripe.com' },
    { label: 'Resend', url: 'https://resend.com' },
    { label: 'Vercel Env', url: 'https://vercel.com' },
  ]

  const criticalCount = tasks.filter(t => t.critical && !t.done).length

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight flex items-center gap-2">
          <Rocket className="h-5 w-5" />
          Mission Report
        </h1>
        <p className="text-sm text-muted-foreground">Jan 20, 2026</p>
      </div>

      {criticalCount > 0 && (
        <div className="flex items-center gap-2 text-sm text-amber-700 bg-amber-50 border border-amber-200 rounded-lg px-3 py-2">
          <AlertCircle className="h-4 w-4" />
          {criticalCount} critical {criticalCount === 1 ? 'task' : 'tasks'} before going live
        </div>
      )}

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Completed */}
        <Card className="border-green-200 bg-green-50/50">
          <CardHeader className="py-3">
            <CardTitle className="text-base font-medium text-green-800">Completed</CardTitle>
          </CardHeader>
          <CardContent className="pt-0 pb-4 space-y-3">
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

        {/* Before Go-Live */}
        <Card>
          <CardHeader className="py-3">
            <CardTitle className="text-base font-medium">Before Go-Live</CardTitle>
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
                      <Circle className={cn(
                        'h-3.5 w-3.5 flex-shrink-0',
                        task.critical ? 'text-amber-500' : 'text-muted-foreground'
                      )} />
                    )}
                    {task.label}
                    {task.critical && !task.done && (
                      <span className="text-[10px] font-medium text-amber-600 bg-amber-100 px-1 rounded">CRITICAL</span>
                    )}
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

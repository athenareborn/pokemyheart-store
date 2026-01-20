'use client'

import { useState } from 'react'
import {
  CheckCircle2,
  Circle,
  ExternalLink,
  Calendar,
  Rocket,
  Target,
  BarChart3,
  Settings,
  Megaphone,
  TrendingUp,
} from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

interface ChecklistItem {
  id: string
  label: string
  completed: boolean
}

interface ChecklistSection {
  title: string
  icon: React.ElementType
  items: ChecklistItem[]
}

export default function MissionReportPage() {
  const [checklists, setChecklists] = useState<ChecklistSection[]>([
    {
      title: 'Meta Business Suite Setup',
      icon: Settings,
      items: [
        { id: 'bs-1', label: 'Verify Business Manager account is set up', completed: false },
        { id: 'bs-2', label: 'Connect Pixel to Ad Account', completed: false },
        { id: 'bs-3', label: 'Verify domain in Business Settings', completed: false },
        { id: 'bs-4', label: 'Configure Aggregated Event Measurement (AEM)', completed: false },
      ],
    },
    {
      title: 'Events Manager Verification',
      icon: BarChart3,
      items: [
        { id: 'em-1', label: 'Check Events Manager shows live events', completed: false },
        { id: 'em-2', label: 'Confirm event deduplication is working', completed: false },
        { id: 'em-3', label: 'Verify "Browser and Server" delivery method', completed: false },
        { id: 'em-4', label: 'Test events are appearing correctly', completed: false },
      ],
    },
    {
      title: 'Create Ad Campaign',
      icon: Megaphone,
      items: [
        { id: 'ac-1', label: 'Define audience targeting', completed: false },
        { id: 'ac-2', label: 'Set up conversion tracking (Purchase event)', completed: false },
        { id: 'ac-3', label: 'Create ad creatives', completed: false },
        { id: 'ac-4', label: 'Set budget and schedule', completed: false },
        { id: 'ac-5', label: 'Launch campaign', completed: false },
      ],
    },
    {
      title: 'Post-Launch Monitoring',
      icon: TrendingUp,
      items: [
        { id: 'pl-1', label: 'Monitor Event Match Quality score', completed: false },
        { id: 'pl-2', label: 'Track ROAS and conversion metrics', completed: false },
        { id: 'pl-3', label: 'Optimize based on performance', completed: false },
      ],
    },
  ])

  const toggleItem = (sectionIndex: number, itemId: string) => {
    setChecklists((prev) =>
      prev.map((section, idx) =>
        idx === sectionIndex
          ? {
              ...section,
              items: section.items.map((item) =>
                item.id === itemId ? { ...item, completed: !item.completed } : item
              ),
            }
          : section
      )
    )
  }

  const completedItems = [
    { label: 'Fixed Critical Production Bug - Facebook Pixel was not loading on Vercel', status: 'passed' },
    { label: 'Added NEXT_PUBLIC_FB_PIXEL_ID to Vercel environment variables', status: 'passed' },
    { label: 'Added FB_CONVERSIONS_API_TOKEN to Vercel environment variables', status: 'passed' },
    { label: 'Redeployed Production successfully', status: 'passed' },
  ]

  const testResults = [
    { event: 'PageView', status: 'passed' },
    { event: 'ViewContent', status: 'passed' },
    { event: 'AddToCart', status: 'passed' },
    { event: 'InitiateCheckout', status: 'passed' },
    { event: 'Purchase (Client + Server CAPI)', status: 'ready' },
  ]

  const quickLinks = [
    {
      label: 'Meta Events Manager',
      url: 'https://business.facebook.com/events_manager',
      description: 'View and debug pixel events',
    },
    {
      label: 'Meta Business Suite',
      url: 'https://business.facebook.com/',
      description: 'Manage your business settings',
    },
    {
      label: 'Meta Ads Manager',
      url: 'https://www.facebook.com/adsmanager',
      description: 'Create and manage ad campaigns',
    },
    {
      label: 'Pixel Helper Extension',
      url: 'https://chrome.google.com/webstore/detail/meta-pixel-helper/fdgfkebogiimcoedlicjlajpkdmockpc',
      description: 'Chrome extension to debug pixels',
    },
  ]

  const today = new Date().toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
            <Rocket className="h-6 w-6 text-primary" />
            Mission Report
          </h1>
          <p className="text-muted-foreground flex items-center gap-2 mt-1">
            <Calendar className="h-4 w-4" />
            {today}
          </p>
        </div>
        <div className="flex items-center gap-2 text-sm text-muted-foreground bg-green-50 text-green-700 px-3 py-1.5 rounded-full">
          <Target className="h-4 w-4" />
          <span>Goal: Launch Facebook Ads</span>
        </div>
      </div>

      {/* Completed Today Section */}
      <Card className="border-green-200 bg-green-50/50">
        <CardHeader>
          <CardTitle className="text-green-800 flex items-center gap-2">
            <CheckCircle2 className="h-5 w-5" />
            Completed Today - Facebook Analytics Implementation
          </CardTitle>
          <CardDescription className="text-green-700">
            All critical tracking infrastructure is now live on production
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Completed Tasks */}
          <div className="space-y-2">
            {completedItems.map((item, idx) => (
              <div
                key={idx}
                className="flex items-center gap-3 text-sm bg-white/80 rounded-lg px-3 py-2"
              >
                <CheckCircle2 className="h-4 w-4 text-green-600 flex-shrink-0" />
                <span className="text-green-900">{item.label}</span>
              </div>
            ))}
          </div>

          {/* Test Results */}
          <div className="pt-4 border-t border-green-200">
            <h4 className="font-medium text-green-800 mb-3">Verification Test Results</h4>
            <div className="grid grid-cols-2 md:grid-cols-5 gap-2">
              {testResults.map((test, idx) => (
                <div
                  key={idx}
                  className={cn(
                    'text-center px-3 py-2 rounded-lg text-sm font-medium',
                    test.status === 'passed'
                      ? 'bg-green-100 text-green-800'
                      : 'bg-blue-100 text-blue-800'
                  )}
                >
                  <div className="text-xs opacity-75 mb-1">
                    {test.status === 'passed' ? 'PASSED' : 'READY'}
                  </div>
                  <div>{test.event}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Pixel ID */}
          <div className="pt-4 border-t border-green-200">
            <div className="bg-white/80 rounded-lg px-4 py-3">
              <div className="text-xs text-green-600 font-medium mb-1">PIXEL ID (LIVE)</div>
              <code className="text-green-900 font-mono">3852621344992629</code>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Next Steps Section */}
      <div>
        <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <Target className="h-5 w-5 text-primary" />
          Next Steps - Launch Facebook Ads
        </h2>
        <div className="grid gap-4 md:grid-cols-2">
          {checklists.map((section, sectionIdx) => (
            <Card key={section.title}>
              <CardHeader className="pb-3">
                <CardTitle className="text-base flex items-center gap-2">
                  <section.icon className="h-4 w-4 text-primary" />
                  {section.title}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {section.items.map((item) => (
                  <button
                    key={item.id}
                    onClick={() => toggleItem(sectionIdx, item.id)}
                    className={cn(
                      'w-full flex items-center gap-3 text-sm px-3 py-2 rounded-lg transition-colors text-left',
                      item.completed
                        ? 'bg-green-50 text-green-800'
                        : 'bg-gray-50 text-gray-700 hover:bg-gray-100'
                    )}
                  >
                    {item.completed ? (
                      <CheckCircle2 className="h-4 w-4 text-green-600 flex-shrink-0" />
                    ) : (
                      <Circle className="h-4 w-4 text-gray-400 flex-shrink-0" />
                    )}
                    <span className={cn(item.completed && 'line-through')}>{item.label}</span>
                  </button>
                ))}
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Quick Links */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <ExternalLink className="h-4 w-4 text-primary" />
            Quick Links
          </CardTitle>
          <CardDescription>Direct access to Meta tools</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {quickLinks.map((link) => (
              <a
                key={link.label}
                href={link.url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex flex-col gap-1 p-3 rounded-lg border border-border hover:border-primary hover:bg-primary/5 transition-colors"
              >
                <div className="font-medium text-sm flex items-center gap-1">
                  {link.label}
                  <ExternalLink className="h-3 w-3 opacity-50" />
                </div>
                <div className="text-xs text-muted-foreground">{link.description}</div>
              </a>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

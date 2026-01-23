'use client'

import { useState } from 'react'
import {
  TrendingUp,
  DollarSign,
  ShoppingCart,
  Target,
  Image as ImageIcon,
  Video,
  Copy,
  ChevronDown,
  ChevronRight,
  Star,
  Zap,
  FileText,
  Lightbulb,
  Calendar,
  CheckCircle,
  Clock,
  MessageSquareQuote
} from 'lucide-react'
import marketingData from '@/data/marketing-source-of-truth.json'

function StatCard({ title, value, subtitle, icon: Icon, trend }: {
  title: string
  value: string
  subtitle?: string
  icon: React.ElementType
  trend?: 'up' | 'down'
}) {
  return (
    <div className="bg-white rounded-lg border p-4">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-muted-foreground">{title}</p>
          <p className="text-2xl font-bold mt-1">{value}</p>
          {subtitle && <p className="text-xs text-muted-foreground mt-1">{subtitle}</p>}
        </div>
        <div className={`p-3 rounded-full ${trend === 'up' ? 'bg-green-100' : 'bg-blue-100'}`}>
          <Icon className={`h-5 w-5 ${trend === 'up' ? 'text-green-600' : 'text-blue-600'}`} />
        </div>
      </div>
    </div>
  )
}

function WinnerCard({ winner, rank }: { winner: typeof marketingData.winners[0], rank: number }) {
  const [expanded, setExpanded] = useState(false)

  return (
    <div className="bg-white rounded-lg border p-4">
      <div
        className="flex items-center justify-between cursor-pointer"
        onClick={() => setExpanded(!expanded)}
      >
        <div className="flex items-center gap-3">
          <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white font-bold ${
            rank === 1 ? 'bg-yellow-500' : rank === 2 ? 'bg-gray-400' : rank === 3 ? 'bg-amber-600' : 'bg-blue-500'
          }`}>
            {rank}
          </div>
          <div>
            <p className="font-medium">{winner.name}</p>
            <p className="text-xs text-muted-foreground capitalize">{winner.type}</p>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <div className="text-right">
            <p className="font-bold text-green-600">{winner.performance.roas}x ROAS</p>
            <p className="text-xs text-muted-foreground">${winner.performance.cpa.toFixed(2)} CPA</p>
          </div>
          {expanded ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
        </div>
      </div>

      {expanded && (
        <div className="mt-4 pt-4 border-t space-y-3">
          <div className="grid grid-cols-3 gap-4 text-sm">
            <div>
              <p className="text-muted-foreground">Spend</p>
              <p className="font-medium">${winner.performance.spend.toFixed(2)}</p>
            </div>
            <div>
              <p className="text-muted-foreground">Purchases</p>
              <p className="font-medium">{winner.performance.purchases}</p>
            </div>
            <div>
              <p className="text-muted-foreground">Ad ID</p>
              <p className="font-mono text-xs">{winner.ad_id}</p>
            </div>
          </div>
          {winner.notes && (
            <p className="text-sm text-muted-foreground bg-muted/50 p-2 rounded">{winner.notes}</p>
          )}
        </div>
      )}
    </div>
  )
}

function CopyCard({ copy, type }: { copy: { text: string; performance?: string; angle?: string; usage?: string }, type: 'body' | 'headline' }) {
  const [copied, setCopied] = useState(false)

  const handleCopy = () => {
    navigator.clipboard.writeText(copy.text)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="bg-white rounded-lg border p-4 hover:border-primary/50 transition-colors">
      <p className={`${type === 'headline' ? 'font-medium' : 'text-sm'}`}>{copy.text}</p>
      <div className="flex items-center justify-between mt-3">
        <p className="text-xs text-muted-foreground">
          {copy.performance || copy.usage || copy.angle}
        </p>
        <button
          onClick={handleCopy}
          className="text-xs text-primary hover:underline flex items-center gap-1"
        >
          <Copy className="h-3 w-3" />
          {copied ? 'Copied!' : 'Copy'}
        </button>
      </div>
    </div>
  )
}

export default function MarketingPage() {
  const [activeTab, setActiveTab] = useState<'overview' | 'winners' | 'copy' | 'assets' | 'plans'>('overview')
  const { campaign, winners, copy_library, assets, recommendations, future_plans } = marketingData as typeof marketingData & { future_plans?: { status: string; backlog: Array<{ id: string; priority: string; category: string; title: string; description: string; timing: string; status: string }>; review_quotes_for_ads: Array<{ quote: string; author: string; use_case: string }>; new_descriptions_to_test: Array<{ text: string; angle: string }> } }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Marketing Source of Truth</h1>
          <p className="text-muted-foreground">
            {campaign.name} | Last updated: {marketingData.last_updated}
          </p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 border-b">
        {(['overview', 'winners', 'copy', 'assets', 'plans'] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-4 py-2 text-sm font-medium border-b-2 -mb-px transition-colors ${
              activeTab === tab
                ? 'border-primary text-primary'
                : 'border-transparent text-muted-foreground hover:text-foreground'
            }`}
          >
            {tab.charAt(0).toUpperCase() + tab.slice(1)}
          </button>
        ))}
      </div>

      {/* Overview Tab */}
      {activeTab === 'overview' && (
        <div className="space-y-6">
          {/* Campaign Stats */}
          <div className="grid grid-cols-4 gap-4">
            <StatCard
              title="Total Spend"
              value={`$${campaign.total_spend.toLocaleString()}`}
              subtitle={campaign.period}
              icon={DollarSign}
            />
            <StatCard
              title="Total Purchases"
              value={campaign.total_purchases.toString()}
              subtitle={`${campaign.market}`}
              icon={ShoppingCart}
              trend="up"
            />
            <StatCard
              title="Overall ROAS"
              value={`${campaign.total_roas}x`}
              icon={TrendingUp}
              trend="up"
            />
            <StatCard
              title="Avg CPA"
              value={`$${campaign.avg_cpa.toFixed(2)}`}
              icon={Target}
            />
          </div>

          {/* Top 3 Winners */}
          <div>
            <h2 className="text-lg font-semibold mb-3 flex items-center gap-2">
              <Star className="h-5 w-5 text-yellow-500" />
              Top Performers
            </h2>
            <div className="space-y-3">
              {winners.slice(0, 3).map((winner, i) => (
                <WinnerCard key={winner.ad_id} winner={winner} rank={i + 1} />
              ))}
            </div>
          </div>

          {/* Recommendations */}
          <div>
            <h2 className="text-lg font-semibold mb-3 flex items-center gap-2">
              <Zap className="h-5 w-5 text-amber-500" />
              2026 Recommendations
            </h2>
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-white rounded-lg border p-4">
                <h3 className="font-medium mb-2">Budget Allocation</h3>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Static Ads</span>
                    <span className="font-medium">{recommendations.budget_allocation.static_ads}</span>
                  </div>
                  <div className="w-full bg-muted rounded-full h-2">
                    <div className="bg-blue-500 h-2 rounded-full" style={{ width: '60%' }} />
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Video Ads</span>
                    <span className="font-medium">{recommendations.budget_allocation.video_ads}</span>
                  </div>
                  <div className="w-full bg-muted rounded-full h-2">
                    <div className="bg-purple-500 h-2 rounded-full" style={{ width: '30%' }} />
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Testing</span>
                    <span className="font-medium">{recommendations.budget_allocation.testing}</span>
                  </div>
                  <div className="w-full bg-muted rounded-full h-2">
                    <div className="bg-green-500 h-2 rounded-full" style={{ width: '10%' }} />
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-lg border p-4">
                <h3 className="font-medium mb-2">Priority Tests</h3>
                <ul className="space-y-2 text-sm">
                  {recommendations.priority_tests.map((test, i) => (
                    <li key={i} className="flex items-start gap-2">
                      <span className="text-primary">•</span>
                      {test}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Winners Tab */}
      {activeTab === 'winners' && (
        <div className="space-y-3">
          {winners.map((winner, i) => (
            <WinnerCard key={winner.ad_id} winner={winner} rank={i + 1} />
          ))}
        </div>
      )}

      {/* Copy Tab */}
      {activeTab === 'copy' && (
        <div className="space-y-6">
          {/* Top Bodies */}
          <div>
            <h2 className="text-lg font-semibold mb-3 flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Top Primary Text (Bodies)
            </h2>
            <div className="grid gap-3">
              {copy_library.top_bodies.map((body, i) => (
                <CopyCard key={i} copy={body} type="body" />
              ))}
            </div>
          </div>

          {/* Top Headlines */}
          <div>
            <h2 className="text-lg font-semibold mb-3">Top Headlines</h2>
            <div className="grid grid-cols-2 gap-3">
              {copy_library.top_headlines.map((headline, i) => (
                <CopyCard key={i} copy={headline} type="headline" />
              ))}
            </div>
          </div>

          {/* Copy Patterns */}
          <div>
            <h2 className="text-lg font-semibold mb-3">Copy Patterns That Work</h2>
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-white rounded-lg border p-4">
                <h3 className="font-medium mb-2 text-green-600">Hooks That Work</h3>
                <ul className="space-y-1 text-sm">
                  {copy_library.copy_patterns.hooks_that_work.map((hook, i) => (
                    <li key={i} className="text-muted-foreground">&ldquo;{hook}&rdquo;</li>
                  ))}
                </ul>
              </div>

              <div className="bg-white rounded-lg border p-4">
                <h3 className="font-medium mb-2 text-amber-600">Urgency Phrases</h3>
                <ul className="space-y-1 text-sm">
                  {copy_library.copy_patterns.urgency_phrases.map((phrase, i) => (
                    <li key={i} className="text-muted-foreground">&ldquo;{phrase}&rdquo;</li>
                  ))}
                </ul>
              </div>

              <div className="bg-white rounded-lg border p-4">
                <h3 className="font-medium mb-2 text-purple-600">Audience Expansion</h3>
                <ul className="space-y-1 text-sm">
                  {copy_library.copy_patterns.audience_expansion.map((phrase, i) => (
                    <li key={i} className="text-muted-foreground">&ldquo;{phrase}&rdquo;</li>
                  ))}
                </ul>
              </div>

              <div className="bg-white rounded-lg border p-4">
                <h3 className="font-medium mb-2 text-blue-600">Pokemon References</h3>
                <ul className="space-y-1 text-sm">
                  {copy_library.copy_patterns.pokemon_references.map((ref, i) => (
                    <li key={i} className="text-muted-foreground">&ldquo;{ref}&rdquo;</li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Assets Tab */}
      {activeTab === 'assets' && (
        <div className="space-y-6">
          {/* Static Images */}
          <div className="bg-white rounded-lg border p-4">
            <div className="flex items-center gap-2 mb-3">
              <ImageIcon className="h-5 w-5 text-blue-500" />
              <h2 className="font-semibold">2025 Static Winners</h2>
            </div>
            <p className="text-sm text-muted-foreground mb-2">{assets.static_images.location}</p>
            <div className="grid grid-cols-3 gap-2">
              {assets.static_images.files.map((file, i) => (
                <div key={i} className="bg-muted/50 rounded p-2 text-xs font-mono truncate">
                  {file}
                </div>
              ))}
            </div>
            <p className="text-xs text-muted-foreground mt-2">
              {assets.static_images.specs.dimensions} | {assets.static_images.specs.format} | {assets.static_images.specs.theme}
            </p>
          </div>

          {/* Videos */}
          <div className="bg-white rounded-lg border p-4">
            <div className="flex items-center gap-2 mb-3">
              <Video className="h-5 w-5 text-purple-500" />
              <h2 className="font-semibold">2025 Video Winners</h2>
            </div>
            <p className="text-sm text-muted-foreground mb-2">{assets.videos.location}</p>
            <div className="grid grid-cols-2 gap-2">
              {assets.videos.files.map((file, i) => (
                <div key={i} className="bg-muted/50 rounded p-2 text-xs font-mono truncate">
                  {file}
                </div>
              ))}
            </div>
            <p className="text-xs text-muted-foreground mt-2">
              {assets.videos.specs.dimensions} | {assets.videos.specs.format} | {assets.videos.specs.duration}
            </p>
          </div>

          {/* 2026 Campaign */}
          <div className="bg-white rounded-lg border p-4 border-green-200 bg-green-50/50">
            <div className="flex items-center gap-2 mb-3">
              <Video className="h-5 w-5 text-green-500" />
              <h2 className="font-semibold">2026 Campaign Assets</h2>
              <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded">Ready</span>
            </div>
            <p className="text-sm text-muted-foreground mb-2">{assets['2026_campaign'].location}</p>
            <div className="grid grid-cols-3 gap-2">
              {assets['2026_campaign'].files.map((file, i) => (
                <div key={i} className="bg-white rounded p-2 text-xs font-mono truncate border">
                  {file}
                </div>
              ))}
            </div>
            <p className="text-xs text-muted-foreground mt-2">
              Source: {assets['2026_campaign'].source} | {assets['2026_campaign'].specs.status}
            </p>
          </div>
        </div>
      )}

      {/* Plans Tab */}
      {activeTab === 'plans' && future_plans && (
        <div className="space-y-6">
          {/* Status Banner */}
          <div className="bg-gradient-to-r from-purple-50 to-pink-50 border border-purple-200 rounded-lg p-4">
            <div className="flex items-center gap-2">
              <Lightbulb className="h-5 w-5 text-purple-500" />
              <span className="font-semibold text-purple-700">{future_plans.status}</span>
            </div>
          </div>

          {/* Backlog Items */}
          <div>
            <h2 className="text-lg font-semibold mb-3 flex items-center gap-2">
              <Calendar className="h-5 w-5 text-blue-500" />
              Creative Backlog
            </h2>
            <div className="space-y-3">
              {future_plans.backlog.map((item) => (
                <div key={item.id} className="bg-white rounded-lg border p-4 hover:border-primary/30 transition-colors">
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-3">
                      <div className={`px-2 py-0.5 rounded text-xs font-medium ${
                        item.priority === 'high' ? 'bg-red-100 text-red-700' :
                        item.priority === 'medium' ? 'bg-yellow-100 text-yellow-700' :
                        'bg-gray-100 text-gray-600'
                      }`}>
                        {item.priority}
                      </div>
                      <div>
                        <p className="font-medium">{item.title}</p>
                        <p className="text-sm text-muted-foreground mt-1">{item.description}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 text-xs">
                      <span className={`px-2 py-1 rounded-full ${
                        item.status === 'ready' ? 'bg-green-100 text-green-700' :
                        item.status === 'in_progress' ? 'bg-blue-100 text-blue-700' :
                        'bg-gray-100 text-gray-600'
                      }`}>
                        {item.status === 'ready' ? <CheckCircle className="h-3 w-3 inline mr-1" /> :
                         item.status === 'idea' ? <Lightbulb className="h-3 w-3 inline mr-1" /> :
                         <Clock className="h-3 w-3 inline mr-1" />}
                        {item.status}
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center gap-4 mt-3 text-xs text-muted-foreground">
                    <span className="bg-muted px-2 py-0.5 rounded">{item.category}</span>
                    <span>Timing: {item.timing}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Review Quotes for Ads */}
          <div>
            <h2 className="text-lg font-semibold mb-3 flex items-center gap-2">
              <MessageSquareQuote className="h-5 w-5 text-amber-500" />
              Review Quotes for Ads
            </h2>
            <div className="grid grid-cols-2 gap-3">
              {future_plans.review_quotes_for_ads.map((review, i) => (
                <div key={i} className="bg-white rounded-lg border p-4">
                  <p className="font-medium">&ldquo;{review.quote}&rdquo;</p>
                  <div className="flex items-center justify-between mt-2">
                    <span className="text-sm text-muted-foreground">— {review.author}</span>
                    <span className="text-xs bg-amber-50 text-amber-700 px-2 py-0.5 rounded">{review.use_case}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* New Descriptions to Test */}
          <div>
            <h2 className="text-lg font-semibold mb-3 flex items-center gap-2">
              <FileText className="h-5 w-5 text-green-500" />
              New Descriptions to Test
            </h2>
            <div className="space-y-3">
              {future_plans.new_descriptions_to_test.map((desc, i) => (
                <CopyCard key={i} copy={{ text: desc.text, angle: desc.angle }} type="body" />
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

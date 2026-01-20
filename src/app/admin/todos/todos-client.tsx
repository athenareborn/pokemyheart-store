'use client'

import { useState, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import {
  Search,
  Filter,
  CheckCircle2,
  Circle,
  Clock,
  AlertTriangle,
  User,
  Bot,
  Users,
  ChevronDown,
  ChevronRight,
  ExternalLink,
  RefreshCw,
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Checkbox } from '@/components/ui/checkbox'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible'
import { cn } from '@/lib/utils'
import type { LaunchTodo, TodoStatus, TodoCategory, TodoPriority } from '@/lib/supabase/types'

interface TodoStats {
  total: number
  done: number
  inProgress: number
  blocked: number
  notStarted: number
  criticalTotal: number
  criticalDone: number
  completionPercent: number
  criticalPercent: number
  byCategory: Record<string, { total: number; done: number }>
}

interface TodosClientProps {
  initialTodos: LaunchTodo[]
  initialStats: TodoStats | null
}

const CATEGORY_LABELS: Record<TodoCategory, string> = {
  legal: 'Legal & Compliance',
  storefront: 'Storefront',
  admin: 'Admin Dashboard',
  backend: 'Database & Backend',
  marketing: 'Marketing & Analytics',
  integrations: 'Integrations',
  seo: 'SEO & Discoverability',
  security: 'Performance & Security',
  analytics: 'Analytics',
  content: 'Content & UX',
  payments: 'Payments & Checkout',
  email: 'Email & Notifications',
}

const CATEGORY_ORDER: TodoCategory[] = [
  'legal', 'payments', 'backend', 'storefront', 'admin',
  'email', 'seo', 'marketing', 'integrations', 'security', 'content'
]

const PRIORITY_COLORS: Record<TodoPriority, string> = {
  critical: 'bg-red-100 text-red-700 border-red-200',
  high: 'bg-orange-100 text-orange-700 border-orange-200',
  medium: 'bg-yellow-100 text-yellow-700 border-yellow-200',
  low: 'bg-gray-100 text-gray-600 border-gray-200',
}

const STATUS_ICONS: Record<TodoStatus, React.ReactNode> = {
  done: <CheckCircle2 className="h-4 w-4 text-green-600" />,
  in_progress: <Clock className="h-4 w-4 text-blue-600" />,
  blocked: <AlertTriangle className="h-4 w-4 text-red-600" />,
  not_started: <Circle className="h-4 w-4 text-gray-400" />,
}

const ASSIGNEE_ICONS: Record<string, React.ReactNode> = {
  human: <User className="h-3 w-3" />,
  ai: <Bot className="h-3 w-3" />,
  both: <Users className="h-3 w-3" />,
}

export function TodosClient({ initialTodos, initialStats }: TodosClientProps) {
  const router = useRouter()
  const [todos, setTodos] = useState(initialTodos)
  const [stats, setStats] = useState(initialStats)
  const [searchQuery, setSearchQuery] = useState('')
  const [filterPriority, setFilterPriority] = useState<string>('all')
  const [filterStatus, setFilterStatus] = useState<string>('all')
  const [filterAssignee, setFilterAssignee] = useState<string>('all')
  const [selectedTodos, setSelectedTodos] = useState<string[]>([])
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(
    new Set(CATEGORY_ORDER)
  )
  const [updating, setUpdating] = useState<string | null>(null)

  // Filter todos
  const filteredTodos = useMemo(() => {
    return todos.filter(todo => {
      const matchesSearch =
        todo.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        todo.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        todo.id.toLowerCase().includes(searchQuery.toLowerCase())

      const matchesPriority = filterPriority === 'all' || todo.priority === filterPriority
      const matchesStatus = filterStatus === 'all' || todo.status === filterStatus
      const matchesAssignee = filterAssignee === 'all' || todo.assignee === filterAssignee

      return matchesSearch && matchesPriority && matchesStatus && matchesAssignee
    })
  }, [todos, searchQuery, filterPriority, filterStatus, filterAssignee])

  // Group by category
  const groupedTodos = useMemo(() => {
    const groups: Record<string, LaunchTodo[]> = {}
    for (const cat of CATEGORY_ORDER) {
      const catTodos = filteredTodos.filter(t => t.category === cat)
      if (catTodos.length > 0) {
        groups[cat] = catTodos
      }
    }
    return groups
  }, [filteredTodos])

  const toggleCategory = (category: string) => {
    setExpandedCategories(prev => {
      const next = new Set(prev)
      if (next.has(category)) {
        next.delete(category)
      } else {
        next.add(category)
      }
      return next
    })
  }

  const toggleTodo = (id: string) => {
    setSelectedTodos(prev =>
      prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
    )
  }

  const updateStatus = async (id: string, status: TodoStatus) => {
    setUpdating(id)
    try {
      const res = await fetch('/api/admin/todos', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, status })
      })
      if (res.ok) {
        setTodos(prev => prev.map(t => t.id === id ? { ...t, status } : t))
        router.refresh()
      }
    } finally {
      setUpdating(null)
    }
  }

  const bulkUpdateStatus = async (status: TodoStatus) => {
    if (selectedTodos.length === 0) return
    setUpdating('bulk')
    try {
      const res = await fetch('/api/admin/todos', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ids: selectedTodos, status })
      })
      if (res.ok) {
        setTodos(prev => prev.map(t =>
          selectedTodos.includes(t.id) ? { ...t, status } : t
        ))
        setSelectedTodos([])
        router.refresh()
      }
    } finally {
      setUpdating(null)
    }
  }

  const getCategoryStats = (category: string) => {
    const catTodos = todos.filter(t => t.category === category)
    const done = catTodos.filter(t => t.status === 'done').length
    return { total: catTodos.length, done, percent: Math.round((done / catTodos.length) * 100) || 0 }
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Launch Checklist</h1>
          <p className="text-sm text-muted-foreground">
            {stats?.done || 0} of {stats?.total || 0} tasks completed
          </p>
        </div>
        <Button variant="outline" size="sm" onClick={() => router.refresh()}>
          <RefreshCw className="h-4 w-4 mr-2" />
          Refresh
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <Card className="p-3">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-muted-foreground">Overall Progress</p>
              <p className="text-2xl font-bold">{stats?.completionPercent || 0}%</p>
            </div>
            <Progress value={stats?.completionPercent || 0} className="w-16 h-2" />
          </div>
        </Card>
        <Card className="p-3">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-muted-foreground">Critical Tasks</p>
              <p className="text-2xl font-bold text-red-600">
                {stats?.criticalDone || 0}/{stats?.criticalTotal || 0}
              </p>
            </div>
            <Progress value={stats?.criticalPercent || 0} className="w-16 h-2" />
          </div>
        </Card>
        <Card className="p-3">
          <div>
            <p className="text-xs text-muted-foreground">In Progress</p>
            <p className="text-2xl font-bold text-blue-600">{stats?.inProgress || 0}</p>
          </div>
        </Card>
        <Card className="p-3">
          <div>
            <p className="text-xs text-muted-foreground">Blocked</p>
            <p className="text-2xl font-bold text-orange-600">{stats?.blocked || 0}</p>
          </div>
        </Card>
      </div>

      {/* Filters */}
      <Card className="p-3">
        <div className="flex flex-wrap items-center gap-3">
          <div className="relative flex-1 min-w-[200px]">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search tasks..."
              className="pl-8 h-8"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <Select value={filterPriority} onValueChange={setFilterPriority}>
            <SelectTrigger className="w-[130px] h-8">
              <SelectValue placeholder="Priority" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Priority</SelectItem>
              <SelectItem value="critical">Critical</SelectItem>
              <SelectItem value="high">High</SelectItem>
              <SelectItem value="medium">Medium</SelectItem>
              <SelectItem value="low">Low</SelectItem>
            </SelectContent>
          </Select>
          <Select value={filterStatus} onValueChange={setFilterStatus}>
            <SelectTrigger className="w-[130px] h-8">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="not_started">Not Started</SelectItem>
              <SelectItem value="in_progress">In Progress</SelectItem>
              <SelectItem value="blocked">Blocked</SelectItem>
              <SelectItem value="done">Done</SelectItem>
            </SelectContent>
          </Select>
          <Select value={filterAssignee} onValueChange={setFilterAssignee}>
            <SelectTrigger className="w-[130px] h-8">
              <SelectValue placeholder="Assignee" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Assignee</SelectItem>
              <SelectItem value="human">Human</SelectItem>
              <SelectItem value="ai">AI</SelectItem>
              <SelectItem value="both">Both</SelectItem>
            </SelectContent>
          </Select>
          {selectedTodos.length > 0 && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button size="sm" variant="outline" className="h-8">
                  Actions ({selectedTodos.length})
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                <DropdownMenuItem onClick={() => bulkUpdateStatus('done')}>
                  Mark as Done
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => bulkUpdateStatus('in_progress')}>
                  Mark In Progress
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => bulkUpdateStatus('blocked')}>
                  Mark Blocked
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => bulkUpdateStatus('not_started')}>
                  Reset to Not Started
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </div>
      </Card>

      {/* Todo List by Category */}
      <div className="space-y-2">
        {Object.entries(groupedTodos).map(([category, catTodos]) => {
          const catStats = getCategoryStats(category)
          const isExpanded = expandedCategories.has(category)

          return (
            <Collapsible key={category} open={isExpanded} onOpenChange={() => toggleCategory(category)}>
              <Card>
                <CollapsibleTrigger asChild>
                  <CardHeader className="py-2 px-3 cursor-pointer hover:bg-muted/50">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        {isExpanded ? (
                          <ChevronDown className="h-4 w-4 text-muted-foreground" />
                        ) : (
                          <ChevronRight className="h-4 w-4 text-muted-foreground" />
                        )}
                        <CardTitle className="text-sm font-medium">
                          {CATEGORY_LABELS[category as TodoCategory] || category}
                        </CardTitle>
                        <Badge variant="secondary" className="text-xs">
                          {catStats.done}/{catStats.total}
                        </Badge>
                      </div>
                      <div className="flex items-center gap-2">
                        <Progress value={catStats.percent} className="w-24 h-1.5" />
                        <span className="text-xs text-muted-foreground w-8">{catStats.percent}%</span>
                      </div>
                    </div>
                  </CardHeader>
                </CollapsibleTrigger>
                <CollapsibleContent>
                  <CardContent className="p-0">
                    <div className="divide-y">
                      {catTodos.map(todo => (
                        <div
                          key={todo.id}
                          className={cn(
                            'flex items-center gap-2 px-3 py-1.5 hover:bg-muted/30 text-sm',
                            todo.status === 'done' && 'opacity-60'
                          )}
                        >
                          <Checkbox
                            checked={selectedTodos.includes(todo.id)}
                            onCheckedChange={() => toggleTodo(todo.id)}
                            className="h-3.5 w-3.5"
                          />
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <button className="hover:bg-muted rounded p-0.5" disabled={updating === todo.id}>
                                {updating === todo.id ? (
                                  <RefreshCw className="h-4 w-4 animate-spin" />
                                ) : (
                                  STATUS_ICONS[todo.status]
                                )}
                              </button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="start">
                              <DropdownMenuItem onClick={() => updateStatus(todo.id, 'not_started')}>
                                <Circle className="h-4 w-4 mr-2 text-gray-400" /> Not Started
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => updateStatus(todo.id, 'in_progress')}>
                                <Clock className="h-4 w-4 mr-2 text-blue-600" /> In Progress
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => updateStatus(todo.id, 'blocked')}>
                                <AlertTriangle className="h-4 w-4 mr-2 text-red-600" /> Blocked
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => updateStatus(todo.id, 'done')}>
                                <CheckCircle2 className="h-4 w-4 mr-2 text-green-600" /> Done
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                          <span className="text-xs text-muted-foreground w-10 font-mono">{todo.id}</span>
                          <Badge
                            variant="outline"
                            className={cn('text-[10px] px-1 py-0 h-4', PRIORITY_COLORS[todo.priority])}
                          >
                            {todo.priority}
                          </Badge>
                          <span className={cn(
                            'flex-1 truncate',
                            todo.status === 'done' && 'line-through'
                          )}>
                            {todo.title}
                          </span>
                          <span className="flex items-center gap-1 text-xs text-muted-foreground">
                            {ASSIGNEE_ICONS[todo.assignee]}
                            <span className="hidden sm:inline">{todo.assignee}</span>
                          </span>
                          {todo.subcategory && (
                            <Badge variant="outline" className="text-[10px] px-1 py-0 h-4 hidden md:inline-flex">
                              {todo.subcategory}
                            </Badge>
                          )}
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </CollapsibleContent>
              </Card>
            </Collapsible>
          )
        })}
      </div>

      {filteredTodos.length === 0 && (
        <Card className="p-8 text-center">
          <p className="text-muted-foreground">No tasks match your filters</p>
        </Card>
      )}
    </div>
  )
}

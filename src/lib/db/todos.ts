import { createClient } from '@/lib/supabase/server'
import type { LaunchTodo, TodoStatus, TodoCategory, TodoPriority } from '@/lib/supabase/types'

export async function getTodos(filters?: {
  category?: TodoCategory
  status?: TodoStatus
  priority?: TodoPriority
  assignee?: 'human' | 'ai' | 'both'
}) {
  const supabase = await createClient()

  let query = supabase
    .from('launch_todos')
    .select('*')
    .order('sort_order', { ascending: true })

  if (filters?.category) {
    query = query.eq('category', filters.category)
  }
  if (filters?.status) {
    query = query.eq('status', filters.status)
  }
  if (filters?.priority) {
    query = query.eq('priority', filters.priority)
  }
  if (filters?.assignee) {
    query = query.eq('assignee', filters.assignee)
  }

  const { data, error } = await query

  if (error) {
    console.error('Error fetching todos:', error)
    return { todos: [], error }
  }

  return { todos: data as LaunchTodo[], error: null }
}

export async function getTodoStats() {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('launch_todos')
    .select('status, priority, category')

  if (error) {
    console.error('Error fetching todo stats:', error)
    return null
  }

  const todos = data as Pick<LaunchTodo, 'status' | 'priority' | 'category'>[]

  const total = todos.length
  const done = todos.filter(t => t.status === 'done').length
  const inProgress = todos.filter(t => t.status === 'in_progress').length
  const blocked = todos.filter(t => t.status === 'blocked').length
  const notStarted = todos.filter(t => t.status === 'not_started').length

  const critical = todos.filter(t => t.priority === 'critical')
  const criticalDone = critical.filter(t => t.status === 'done').length

  // Category breakdown
  const byCategory = todos.reduce((acc, t) => {
    if (!acc[t.category]) {
      acc[t.category] = { total: 0, done: 0 }
    }
    acc[t.category].total++
    if (t.status === 'done') acc[t.category].done++
    return acc
  }, {} as Record<string, { total: number; done: number }>)

  return {
    total,
    done,
    inProgress,
    blocked,
    notStarted,
    criticalTotal: critical.length,
    criticalDone,
    completionPercent: Math.round((done / total) * 100),
    criticalPercent: critical.length > 0 ? Math.round((criticalDone / critical.length) * 100) : 100,
    byCategory
  }
}

export async function updateTodoStatus(id: string, status: TodoStatus) {
  const supabase = await createClient()

  const { error } = await supabase
    .from('launch_todos')
    .update({ status, updated_at: new Date().toISOString() })
    .eq('id', id)

  if (error) {
    console.error('Error updating todo:', error)
    return { success: false, error }
  }

  return { success: true, error: null }
}

export async function updateTodoNotes(id: string, notes: string) {
  const supabase = await createClient()

  const { error } = await supabase
    .from('launch_todos')
    .update({ notes, updated_at: new Date().toISOString() })
    .eq('id', id)

  if (error) {
    console.error('Error updating todo notes:', error)
    return { success: false, error }
  }

  return { success: true, error: null }
}

export async function bulkUpdateStatus(ids: string[], status: TodoStatus) {
  const supabase = await createClient()

  const { error } = await supabase
    .from('launch_todos')
    .update({ status, updated_at: new Date().toISOString() })
    .in('id', ids)

  if (error) {
    console.error('Error bulk updating todos:', error)
    return { success: false, error }
  }

  return { success: true, error: null }
}

import { NextRequest, NextResponse } from 'next/server'
import { updateTodoStatus, updateTodoNotes, bulkUpdateStatus } from '@/lib/db/todos'
import type { TodoStatus } from '@/lib/supabase/types'

export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json()
    const { id, ids, status, notes } = body

    // Bulk update
    if (ids && Array.isArray(ids) && status) {
      const result = await bulkUpdateStatus(ids, status as TodoStatus)
      if (!result.success) {
        return NextResponse.json({ error: 'Failed to update todos' }, { status: 500 })
      }
      return NextResponse.json({ success: true })
    }

    // Single update - status
    if (id && status) {
      const result = await updateTodoStatus(id, status as TodoStatus)
      if (!result.success) {
        return NextResponse.json({ error: 'Failed to update todo' }, { status: 500 })
      }
      return NextResponse.json({ success: true })
    }

    // Single update - notes
    if (id && notes !== undefined) {
      const result = await updateTodoNotes(id, notes)
      if (!result.success) {
        return NextResponse.json({ error: 'Failed to update notes' }, { status: 500 })
      }
      return NextResponse.json({ success: true })
    }

    return NextResponse.json({ error: 'Invalid request' }, { status: 400 })
  } catch (error) {
    console.error('Todo API error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

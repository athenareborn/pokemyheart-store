import { getTodos, getTodoStats } from '@/lib/db/todos'
import { TodosClient } from './todos-client'

export default async function TodosPage() {
  const [{ todos }, stats] = await Promise.all([
    getTodos(),
    getTodoStats()
  ])

  return <TodosClient initialTodos={todos} initialStats={stats} />
}

import { query } from '../db/index.js'
import type { Task } from '../types/tasks.js'

export async function listTasksForUser(userId: number): Promise<Task[]> {
  const rows = await query<any>(
    'SELECT id, title, description, due_date AS dueDate, completed, created_at AS createdAt FROM tasks WHERE user_id=$1 ORDER BY created_at DESC',
    [userId]
  )

  return rows.map((r: any) => ({
    id: Number(r.id),
    title: String(r.title ?? ''),
    description: String(r.description ?? ''),
    dueDate: (r.dueDate ?? r.due_date ?? null) as string | null,
    completed: Boolean(r.completed),
    createdAt: (r.createdAt ?? r.created_at) as string,
  }))
}


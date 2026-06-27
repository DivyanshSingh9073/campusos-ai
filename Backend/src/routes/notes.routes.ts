import { Router } from 'express'
import { query } from '../db/index.js'
import { requireAuth, type AuthedRequest } from '../middleware/auth.js'

export const notesRouter = Router()

notesRouter.use(requireAuth)

notesRouter.get('/', async (req: AuthedRequest, res) => {
  const userId = req.user!.id
  const rows = await query<any>(
    'SELECT id, title, subject, file_url AS fileUrl FROM notes WHERE user_id=$1 ORDER BY id DESC',
    [userId]
  )
  return res.json({ notes: rows })
})

notesRouter.get('/:id', async (req: AuthedRequest, res) => {
  const userId = req.user!.id
  const noteId = Number(req.params.id)
  if (!Number.isFinite(noteId)) return res.status(400).json({ error: 'invalid id' })

  const rows = await query<any>(
    'SELECT id, title, subject, file_url AS fileUrl FROM notes WHERE id=$1 AND user_id=$2',
    [noteId, userId]
  )

  if (!rows[0]) return res.status(404).json({ error: 'note not found' })
  return res.json({ note: rows[0] })
})

notesRouter.post('/upload', async (req: AuthedRequest, res) => {
  const userId = req.user!.id
  const { title, subject, file_url } = req.body as {
    title?: string
    subject?: string
    file_url?: string
  }

  if (!title?.trim()) return res.status(400).json({ error: 'title is required' })
  if (!subject?.trim()) return res.status(400).json({ error: 'subject is required' })
  if (!file_url?.trim()) return res.status(400).json({ error: 'file_url is required' })

  const rows = await query<any>(
    'INSERT INTO notes (title, subject, file_url, user_id) VALUES ($1, $2, $3, $4) RETURNING id, title, subject, file_url AS fileUrl',
    [title.trim(), subject.trim(), file_url.trim(), userId]
  )

  return res.status(201).json({ note: rows[0] })
})

notesRouter.delete('/:id', async (req: AuthedRequest, res) => {
  const userId = req.user!.id
  const noteId = Number(req.params.id)
  if (!Number.isFinite(noteId)) return res.status(400).json({ error: 'invalid id' })

  await query('DELETE FROM notes WHERE id=$1 AND user_id=$2', [noteId, userId])
  return res.status(204).send()
})


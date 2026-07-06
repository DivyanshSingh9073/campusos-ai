import express from 'express'
import cors from 'cors'
import helmet from 'helmet'

import { config } from './config.js'
import { authRouter } from './routes/auth.routes.js'
import { notesRouter } from './routes/notes.routes.js'
import { tasksRouter } from './routes/tasks.routes.js'

const app = express()

app.use(helmet())
app.use(cors({ origin: config.CORS_ORIGIN, credentials: true }))
app.use(express.json({ limit: '1mb' }))

app.get('/health', (_req: express.Request, res: express.Response) => {
  res.json({ ok: true })
})

app.use('/api/auth', authRouter)
app.use('/api/notes', notesRouter)
app.use('/api/tasks', tasksRouter)

app.get('/', (_req: express.Request, res: express.Response) => {
  res.json({
    message: 'CampusOS AI Backend Running 🚀',
  })
})

// Basic 404
app.use((req: express.Request, res: express.Response) => {
  res.status(404).json({ error: `Route not found: ${req.method} ${req.path}` })
})

// Error handler
app.use((err: any, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
  console.error(err)
  res.status(500).json({ error: 'Internal server error' })
})

app.listen(config.PORT, () => {
  console.log(`CampusOS AI Backend listening on http://localhost:${config.PORT}`)
})



import { Router } from 'express'
import bcrypt from 'bcrypt'
import jwt from 'jsonwebtoken'
import { query } from '../db/index.js'
import { config } from '../config.js'
import { requireAuth, type AuthedRequest } from '../middleware/auth.js'
import { asyncHandler } from '../middleware/asyncHandler.js'
import { rateLimit } from '../middleware/rateLimit.js'

export const authRouter = Router()

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

// 10 attempts / 15 minutes per IP+route — enough headroom for real users
// mistyping a password a few times, tight enough to blunt naive brute force.
const authLimiter = rateLimit({ windowMs: 15 * 60 * 1000, max: 10 })

authRouter.post(
  '/register',
  authLimiter,
  asyncHandler(async (req, res) => {
    const { name, email, password } = req.body as { name?: string; email?: string; password?: string }

    if (!name?.trim()) return res.status(400).json({ error: 'name is required' })
    if (name.trim().length > 255) return res.status(400).json({ error: 'name must be 255 characters or fewer' })
    if (!email?.trim()) return res.status(400).json({ error: 'email is required' })
    if (!EMAIL_RE.test(email.trim())) return res.status(400).json({ error: 'enter a valid email address' })
    if (!password || password.length < 8) return res.status(400).json({ error: 'password must be at least 8 chars' })

    const password_hash = await bcrypt.hash(password, 10)

    try {
      const rows = await query<{ id: number }>(
        'INSERT INTO users (name, email, password_hash) VALUES ($1, $2, $3) RETURNING id',
        [name.trim(), email.trim().toLowerCase(), password_hash]
      )
      return res.status(201).json({ id: rows[0]?.id })
    } catch (e: any) {
      // Unique constraint on email
      if (String(e?.code) === '23505') return res.status(409).json({ error: 'email already exists' })
      throw e
    }
  })
)

authRouter.post(
  '/login',
  authLimiter,
  asyncHandler(async (req, res) => {
    const { email, password } = req.body as { email?: string; password?: string }
    if (!email?.trim()) return res.status(400).json({ error: 'email is required' })
    if (!password) return res.status(400).json({ error: 'password is required' })

    const users = await query<{ id: number; password_hash: string; name: string; email: string }>(
      'SELECT id, name, email, password_hash FROM users WHERE email=$1 LIMIT 1',
      [email.trim().toLowerCase()]
    )

    const user = users[0]
    if (!user) return res.status(401).json({ error: 'Invalid email or password' })

    const ok = await bcrypt.compare(password, user.password_hash)
    if (!ok) return res.status(401).json({ error: 'Invalid email or password' })

    const token = jwt.sign({ sub: String(user.id) }, config.JWT_SECRET as jwt.Secret, {
      expiresIn: config.JWT_EXPIRES_IN as jwt.SignOptions['expiresIn']
    })

    return res.json({
      token,
      user: { id: user.id, name: user.name, email: user.email }
    })
  })
)

authRouter.get(
  '/profile',
  requireAuth,
  asyncHandler(async (req: AuthedRequest, res) => {
    const userId = req.user!.id
    const rows = await query<{ id: number; name: string; email: string; branch: string | null; year: string | null }>(
      'SELECT id, name, email, branch, year FROM users WHERE id=$1',
      [userId]
    )

    if (!rows[0]) return res.status(404).json({ error: 'user not found' })
    return res.json({ user: rows[0] })
  })
)

// PATCH /api/auth/profile — update name/branch/year. Email and password are
// intentionally not editable here (email is the login identity; password
// changes deserve their own dedicated, re-auth-guarded flow, which is out of
// scope for this phase).
authRouter.patch(
  '/profile',
  requireAuth,
  asyncHandler(async (req: AuthedRequest, res) => {
    const userId = req.user!.id
    const { name, branch, year } = req.body as { name?: string; branch?: string; year?: string }

    if (name !== undefined && !name.trim()) {
      return res.status(400).json({ error: 'name cannot be empty' })
    }
    if (name !== undefined && name.trim().length > 255) {
      return res.status(400).json({ error: 'name must be 255 characters or fewer' })
    }
    if (branch !== undefined && branch.length > 100) {
      return res.status(400).json({ error: 'branch must be 100 characters or fewer' })
    }
    if (year !== undefined && year.length > 50) {
      return res.status(400).json({ error: 'year must be 50 characters or fewer' })
    }

    const rows = await query<{ id: number; name: string; email: string; branch: string | null; year: string | null }>(
      `UPDATE users
       SET name = COALESCE($1, name),
           branch = COALESCE($2, branch),
           year = COALESCE($3, year)
       WHERE id = $4
       RETURNING id, name, email, branch, year`,
      [name?.trim() ?? null, branch?.trim() ?? null, year?.trim() ?? null, userId]
    )

    if (!rows[0]) return res.status(404).json({ error: 'user not found' })
    return res.json({ user: rows[0] })
  })
)

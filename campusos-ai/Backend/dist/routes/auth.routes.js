import { Router } from 'express';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { query } from '../db/index.js';
import { config } from '../config.js';
import { requireAuth } from '../middleware/auth.js';
export const authRouter = Router();
authRouter.post('/register', async (req, res) => {
    const { name, email, password } = req.body;
    if (!name?.trim())
        return res.status(400).json({ error: 'name is required' });
    if (!email?.trim())
        return res.status(400).json({ error: 'email is required' });
    if (!password || password.length < 8)
        return res.status(400).json({ error: 'password must be at least 8 chars' });
    const password_hash = await bcrypt.hash(password, 10);
    try {
        const rows = await query('INSERT INTO users (name, email, password_hash) VALUES ($1, $2, $3) RETURNING id', [name.trim(), email.trim().toLowerCase(), password_hash]);
        return res.status(201).json({ id: rows[0]?.id });
    }
    catch (e) {
        // Unique constraint on email
        if (String(e?.code) === '23505')
            return res.status(409).json({ error: 'email already exists' });
        console.error('register failed:', {
            message: e?.message,
            code: e?.code,
            detail: e?.detail,
        });
        return res.status(500).json({ error: 'failed to register', details: e?.message ?? null });
    }
});
authRouter.post('/login', async (req, res) => {
    const { email, password } = req.body;
    if (!email?.trim())
        return res.status(400).json({ error: 'email is required' });
    if (!password)
        return res.status(400).json({ error: 'password is required' });
    const users = await query('SELECT id, name, email, password_hash FROM users WHERE email=$1 LIMIT 1', [email.trim().toLowerCase()]);
    const user = users[0];
    if (!user)
        return res.status(401).json({ error: 'Invalid email or password' });
    const ok = await bcrypt.compare(password, user.password_hash);
    if (!ok)
        return res.status(401).json({ error: 'Invalid email or password' });
    const token = jwt.sign({ sub: String(user.id) }, config.JWT_SECRET, {
        expiresIn: config.JWT_EXPIRES_IN
    });
    return res.json({
        token,
        user: { id: user.id, name: user.name, email: user.email }
    });
});
authRouter.get('/profile', requireAuth, async (req, res) => {
    const userId = req.user.id;
    const rows = await query('SELECT id, name, email FROM users WHERE id=$1', [userId]);
    if (!rows[0])
        return res.status(404).json({ error: 'user not found' });
    return res.json({ user: rows[0] });
});

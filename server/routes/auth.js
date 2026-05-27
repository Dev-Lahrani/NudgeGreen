import { Router } from 'express'
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import { randomUUID } from 'crypto'
import db from '../db.js'

const router = Router()

function makeToken(userId) {
  return jwt.sign({ sub: userId }, process.env.JWT_SECRET, { expiresIn: '30d' })
}

router.post('/signup', async (req, res) => {
  const { display_name, city, password } = req.body
  if (!display_name || !city || !password) {
    return res.status(400).json({ error: 'display_name, city, and password are required' })
  }
  if (password.length < 6) {
    return res.status(400).json({ error: 'Password must be at least 6 characters' })
  }
  try {
    const password_hash = await bcrypt.hash(password, 10)
    const id = randomUUID()
    db.prepare(
      'INSERT INTO users (id, display_name, city, password_hash) VALUES (?, ?, ?, ?)'
    ).run(id, display_name.trim(), city.trim(), password_hash)
    res.status(201).json({ user_id: id, token: makeToken(id) })
  } catch (err) {
    if (err.message?.includes('UNIQUE constraint failed')) {
      return res.status(409).json({ error: 'That display name is already taken' })
    }
    console.error(err)
    res.status(500).json({ error: 'Database error' })
  }
})

router.post('/login', async (req, res) => {
  const { display_name, password } = req.body
  if (!display_name || !password) {
    return res.status(400).json({ error: 'display_name and password are required' })
  }
  try {
    const user = db.prepare(
      'SELECT id, password_hash FROM users WHERE display_name = ?'
    ).get(display_name.trim())

    if (!user || !(await bcrypt.compare(password, user.password_hash))) {
      return res.status(401).json({ error: 'Invalid display name or password' })
    }
    res.json({ user_id: user.id, token: makeToken(user.id) })
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: 'Database error' })
  }
})

export default router

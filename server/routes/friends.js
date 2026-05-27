import { Router } from 'express'
import { randomUUID } from 'crypto'
import db from '../db.js'

const router = Router()

// GET /api/friends — accepted friends list
router.get('/', (req, res) => {
  try {
    const rows = db.prepare(`
      SELECT u.id, u.display_name, u.city
      FROM friendships f
      JOIN users u ON u.id = CASE WHEN f.user_id = ? THEN f.friend_id ELSE f.user_id END
      WHERE (f.user_id = ? OR f.friend_id = ?) AND f.status = 'accepted'
      ORDER BY u.display_name
    `).all(req.userId, req.userId, req.userId)
    res.json(rows)
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: 'Database error' })
  }
})

// GET /api/friends/requests — incoming pending requests
router.get('/requests', (req, res) => {
  try {
    const rows = db.prepare(`
      SELECT u.id, u.display_name, u.city, f.created_at
      FROM friendships f
      JOIN users u ON u.id = f.user_id
      WHERE f.friend_id = ? AND f.status = 'pending'
      ORDER BY f.created_at DESC
    `).all(req.userId)
    res.json(rows)
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: 'Database error' })
  }
})

// POST /api/friends/request — send friend request
router.post('/request', (req, res) => {
  const { target_user_id } = req.body
  if (!target_user_id) return res.status(400).json({ error: 'target_user_id required' })
  if (target_user_id === req.userId) return res.status(400).json({ error: 'Cannot friend yourself' })
  try {
    const existing = db.prepare(`
      SELECT id FROM friendships
      WHERE (user_id = ? AND friend_id = ?) OR (user_id = ? AND friend_id = ?)
    `).get(req.userId, target_user_id, target_user_id, req.userId)
    if (existing) return res.status(409).json({ error: 'Friendship already exists' })

    db.prepare(
      'INSERT INTO friendships (id, user_id, friend_id, status) VALUES (?, ?, ?, ?)'
    ).run(randomUUID(), req.userId, target_user_id, 'pending')
    res.json({ ok: true })
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: 'Database error' })
  }
})

// POST /api/friends/accept — accept an incoming request
router.post('/accept', (req, res) => {
  const { requester_id } = req.body
  if (!requester_id) return res.status(400).json({ error: 'requester_id required' })
  try {
    const info = db.prepare(`
      UPDATE friendships SET status = 'accepted'
      WHERE user_id = ? AND friend_id = ? AND status = 'pending'
    `).run(requester_id, req.userId)
    if (info.changes === 0) return res.status(404).json({ error: 'No pending request found' })
    res.json({ ok: true })
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: 'Database error' })
  }
})

// DELETE /api/friends/:userId — unfriend or reject
router.delete('/:userId', (req, res) => {
  const otherId = req.params.userId
  try {
    const info = db.prepare(`
      DELETE FROM friendships
      WHERE (user_id = ? AND friend_id = ?) OR (user_id = ? AND friend_id = ?)
    `).run(req.userId, otherId, otherId, req.userId)
    if (info.changes === 0) return res.status(404).json({ error: 'Friendship not found' })
    res.json({ ok: true })
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: 'Database error' })
  }
})

export default router

import { Router } from 'express'
import { randomUUID } from 'crypto'
import db from '../db.js'

const router = Router()

router.get('/', (req, res) => {
  try {
    const rows = db.prepare(`
      SELECT d.id, d.user_id, u.display_name, d.decision_text,
             d.category, d.impact_level, d.co2_kg, d.created_at
      FROM decisions d
      JOIN users u ON u.id = d.user_id
      WHERE d.user_id IN (
        SELECT CASE WHEN f.user_id = ? THEN f.friend_id ELSE f.user_id END
        FROM friendships f
        WHERE (f.user_id = ? OR f.friend_id = ?) AND f.status = 'accepted'
      )
      ORDER BY d.created_at DESC
      LIMIT 30
    `).all(req.userId, req.userId, req.userId)
    res.json(rows)
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: 'Database error' })
  }
})

router.post('/nudge/:decisionId', (req, res) => {
  const { decisionId } = req.params
  try {
    const decision = db.prepare('SELECT user_id FROM decisions WHERE id = ?').get(decisionId)
    if (!decision) return res.status(404).json({ error: 'Decision not found' })
    if (decision.user_id === req.userId) return res.status(400).json({ error: 'Cannot nudge yourself' })

    const friendship = db.prepare(`
      SELECT id FROM friendships
      WHERE ((user_id = ? AND friend_id = ?) OR (user_id = ? AND friend_id = ?))
        AND status = 'accepted'
    `).get(req.userId, decision.user_id, decision.user_id, req.userId)
    if (!friendship) return res.status(403).json({ error: 'Not friends' })

    db.prepare(
      'INSERT INTO notifications (id, to_user_id, from_user_id, decision_id) VALUES (?, ?, ?, ?)'
    ).run(randomUUID(), decision.user_id, req.userId, decisionId)

    res.json({ ok: true })
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: 'Database error' })
  }
})

export default router

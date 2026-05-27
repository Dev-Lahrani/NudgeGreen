import { Router } from 'express'
import db from '../db.js'

const router = Router()

router.get('/', (req, res) => {
  try {
    const items = db.prepare(`
      SELECT n.id, u.display_name AS from_display_name,
             d.decision_text, n.read, n.created_at
      FROM notifications n
      JOIN users u ON u.id = n.from_user_id
      JOIN decisions d ON d.id = n.decision_id
      WHERE n.to_user_id = ?
      ORDER BY n.created_at DESC
      LIMIT 20
    `).all(req.userId)

    const unreadRow = db.prepare(
      'SELECT COUNT(*) AS cnt FROM notifications WHERE to_user_id = ? AND read = 0'
    ).get(req.userId)

    res.json({ unread_count: unreadRow.cnt, items })
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: 'Database error' })
  }
})

router.post('/read', (req, res) => {
  try {
    db.prepare('UPDATE notifications SET read = 1 WHERE to_user_id = ?').run(req.userId)
    res.json({ ok: true })
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: 'Database error' })
  }
})

export default router

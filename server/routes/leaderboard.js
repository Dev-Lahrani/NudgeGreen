import { Router } from 'express'
import db from '../db.js'

const router = Router()

router.get('/', (req, res) => {
  const userId = req.userId
  try {
    const rows = db.prepare(`
      SELECT u.id, u.display_name, u.city,
             COALESCE(SUM(s.co2_saved), 0) AS total_co2_saved,
             (SELECT f.status
              FROM friendships f
              WHERE (f.user_id = ? AND f.friend_id = u.id)
                 OR (f.friend_id = ? AND f.user_id = u.id)
              LIMIT 1) AS friendship_status,
             (SELECT CASE WHEN f.user_id = ? THEN 'outgoing' ELSE 'incoming' END
              FROM friendships f
              WHERE (f.user_id = ? AND f.friend_id = u.id)
                 OR (f.friend_id = ? AND f.user_id = u.id)
              LIMIT 1) AS friendship_dir
      FROM users u
      LEFT JOIN saved_co2 s
        ON s.user_id = u.id
        AND s.created_at >= datetime('now', '-7 days')
      GROUP BY u.id, u.display_name, u.city
      ORDER BY total_co2_saved DESC
      LIMIT 10
    `).all(userId, userId, userId, userId, userId)
    res.json(rows)
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: 'Database error' })
  }
})

export default router

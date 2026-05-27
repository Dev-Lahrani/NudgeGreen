import { Router } from 'express'
import db from '../db.js'

const router = Router()

router.get('/', (_req, res) => {
  try {
    const rows = db.prepare(`
      SELECT u.id, u.display_name, u.city,
             COALESCE(SUM(s.co2_saved), 0) AS total_co2_saved
      FROM users u
      LEFT JOIN saved_co2 s
        ON s.user_id = u.id
        AND s.created_at >= datetime('now', '-7 days')
      GROUP BY u.id, u.display_name, u.city
      ORDER BY total_co2_saved DESC
      LIMIT 10
    `).all()
    res.json(rows)
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: 'Database error' })
  }
})

export default router

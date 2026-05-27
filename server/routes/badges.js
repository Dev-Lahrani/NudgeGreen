import { Router } from 'express'
import db from '../db.js'
import { BADGE_IDS } from '../badgeChecker.js'

const router = Router()

router.get('/', (req, res) => {
  try {
    const rows = db.prepare(
      'SELECT badge_id, earned_at FROM badges WHERE user_id = ?'
    ).all(req.userId)

    const earned = new Map(rows.map((r) => [r.badge_id, r.earned_at]))
    res.json(
      BADGE_IDS.map((id) => ({
        badge_id: id,
        earned: earned.has(id),
        earned_at: earned.get(id) ?? null,
      }))
    )
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: 'Database error' })
  }
})

export default router

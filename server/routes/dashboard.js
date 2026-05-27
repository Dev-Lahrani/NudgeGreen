import { Router } from 'express'
import db from '../db.js'

const router = Router()

function calcStreak(days) {
  if (!days.length) return 0
  const sorted = days
    .map((d) => { const dt = new Date(d); dt.setHours(0, 0, 0, 0); return dt.getTime() })
    .sort((a, b) => b - a)

  const today = new Date(); today.setHours(0, 0, 0, 0)
  const yesterday = new Date(today); yesterday.setDate(yesterday.getDate() - 1)

  const start = sorted[0]
  if (start !== today.getTime() && start !== yesterday.getTime()) return 0

  let streak = 1
  for (let i = 1; i < sorted.length; i++) {
    if (sorted[i - 1] - sorted[i] === 86_400_000) streak++
    else break
  }
  return streak
}

router.get('/', (req, res) => {
  const userId = req.userId
  try {
    const totals = db.prepare(
      `SELECT COUNT(*) AS total_decisions, COALESCE(SUM(co2_kg), 0) AS total_co2
       FROM decisions WHERE user_id = ?`
    ).get(userId)

    const saved = db.prepare(
      `SELECT COALESCE(SUM(co2_saved), 0) AS total_co2_saved
       FROM saved_co2 WHERE user_id = ?`
    ).get(userId)

    const dailyCo2 = db.prepare(
      `SELECT date(created_at) AS day, COALESCE(SUM(co2_kg), 0) AS co2
       FROM decisions
       WHERE user_id = ? AND created_at >= datetime('now', '-7 days')
       GROUP BY date(created_at)
       ORDER BY day ASC`
    ).all(userId)

    const byCategory = db.prepare(
      `SELECT category, COALESCE(SUM(co2_kg), 0) AS co2
       FROM decisions
       WHERE user_id = ? AND category IS NOT NULL AND co2_kg IS NOT NULL
       GROUP BY category`
    ).all(userId)

    const streakDays = db.prepare(
      `SELECT DISTINCT date(created_at) AS day
       FROM decisions WHERE user_id = ? ORDER BY day DESC`
    ).all(userId)

    res.json({
      stats: {
        total_decisions: totals.total_decisions,
        total_co2: totals.total_co2,
        total_co2_saved: saved.total_co2_saved,
        streak: calcStreak(streakDays.map((r) => r.day)),
      },
      daily_co2: dailyCo2,
      by_category: byCategory,
    })
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: 'Database error' })
  }
})

export default router

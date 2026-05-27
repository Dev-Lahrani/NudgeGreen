import { randomUUID } from 'crypto'
import db from './db.js'

export const BADGE_IDS = [
  'first_step',
  'green_streak',
  'carbon_crusher',
  'top_nudger',
  'road_warrior',
  'plant_parent',
]

function hasConsecutiveDays(days, count) {
  if (days.length < count) return false
  const sorted = days
    .map((d) => { const dt = new Date(d); dt.setHours(0, 0, 0, 0); return dt.getTime() })
    .sort((a, b) => b - a)

  let run = 1
  for (let i = 1; i < sorted.length; i++) {
    if (sorted[i - 1] - sorted[i] === 86_400_000) {
      if (++run >= count) return true
    } else {
      run = 1
    }
  }
  return run >= count
}

function checkBadge(badgeId, userId) {
  switch (badgeId) {
    case 'first_step':
      return !!db.prepare('SELECT 1 FROM decisions WHERE user_id = ? LIMIT 1').get(userId)

    case 'green_streak': {
      const rows = db.prepare(
        `SELECT DISTINCT date(created_at) AS day FROM decisions
         WHERE user_id = ? AND LOWER(impact_level) = 'low'
         ORDER BY day DESC LIMIT 30`
      ).all(userId)
      return hasConsecutiveDays(rows.map((r) => r.day), 3)
    }

    case 'carbon_crusher': {
      const { total } = db.prepare(
        'SELECT COALESCE(SUM(co2_saved), 0) AS total FROM saved_co2 WHERE user_id = ?'
      ).get(userId)
      return total >= 10
    }

    case 'top_nudger': {
      const row = db.prepare(`
        SELECT id FROM (
          SELECT u.id, COALESCE(SUM(s.co2_saved), 0) AS total
          FROM users u
          LEFT JOIN saved_co2 s ON s.user_id = u.id
            AND s.created_at >= datetime('now', '-7 days')
          GROUP BY u.id
          ORDER BY total DESC
          LIMIT 10
        ) WHERE id = ?
      `).get(userId)
      return !!row
    }

    case 'road_warrior': {
      const { cnt } = db.prepare(
        `SELECT COUNT(*) AS cnt FROM decisions
         WHERE user_id = ? AND LOWER(category) = 'transport'`
      ).get(userId)
      return cnt >= 5
    }

    case 'plant_parent': {
      const { cnt } = db.prepare(
        `SELECT COUNT(*) AS cnt FROM decisions
         WHERE user_id = ? AND LOWER(impact_level) = 'low'`
      ).get(userId)
      return cnt >= 10
    }

    default:
      return false
  }
}

export function checkAndAwardBadges(userId) {
  const earned = new Set(
    db.prepare('SELECT badge_id FROM badges WHERE user_id = ?')
      .all(userId)
      .map((r) => r.badge_id)
  )
  const toCheck = BADGE_IDS.filter((id) => !earned.has(id))
  if (!toCheck.length) return []

  const newBadges = toCheck.filter((id) => checkBadge(id, userId))

  const insert = db.prepare(
    'INSERT OR IGNORE INTO badges (id, user_id, badge_id) VALUES (?, ?, ?)'
  )
  for (const id of newBadges) insert.run(randomUUID(), userId, id)

  return newBadges
}

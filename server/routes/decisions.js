import { Router } from 'express'
import { randomUUID } from 'crypto'
import db from '../db.js'
import { checkAndAwardBadges } from '../badgeChecker.js'

const router = Router()

const logDecisionTx = db.transaction((userId, decisionText, category, impactLevel, co2Kg) => {
  const decisionId = randomUUID()
  db.prepare(
    `INSERT INTO decisions (id, user_id, decision_text, category, impact_level, co2_kg)
     VALUES (?, ?, ?, ?, ?, ?)`
  ).run(decisionId, userId, decisionText, category ?? null, impactLevel ?? null, co2Kg ?? null)

  if (co2Kg != null && co2Kg > 0) {
    db.prepare(
      'INSERT INTO saved_co2 (id, user_id, decision_id, co2_saved) VALUES (?, ?, ?, ?)'
    ).run(randomUUID(), userId, decisionId, co2Kg)
  }
  return decisionId
})

router.post('/log', (req, res) => {
  const { decision_text, category, impact_level, co2_kg } = req.body
  if (!decision_text) {
    return res.status(400).json({ error: 'decision_text is required' })
  }
  try {
    const decision_id = logDecisionTx(
      req.userId,
      decision_text.trim(),
      category,
      impact_level,
      co2_kg
    )
    const new_badges = checkAndAwardBadges(req.userId)
    res.json({ decision_id, new_badges })
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: 'Database error' })
  }
})

export default router

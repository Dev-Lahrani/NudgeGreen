import 'dotenv/config'
import express from 'express'
import cors from 'cors'
import { initDb } from './initDb.js'
import authRouter from './routes/auth.js'
import decisionsRouter from './routes/decisions.js'
import leaderboardRouter from './routes/leaderboard.js'
import dashboardRouter from './routes/dashboard.js'
import badgesRouter from './routes/badges.js'
import { requireAuth } from './middleware/auth.js'

initDb()

const app = express()
const PORT = process.env.PORT ?? 3001

app.use(cors())
app.use(express.json())

app.use('/api/auth', authRouter)
app.use('/api/decisions', requireAuth, decisionsRouter)
app.use('/api/leaderboard', requireAuth, leaderboardRouter)
app.use('/api/dashboard', requireAuth, dashboardRouter)
app.use('/api/badges', requireAuth, badgesRouter)

app.listen(PORT, () => console.log(`NudgeGreen server running on port ${PORT}`))

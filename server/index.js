import 'dotenv/config'
import express from 'express'
import cors from 'cors'
import { initDb } from './initDb.js'
import authRouter from './routes/auth.js'
import decisionsRouter from './routes/decisions.js'
import leaderboardRouter from './routes/leaderboard.js'
import dashboardRouter from './routes/dashboard.js'
import badgesRouter from './routes/badges.js'
import nudgeRouter from './routes/nudge.js'
import friendsRouter from './routes/friends.js'
import feedRouter from './routes/feed.js'
import notificationsRouter from './routes/notifications.js'
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
app.use('/api/nudge', requireAuth, nudgeRouter)
app.use('/api/friends', requireAuth, friendsRouter)
app.use('/api/feed', requireAuth, feedRouter)
app.use('/api/notifications', requireAuth, notificationsRouter)

app.listen(PORT, () => console.log(`NudgeGreen server running on port ${PORT}`))

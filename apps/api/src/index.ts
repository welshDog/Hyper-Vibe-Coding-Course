import express from 'express'
import cors from 'cors'
import helmet from 'helmet'
import { authRouter } from './routes/auth'
import { coursesRouter } from './routes/courses'
import { progressRouter } from './routes/progress'

const app = express()
const PORT = process.env.PORT ?? 4000

// Middleware
app.use(helmet())
app.use(cors({ origin: process.env.FRONTEND_URL ?? 'http://localhost:3000' }))
app.use(express.json())

// Health check
app.get('/health', (_req, res) => {
  res.json({ status: 'ok', time: new Date().toISOString() })
})

// Routes
app.use('/api/auth', authRouter)
app.use('/api/courses', coursesRouter)
app.use('/api/progress', progressRouter)

app.listen(PORT, () => {
  console.log(`🚀 Hyper Vibe API running on port ${PORT}`)
})

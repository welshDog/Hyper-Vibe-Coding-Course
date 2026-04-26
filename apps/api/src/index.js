const express = require('express')
const cors = require('cors')
require('dotenv').config()

const app = express()
const port = Number(process.env.PORT || 4000)
const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173'

app.use(cors({ origin: frontendUrl }))
app.use(express.json())

app.get('/health', (_req, res) => {
  res.json({ status: 'ok', time: new Date().toISOString() })
})

app.get('/api/courses', (_req, res) => {
  res.json([])
})

app.listen(port, () => {
  console.log(`🚀 Hyper Vibe API running on port ${port}`)
})


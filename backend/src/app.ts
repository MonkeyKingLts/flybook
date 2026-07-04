import 'dotenv/config'
import cors from 'cors'
import express from 'express'
import helmet from 'helmet'
import { clerkMiddleware } from '@clerk/express'
import { apiRouter } from './routes/index.js'
import { webhookRouter } from './routes/webhooks.js'
import { errorHandler } from './middleware/error-handler.js'
import { ok } from './utils/response.js'

export function createApp() {
  const app = express()

  app.use(helmet())
  app.use(
    cors({
      origin: process.env.FRONTEND_URL ?? 'http://localhost:5173',
      credentials: true,
    }),
  )

  // Clerk webhook needs raw body - mount before json parser for that route only
  app.use('/api/webhooks', express.json(), webhookRouter)

  app.use(express.json())
  app.use(clerkMiddleware())

  app.get('/health', (_req, res) => ok(res, { status: 'ok' }))

  app.use('/api/v1', apiRouter)

  app.use(errorHandler)

  return app
}

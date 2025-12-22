// notification-service/src/index.ts
import dotenv from 'dotenv'
dotenv.config()
import express from 'express'
import cors from 'cors'
import { startNotificationConsumer } from './services/notification.consumer'
import { initTopology } from './config/rabbitmq.config'
import { connectDB } from './config/db.config'
import notificationRoutes from './routes/notification.routes'
import logger from './utils/logger.service'

const app = express()
app.use(cors({ origin: true, credentials: true }))
app.use(express.json())

// Routes
app.use('/', notificationRoutes)

const PORT = process.env.PORT || 4010

async function main() {
  await connectDB()
  await initTopology()
  await startNotificationConsumer()
  
  app.listen(PORT, () => {
    logger.info(`✅ Notification service started on port ${PORT}`)
  })
}

// Handle uncaught errors
process.on('uncaughtException', (error) => {
  logger.error('Uncaught Exception', { error })
  process.exit(1)
})

process.on('unhandledRejection', (reason, promise) => {
  logger.error('Unhandled Rejection', { reason, promise })
  process.exit(1)
})

main().catch((err) => {
  logger.error('Notification service startup error', { error: err })
  process.exit(1)
})

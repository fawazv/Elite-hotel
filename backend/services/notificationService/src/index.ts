// notification-service/src/index.ts
import dotenv from 'dotenv'
dotenv.config()
import { startNotificationConsumer } from './services/notification.consumer'
import { initTopology } from './config/rabbitmq.config'
import logger from './utils/logger.service'

async function main() {
  await initTopology()
  await startNotificationConsumer()
  logger.info('✅ Notification service started')
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

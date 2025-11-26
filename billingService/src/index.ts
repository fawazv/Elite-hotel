import dotenv from 'dotenv'
dotenv.config()
import connectMongodb from './config/db.config'
import { initTopology } from './config/rabbitmq.config'
import { startBillingConsumer } from './consumers/billing.consumer'
import { BillingService } from './service/implementation/billing.service'
import { BillingRepository } from './repository/implementation/billing.repository'
import logger from './utils/logger.service'

// Startup function
async function start() {
  try {
    // MongoDB
    await connectMongodb()
    logger.info('✅ MongoDB connected (BillingService)')

    // RabbitMQ
    await initTopology()
    logger.info('✅ RabbitMQ connected (BillingService)')

    // Initialize service and repository
    const repo = new BillingRepository()
    const billingService = new BillingService(repo)

    // Start consumer
    await startBillingConsumer(billingService)
    logger.info('✅ Billing consumer started')

    logger.info('🚀 BillingService running (background worker)')
  } catch (err) {
    logger.error('❌ BillingService startup error', { error: err })
    process.exit(1)
  }
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

start()

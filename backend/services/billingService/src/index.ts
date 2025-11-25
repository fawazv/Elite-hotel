import dotenv from 'dotenv'
dotenv.config()
import connectMongodb from './config/db.config'
import { initTopology, getRabbitChannel } from './config/rabbitmq.config'
import { startBillingConsumer } from './consumers/billing.consumer'
import { BillingService } from './service/implementation/billing.service'
import { BillingRepository } from './repository/implementation/billing.repository'

// Startup function
async function start() {
  try {
    // MongoDB
    await connectMongodb()
    console.log('✅ MongoDB connected (BillingService)')

    // RabbitMQ
    await initTopology()
    console.log('✅ RabbitMQ connected (BillingService)')

    // Initialize service and repository
    const repo = new BillingRepository()
    const billingService = new BillingService(repo)

    // Start consumer
    await startBillingConsumer(billingService)
    console.log('✅ Billing consumer started')

    console.log('🚀 BillingService running (background worker)')
  } catch (err) {
    console.error('❌ BillingService startup error:', err)
    process.exit(1)
  }
}

start()

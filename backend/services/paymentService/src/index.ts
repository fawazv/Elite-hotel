import dotenv from 'dotenv'
dotenv.config()
import express from 'express'
import connectMongodb from './config/db.config'
import cors from 'cors'
import paymentRoutes from './routes/payment.route'
import { startReservationConsumer } from './consumers/reservation.consumer'
import { initTopology } from './config/rabbitmq.config'
import webhookRoutes from './routes/webhook.routes'
import { startPaymentConsumer } from './consumers/payment.consumer'
import { paymentService } from './config/container'

const app = express()

// Stripe needs raw body for signature verification
app.use(
  '/payments/webhook/stripe',
  express.raw({ type: 'application/json' }) // raw buffer
)

// Middlewares
app.use(express.json())
app.use(express.urlencoded({ extended: true }))

app.use(
  cors({
    origin: 'http://localhost:5173',
    credentials: true,
  })
)

// Routes
app.use('/api/payments', paymentRoutes)
app.use('/payments/webhook', webhookRoutes)

app.get('/health', (req, res) => {
  res.json({ status: 'ok', service: 'PaymentService' })
})

// Startup function
async function start() {
  try {
    // RabbitMQ
    await initTopology()
    console.log('✅ RabbitMQ connected (PaymentService)')

    await connectMongodb()

    // Consumers
    startReservationConsumer()
    startPaymentConsumer(paymentService)

    // Server
    app.listen(4006, () => {
      console.log(`🚀 PaymentService running at http://localhost:4006`)
    })
  } catch (err) {
    console.error('❌ PaymentService startup error:', err)
    process.exit(1)
  }
}

start()

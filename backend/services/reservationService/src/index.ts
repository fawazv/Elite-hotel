import dotenv from 'dotenv'
dotenv.config()
import express from 'express'
import cors from 'cors'
import connectMongodb from './config/db.config'
import reservationRoute from './routes/reservation.route'
import errorHandler from './middleware/errorHandler'
import { initTopology } from './config/rabbitmq.config'

const app = express()

app.use(express.json())
app.use(express.urlencoded({ extended: true }))

app.use(
  cors({
    origin: 'http://localhost:5173',
    credentials: true,
  })
)

app.use('/', reservationRoute)

// global error handler
app.use(errorHandler)

async function start() {
  try {
    // 1. init RabbitMQ topology (exchanges, queues, bindings)
    await initTopology()

    // 3. connect MongoDB
    await connectMongodb()

    // 4. start express server
    app.listen(4005, () =>
      console.log(`server running on http://localhost:4005`)
    )
  } catch (error) {
    console.error('Service startup failed:', error)
    process.exit(1) // crash if startup dependencies not ready
  }
}

start()

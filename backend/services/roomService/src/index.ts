import express from 'express'
import cors from 'cors'
import dotenv from 'dotenv'
import connectMongodb from './config/db.config'
import roomRoute from './routes/room.route'
import errorHandler from './middleware/errorHandler'
import helmet from 'helmet'
import morgan from 'morgan'
import hpp from 'hpp'
import { initRoomTopology } from './config/rabbitmq.config'
import { startReservationSubscriber } from './subscribers/reservation.subscriber'

const app = express()

dotenv.config()

app.use(express.json({ limit: '1mb' }))
app.use(express.urlencoded({ extended: true }))

// Security: Helmet for security headers
app.use(helmet())

// Security: HTTP Parameter Pollution protection
app.use(hpp())

app.use(
  cors({
    origin: 'http://localhost:5173',
    credentials: true,
  })
)
app.use(morgan('dev'))

app.use('/', roomRoute)

// global error handler
app.use(errorHandler)

async function start() {
  try {
    // 1. init RabbitMQ topology (exchanges, queues, bindings)
    await initRoomTopology()

    // 3. connect MongoDB
    await connectMongodb()

    await startReservationSubscriber()

    // 4. start express server
    app.listen(4003, () =>
      console.log(`server running on http://localhost:4003`)
    )
  } catch (error) {
    console.error('Service startup failed:', error)
    process.exit(1) // crash if startup dependencies not ready
  }
}

start()

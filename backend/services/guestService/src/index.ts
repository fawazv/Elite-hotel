import express from 'express'
import cors from 'cors'
import dotenv from 'dotenv'
import guestRoute from './routes/guest.route'
import errorHandler from './middleware/errorHandler'
import helmet from 'helmet'
import morgan from 'morgan'
import connectMongoDB from './config/db.config'
import { initGuestRpcServer } from './rpc/guest.rpc.server'
import { initTopology } from './config/rabbitmq.config'

const app = express()

dotenv.config()

app.use(express.json())
app.use(express.urlencoded({ extended: true }))

app.use(helmet())
app.use(
  cors({
    origin: 'http://localhost:5173',
    credentials: true,
  })
)
app.use(morgan('dev'))

app.use('/', guestRoute)

// global error handler
app.use(errorHandler)

async function startServer() {
  try {
    // 1. Connect to Mongo
    await connectMongoDB()

    // 2. Init RabbitMQ Topology
    await initTopology()
    console.log('✅ RabbitMQ topology initialized')

    // 3. Start Guest RPC Server
    await initGuestRpcServer()

    // 4. Start Express HTTP API
    const app = express()
    app.use(express.json())
    app.use('/guests', guestRoute)

    app.listen(4004, () =>
      console.log(`server running on http://localhost:4004`)
    )
  } catch (err) {
    console.error('❌ Failed to start GuestService', err)
    process.exit(1)
  }
}

startServer()

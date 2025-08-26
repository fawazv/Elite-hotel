import dotenv from 'dotenv'
dotenv.config()
import express from 'express'
import cors from 'cors'
import connectMongodb from './config/db.config'
import guestRoute from './routes/guest.route'
import errorHandler from './middleware/errorHandler'
import helmet from 'helmet'
import morgan from 'morgan'
import { initTopology } from './config/rabbitmq.config'
import { initGuestRpcServer } from './rpc/guest.rpc.server'

const app = express()

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

// setup RabbitMQ topology (exchanges/queues)
initTopology()
console.log('✅ RabbitMQ topology initialized')

// start Guest RPC server
initGuestRpcServer()
console.log('✅ Guest RPC server listening on guest.service.rpc')

// connect DB
connectMongodb()
console.log('✅ MongoDB connected')

// start Express server
app.listen(4004, () =>
  console.log(`🚀 GuestService running at http://localhost:4004`)
)

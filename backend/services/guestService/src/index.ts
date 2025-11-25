import dotenv from 'dotenv'
dotenv.config()
import express from 'express'
import cors from 'cors'
import connectMongodb from './config/db.config'
import guestRoute from './routes/guest.route'
import errorHandler from './middleware/errorHandler'
import helmet from 'helmet'
import morgan from 'morgan'
import mongoSanitize from 'express-mongo-sanitize'
import compression from 'compression'
import { initTopology } from './config/rabbitmq.config'
import { initGuestRpcServer } from './rpc/guest.rpc.server'

const app = express()

// Security: Request size limits to prevent DoS
app.use(express.json({ limit: '100kb' }))
app.use(express.urlencoded({ extended: true, limit: '100kb' }))

// Security headers
app.use(helmet())

// Sanitize data to prevent NoSQL injection
app.use(
  mongoSanitize({
    replaceWith: '_',
    onSanitize: ({ req, key }) => {
      console.warn(`Sanitized key "${key}" in request`)
    },
  })
)

// Response compression
app.use(compression())

// CORS configuration
app.use(
  cors({
    origin: process.env.CORS_ORIGIN || 'http://localhost:5173',
    credentials: true,
  })
)

// Request logging
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

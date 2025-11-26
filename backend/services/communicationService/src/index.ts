import express from 'express'
import http from 'http'
import dotenv from 'dotenv'
import cors from 'cors'
import helmet from 'helmet'
import morgan from 'morgan'
import rateLimit from 'express-rate-limit'
import connectMongodb from './config/db.config'
import { rabbitmqConnect } from './config/rabbitmq.config'
import { initializeSocketIO } from './config/socket.config'
import videoChatRoute from './routes/videochat.route'
import errorHandler from './middleware/errorHandler'

dotenv.config()

const app = express()
const httpServer = http.createServer(app)

// Initialize Socket.IO
const io = initializeSocketIO(httpServer)

// Connect to databases and message queue
rabbitmqConnect().then(() => {
  console.log('✅ RabbitMQ connected')
})

connectMongodb().then(() => {
  console.log('✅ MongoDB connected')
})

// Middleware
app.use(helmet())
app.use(morgan('dev'))
app.use(
  cors({
    origin: process.env.FRONTEND_URL || 'http://localhost:5173',
    credentials: true,
  })
)
app.use(express.json())
app.use(express.urlencoded({ extended: true }))

// Rate limiting
const limiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 100, // limit each IP to 100 requests per windowMs
  message: 'Too many requests, please try again later',
})
app.use('/api/videochat', limiter)

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'OK', service: 'videoChatService' })
})

// Routes
app.use('/api/videochat', videoChatRoute)

// Error handling
app.use(errorHandler)

// Start server
const PORT = process.env.PORT || 4010
httpServer.listen(PORT, () => {
  console.log(`🚀 Video Chat Service running on http://localhost:${PORT}`)
})

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM received, shutting down gracefully...')
  httpServer.close(() => {
    console.log('Server closed')
    process.exit(0)
  })
})

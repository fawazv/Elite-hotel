import dotenv from 'dotenv'
dotenv.config()

import express from 'express'
import cors from 'cors'
import connectMongodb from './config/db.config'
import userRoute from './routes/user.route'
import errorHandler from './middleware/errorHandler'
import helmet from 'helmet'
import morgan from 'morgan'
import { initRabbitMQ } from './config/rabbitmq.config'
import { initUserRpcConsumer } from './consumers/user.rpc.consumer'

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

app.use('/', userRoute)

// global error handler
app.use(errorHandler)

// Main function to start the application
async function start() {
  try {
    // Connect to MongoDB
    await connectMongodb()

    // Initialize RabbitMQ and RPC consumer
    await initRabbitMQ()
    await initUserRpcConsumer()

    // Start the Express server
    app.listen(4002, () => {
      console.log('UserService running on http://localhost:4002')
    })
  } catch (err) {
    console.error('Failed to start the server:', err)
    process.exit(1)
  }
}

// Call the start function
start()

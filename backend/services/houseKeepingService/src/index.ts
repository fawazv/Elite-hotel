import dotenv from 'dotenv'
dotenv.config()

import express from 'express'
import cors from 'cors'
import housekeepingRoutes from './routes/housekeeping.routes'
import { initRabbitTopology } from './config/rabbitmq.config'
import { startHousekeepingConsumer } from './consumers/housekeeping.consumer'
import { createContainer } from './config/container'
import errorHandler from './errors/errorHandler'
import connectMongoDB from './config/db.config'

async function start() {
  // DI container
  const container = createContainer()

  // DB
  await connectMongoDB()

  // RabbitMQ topology & consumers
  await initRabbitTopology()
  await startHousekeepingConsumer(container.housekeepingService)

  // Express
  const app = express()
  app.use(express.json())
  app.use(express.urlencoded({ extended: true }))

  app.use(
    cors({
      origin: 'http://localhost:5173',
      credentials: true,
    })
  )
  app.use('/housekeeping', housekeepingRoutes(container))

  // global error handler
  app.use(errorHandler)

  app.listen(4008, () => console.log(`HousekeepingService listening on 4008`))
}

start().catch((err) => {
  console.error('Failed to start service', err)
  process.exit(1)
})

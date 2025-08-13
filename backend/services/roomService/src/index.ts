import express from 'express'
import cors from 'cors'
import dotenv from 'dotenv'
dotenv.config()

import connectMongodb from './config/db.config'
import roomRoute from './routes/room.route'
import errorHandler from './middleware/errorHandler'

const app = express()

dotenv.config()

app.use(
  cors({
    origin: 'http://localhost:5173',
    credentials: true,
  })
)

app.use(express.json())
app.use(express.urlencoded({ extended: true }))

app.use('/', roomRoute)

// global error handler
app.use(errorHandler)

const PORT = process.env.PORT || 4003

connectMongodb().then(() => {
  app.listen(PORT, () => console.log(`room-service running on ${PORT}`))
})

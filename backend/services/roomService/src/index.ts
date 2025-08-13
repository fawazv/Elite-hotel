import express from 'express'
import cors from 'cors'
import dotenv from 'dotenv'
dotenv.config()

import connectMongodb from './config/db.config'
import roomRoute from './routes/room.route'
import errorHandler from './middleware/errorHandler'

const app = express()

dotenv.config()

app.get('/health', (req, res) =>
  res.json({ status: 'ok', service: 'room-service' })
)

connectMongodb().then(() => {
  console.log('mongodb connected')
})

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

app.listen(4003, () => console.log(`server running on http://localhost:4003`))

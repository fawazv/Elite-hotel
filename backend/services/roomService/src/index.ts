import express from 'express'
import cors from 'cors'
import dotenv from 'dotenv'
import roomRoute from './routes/room.route'
import errorHandler from './middleware/errorHandler'
import connectMongoDB from './config/db.config'

dotenv.config()
const app = express()

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

async function startServer() {
  try {
    await connectMongoDB()
    app.listen(PORT, () => {
      console.log(`room-service running on ${PORT}`)
    })
  } catch (err) {
    console.error('Failed to start server:', err)
    process.exit(1) // Exit with failure code
  }
}

startServer()

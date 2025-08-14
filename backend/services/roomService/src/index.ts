import express from 'express'
import cors from 'cors'
import dotenv from 'dotenv'
import connectMongodb from './config/db.config'
import roomRoute from './routes/room.route'
import errorHandler from './middleware/errorHandler'
import helmet from 'helmet'
import morgan from 'morgan'

const app = express()

dotenv.config()

app.use(express.json({ limit: '1mb' }))
app.use(express.urlencoded({ extended: true }))

app.use(helmet())
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

connectMongodb().then(() => {
  app.listen(4003, () => console.log(`server running on http://localhost:4003`))
})

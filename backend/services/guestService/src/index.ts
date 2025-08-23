import express from 'express'
import cors from 'cors'
import dotenv from 'dotenv'
import connectMongodb from './config/db.config'
import guestRoute from './routes/guest.route'
import errorHandler from './middleware/errorHandler'
import helmet from 'helmet'
import morgan from 'morgan'

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

connectMongodb().then(() => {
  app.listen(4004, () => console.log(`server running on http://localhost:4004`))
})

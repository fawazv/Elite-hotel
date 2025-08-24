import express from 'express'
import cors from 'cors'
import dotenv from 'dotenv'
import connectMongodb from './config/db.config'
import reservationRoute from './routes/reservation.route'
import errorHandler from './middleware/errorHandler'

const app = express()

dotenv.config()

app.use(express.json())
app.use(express.urlencoded({ extended: true }))

app.use(
  cors({
    origin: 'http://localhost:5173',
    credentials: true,
  })
)

app.use('/', reservationRoute)

// global error handler
app.use(errorHandler)

connectMongodb().then(() => {
  app.listen(4005, () => console.log(`server running on http://localhost:4005`))
})

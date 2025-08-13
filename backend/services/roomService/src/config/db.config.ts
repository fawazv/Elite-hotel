import mongoose from 'mongoose'

const connectMongodb = async () => {
  try {
    const connectionString = process.env.MONGO_URI
    if (!connectionString) {
      console.log('cannot get connectionString ')
      return
    }
    await mongoose.connect(connectionString)
    console.log('MongoDB connected (room-service)')
  } catch (error) {
    console.error('failed to connect database', error)
  }
}
export default connectMongodb

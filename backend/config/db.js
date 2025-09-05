import mongoose from 'mongoose'
export const connectDB = async () => {
  const uri = process.env.MONGODB_URI
  await mongoose.connect(uri, { })
}

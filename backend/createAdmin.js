import mongoose from 'mongoose'
import { User } from './models/User.js'
import dotenv from 'dotenv'

dotenv.config()

const createAdmin = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI)
    
    const existingAdmin = await User.findOne({ email: 'admin@gmail.com' })
    if (existingAdmin) {
      console.log('Admin user already exists')
      process.exit(0)
    }

    const admin = new User({
      name: 'Admin',
      email: 'admin@gmail.com',
      password: 'admin',
      role: 'admin',
      isVerified: true,
      doctorApproved: 'approved'
    })

    await admin.save()
    console.log('Admin user created successfully')
    process.exit(0)
  } catch (error) {
    console.error('Error creating admin:', error)
    process.exit(1)
  }
}

createAdmin()

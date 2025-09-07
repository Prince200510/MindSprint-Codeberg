import mongoose from 'mongoose'
import { User } from '../models/User.js'
import dotenv from 'dotenv'
import path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

// Load environment variables from the backend directory
dotenv.config({ path: path.join(__dirname, '..', '.env') })

const createAdmin = async () => {
  try {
    console.log('Connecting to MongoDB...')
    await mongoose.connect(process.env.MONGODB_URI)
    console.log('Connected to MongoDB successfully')
    
    // Check if admin already exists
    const existingAdmin = await User.findOne({ email: 'admin@gmail.com' })
    if (existingAdmin) {
      console.log('Admin user already exists with email: admin@gmail.com')
      console.log('Admin details:')
      console.log(`- Name: ${existingAdmin.name}`)
      console.log(`- Email: ${existingAdmin.email}`)
      console.log(`- Role: ${existingAdmin.role}`)
      console.log(`- Verified: ${existingAdmin.isVerified}`)
      await mongoose.disconnect()
      process.exit(0)
    }

    console.log('Creating new admin user...')
    
    // Create new admin user
    const admin = new User({
      name: 'Admin',
      email: 'admin@gmail.com',
      password: 'admin', // This will be hashed automatically by the pre-save middleware
      role: 'admin',
      isVerified: true,
      doctorApproved: 'approved'
    })

    await admin.save()
    console.log('✅ Admin user created successfully!')
    console.log('Admin credentials:')
    console.log('- Email: admin@gmail.com')
    console.log('- Password: admin')
    console.log('- Role: admin')
    
    await mongoose.disconnect()
    console.log('Database connection closed')
    process.exit(0)
  } catch (error) {
    console.error('❌ Error creating admin:', error.message)
    await mongoose.disconnect()
    process.exit(1)
  }
}

// Execute the script
createAdmin()

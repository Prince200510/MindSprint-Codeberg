import mongoose from 'mongoose'
import bcrypt from 'bcrypt'

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true, lowercase: true, index: true },
  password: { type: String, required: true },
  role: { type: String, enum: ['user','doctor','admin'], default: 'user' },
  doctorApproved: { type: Boolean, default: false },
  specialization: String,
  mobile: String,
  profile: {
    firstName: String,
    lastName: String,
    dateOfBirth: Date,
    gender: { 
      type: String, 
      enum: ['male', 'female', 'other', 'prefer-not-to-say', ''],
      default: '' 
    },
    address: String,
    city: String,
    pincode: String,
    emergencyContact: {
      name: String,
      number: String
    },
    medicalHistory: {
      conditions: [String],
      allergies: [String],
      currentMedications: [String],
      isStudent: { type: Boolean, default: false },
      studentInstitution: String,
      healthIssues: String
    },
    notificationPreferences: {
      email: { type: Boolean, default: true },
      sms: { type: Boolean, default: false },
      app: { type: Boolean, default: true }
    }
  },
  
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
})

userSchema.pre('save', async function(next){
  if(!this.isModified('password')) return next()
  const salt = await bcrypt.genSalt(10)
  this.password = await bcrypt.hash(this.password, salt)
  next()
})

userSchema.pre('save', function(next) {
  this.updatedAt = new Date()
  next()
})

userSchema.methods.comparePassword = function(candidate){
  return bcrypt.compare(candidate, this.password)
}

export const User = mongoose.model('User', userSchema)

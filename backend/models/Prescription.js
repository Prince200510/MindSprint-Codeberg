import mongoose from 'mongoose'

const prescriptionSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  doctorId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: false
  },
  medicineName: {
    type: String,
    required: true,
    trim: true
  },
  dosage: {
    type: String,
    required: true,
    trim: true
  },
  frequency: {
    type: String,
    required: true,
    trim: true
  },
  duration: {
    type: String,
    required: true,
    trim: true
  },
  specialInstructions: {
    type: String,
    trim: true
  },
  beforeAfterFood: {
    type: String,
    enum: ['before', 'after', 'with', 'anytime'],
    default: 'after'
  },
  withWater: {
    type: Boolean,
    default: true
  },
  avoidAlcohol: {
    type: Boolean,
    default: false
  },
  startDate: {
    type: Date,
    required: true
  },
  endDate: {
    type: Date
  },
  times: [{
    type: String, 
    validate: {
      validator: function(v) {
        return /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/.test(v)
      },
      message: 'Time must be in HH:MM format'
    }
  }],
  totalDoses: {
    type: Number,
    required: true,
    min: 1
  },
  takenDoses: {
    type: Number,
    default: 0,
    min: 0
  },
  doseLogs: [{
    date: {
      type: Date,
      default: Date.now
    },
    time: String,
    taken: {
      type: Boolean,
      default: false
    },
    notes: String
  }],
  active: {
    type: Boolean,
    default: true
  },
  notifications: {
    enabled: {
      type: Boolean,
      default: true
    },
    reminderMinutes: {
      type: Number,
      default: 15 
    }
  },
  
  originalName: String,
  filePath: String,
  parsedData: Object,
  status: { type: String, enum: ['uploaded','reviewed','approved'], default: 'uploaded' },
  
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
})

prescriptionSchema.pre('save', function(next) {
  this.updatedAt = new Date()
  next()
})

prescriptionSchema.virtual('completionPercentage').get(function() {
  if (this.totalDoses === 0) return 0
  return Math.round((this.takenDoses / this.totalDoses) * 100)
})

prescriptionSchema.virtual('isExpired').get(function() {
  if (!this.endDate) return false
  return new Date() > this.endDate
})

prescriptionSchema.virtual('nextDose').get(function() {
  if (!this.active || this.times.length === 0) return null
  
  const now = new Date()
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())
  
  for (const time of this.times.sort()) {
    const [hours, minutes] = time.split(':').map(Number)
    const doseTime = new Date(today.getTime())
    doseTime.setHours(hours, minutes, 0, 0)
    
    if (doseTime > now) {
      return doseTime
    }
  }
  
  const tomorrow = new Date(today.getTime() + 24 * 60 * 60 * 1000)
  const [hours, minutes] = this.times.sort()[0].split(':').map(Number)
  tomorrow.setHours(hours, minutes, 0, 0)
  
  return tomorrow
})

prescriptionSchema.set('toJSON', { virtuals: true })
prescriptionSchema.set('toObject', { virtuals: true })

export const Prescription = mongoose.model('Prescription', prescriptionSchema)

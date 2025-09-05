import mongoose from 'mongoose'

const medicineSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  name: {
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
  totalDoses: {
    type: Number,
    min: 0
  },
  takenDoses: {
    type: Number,
    default: 0,
    min: 0
  },
  active: {
    type: Boolean,
    default: true
  },
  
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
})

medicineSchema.pre('save', function(next) {
  this.updatedAt = new Date()
  next()
})

medicineSchema.virtual('completionPercentage').get(function() {
  if (!this.totalDoses || this.totalDoses === 0) return 0
  return Math.round((this.takenDoses / this.totalDoses) * 100)
})

medicineSchema.virtual('isExpired').get(function() {
  if (!this.endDate) return false
  return new Date() > this.endDate
})

medicineSchema.set('toJSON', { virtuals: true })
medicineSchema.set('toObject', { virtuals: true })

export const Medicine = mongoose.model('Medicine', medicineSchema)

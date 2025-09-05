import mongoose from 'mongoose'

const doseSchema = new mongoose.Schema({
  time: String,
  taken: { type: Boolean, default: false },
  takenAt: Date
},{ _id: false })

const scheduleSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  prescription: { type: mongoose.Schema.Types.ObjectId, ref: 'Prescription' },
  medicineName: { type: String, required: true },
  doses: [doseSchema],
  startDate: Date,
  endDate: Date,
  createdAt: { type: Date, default: Date.now }
})

export const Schedule = mongoose.model('Schedule', scheduleSchema)

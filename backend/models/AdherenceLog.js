import mongoose from 'mongoose'

const adherenceLogSchema = new mongoose.Schema({
  schedule: { type: mongoose.Schema.Types.ObjectId, ref: 'Schedule', required: true },
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  date: { type: Date, required: true },
  takenCount: { type: Number, default: 0 },
  missedCount: { type: Number, default: 0 }
})

export const AdherenceLog = mongoose.model('AdherenceLog', adherenceLogSchema)

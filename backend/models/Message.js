import mongoose from 'mongoose'

const messageSchema = new mongoose.Schema({
  room: String,
  from: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  to: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  body: String,
  type: { type: String, enum: ['text'], default: 'text' },
  createdAt: { type: Date, default: Date.now }
})

export const Message = mongoose.model('Message', messageSchema)

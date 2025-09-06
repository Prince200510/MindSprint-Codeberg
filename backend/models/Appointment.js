import mongoose from 'mongoose'

const appointmentSchema = new mongoose.Schema({
  patient: {type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true},
  patientName: { type: String, required: true },
  patientEmail: { type: String, required: true },
  patientPhone: String,
  doctor: {type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true},
  doctorName: { type: String, required: true },
  appointmentType: { type: String, enum: ['online', 'offline', 'chat'], required: true},
  appointmentDate: { type: Date, required: true },
  appointmentTime: { type: String, required: true },
  symptoms: String,
  currentMedication: [String],
  medicalHistory: String,
  urgencyLevel: {type: String, enum: ['low', 'medium', 'high'], default: 'medium'},
  status: { type: String, enum: ['pending', 'confirmed', 'completed', 'cancelled'], default: 'pending'},
  consultationFee: { type: Number, required: true },
  paymentStatus: { type: String, enum: ['pending', 'paid', 'failed'], default: 'pending'},
  paymentId: String,
  doctorNotes: String,
  prescription: [{
    medicine: String,
    dosage: String,
    frequency: String,
    duration: String
  }],
  meetingLink: String,
  meetingId: String,
  chatRoomId: String,
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
})

appointmentSchema.pre('save', function(next) {
  this.updatedAt = new Date()
  next()
})

export const Appointment = mongoose.model('Appointment', appointmentSchema)

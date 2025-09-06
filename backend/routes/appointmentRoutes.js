import { Router } from 'express'
import { getApprovedDoctors, bookAppointment, getPatientAppointments, getDoctorAppointments, updateAppointmentStatus} from '../controllers/appointmentController.js'
import { auth } from '../middleware/auth.js'

const r = Router()
r.get('/doctors/available', auth, getApprovedDoctors)
r.post('/book', auth, bookAppointment)
r.get('/patient/appointments', auth, getPatientAppointments)
r.get('/doctor/appointments', auth, getDoctorAppointments)
r.put('/doctor/appointments/:appointmentId', auth, updateAppointmentStatus)

export default r

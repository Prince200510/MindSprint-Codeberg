import { Router } from 'express'
import { getPendingDoctors,  approveDoctor,  rejectDoctor,  getDoctorDashboard,  getDoctorProfile,  updateDoctorProfile, upload} from '../controllers/doctorController.js'
import { auth, requireRoles } from '../middleware/auth.js'

const r = Router()
r.get('/pending', auth, requireRoles('admin'), getPendingDoctors)
r.put('/:id/approve', auth, requireRoles('admin'), approveDoctor)
r.put('/:id/reject', auth, requireRoles('admin'), rejectDoctor)
r.get('/dashboard', auth, requireRoles('doctor'), getDoctorDashboard)
r.get('/profile', auth, requireRoles('doctor'), getDoctorProfile)
r.put('/profile', auth, requireRoles('doctor'), updateDoctorProfile)

export default r

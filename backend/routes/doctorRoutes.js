import { Router } from 'express'
import { listDoctors, approveDoctor, rejectDoctor } from '../controllers/doctorController.js'
import { auth, requireRoles } from '../middleware/auth.js'
const r = Router()
r.get('/', auth, requireRoles('admin'), listDoctors)
r.patch('/:id/approve', auth, requireRoles('admin'), approveDoctor)
r.delete('/:id/reject', auth, requireRoles('admin'), rejectDoctor)
export default r

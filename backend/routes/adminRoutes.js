import { Router } from 'express'
import { auth, adminOnly } from '../middleware/auth.js'
import { getDashboardStats, getPendingDoctors, approveDoctor, rejectDoctor, getRecentActivity, getAllUsers} from '../controllers/adminController.js'

const router = Router()
router.use(auth)
router.use(adminOnly)
router.get('/dashboard/stats', getDashboardStats)
router.get('/dashboard/activity', getRecentActivity)
router.get('/doctors/pending', getPendingDoctors)
router.put('/doctors/:doctorId/approve', approveDoctor)
router.put('/doctors/:doctorId/reject', rejectDoctor)
router.get('/users', getAllUsers)

export default router

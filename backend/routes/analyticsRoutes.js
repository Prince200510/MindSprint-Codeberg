import { Router } from 'express'
import { adherenceStats, platformStats, userDashboardStats, medicineInsights } from '../controllers/analyticsController.js'
import { auth, requireRoles } from '../middleware/auth.js'
const r = Router()
r.get('/adherence', auth, adherenceStats)
r.get('/dashboard', auth, userDashboardStats)
r.get('/insights', auth, medicineInsights)
r.get('/platform', auth, requireRoles('admin'), platformStats)
export default r
